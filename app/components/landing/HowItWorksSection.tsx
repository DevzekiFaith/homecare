"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  UserCheck, 
  Tag, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import Link from "next/link";

const PROCESS_STEPS = [
  {
    id: "01",
    label: "Tell Us Need",
    stepTitle: "Step 01: Service Request",
    heading: "1. TELL US WHAT YOU NEED",
    desc: "Describe your repair or maintenance problem, select your trade, and provide your location or photos on the request page.",
    metricValue: "< 60s",
    metricLabel: "Simple Submission Time",
    image: "/slide_matching_unique.jpg",
    badgeTitle: "Request Submitted",
    badgeRole: "Clear Problem Description & Media",
    badges: [
      { label: "Photo/Video Upload", icon: FileText, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Location Auto-Locate", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "02",
    label: "Find Pro",
    stepTitle: "Step 02: Verification Pairing",
    heading: "2. FIND A VERIFIED PROFESSIONAL",
    desc: "HomeCare matches your job with nearby government NIN-verified professionals evaluated for trade expertise and reliability.",
    metricValue: "100%",
    metricLabel: "NIN Identity & Background Checked",
    image: "/slide_verified_pros_unique.jpg",
    badgeTitle: "Professional Matched",
    badgeRole: "Accredited Local Professional",
    badges: [
      { label: "Location Verified", icon: UserCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "NIN Background Checked", icon: ShieldCheck, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ],
  },
  {
    id: "03",
    label: "Agree Job",
    stepTitle: "Step 03: Upfront Quote Lock",
    heading: "3. AGREE ON THE JOB",
    desc: "Receive a transparent pricing quote and scope of work upfront before any job commences. Zero hidden extra charges.",
    metricValue: "₦0",
    metricLabel: "Surprise Surplus Charges",
    image: "/slide_agreed_pricing_unique.jpg",
    badgeTitle: "Scope & Price Lock",
    badgeRole: "Zero Hidden Extra Costs",
    badges: [
      { label: "Fixed Upfront Quote", icon: Tag, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Scope Protection", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "04",
    label: "Pay Securely",
    stepTitle: "Step 04: Escrow Protection",
    heading: "4. PAY SECURELY",
    desc: "Your payment is deposited safely into HomeCare Escrow and never sent directly to professionals before work starts.",
    metricValue: "100%",
    metricLabel: "Escrow Deposit Security",
    image: "/slide_escrow_vault_unique.jpg",
    badgeTitle: "HomeCare Escrow Active",
    badgeRole: "Funds Held In Protected Vault",
    badges: [
      { label: "Escrow Vault Lock", icon: Lock, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Payment Safeguard", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "05",
    label: "Track Service",
    stepTitle: "Step 05: Dispatch & Transit Tracking",
    heading: "5. TRACK THE SERVICE",
    desc: "Track the assigned professional's transit, dispatch status, and estimated arrival time directly on your HomeCare screen.",
    metricValue: "Live",
    metricLabel: "Transit & Dispatch Tracking",
    image: "/slide_plumbing_unique.jpg",
    badgeTitle: "Professional Transit",
    badgeRole: "On-Time Arrival Tracking",
    badges: [
      { label: "Dispatch ETA", icon: Wrench, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Service Tracking", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "06",
    label: "Confirm Done",
    stepTitle: "Step 06: Inspection & Release",
    heading: "6. CONFIRM COMPLETION",
    desc: "Inspect and test the completed work. Funds are released from escrow only when you explicitly confirm satisfaction.",
    metricValue: "1-Click",
    metricLabel: "Customer Release Sign-off",
    image: "/slide_verified_pro.jpg",
    badgeTitle: "Client Inspection Sign-Off",
    badgeRole: "Funds Released Upon Approval",
    badges: [
      { label: "Customer Approval", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Quality Tested", icon: Sparkles, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "07",
    label: "Review/Rebook",
    stepTitle: "Step 07: Rating & Post-Service Support",
    heading: "7. REVIEW / REBOOK",
    desc: "Rate your professional, save them to your trusted favorites, and enjoy 30-day post-service follow-up protection.",
    metricValue: "30 Days",
    metricLabel: "Post-Service Follow-Up Support",
    image: "/tech-working.jpg",
    badgeTitle: "Follow-Up Protection Active",
    badgeRole: "Rebook Favorite Professionals Anytime",
    badges: [
      { label: "30-Day Support", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rebook Favorite Pro", icon: UserCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
  },
];

export default function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROCESS_STEPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = PROCESS_STEPS[activeIndex];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 inline-block mb-3 shadow-2xs">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            How HomeCare <span className="text-sky-600">Works</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium">
            From problem request to protected payout — zero guesswork at every stage.
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                    {current.stepTitle}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                    {current.heading}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center gap-2 text-sky-700 font-black text-xs uppercase tracking-wider">
                      <ShieldCheck size={15} className="text-sky-600" />
                      <span>{current.id === "05" ? "Safest Payment Process Active" : "Guaranteed HomeCare Standard"}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Structured process ensuring full accountability, NIN-verified professionals, and 100% deposit protection.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {PROCESS_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to step ${idx + 1}`}
                      className={`transition-all duration-300 cursor-pointer ${
                        activeIndex === idx
                          ? "w-8 h-2.5 bg-sky-600 rounded-full shadow-xs"
                          : "w-2.5 h-2.5 bg-slate-400 hover:bg-slate-600 rounded-full"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveIndex((prev) => (prev - 1 + PROCESS_STEPS.length) % PROCESS_STEPS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % PROCESS_STEPS.length)}
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
                    <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mt-0.5">
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

          {/* Bottom Frosted Glass Step Tabs (01 - 07) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-6 border-t border-slate-200">
            {PROCESS_STEPS.map((step, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Step {step.id}
                    </span>
                    <div className={`h-5 w-5 rounded-lg flex items-center justify-center font-black text-[9px] ${
                      active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {step.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-tight line-clamp-1 block">
                      {step.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Action Button */}
        <div className="text-center mt-12">
          <Link
            href="/request"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Book a Service Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}

