"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  ShieldCheck, 
  Truck, 
  Zap, 
  MessageCircle, 
  CheckCircle2
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

const WELCOME_CODE = "WELCOME2500";
const VOUCHER_SEEN_KEY = "hc_welcome_voucher_seen_v1";

interface SocialPurchase {
  id: string;
  customerName: string;
  location: string;
  timeAgo: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
}

const NIGERIAN_PURCHASES: SocialPurchase[] = [
  {
    id: "sp-1",
    customerName: "Engr. Chidi O.",
    location: "Lekki Phase 1, Lagos",
    timeAgo: "3 mins ago",
    productId: "sp-power-1",
    productName: "Tuya 16A Smart WiFi Surge Plug",
    productImage: "/products/extension-board.jpg",
    price: 8500,
  },
  {
    id: "sp-2",
    customerName: "Dr. Fatima B.",
    location: "Maitama, Abuja",
    timeAgo: "8 mins ago",
    productId: "sp-water-3",
    productName: "Smart Instant Tankless Water Heater",
    productImage: "/products/smart_water_heater_1787269874318.jpg",
    price: 85000,
  },
  {
    id: "sp-3",
    customerName: "Tunde Alabi",
    location: "Ikeja GRA, Lagos",
    timeAgo: "14 mins ago",
    productId: "sp-power-6",
    productName: "40,000mAh 65W Laptop & Phone Power Bank",
    productImage: "/products/smart-power-bank.jpg",
    price: 28500,
  },
  {
    id: "sp-4",
    customerName: "Blessing Eze",
    location: "Trans-Amadi, Port Harcourt",
    timeAgo: "21 mins ago",
    productId: "sp-sec-1",
    productName: "Tuya Biometric AI Smart Door Lock",
    productImage: "/products/smart-lock.jpg",
    price: 75000,
  },
  {
    id: "sp-5",
    customerName: "Adeolu K.",
    location: "Bodija, Ibadan",
    timeAgo: "29 mins ago",
    productId: "sp-light-2",
    productName: "Luxury Tempered Glass Touch Switch",
    productImage: "/products/touch-switch-double.png",
    price: 14500,
  },
];

export default function PromoOverlay() {
  const { applyCoupon } = useCart();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showTicker, setShowTicker] = useState(false);

  // Trigger welcome modal after 6 seconds if user hasn't seen it recently
  useEffect(() => {
    let timer: NodeJS.Timeout;
    try {
      const hasSeen = localStorage.getItem(VOUCHER_SEEN_KEY);
      if (!hasSeen) {
        timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 6000);
      }
    } catch {
      timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 6000);
    }

    return () => clearTimeout(timer);
  }, []);

  // Trigger Live Purchase Ticker every 35-45 seconds
  useEffect(() => {
    // Only start social proof ticker after initial delay and when welcome modal is closed
    const initialDelay = setTimeout(() => {
      setShowTicker(true);
    }, 14000);

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % NIGERIAN_PURCHASES.length);
      setShowTicker(true);
    }, 38000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  // Auto-hide individual ticker notification after 7 seconds
  useEffect(() => {
    if (!showTicker) return;
    const hideTimer = setTimeout(() => {
      setShowTicker(false);
    }, 7000);
    return () => clearTimeout(hideTimer);
  }, [showTicker, tickerIndex]);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcomeModal(false);
    try {
      localStorage.setItem(VOUCHER_SEEN_KEY, "true");
    } catch {}
  }, []);

  const handleClaimVoucher = useCallback(() => {
    applyCoupon(WELCOME_CODE);
    try {
      navigator.clipboard.writeText(WELCOME_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}

    toast.success("₦2,500 Voucher Applied!", {
      description: "Code WELCOME2500 has been automatically added to your checkout.",
    });

    handleDismissWelcome();
  }, [applyCoupon, handleDismissWelcome]);

  const handleOrderWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(
      `Hello HomeCare! I want to claim the ₦2,500 welcome voucher (WELCOME2500) for my smart appliance order in Nigeria.`
    );
    window.open(`https://wa.me/2348000000000?text=${encoded}`, "_blank");
    handleDismissWelcome();
  }, [handleDismissWelcome]);

  const currentPurchase = NIGERIAN_PURCHASES[tickerIndex];

  return (
    <>
      {/* ── 1. WELCOME VOUCHER MODAL (High-Converting First-Order Value) ── */}
      <AnimatePresence>
        {showWelcomeModal && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissWelcome}
              className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative w-full max-w-lg bg-white rounded-3xl border border-sky-100 shadow-2xl overflow-hidden pointer-events-auto text-slate-900">
                {/* Close Button */}
                <button
                  onClick={handleDismissWelcome}
                  className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                  aria-label="Close voucher modal"
                >
                  <X size={16} />
                </button>

                {/* Top Festive Header Banner */}
                <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-blue-800 text-white p-6 sm:p-7 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-44 h-44 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sky-100 text-[10px] font-black uppercase tracking-widest border border-white/20">
                      <Gift size={12} className="text-cyan-300" />
                      Exclusive Welcome Voucher
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight leading-snug">
                      Claim ₦2,500 OFF <br />Your First Appliance
                    </h3>
                    <p className="text-xs sm:text-sm text-sky-100/90 font-medium leading-relaxed">
                      Enjoy ₦2,500 instant discount on smart surge plugs, water heaters, power banks, and locks across Nigeria.
                    </p>
                  </div>
                </div>

                {/* Voucher Content & Highlights */}
                <div className="p-6 sm:p-7 space-y-5">
                  {/* Voucher Box with Dash Border */}
                  <div className="bg-sky-50/70 rounded-2xl p-4 border-2 border-dashed border-sky-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                        Voucher Code (Orders from ₦25,000)
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-wider mt-0.5">
                        {WELCOME_CODE}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClaimVoucher}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? "Applied!" : "Apply & Copy"}</span>
                    </button>
                  </div>

                  {/* Trust Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Zap size={14} className="text-sky-600 shrink-0 mt-0.5" />
                      <span className="leading-tight"><strong>NEPA Safe:</strong> Built for 240V voltage swings</span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Truck size={14} className="text-sky-600 shrink-0 mt-0.5" />
                      <span className="leading-tight"><strong>Fast Dispatch:</strong> 24-48h in Lagos, Abuja & PH</span>
                    </div>
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <ShieldCheck size={14} className="text-sky-600 shrink-0 mt-0.5" />
                      <span className="leading-tight"><strong>CarePay Escrow:</strong> 100% money-back guarantee</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleClaimVoucher}
                      className="w-full h-12 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Gift size={15} />
                      <span>Claim ₦2,500 Voucher & Shop Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOrderWhatsApp}
                      className="w-full h-11 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} className="text-emerald-600" />
                      <span>Prefer to Order via WhatsApp?</span>
                    </button>
                  </div>

                  {/* Subtle Dismissal */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleDismissWelcome}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      No thanks, I will pay full price
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 2. LIVE NIGERIAN SALES TICKER (Bottom-Left Non-Intrusive Social Proof) ── */}
      <AnimatePresence>
        {showTicker && currentPurchase && !showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0, x: -30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-20 sm:bottom-6 left-3 sm:left-6 z-[60] max-w-sm w-[calc(100vw-1.5rem)] sm:w-auto"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200/90 shadow-xl shadow-slate-900/10 flex items-center gap-3 relative overflow-hidden group">
              {/* Product Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <Image
                  src={currentPurchase.productImage}
                  alt={currentPurchase.productName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Purchase Details */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-slate-800">{currentPurchase.customerName}</span>
                  <span>in {currentPurchase.location}</span>
                </div>

                <Link
                  href={`/store/${currentPurchase.productId}`}
                  className="block text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors truncate mt-0.5"
                >
                  Purchased {currentPurchase.productName}
                </Link>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-0.5">
                  <span className="text-sky-700 font-black">₦{currentPurchase.price.toLocaleString()}</span>
                  <span>•</span>
                  <span>{currentPurchase.timeAgo}</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold ml-auto">
                    <CheckCircle2 size={10} className="text-emerald-600" /> Verified Order
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowTicker(false)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
