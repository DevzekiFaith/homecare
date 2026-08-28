"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ThumbsUp, CheckCircle2, ShieldCheck, Lock, AlertCircle } from "lucide-react";

const CLIENT_OUTCOMES = [
  {
    id: "01",
    tabLabel: "Temiloluwa & Folake (Ikeja GRA)",
    tag: "Family Home Plumbing Outcome",
    heading: "Kitchen Pipe Burst Stopped Cleanly Under Escrow",
    desc: "Age-long kitchen pipe burst causing severe flooding under the sink vanity. Verified plumber arrived within 45 minutes, replaced corroded copper fittings, and stopped the leak with zero property damage for the family.",
    problem: "Kitchen pipe burst causing severe under-sink flooding",
    outcome: "Corroded fittings replaced & leak stopped under 2 hours",
    metricValue: "5.0★",
    metricLabel: "Verified Plumbing Service Rating",
    customerName: "Alhaji Temiloluwa & Folake A.",
    customerRole: "Homeowner & Family · Ikeja GRA, Lagos",
    customerAvatar: "/testimonials/folake_ogundele.png",
    customerAttire: "Yoruba Family · Rich Aso-Oke Lace & Traditional Gele",
    image: "/testimonials/folake_ogundele.png",
    badges: [
      { label: "Family Home Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Plumbing Pro", icon: CheckCircle2, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Escrow Locked", icon: Lock, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "02",
    tabLabel: "Otunba Rotimi (Lekki Estate)",
    tag: "Estate & Facility Management Outcome",
    heading: "12-Unit Apartment Water Booster & Electrical Sweep",
    desc: "Scheduled quarterly preventive maintenance across 12 rental units in Lekki. Verified multi-trade team serviced 3 water booster pumps, balanced breaker panels, and cleared main drains seamlessly.",
    problem: "Water booster pressure failure & circuit breaker tripping",
    outcome: "3 booster pumps serviced & panels balanced",
    metricValue: "100%",
    metricLabel: "Facility Tenant Satisfaction Rate",
    customerName: "Otunba Rotimi Adebayo",
    customerRole: "Estate Landlord & Facility Owner · Lekki Phase 1, Lagos",
    customerAvatar: "/testimonials/rotimi_adebayo.png",
    customerAttire: "Yoruba High Chief · Royal Embroidered Agbada & Fila Gobi",
    image: "/testimonials/rotimi_adebayo.png",
    badges: [
      { label: "Commercial Facility", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Multi-Trade Team", icon: ShieldCheck, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "12 Units Certified", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "03",
    tabLabel: "Dr. Abiola (VI Medical Clinic)",
    tag: "Clinic & Business HVAC Outcome",
    heading: "Clinic Consultation Room Cooling Restored",
    desc: "Two clinic consultation room AC units stopped cooling due to gas leakage. HVAC professional pressure-tested gas lines, refilled R410a coolant, and restored ice-cold airflow for patients and staff.",
    problem: "Clinic AC units stopped cooling due to gas leak",
    outcome: "Gas lines pressure-tested & R410a refilled",
    metricValue: "30 Days",
    metricLabel: "Post-Job Warranty Guarantee",
    customerName: "Dr. (Mrs) Abiola Adeyemi-Ojo",
    customerRole: "Medical Director & Clinic Owner · Victoria Island, Lagos",
    customerAvatar: "/testimonials/clinic_doctor_business.jpg",
    customerAttire: "Yoruba Medical Director · Corporate Clinical Blazer & Coral Beads",
    image: "/testimonials/clinic_doctor_business.jpg",
    badges: [
      { label: "Business Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "HVAC Specialist", icon: ShieldCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "R410a Refilled", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "04",
    tabLabel: "Engr. Babatunde (Bodija Ibadan)",
    tag: "Residential Compound Electrical Outcome",
    heading: "Borehole Surge Control Box Rewired Same-Day",
    desc: "Borehole pump control box blew out during a sudden power surge in Bodija. Electrician replaced damaged control panel and rewired surge protection safely.",
    problem: "Borehole pump control box blown during power surge",
    outcome: "Control panel replaced & surge protection rewired",
    metricValue: "Same Day",
    metricLabel: "Borehole Power Restoration SLA",
    customerName: "Engr. Babatunde Oladipo",
    customerRole: "Compound Landlord · Bodija, Ibadan",
    customerAvatar: "/testimonials/testimonial_adebayo.jpg",
    customerAttire: "Yoruba Landlord · Tailored Agbada & Native Fila",
    image: "/testimonials/testimonial_adebayo.jpg",
    badges: [
      { label: "Compound Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Electrical Pro", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Surge Protected", icon: CheckCircle2, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "05",
    tabLabel: "Toluwanimi & Ayo (Abeokuta)",
    tag: "New Home Entrance & Carpentry Outcome",
    heading: "Front Door Security Mortise Lock Fully Aligned",
    desc: "Damaged front door mortise lock and unaligned wooden door frame causing security risks. Carpenter re-aligned door frame, installed heavy-duty mortise lock, and restored full entrance security.",
    problem: "Damaged mortise lock & unaligned wooden frame",
    outcome: "Frame re-aligned & heavy-duty lock installed",
    metricValue: "Pre-Agreed",
    metricLabel: "Upfront Fixed Price Lock",
    customerName: "Mrs. Toluwanimi & Ayodele Alabi",
    customerRole: "New Homeowners · Ibara Housing Estate, Abeokuta",
    customerAvatar: "/testimonials/toluwanimi_alabi.png",
    customerAttire: "New Homeowner · Vibrant Yoruba Iro, Buba & Ankara",
    image: "/testimonials/toluwanimi_alabi.png",
    badges: [
      { label: "Homeowner Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Carpentry Pro", icon: CheckCircle2, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "Frame Aligned", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CLIENT_OUTCOMES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = CLIENT_OUTCOMES[activeIndex];

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
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 mb-3 inline-block shadow-2xs">
            Verified Client Outcomes &amp; Ratings
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            LOVED BY HOMEOWNERS <br />
            <span className="text-sky-600">&amp; BUSINESSES ACROSS NIGERIA</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Real verified repairs and maintenance completed for Nigerian families, healthcare clinics, business owners, and estate managers with 100% escrow protection.
          </p>
        </motion.div>

        {/* Split Interactive Container (Image on LEFT: order-1, Writeup on RIGHT: order-2) */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[28px] sm:rounded-[40px] p-4 sm:p-8 lg:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Candidate / Client Showcase Image Card (Image on LEFT: order-1, lg:col-span-7) */}
            <div className="lg:col-span-7 relative order-1">
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
                    alt={current.customerName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge with Avatar */}
                  <div className="relative z-10 self-start p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/20 max-w-sm shadow-xl flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-sky-400 shrink-0 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.customerAvatar}
                        alt={current.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-white tracking-tight leading-tight">
                        {current.customerName}
                      </h5>
                      <p className="text-[10.5px] font-bold text-sky-300 uppercase tracking-wider mt-0.5">
                        {current.customerRole}
                      </p>
                      <span className="text-[9px] font-semibold text-emerald-400 block mt-0.5">
                        ✓ {current.customerAttire}
                      </span>
                    </div>
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

            {/* RIGHT COLUMN: Writeup & Metrics (Writeup on RIGHT: order-2, lg:col-span-5) */}
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 border border-sky-200 px-3 py-1 rounded-full inline-block">
                      {current.tag}
                    </span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight font-heading leading-snug">
                    {current.heading}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {current.desc}
                  </p>

                  {/* Problem & Outcome Cards */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5">
                      <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-rose-900 uppercase text-[10px] block">Problem:</span>
                        <p className="text-slate-700 font-semibold">{current.problem}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-emerald-900 uppercase text-[10px] block">Outcome:</span>
                        <p className="text-slate-700 font-semibold">{current.outcome}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Minimalist Pill Slider Progress Indicators */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
                  {CLIENT_OUTCOMES.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Go to review ${idx + 1}`}
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
                    onClick={() => setActiveIndex((prev) => (prev - 1 + CLIENT_OUTCOMES.length) % CLIENT_OUTCOMES.length)}
                    className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % CLIENT_OUTCOMES.length)}
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

          {/* Bottom Step Tabs (01 - 05) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-slate-200">
            {CLIENT_OUTCOMES.map((item, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all text-left cursor-pointer flex items-center gap-3 ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.customerAvatar}
                      alt={item.customerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest block ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Review {item.id}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider truncate block mt-0.5">
                      {item.tabLabel}
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
