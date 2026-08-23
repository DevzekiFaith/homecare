"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Droplet, 
  Zap, 
  Wind, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

const PROBLEMS = [
  {
    id: "01",
    symptom: "My AC isn't cooling",
    category: "AC & Fridge Repair",
    desc: "Low gas, compressor issues, or dirty filters.",
    tagline: "HVAC & Cooling System Diagnostics",
    metricValue: "15 Mins",
    metricLabel: "Technician Dispatch Time",
    href: "/request?service=AC+%26+Fridge+Repair",
    image: "/slide_ac_cooling.jpg",
    badgeTitle: "Cooling System Diagnostic",
    badgeRole: "Gas Leakage & Compressor Lock Check",
    badges: [
      { label: "Gas Leak Test", icon: Wind, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "NIN Verified Pro", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "02",
    symptom: "My tap keeps leaking",
    category: "Plumber",
    desc: "Worn washers, valve leakage, or pipe pressure.",
    tagline: "Precision Leak & Valve Repair",
    metricValue: "100%",
    metricLabel: "No-Drip Repair Lock",
    href: "/request?service=Plumber",
    image: "/slide_plumbing_unique.jpg",
    badgeTitle: "Leak & Pipe Fixing",
    badgeRole: "Washer Replacement & Valve Swaps",
    badges: [
      { label: "High Pressure Test", icon: Droplet, color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
      { label: "Upfront Quote", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "03",
    symptom: "My socket is sparking",
    category: "Electrician",
    desc: "Overloaded circuit, loose wiring, or breaker trip.",
    tagline: "High & Low Voltage Electrical Safety",
    metricValue: "⚡ Safe",
    metricLabel: "Immediate Circuit Isolation",
    href: "/request?service=Electrician",
    image: "/slide_verified_pro.jpg",
    badgeTitle: "Electrical Panel Safety",
    badgeRole: "Conduit Rewiring & Socket Fixes",
    badges: [
      { label: "Circuit Test", icon: Zap, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Safety Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "04",
    symptom: "My water pump stopped working",
    category: "Plumber",
    desc: "Control box failure, suction blockage, or motor trip.",
    tagline: "Submersible & Surface Pump Overhaul",
    metricValue: "Same Day",
    metricLabel: "Pump Restoration SLA",
    href: "/request?service=Plumber",
    image: "/slide_verified_pros_unique.jpg",
    badgeTitle: "Water Pump Restoration",
    badgeRole: "Control Panel & Suction Line Repair",
    badges: [
      { label: "Control Box Fix", icon: Wrench, color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
      { label: "Motor Testing", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "05",
    symptom: "My door won't lock",
    category: "Carpentry",
    desc: "Misaligned frame, broken mortise lock, or handle failure.",
    tagline: "Security Lock & Frame Alignment",
    metricValue: "100%",
    metricLabel: "Home Security Restoration",
    href: "/request?service=Carpentry",
    image: "/slide_carpentry_unique.jpg",
    badgeTitle: "Door & Mortise Lock Repair",
    badgeRole: "Frame Alignment & Handle Replacement",
    badges: [
      { label: "Mortise Lock Fix", icon: Lock, color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
      { label: "Security Guaranteed", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "06",
    symptom: "My generator isn't starting",
    category: "Electrician & Mechanic",
    desc: "Carburetor blockage, battery drain, or spark plug.",
    tagline: "Diesel & Petrol Generator Servicing",
    metricValue: "Rapid",
    metricLabel: "Power Restoration Dispatch",
    href: "/request?service=Electrician",
    image: "/slide_generator_repair.jpg",
    badgeTitle: "Generator Power Servicing",
    badgeRole: "Carburetor Cleaning & AVR Tuning",
    badges: [
      { label: "Carb Cleaned", icon: Sparkles, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "AVR & Battery Fix", icon: Zap, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

export default function ProblemFinderSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROBLEMS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = PROBLEMS[activeIndex];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 inline-block mb-3 shadow-2xs">
            Symptom Match Finder
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            What&apos;s Wrong With <span className="text-sky-600">Your Home?</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium">
            Select your symptom below. We will instantly pair you with the exact right accredited technician.
          </p>
        </div>

        {/* Flipped Layout: Image Slide on Left, Write-up on Right */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Visual Showcase Card (Slide Flipped to Left) */}
            <div className="lg:col-span-6 relative order-1">
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
                    alt={current.symptom}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark Gradient Overlay */}
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

            {/* RIGHT COLUMN: Write Up / Details (Flipped to Right) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8 order-2">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                      Symptom {current.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                      Matches: {current.category}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight font-heading leading-tight">
                    &ldquo;{current.symptom}&rdquo;
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-4.5 rounded-2xl bg-white border border-sky-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Diagnosed Cause &amp; Trade</span>
                      <span className="text-sm font-extrabold text-slate-900 block mt-0.5">{current.tagline}</span>
                    </div>
                    <Link
                      href={current.href}
                      className="h-11 px-5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>Book Technician Now</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {PROBLEMS.map((prob, idx) => (
                    <button
                      key={prob.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to symptom ${idx + 1}`}
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + PROBLEMS.length) % PROBLEMS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % PROBLEMS.length)}
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
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[170px]">
                  {current.metricLabel}
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Frosted Glass Step Tabs (01 - 06) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-200">
            {PROBLEMS.map((item, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Symptom {item.id}
                    </span>
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {item.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-tight line-clamp-1 block">
                      {item.symptom}
                    </span>
                    <span className={`text-[10px] font-bold block line-clamp-1 mt-0.5 ${active ? "text-emerald-400" : "text-sky-600"}`}>
                      {item.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Assurance Notice */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 p-4 rounded-full max-w-2xl mx-auto text-center"
        >
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>Not sure? Describe your issue on the booking form and our team will assign the right specialist.</span>
        </motion.div>

      </div>
    </section>
  );
}

