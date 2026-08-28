"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Building2, 
  Home, 
  Key, 
  ShieldCheck, 
  ArrowRight, 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from "lucide-react";

const TARGETS = [
  {
    id: "01",
    title: "HOMEOWNERS",
    subtitle: "Single Family Residences",
    desc: "Routine preventive maintenance, electrical audits, and emergency repair dispatch before issues cause costly structural damage.",
    metricValue: "24/7",
    metricLabel: "Emergency Priority Dispatch SLA",
    image: "/slide_verified_pro.jpg",
    badgeTitle: "Homeowner Protection",
    badgeRole: "Routine Maintenance & Emergency SLA",
    perks: ["Routine call-outs", "Emergency priority", "Appliance protection"],
    badges: [
      { label: "Routine Audits", icon: Home, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Emergency SLA", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "02",
    title: "LANDLORDS",
    subtitle: "Residential Apartments & Units",
    desc: "Seamless tenant move-in/move-out inspection sweeps, water pump servicing, and rapid response for multi-unit properties.",
    metricValue: "100%",
    metricLabel: "Centralized Invoicing & Sweeps",
    image: "/slide_ac_cooling.jpg",
    badgeTitle: "Multi-Unit Property Sweep",
    badgeRole: "Pre-Tenant Inspections & Audits",
    perks: ["Pre-tenant sweeps", "Plumbing & wiring audits", "Centralized invoicing"],
    badges: [
      { label: "Pre-Tenant Sweeps", icon: Key, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
      { label: "Plumbing Audits", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    ],
  },
  {
    id: "03",
    title: "PROPERTY MANAGERS",
    subtitle: "Estates & Gated Communities",
    desc: "Dedicated account manager, assigned multi-trade professional teams, and scheduled preventive sweeps across multiple locations.",
    metricValue: "Dedicated",
    metricLabel: "Account Manager & Multi-Trade SLA",
    image: "/slide_property_estate.jpg",
    badgeTitle: "Estate & Facility Contracts",
    badgeRole: "Multi-Location Preventive Sweeps",
    perks: ["Multi-property contracts", "24/7 Dispatch SLA", "Dedicated Account Manager"],
    badges: [
      { label: "Dedicated Manager", icon: Building2, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "Multi-Location SLA", icon: Sparkles, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    ],
  },
  {
    id: "04",
    title: "BUSINESSES & FACILITIES",
    subtitle: "Commercial & Office Spaces",
    desc: "Office AC & generator servicing, water filter maintenance, and routine safety audits for corporate and retail environments.",
    metricValue: "Preferred",
    metricLabel: "B2B Commercial Pricing Plans",
    image: "/tech-working.jpg",
    badgeTitle: "Corporate Facility SLA",
    badgeRole: "Office AC & Power Generator Plans",
    perks: ["Commercial AC plans", "Generator maintenance", "Preferred B2B pricing"],
    badges: [
      { label: "Commercial AC", icon: ClipboardCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Generator Servicing", icon: ShieldCheck, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

export default function PropertyFacilitySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TARGETS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = TARGETS[activeIndex];

  return (
    <section className="py-20 px-4 sm:px-6 bg-white relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 mb-3 inline-block shadow-2xs">
            Facility &amp; Property Protection Plans
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            TAILORED PROTECTION FOR <br />
            <span className="text-sky-600">EVERY PROPERTY SCALE</span>
          </h2>
          <p className="mt-3 text-slate-600 text-xs sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            From single-family residences to 50-unit estates and commercial office suites, HomeCare offers transparent recurring maintenance contracts.
          </p>
        </motion.div>

        {/* Modern Split Interactive Showcase Container */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[28px] sm:rounded-[40px] p-4 sm:p-8 lg:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-8">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="space-y-4 sm:space-y-5"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                    {current.subtitle}
                  </span>

                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading">
                    {current.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-sky-600 tracking-wider block">Key Included Plan Perks</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {current.perks.map((perk, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {TARGETS.map((target, idx) => (
                    <button
                      key={target.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to target ${idx + 1}`}
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + TARGETS.length) % TARGETS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % TARGETS.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Big Bold Stat Metric */}
              <div className="pt-4 border-t border-slate-200/80 flex items-baseline gap-4">
                <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
                  {current.metricValue}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[150px]">
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
                  className="relative rounded-[24px] sm:rounded-[36px] overflow-hidden min-h-[320px] sm:min-h-[440px] flex flex-col justify-between p-4 sm:p-8 shadow-2xl border border-slate-900/10 group"
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

          {/* Bottom Frosted Glass Step Tabs (01 - 04) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
            {TARGETS.map((target, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={target.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between h-full ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Profile {target.id}
                    </span>
                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center font-black text-[10px] ${
                      active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {target.id}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-tight line-clamp-1 block">
                      {target.title}
                    </span>
                    <span className={`text-[10px] font-medium block line-clamp-1 mt-0.5 ${active ? "text-slate-300" : "text-slate-500"}`}>
                      {target.subtitle}
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
            href="/property-management"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all hover:scale-102 cursor-pointer"
          >
            <span>MANAGE MY PROPERTY</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}

