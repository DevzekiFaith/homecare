"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCheck, 
  Tag, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  Star, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";
import Link from "next/link";

const SLIDES = [
  {
    id: "01",
    tabLabel: "Verified Pros",
    problemTag: "Problem #1: Identity & Trust Risk",
    question: "WHO IS TRUSTWORTHY?",
    problemDesc: "Inviting a stranger into your private home without knowing their history, real name, or identity background.",
    solutionTag: "VERIFIED PROFESSIONALS",
    solutionTitle: "100% Government NIN Verified",
    solutionDesc: "Every professional undergoes mandatory government NIN identity verification, criminal background checks, and technical trade evaluations before stepping into your home.",
    metricValue: "99.8%",
    metricLabel: "Artisan Satisfaction Rate",
    proName: "Babatunde Adeleke",
    proRole: "Lead Electrical Engineer · Lagos",
    image: "/slide_verified_pros_unique.jpg",
    badges: [
      { label: "NIN Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "4.9★ Rated", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "140+ Jobs Done", icon: UserCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
  },
  {
    id: "02",
    tabLabel: "Agreed Pricing",
    problemTag: "Problem #2: Surprise Inflation",
    question: "WHAT WILL IT COST?",
    problemDesc: "Artisans changing prices mid-way, adding surprise extra charges, or overcharging for standard materials.",
    solutionTag: "AGREED PRICING",
    solutionTitle: "Transparent Upfront Quotes",
    solutionDesc: "You know the exact expected price and scope of work upfront before any job commences. Zero hidden surprises or last-minute price inflation.",
    metricValue: "₦0",
    metricLabel: "Hidden Extra Charges",
    proName: "Upfront Price Guarantee",
    proRole: "Guaranteed Scope & Cost Lock",
    image: "/slide_agreed_pricing_unique.jpg",
    badges: [
      { label: "Fixed Upfront Quote", icon: Tag, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Price Lock Protection", icon: Zap, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "Transparent Parts Cost", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "03",
    tabLabel: "Protected Escrow",
    problemTag: "Problem #3: Abandoned Repairs",
    question: "WHAT IF THE JOB GOES WRONG?",
    problemDesc: "Artisans taking upfront deposits and abandoning the work, or performing a poor repair with no recourse.",
    solutionTag: "PROTECTED PAYMENTS",
    solutionTitle: "HomeCare Payment Protection",
    solutionDesc: "Your funds stay safely held in HomeCare Escrow and are only released when you inspect, test, and approve the completed job.",
    metricValue: "100%",
    metricLabel: "Protected Deposit Guarantee",
    proName: "HomeCare Escrow Protection",
    proRole: "Funds Released Only Upon Your OK",
    image: "/slide_escrow_vault_unique.jpg",
    badges: [
      { label: "Escrow Deposit Lock", icon: Lock, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Inspection Required", icon: Sparkles, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "100% Recourse Guarantee", icon: ShieldCheck, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

export default function ProblemStorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = SLIDES[activeIndex];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white text-slate-900 relative overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-black uppercase tracking-widest text-rose-700 mb-4 shadow-2xs">
            <HelpCircle size={14} className="animate-pulse" />
            <span>The Reality of Home Repairs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase font-heading leading-tight">
            Finding Someone To Fix Your Home <br />
            <span className="text-sky-600">Shouldn&apos;t Feel Like A Gamble.</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            Traditional home repairs are full of uncertainty. HomeCare replaces guesswork with structured trust, transparent quotes, and payment protection.
          </p>
        </motion.div>

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
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-100/70 border border-rose-200 px-3 py-1 rounded-full inline-block">
                    {current.problemTag}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                    {current.question}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    {current.problemDesc}
                  </p>

                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-sky-700 font-black text-xs uppercase tracking-wider">
                      <ShieldCheck size={16} className="text-sky-600" />
                      <span>{current.solutionTag}</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {current.solutionTitle}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {current.solutionDesc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators (Inspired by Image 1) */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % SLIDES.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Big Bold Stat Metric (Inspired by Image 1) */}
              <div className="pt-4 border-t border-slate-200/80 flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
                  {current.metricValue}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[140px]">
                  {current.metricLabel}
                </span>
              </div>

            </div>

            {/* Right Card Column: Visual Showcase (Inspired by Image 1 & Image 2) */}
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
                    alt={current.proName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge (Image 1 Style) */}
                  <div className="relative z-10 self-start p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 max-w-xs shadow-lg">
                    <h5 className="text-base font-black text-white tracking-tight">
                      {current.proName}
                    </h5>
                    <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mt-0.5">
                      → {current.proRole}
                    </p>
                  </div>

                  {/* Bottom Overlay Badges (Image 1 & Image 2 Pill Style) */}
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

          {/* Bottom Frosted Glass Step Tabs (Inspired by Image 2: 01, 02, 03) */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200">
            {SLIDES.map((slide, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Step {slide.id}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider truncate block mt-0.5">
                      {slide.tabLabel}
                    </span>
                  </div>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {slide.id}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Action Callout */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/request"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 hover:translate-x-1 transition-all"
          >
            <span>Experience Stress-Free Repairs Now</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

