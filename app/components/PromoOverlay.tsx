"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  CheckCircle2,
  Activity,
  ChevronRight,
  BadgeCheck
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
  deliveryStatus: string;
  actionType: "ordered" | "delivered" | "installed";
}

const NIGERIAN_PURCHASES: SocialPurchase[] = [
  {
    id: "sp-1",
    customerName: "Engr. Chidi O.",
    location: "Lekki Phase 1, Lagos",
    timeAgo: "2 mins ago",
    productId: "sp-power-1",
    productName: "Tuya 16A Smart WiFi Surge Plug",
    productImage: "/products/extension-board.jpg",
    price: 8500,
    deliveryStatus: "Dispatched via GIG Express Lagos",
    actionType: "ordered",
  },
  {
    id: "sp-2",
    customerName: "Dr. Fatima B.",
    location: "Maitama, Abuja",
    timeAgo: "6 mins ago",
    productId: "sp-water-3",
    productName: "Smart Instant Tankless Water Heater",
    productImage: "/products/smart_water_heater_1787269874318.jpg",
    price: 85000,
    deliveryStatus: "Verified Pro Installation Booked",
    actionType: "installed",
  },
  {
    id: "sp-3",
    customerName: "Tunde Alabi",
    location: "Ikeja GRA, Lagos",
    timeAgo: "11 mins ago",
    productId: "sp-power-6",
    productName: "40,000mAh 65W Laptop & Phone Power Bank",
    productImage: "/products/smart-power-bank.jpg",
    price: 28500,
    deliveryStatus: "Delivered to Doorstep · CarePay Released",
    actionType: "delivered",
  },
  {
    id: "sp-4",
    customerName: "Blessing Eze",
    location: "Trans-Amadi, Port Harcourt",
    timeAgo: "17 mins ago",
    productId: "sp-sec-1",
    productName: "Tuya Biometric AI Smart Door Lock",
    productImage: "/products/smart-lock.jpg",
    price: 75000,
    deliveryStatus: "In Transit with RedStar Courier",
    actionType: "ordered",
  },
  {
    id: "sp-5",
    customerName: "Arc. Kenneth N.",
    location: "Independence Layout, Enugu",
    timeAgo: "22 mins ago",
    productId: "sp-water-5",
    productName: "Smart Ultrasonic Water Tank Monitor",
    productImage: "/products/smart-water-level.jpg",
    price: 38500,
    deliveryStatus: "Delivered & Calibrated with Tuya App",
    actionType: "delivered",
  },
  {
    id: "sp-6",
    customerName: "Adeolu K.",
    location: "Bodija, Ibadan",
    timeAgo: "28 mins ago",
    productId: "sp-light-2",
    productName: "Luxury Tempered Glass Touch Switch",
    productImage: "/products/touch-switch-double.png",
    price: 14500,
    deliveryStatus: "Dispatched from Lagos Regional Hub",
    actionType: "ordered",
  },
  {
    id: "sp-7",
    customerName: "Hajia Amina D.",
    location: "Nasarawa GRA, Kano",
    timeAgo: "34 mins ago",
    productId: "sp-power-2",
    productName: "Tuya 3-Gang Smart Surge Extension Board",
    productImage: "/products/extension-board.jpg",
    price: 18500,
    deliveryStatus: "Delivered via Speedaf Courier",
    actionType: "delivered",
  },
  {
    id: "sp-8",
    customerName: "Pastor Olawale S.",
    location: "Magodo Phase 2, Lagos",
    timeAgo: "41 mins ago",
    productId: "sp-fan-1",
    productName: "Smart Low-Wattage Inverter Fan",
    productImage: "/products/rechargeable-fan.jpg",
    price: 45000,
    deliveryStatus: "Installed by Verified HomeCare Electrician",
    actionType: "installed",
  },
];

export default function PromoOverlay() {
  const pathname = usePathname();
  const { applyCoupon } = useCart();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showTicker, setShowTicker] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showFeedDrawer, setShowFeedDrawer] = useState(false);

  // Suppress on checkout page for zero distraction
  const isCheckout = Boolean(pathname?.includes("/checkout"));

  // 1. Immediate trigger for social proof ticker: starts within 2.5 seconds
  useEffect(() => {
    if (isCheckout) return;

    const initialDelay = setTimeout(() => {
      setShowTicker(true);
    }, 2500);

    const interval = setInterval(() => {
      if (!isPaused) {
        setTickerIndex((prev) => (prev + 1) % NIGERIAN_PURCHASES.length);
        setShowTicker(true);
      }
    }, 11000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [isCheckout, isPaused]);

  // 2. Display each ticker for 6.5 seconds, then transition
  useEffect(() => {
    if (!showTicker || isPaused) return;

    const hideTimer = setTimeout(() => {
      setShowTicker(false);
    }, 6500);

    return () => clearTimeout(hideTimer);
  }, [showTicker, tickerIndex, isPaused]);

  // 3. Welcome voucher modal trigger (after 5 seconds for new visitors)
  useEffect(() => {
    if (isCheckout) return;
    try {
      const hasSeen = localStorage.getItem(VOUCHER_SEEN_KEY);
      if (!hasSeen) {
        const modalTimer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 5000);
        return () => clearTimeout(modalTimer);
      }
    } catch {}
  }, [isCheckout]);

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
    window.open(`https://wa.me/2349119059859?text=${encoded}`, "_blank");
    handleDismissWelcome();
  }, [handleDismissWelcome]);

  if (isCheckout) {
    return null;
  }

  const currentPurchase = NIGERIAN_PURCHASES[tickerIndex];

  return (
    <>
      {/* ── 1. LIVE NIGERIAN SALES TICKER (Dynamic Island on Mobile, Glass Pill on Desktop) ── */}
      <AnimatePresence>
        {showTicker && currentPurchase && !showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] sm:top-auto sm:bottom-6 left-3 sm:left-6 z-[70] max-w-sm w-[calc(100vw-1.5rem)] sm:w-auto"
          >
            <div className="bg-slate-950/95 text-white backdrop-blur-xl rounded-2xl p-3 border border-sky-500/30 shadow-2xl shadow-sky-950/50 flex items-center gap-3 relative overflow-hidden group">
              {/* Subtle ambient light bar */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 animate-pulse" />

              {/* Product Thumbnail */}
              <Link 
                href={`/store/${currentPurchase.productId}`}
                className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/15 shrink-0 block group-hover:scale-105 transition-transform"
              >
                <Image
                  src={currentPurchase.productImage}
                  alt={currentPurchase.productName}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target) target.src = "/products/extension-board.jpg";
                  }}
                />
              </Link>

              {/* Purchase Details */}
              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center gap-1.5 text-[10px] text-sky-200/80 font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-white truncate">{currentPurchase.customerName}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-cyan-300 truncate">{currentPurchase.location}</span>
                </div>

                <Link
                  href={`/store/${currentPurchase.productId}`}
                  className="block text-xs font-bold text-white hover:text-cyan-300 transition-colors truncate mt-0.5"
                >
                  {currentPurchase.productName}
                </Link>

                <div className="flex items-center gap-2 text-[10px] text-sky-200/70 font-medium mt-0.5">
                  <span className="text-cyan-300 font-black">₦{currentPurchase.price.toLocaleString()}</span>
                  <span>•</span>
                  <span>{currentPurchase.timeAgo}</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold ml-auto text-[9px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    <CheckCircle2 size={10} className="text-emerald-400" /> CarePay Escrow
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTicker(false);
                }}
                className="absolute top-2 right-2 text-slate-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. PERSISTENT FLOATING SOCIAL PROOF & VOUCHER PILL (Bottom-Right) ── */}
      <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-[60] flex flex-col items-end gap-2 pointer-events-auto">
        {/* Live Nigerian Activity Pill */}
        <button
          onClick={() => setShowFeedDrawer(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white border border-sky-500/40 shadow-xl backdrop-blur-md text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-sky-200 group-hover:text-white">Live Nigeria Orders</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-black text-[9px]">
            {NIGERIAN_PURCHASES.length}+
          </span>
        </button>

        {/* Claim ₦2,500 Voucher Pill */}
        <button
          onClick={() => setShowWelcomeModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white border border-sky-400/40 shadow-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Gift size={12} className="text-cyan-300" />
          <span>Claim ₦2,500 OFF</span>
        </button>
      </div>

      {/* ── 3. LIVE NIGERIAN ORDERS FEED DRAWER ── */}
      <AnimatePresence>
        {showFeedDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFeedDrawer(false)}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[90] w-full sm:max-w-md bg-slate-950 text-white border-l border-sky-900/40 flex flex-col shadow-2xl h-[100dvh]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">
                      Live Nigerian Customer Feed
                    </h3>
                    <p className="text-[10px] text-sky-200/70 font-medium">
                      Real-time orders &amp; installations verified with CarePay Escrow
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFeedDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Feed List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-sky-200">
                  <BadgeCheck size={16} className="text-cyan-300 shrink-0" />
                  <p className="text-[11px] leading-tight">
                    Every order placed on HomeCare is held in <strong>CarePay Escrow</strong> until confirmed delivered and installed.
                  </p>
                </div>

                {NIGERIAN_PURCHASES.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/[0.05] hover:bg-white/[0.08] p-3.5 rounded-2xl border border-white/10 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span className="text-xs font-black text-white">{p.customerName}</span>
                        <span className="text-[10px] text-cyan-300 font-semibold">in {p.location}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{p.timeAgo}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                        <Image
                          src={p.productImage}
                          alt={p.productName}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target) target.src = "/products/extension-board.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/store/${p.productId}`}
                          onClick={() => setShowFeedDrawer(false)}
                          className="block text-xs font-bold text-white hover:text-cyan-300 transition-colors truncate"
                        >
                          {p.productName}
                        </Link>
                        <p className="text-xs font-black text-cyan-300 font-heading mt-0.5">
                          ₦{p.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                      <span className="text-sky-200/80 font-medium truncate">
                        {p.deliveryStatus}
                      </span>
                      <Link
                        href={`/store/${p.productId}`}
                        onClick={() => setShowFeedDrawer(false)}
                        className="text-cyan-300 hover:text-white font-extrabold uppercase tracking-wider shrink-0 ml-2 flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  <span>Hubs: Lagos, Abuja, Port Harcourt, Enugu</span>
                </div>
                <Link
                  href="/store"
                  onClick={() => setShowFeedDrawer(false)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider"
                >
                  Shop Store
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 4. WELCOME VOUCHER MODAL ── */}
      <AnimatePresence>
        {showWelcomeModal && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissWelcome}
              className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-xs"
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
                        Voucher Code (Save ₦2,500 on ₦15k+ · 15% off any order)
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
                      <span>Claim ₦2,500 Voucher &amp; Shop Now</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOrderWhatsApp}
                      className="w-full h-11 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} className="text-emerald-600" />
                      <span>Prefer to Order via WhatsApp?</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDismissWelcome}
                      className="w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
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
    </>
  );
}
