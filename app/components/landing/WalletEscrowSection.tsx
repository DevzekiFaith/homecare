"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Wallet, 
  Star, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Tag,
  Wrench
} from "lucide-react";
import Link from "next/link";

const ESCROW_STEPS = [
  {
    id: "01",
    label: "Order Placed",
    sub: "Customer Booking",
    stepTitle: "Step 01: Service Booking & Scope Lock",
    heading: "CUSTOMER PLACES ORDER",
    desc: "The client selects their needed artisan service, agrees on the transparent job quote, and submits the request on HomeCare.",
    metricValue: "100%",
    metricLabel: "Transparent Scope Lock",
    image: "/slide_matching_unique.jpg",
    badgeTitle: "Booking Initiated",
    badgeRole: "Clear Upfront Job Parameters",
    badges: [
      { label: "Transparent Quote", icon: Tag, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Scope Confirmed", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "02",
    label: "Payment Deposited",
    sub: "Held Safely",
    stepTitle: "Step 02: Secure Payment Deposit",
    heading: "PAYMENT HELD SAFELY",
    desc: "Customer deposits payment into HomeCare. Funds are protected and never sent directly to unverified technician bank accounts.",
    metricValue: "🔒 Safe",
    metricLabel: "Zero Direct Transfer Risk",
    image: "/slide_agreed_pricing_unique.jpg",
    badgeTitle: "Protected Payment Deposit",
    badgeRole: "Funds Safely Held In Vault",
    badges: [
      { label: "Bank Escrow", icon: Wallet, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Flutterwave Protected", icon: Lock, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ],
  },
  {
    id: "03",
    label: "Escrow Locked",
    sub: "HomeCare Safeguard",
    stepTitle: "Step 03: HomeCare Payment Lock",
    heading: "LOCKED IN NEUTRAL ESCROW",
    desc: "Funds remain locked in neutral HomeCare Escrow protection. Neither party can tamper with or withdraw funds during the repair process.",
    metricValue: "100%",
    metricLabel: "Escrow Protection Guarantee",
    image: "/slide_escrow_vault_unique.jpg",
    badgeTitle: "HomeCare Escrow Lock",
    badgeRole: "Neutral Vault Security Active",
    badges: [
      { label: "Neutral Vault", icon: ShieldCheck, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Locked Vault", icon: Lock, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "04",
    label: "Repair Execution",
    sub: "Technician Finishes",
    stepTitle: "Step 04: Technician Repair Execution",
    heading: "TECHNICIAN COMPLETES JOB",
    desc: "The assigned NIN-verified artisan arrives on-site, executes the repair work to specification, and submits final completion photos.",
    metricValue: "4.9★",
    metricLabel: "NIN Verified Work Quality",
    image: "/slide_plumbing_unique.jpg",
    badgeTitle: "Professional On-Site Work",
    badgeRole: "Verified Artisan Repair",
    badges: [
      { label: "On-Site Execution", icon: Wrench, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "NIN Verified Pro", icon: UserCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "05",
    label: "Inspection Done",
    sub: "Customer Confirms",
    stepTitle: "Step 05: Client Inspection & Approval",
    heading: "CUSTOMER INSPECTS & CONFIRMS",
    desc: "The homeowner tests the completed work, verifies repair quality, and approves completion on their HomeCare dashboard.",
    metricValue: "1-Click",
    metricLabel: "Customer Release Control",
    image: "/slide_verified_pros_unique.jpg",
    badgeTitle: "Client Quality Sign-Off",
    badgeRole: "Explicit Homeowner Authorization",
    badges: [
      { label: "Customer Approval", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Quality Inspection", icon: CheckCircle2, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
  },
  {
    id: "06",
    label: "Payout Released",
    sub: "Pro Disbursed",
    stepTitle: "Step 06: Automatic Artisan Disbursal",
    heading: "PAYMENT RELEASED TO ARTISAN",
    desc: "Once confirmed, HomeCare automatically releases payment directly to the technician's wallet. Satisfaction guaranteed.",
    metricValue: "⚡ Instant",
    metricLabel: "Automated Artisan Payout",
    image: "/slide_verified_pro.jpg",
    badgeTitle: "Disbursal Complete",
    badgeRole: "Artisan Earns Earnings",
    badges: [
      { label: "Instant Disbursal", icon: ArrowRight, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "100% Satisfied", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

export default function WalletEscrowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ESCROW_STEPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = ESCROW_STEPS[activeIndex];

  return (
    <section className="py-24 px-4 sm:px-6 bg-white text-slate-900 relative z-10 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-4 shadow-2xs">
            <ShieldCheck size={14} />
            <span>Escrow &amp; Payment Safeguard</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase font-heading leading-tight">
            Your Money <span className="text-emerald-600">Stays Protected.</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Payment is held securely according to HomeCare&apos;s payment protection process until the job reaches the agreed completion stage and you explicitly approve.
          </p>
        </div>

        {/* Modern Split Interactive Showcase Container */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                    {current.stepTitle}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                    {current.heading}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase tracking-wider">
                      <Lock size={15} className="text-emerald-600" />
                      <span>HomeCare Escrow Protection Active</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Zero upfront financial risk for homeowners. Funds released exclusively upon client inspection sign-off.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {ESCROW_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to step ${idx + 1}`}
                      className={`transition-all duration-300 cursor-pointer ${
                        activeIndex === idx
                          ? "w-8 h-2.5 bg-emerald-600 rounded-full shadow-xs"
                          : "w-2.5 h-2.5 bg-slate-400 hover:bg-slate-600 rounded-full"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveIndex((prev) => (prev - 1 + ESCROW_STEPS.length) % ESCROW_STEPS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % ESCROW_STEPS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Big Bold Stat Metric */}
              <div className="pt-4 border-t border-slate-200/80 flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
                  {current.metricValue}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[150px]">
                  {current.metricLabel}
                </span>
              </div>

            </div>

            {/* Right Card Column: Visual Showcase */}
            <div className="lg:col-span-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden min-h-[380px] sm:min-h-[440px] flex flex-col justify-between p-6 sm:p-8 shadow-2xl border border-slate-900/10 group"
                >
                  {/* Background Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.image}
                    alt={current.badgeTitle}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge */}
                  <div className="relative z-10 self-start p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 max-w-xs shadow-lg">
                    <h5 className="text-base font-black text-white tracking-tight">
                      {current.badgeTitle}
                    </h5>
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                      → {current.badgeRole}
                    </p>
                  </div>

                  {/* Bottom Overlay Badges */}
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {current.badges.map((badge, idx) => {
                        const Icon = badge.icon;
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${badge.color}`}
                          >
                            <Icon size={13} />
                            <span>{badge.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

          {/* Bottom Frosted Glass Step Tabs (01 - 06) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-200">
            {ESCROW_STEPS.map((step, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-emerald-500 shadow-lg scale-102 ring-2 ring-emerald-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-emerald-400" : "text-slate-400"}`}>
                      Step {step.id}
                    </span>
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {step.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-tight line-clamp-1">
                      {step.label}
                    </span>
                    <span className={`text-[10px] font-medium block line-clamp-1 mt-0.5 ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {step.sub}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/request"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Book With Payment Protection</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}

