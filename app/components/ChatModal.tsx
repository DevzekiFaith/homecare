"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function ChatModal({ requestId, isOpen, onClose, title = "Chat", subtitle }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;

    const setupChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);

        // Fetch messages
        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: true });

        if (data) setMessages(data);
      } catch {
        // Supabase unavailable — chat will show empty state
      } finally {
        setLoading(false);
      }
    };

    setupChat();


    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as unknown as Message;
          setMessages((prev) => {
            // Prevent duplicate messages if the insert comes back from the broadcast and fetch
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, requestId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const content = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      request_id: requestId,
      sender_id: userId,
      content,
    });

    if (error) {
      toast.error("Failed to send message");
      setNewMessage(content); // Restore message
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-background border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                  {subtitle && <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="animate-spin text-brand-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center px-6">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <MessageCircle size={32} className="opacity-20" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Secure Chat Active</p>
                  <p className="text-xs mt-1 leading-relaxed">Messaging is now enabled for this request. All chats are encrypted and monitored for quality assurance.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-sky-600 text-white rounded-tr-none shadow-md shadow-sky-600/20"
                            : "bg-white/5 text-foreground border border-white/10 rounded-tl-none"
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[9px] mt-1 font-bold opacity-75 ${isMine ? "text-sky-100" : "text-zinc-500"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !userId}
                  className="h-11 w-11 rounded-xl bg-sky-600 text-white flex items-center justify-center hover:bg-sky-500 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer shadow-md shadow-sky-600/30"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
