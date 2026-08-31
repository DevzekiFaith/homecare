"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronDown, CheckCheck, ShieldCheck, Sparkles, PhoneCall } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  created_at: string;
  is_worker?: boolean;
}

interface InMapChatProps {
  requestId?: string;
  workerName?: string;
  workerRole?: string;
  workerAvatar?: string;
  clientName?: string;
  isDemo?: boolean;
  isOpenByDefault?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right";
  className?: string;
}

const QUICK_REPLIES = [
  "I'm outside 🚪",
  "At the security gate 🛡️",
  "Traffic delay 2 mins 🚗",
  "Please confirm house # 📍",
  "Arriving now! ⚡",
];

const DEMO_SEED_MESSAGES: ChatMessage[] = [
  {
    id: "demo-1",
    sender_id: "worker-1",
    sender_name: "Emeka N. (Verified Pro)",
    content: "Hello! I am en route to your address with complete tooling kit.",
    created_at: "2026-08-28T02:00:00.000Z",
    is_worker: true,
  },
  {
    id: "demo-2",
    sender_id: "user-1",
    sender_name: "You",
    content: "Thanks! Gate code is #402. Call when at security.",
    created_at: "2026-08-28T02:02:00.000Z",
    is_worker: false,
  },
];

export default function InMapChat({
  requestId,
  workerName = "Emeka N. (Verified Pro)",
  workerRole = "Senior Plumber & Pipe Specialist",
  workerAvatar,
  clientName = "You",
  isDemo = false,
  isOpenByDefault = false,
  position = "bottom-right",
  className = "",
}: InMapChatProps) {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const [messages, setMessages] = useState<ChatMessage[]>(isDemo ? DEMO_SEED_MESSAGES : []);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(isDemo ? 1 : 0);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const localCounter = useRef(0);
  const supabase = createClient();

  // Initialize Supabase user & message fetch if real request
  useEffect(() => {
    if (isDemo || !requestId) return;

    let isMounted = true;
    const fetchChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) setUserId(user.id);

        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: true });

        if (data && isMounted) {
          setMessages(
            data.map((m: Record<string, unknown>) => ({
              id: String(m.id),
              sender_id: String(m.sender_id),
              content: String(m.content),
              created_at: String(m.created_at),
              is_worker: m.sender_id !== user?.id,
            }))
          );
        }
      } catch (err) {
        console.error("In-map chat fetch error:", err);
      }
    };

    fetchChat();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`map-chat:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === String(newMsg.id))) return prev;
            return [
              ...prev,
              {
                id: String(newMsg.id),
                sender_id: String(newMsg.sender_id),
                content: String(newMsg.content),
                created_at: String(newMsg.created_at),
                is_worker: newMsg.sender_id !== userId,
              },
            ];
          });
          if (!isOpen) {
            setUnreadCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [requestId, isDemo, supabase, userId, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    setInputText("");
    localCounter.current += 1;
    const msgId = `local-${localCounter.current}`;
    const nowIso = new Date().toISOString();

    const newMsgObj: ChatMessage = {
      id: msgId,
      sender_id: userId || "current-user",
      sender_name: clientName,
      content,
      created_at: nowIso,
      is_worker: false,
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsgObj]);

    if (!isDemo && requestId && userId) {
      const { error } = await supabase.from("messages").insert({
        request_id: requestId,
        sender_id: userId,
        content,
      });
      if (error) {
        toast.error("Failed to send message over live channel");
      }
    } else if (isDemo) {
      // Simulate pro reply after 1.5s in demo mode
      setTimeout(() => {
        const replies = [
          "Got it! I am navigating via Esri Live GPS.",
          "Perfect, I will notify you once I reach your gate.",
          "Understood! Bringing the required parts.",
        ];
        const randomReply = replies[localCounter.current % replies.length];
        localCounter.current += 1;
        const replyId = `demo-reply-${localCounter.current}`;
        const proReply: ChatMessage = {
          id: replyId,
          sender_id: "worker-1",
          sender_name: workerName,
          content: randomReply,
          created_at: new Date().toISOString(),
          is_worker: true,
        };
        setMessages((prev) => [...prev, proReply]);
      }, 1400);
    }
  }, [clientName, inputText, isDemo, requestId, supabase, userId, workerName]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const posClasses = {
    "bottom-right": "bottom-3 right-3 sm:bottom-4 sm:right-4",
    "bottom-left": "bottom-3 left-3 sm:bottom-4 sm:left-4",
    "top-right": "top-3 right-3 sm:top-4 sm:right-4",
  }[position];

  return (
    <div className={`absolute ${posClasses} z-[1100] ${className}`}>
      {/* Collapsed Pill Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white border border-sky-400/40 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {workerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={workerAvatar} alt="Pro" className="w-full h-full rounded-full object-cover" />
              ) : (
                <MessageCircle size={16} />
              )}
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-black text-white leading-tight">{workerName.split(" ")[0]}</p>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-bold rounded">Live</span>
            </div>
            <p className="text-[10px] text-sky-300 font-semibold truncate max-w-[120px]">Live In-Map Chat</p>
          </div>

          {unreadCount > 0 && (
            <span className="ml-1 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </motion.button>
      )}

      {/* Expanded Floating In-Map Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-[calc(100vw-2rem)] sm:w-84 max-h-[440px] flex flex-col rounded-2xl bg-slate-900/95 border border-sky-500/30 text-white shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 bg-gradient-to-r from-slate-900 via-sky-950/80 to-slate-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {workerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={workerAvatar} alt="Pro" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      "PRO"
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-white">{workerName}</h4>
                    <ShieldCheck size={13} className="text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-sky-300 font-medium">{workerRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toast.info("Connecting VoIP audio link...")}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="Direct Call"
                >
                  <PhoneCall size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title="Minimize Chat"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Quick Dispatch Telemetry Banner */}
            <div className="px-3 py-1.5 bg-sky-950/60 border-b border-sky-500/20 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-sky-300 font-bold">
                <Sparkles size={11} className="text-amber-400" />
                Live GPS Active
              </span>
              <span className="text-emerald-400 font-bold">Encrypted Telemetry</span>
            </div>

            {/* Messages Thread */}
            <div
              ref={scrollRef}
              className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[220px] text-xs scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <MessageCircle size={24} className="mx-auto mb-1.5 opacity-30 text-sky-400" />
                  <p className="text-[11px] font-bold text-slate-300">Live In-Map Dispatch Chat</p>
                  <p className="text-[10px] text-slate-500">Send notes directly to your professional on the map.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isWorker = msg.is_worker ?? msg.sender_id !== userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isWorker ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          isWorker
                            ? "bg-slate-800 text-slate-100 border border-white/10 rounded-tl-none"
                            : "bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-600/30"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-slate-400">
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {!isWorker && <CheckCheck size={11} className="text-sky-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Action Chips */}
            <div className="px-2.5 py-1.5 bg-slate-950/60 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_REPLIES.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="shrink-0 px-2 py-1 rounded-lg bg-white/5 hover:bg-sky-600/30 hover:border-sky-500/50 border border-white/10 text-[10px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2 bg-slate-900 border-t border-white/10 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Message professional..."
                className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-8 w-8 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-sky-600/30"
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
