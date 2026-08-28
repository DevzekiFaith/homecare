"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  UserCheck, 
  Fingerprint, 
  Award, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ThumbsUp, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";

const VERIFICATION_STEPS = [
  {
    id: "01",
    tabLabel: "NIN Check",
    phaseTag: "Phase #1: National Identity Check",
    heading: "100% Government NIN Verified",
    desc: "Every candidate submits their 11-digit National Identity Number (NIN), cross-referenced directly with national identity databases via accredited identity providers (Dojah / Prembly).",
    metricValue: "100%",
    metricLabel: "NIMC Identity Verification SLA",
    proName: "Babatunde Adeleke",
    proRole: "Why Babatunde is a verified fit",
    image: "/slide_verified_pros_unique.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "NIN Verified", icon: Fingerprint, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Identity Matched", icon: ShieldCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Rated ★ 4.9", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "02",
    tabLabel: "Background Vetting",
    phaseTag: "Phase #2: Physical & Criminal Vetting",
    heading: "Background & Address Checked",
    desc: "Physical address verification, guarantor confirmation, and criminal history checks ensure we know exactly who is entering your private residence.",
    metricValue: "Checked",
    metricLabel: "Physical & Address Audit Rate",
    proName: "Felix Ogundele",
    proRole: "Why Felix is a verified fit",
    image: "/slide_plumbing_unique.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Address Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Guarantor Locked", icon: Lock, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "Rated ★ 4.9", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "03",
    tabLabel: "Trade Evaluation",
    phaseTag: "Phase #3: Trade Skill Assessment",
    heading: "Skill & Experience Evaluated",
    desc: "Professionals undergo trade history verification, previous project portfolio reviews, and technical skill testing before receiving active dispatch status.",
    metricValue: "Accredited",
    metricLabel: "Trade Skill & Quality Standard",
    proName: "David Okon",
    proRole: "Why David is a verified fit",
    image: "/tech-working.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Trade Accredited", icon: Award, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Safety Tested", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "04",
    tabLabel: "SLA Monitoring",
    phaseTag: "Phase #4: Continuous Rating SLA",
    heading: "Strict Continuous Rating SLA",
    desc: "Pros maintain minimum 4.5★ customer satisfaction performance ratings. Any breach of safety, price inflation, or misconduct results in immediate account suspension.",
    metricValue: "4.5★ Min",
    metricLabel: "Enforced Customer Rating Floor",
    proName: "HomeCare Security Gate",
    proRole: "Continuous SLA Monitoring Active",
    image: "/slide_verified_pro.jpg",
    badges: [
      { label: "SLA Compliant", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Zero Tolerance", icon: Lock, color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
      { label: "Escrow Protected", icon: Sparkles, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
  },
];

export default function VerificationSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VERIFICATION_STEPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = VERIFICATION_STEPS[activeIndex];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white text-slate-900 relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-black uppercase tracking-widest text-sky-700 mb-4 shadow-2xs">
            <ShieldCheck size={14} className="text-sky-600" />
            <span>Transparency &amp; Trust Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            HOW WE VERIFY <span className="text-sky-600">PROFESSIONALS</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            Trust doesn&apos;t come from exaggerated marketing claims. It comes from transparent processes, government ID cross-referencing, and real performance accountability.
          </p>
        </motion.div>

        {/* Split Interactive Container matching candidate card UI layout */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Image Showcase Card (Positioned on Left) */}
            <div className="lg:col-span-7 relative order-1">
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
                    alt={current.proName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge */}
                  <div className="relative z-10 self-start p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 max-w-xs shadow-lg">
                    <h5 className="text-lg font-black text-white tracking-tight">
                      {current.proName}
                    </h5>
                    <p className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mt-0.5">
                      → {current.proRole}
                    </p>
                  </div>

                  {/* Bottom Overlay Badges */}
                  <div className="relative z-10 space-y-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      {current.badges.map((badge, idx) => {
                        const Icon = badge.icon;
                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-sm ${badge.color}`}
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

            {/* RIGHT COLUMN: Writeup & Metrics (Positioned on Right) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8 order-2">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                    {current.phaseTag}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading leading-snug">
                    {current.heading}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {VERIFICATION_STEPS.map((step, idx) => (
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + VERIFICATION_STEPS.length) % VERIFICATION_STEPS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % VERIFICATION_STEPS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Big Bold Stat Metric */}
              <div className="pt-4 border-t border-slate-200/80 flex items-baseline gap-4">
                <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-heading">
                  {current.metricValue}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[160px]">
                  {current.metricLabel}
                </span>
              </div>

            </div>

          </div>

          {/* Bottom Step Tabs (01 - 04) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
            {VERIFICATION_STEPS.map((step, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Phase {step.id}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider truncate block mt-0.5">
                      {step.tabLabel}
                    </span>
                  </div>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {step.id}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Detailed Verification Protocol Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/verification"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:scale-102 cursor-pointer"
          >
            <span>Read Complete Verification Standard</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
