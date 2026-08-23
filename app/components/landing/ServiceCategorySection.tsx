"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Sparkles, 
  Home, 
  Zap, 
  Droplet, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Snowflake, 
  Hammer, 
  Paintbrush, 
  UserCheck, 
  Tag, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const CATEGORY_SLIDES = [
  {
    id: "01",
    name: "Electrical & Wiring",
    slug: "electrical",
    count: "120+ Verified Pros",
    tagline: "High & Low Voltage Specialists",
    desc: "Complete house wiring, conduit fittings, circuit breaker trips, inverter/solar setups, socket repairs, and lighting installations.",
    metricValue: "120+",
    metricLabel: "Active Electricians in Lagos",
    image: "/slide_verified_pro.jpg",
    proName: "Master Electrical Engineering",
    proRole: "Safety-Tested Conduit & Panel Wiring",
    badges: [
      { label: "NIN Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "24/7 Response", icon: Zap, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "15-Min Match", icon: Sparkles, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
    link: "/request?category=electrical",
  },
  {
    id: "02",
    name: "AC & Refrigeration",
    slug: "ac",
    count: "85+ Verified Pros",
    tagline: "HVAC & Cooling Systems",
    desc: "Split AC installation, gas refilling, compressor diagnostics, duct cleaning, and industrial refrigerator repairs.",
    metricValue: "85+",
    metricLabel: "Cooling System Experts",
    image: "/slide_ac_cooling.jpg",
    proName: "HVAC & Refrigeration Technicians",
    proRole: "R22/R410a Gas Refills & Servicing",
    badges: [
      { label: "Gas Leak Testing", icon: Snowflake, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Compressor Lock", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "4.9★ Rated", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
    link: "/request?category=ac",
  },
  {
    id: "03",
    name: "Carpentry & Furniture",
    slug: "carpentry",
    count: "90+ Verified Pros",
    tagline: "Custom Woodwork & Repairs",
    desc: "Door lock fittings, kitchen cabinet construction, wardrobe repairs, bed frame assembly, and hardwood flooring.",
    metricValue: "90+",
    metricLabel: "Master Carpenters & Joiners",
    image: "/slide_carpentry_unique.jpg",
    proName: "Precision Cabinetry & Joinery",
    proRole: "Custom Furniture & Door Fittings",
    badges: [
      { label: "Precision Fittings", icon: Hammer, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "NIN Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Custom Woodwork", icon: Home, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
    link: "/request?category=carpentry",
  },
  {
    id: "04",
    name: "Painting & Masonry",
    slug: "painting",
    count: "65+ Verified Pros",
    tagline: "Exterior & Interior Finishes",
    desc: "POP ceiling repairs, damp proofing wall treatments, exterior weatherproofing paints, tiling, and block work.",
    metricValue: "65+",
    metricLabel: "Certified Painters & Masons",
    image: "/slide_painting_unique.jpg",
    proName: "Premium Wall Finishing & POP",
    proRole: "Anti-Damp Treatment & Tiling",
    badges: [
      { label: "Anti-Damp Seal", icon: Paintbrush, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "POP & Tiling", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Clean Finish", icon: Sparkles, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
    link: "/request?category=painting",
  },
  {
    id: "05",
    name: "Generator Repair",
    slug: "generator",
    count: "70+ Verified Pros",
    tagline: "Diesel & Petrol Plant Engineers",
    desc: "Automatic changeover switch panels, AVR voltage regulator replacements, diesel plant overhauling, and carb servicing.",
    metricValue: "70+",
    metricLabel: "Generator Mechanics",
    image: "/slide_generator_repair.jpg",
    proName: "Power Plant & Generator Service",
    proRole: "Diesel/Petrol Overhauling & AVR",
    badges: [
      { label: "Auto Changeover", icon: Zap, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "AVR & Carb Servicing", icon: Wrench, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "NIN Verified", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
    link: "/request?category=generator",
  },
  {
    id: "06",
    name: "General Handyman",
    slug: "general",
    count: "150+ Verified Pros",
    tagline: "Multi-Skilled Home Fixers",
    desc: "TV wall mounts, curtain rod fittings, fixture assembly, plumbing leaks, minor electrical touchups, and home maintenance.",
    metricValue: "150+",
    metricLabel: "Multi-Skilled Handymen",
    image: "/slide_handyman_unique.jpg",
    proName: "Express All-Round Handyman",
    proRole: "Rapid Home Fixture Repairs",
    badges: [
      { label: "Same-Day Dispatch", icon: Sparkles, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Multi-Skilled Pro", icon: UserCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Upfront Pricing", icon: Tag, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ],
    link: "/request?category=general",
  },
];

export default function ServiceCategorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CATEGORY_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = CATEGORY_SLIDES[activeIndex];

  return (
    <section className="relative z-20 px-4 sm:px-6 -mt-16 sm:-mt-20 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Modern Split Interactive Showcase Container */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-white border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 shadow-2xs">
                Full Service Coverage
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Explore Top Service Trades
              </h2>
            </div>
            <Link
              href="/request"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              <span>Book Any Artisan Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>

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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                      Category {current.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                      {current.count}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                    {current.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-sky-100 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Trade Specialty</span>
                      <span className="text-sm font-extrabold text-slate-900 block mt-0.5">{current.tagline}</span>
                    </div>
                    <Link
                      href={current.link}
                      className="h-10 px-5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all hover:scale-102 cursor-pointer"
                    >
                      <span>Book {current.name.split(" ")[0]}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {CATEGORY_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to trade ${idx + 1}`}
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + CATEGORY_SLIDES.length) % CATEGORY_SLIDES.length)}
                    className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % CATEGORY_SLIDES.length)}
                    className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
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
                    alt={current.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge */}
                  <div className="relative z-10 self-start p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 max-w-xs shadow-lg">
                    <h5 className="text-base font-black text-white tracking-tight">
                      {current.proName}
                    </h5>
                    <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mt-0.5">
                      → {current.proRole}
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
            {CATEGORY_SLIDES.map((slide, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Trade {slide.id}
                    </span>
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      active ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {slide.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-tight line-clamp-1 block">
                      {slide.name}
                    </span>
                    <span className={`text-[10px] font-bold block line-clamp-1 mt-0.5 ${active ? "text-emerald-400" : "text-sky-600"}`}>
                      {slide.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

