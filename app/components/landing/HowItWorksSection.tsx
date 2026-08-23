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
    stepTitle: "Step 01: Booking & Problem Description",
    heading: "TELL US WHAT YOU NEED",
    desc: "Describe the problem or upload a photo/video on the booking request page. Takes under 60 seconds.",
    metricValue: "< 60s",
    metricLabel: "Request Submission Time",
    image: "/tech-working.jpg",
    badgeTitle: "Request Submitted",
    badgeRole: "Clear Problem Description & Media",
    badges: [
      { label: "Photo/Video Upload", icon: FileText, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Location Auto-Locate", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "02",
    label: "Get Matched",
    stepTitle: "Step 02: Smart Artisan Pairing",
    heading: "GET MATCHED WITH PROS",
    desc: "HomeCare pairs you with accredited, location-verified local professionals matching your exact trade needs.",
    metricValue: "< 15m",
    metricLabel: "Average Artisan Match Speed",
    image: "/hero-tech.jpg",
    badgeTitle: "Artisan Matched",
    badgeRole: "Accredited Local Technician",
    badges: [
      { label: "Location Verified", icon: UserCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "NIN Background Checked", icon: ShieldCheck, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ],
  },
  {
    id: "03",
    label: "Agree Scope",
    stepTitle: "Step 03: Upfront Quote Confirmation",
    heading: "AGREE BEFORE WORK STARTS",
    desc: "Know the expected price quote and full scope of work upfront before any job commences. Zero hidden surprises.",
    metricValue: "100%",
    metricLabel: "Upfront Price Lock",
    image: "/pipe-fitting.jpg",
    badgeTitle: "Scope & Price Lock",
    badgeRole: "Zero Hidden Surplus Charges",
    badges: [
      { label: "Fixed Upfront Quote", icon: Tag, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Price Lock Safeguard", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "04",
    label: "Job Execution",
    stepTitle: "Step 04: On-Site Repair & Fixing",
    heading: "GET THE JOB DONE SAFELY",
    desc: "The assigned professional arrives on time, follows safety protocols, and completes the work to specification.",
    metricValue: "4.9★",
    metricLabel: "Job Quality Rating",
    image: "/tech-working.jpg",
    badgeTitle: "Professional Repair",
    badgeRole: "On-Time Safe Execution",
    badges: [
      { label: "On-Time Arrival", icon: Wrench, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Safe Execution", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "05",
    label: "Release Payment",
    stepTitle: "Step 05: Escrow Approval & Payout",
    heading: "APPROVE & RELEASE PAYMENT",
    desc: "Payment is held safely in HomeCare Protection and released only when you confirm satisfaction.",
    metricValue: "100%",
    metricLabel: "Safest Payment Process",
    image: "/hero-tech.jpg",
    badgeTitle: "Safest Payment Process",
    badgeRole: "Funds Released Only Upon Your OK",
    badges: [
      { label: "Safest Payment Process", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Escrow Protection", icon: Lock, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
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
                      Structured process ensuring full accountability, NIN-verified artisans, and 100% deposit protection.
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

          {/* Bottom Frosted Glass Step Tabs (01 - 05) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-200">
            {PROCESS_STEPS.map((step, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Step {step.id}
                    </span>
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {step.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-tight line-clamp-1 block">
                      {step.label}
                    </span>
                    {step.id === "05" && (
                      <span className="text-[9px] font-extrabold uppercase text-emerald-400 block mt-0.5">
                        Safest Process
                      </span>
                    )}
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

