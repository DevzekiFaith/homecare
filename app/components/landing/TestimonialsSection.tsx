"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ThumbsUp, CheckCircle2, ShieldCheck, Lock, AlertCircle } from "lucide-react";
import { fetchAllReviews } from "@/lib/reviews";

const CLIENT_OUTCOMES = [
  {
    id: "01",
    tabLabel: "Temiloluwa (Ikeja)",
    tag: "Plumbing Repair Outcome",
    heading: "Kitchen Pipe Burst Stopped Cleanly Under Escrow",
    desc: "Age-long kitchen pipe burst causing severe flooding under the sink vanity. Verified plumber arrived within 45 minutes, replaced corroded copper fittings, and stopped the leak with zero property damage.",
    problem: "Kitchen pipe burst causing severe under-sink flooding",
    outcome: "Corroded fittings replaced & leak stopped under 2 hours",
    metricValue: "5.0★",
    metricLabel: "Verified Plumbing Service Rating",
    customerName: "Temiloluwa A.",
    customerRole: "Homeowner · Ikeja, Lagos",
    image: "/pipe-fitting.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Plumbing Pro", icon: CheckCircle2, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Escrow Locked", icon: Lock, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "02",
    tabLabel: "Tony (Enugu)",
    tag: "Electrical & Pump Outcome",
    heading: "Borehole Surge Control Box Rewired Same-Day",
    desc: "Borehole pump control box blew out during a sudden power surge in Independence Layout. Electrician replaced damaged control panel and rewired surge protection safely.",
    problem: "Borehole pump control box blown during power surge",
    outcome: "Control panel replaced & surge protection rewired",
    metricValue: "Same Day",
    metricLabel: "Borehole Power Restoration SLA",
    customerName: "Tony O.",
    customerRole: "Resident · Independence Layout, Enugu",
    image: "/su3.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Electrical Pro", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Surge Protected", icon: CheckCircle2, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "03",
    tabLabel: "Temilade (Abeokuta)",
    tag: "Carpentry & Locks Outcome",
    heading: "Front Door Security Mortise Lock Fully Aligned",
    desc: "Damaged front door mortise lock and unaligned wooden door frame causing security risks. Carpenter re-aligned door frame, installed heavy-duty mortise lock, and restored full entrance security.",
    problem: "Damaged mortise lock & unaligned wooden frame",
    outcome: "Frame re-aligned & heavy-duty lock installed",
    metricValue: "Pre-Agreed",
    metricLabel: "Upfront Fixed Price Lock",
    customerName: "Temilade A.",
    customerRole: "New Homeowner · Ibara, Abeokuta",
    image: "/su10.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "Carpentry Pro", icon: CheckCircle2, color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      { label: "Frame Aligned", icon: ShieldCheck, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
  {
    id: "04",
    tabLabel: "Dr. Biola (VI)",
    tag: "Clinic AC Cooling Outcome",
    heading: "Clinic Consultation Room Cooling Restored",
    desc: "Two clinic consultation room AC units stopped cooling due to gas leakage. HVAC technician pressure-tested gas lines, refilled R410a coolant, and restored ice-cold airflow for patients.",
    problem: "Clinic AC units stopped cooling due to gas leak",
    outcome: "Gas lines pressure-tested & R410a refilled",
    metricValue: "30 Days",
    metricLabel: "Post-Job Warranty Guarantee",
    customerName: "Dr. Biola M.",
    customerRole: "Clinic Administrator · Victoria Island",
    image: "/su9.jpg",
    badges: [
      { label: "Good Fit", icon: ThumbsUp, color: "bg-white/90 text-slate-900 border-white/40" },
      { label: "HVAC Specialist", icon: ShieldCheck, color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
      { label: "R410a Refilled", icon: CheckCircle2, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      { label: "Rated ★ 5.0", icon: Star, color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    ],
  },
];

const fallbackReviews = [
  {
    name: "Temiloluwa A.",
    location: "Ikeja, Lagos",
    service: "Plumbing Repair",
    problem: "Age-long kitchen pipe burst causing flooding under the sink vanity.",
    outcome: "Verified plumber arrived, replaced the corroded fittings, and stopped the leak cleanly.",
    rating: 5,
  },
  {
    name: "Tony O.",
    location: "Independence Layout, Enugu",
    service: "Electrical & Borehole Pump",
    problem: "Borehole pump control box blew out during a power surge.",
    outcome: "Electrician replaced the control panel and rewired the surge protection safely under escrow.",
    rating: 5,
  },
  {
    name: "Temilade A.",
    location: "Ibara, Abeokuta",
    service: "Carpentry & Locks",
    problem: "Damaged front door mortise lock and unaligned wooden door frame.",
    outcome: "Carpenter re-aligned the frame, installed a heavy-duty mortise lock, and restored security.",
    rating: 5,
  },
  {
    name: "Dr. Biola M.",
    location: "Victoria Island, Lagos",
    service: "Clinic AC Maintenance",
    problem: "Two clinic consultation room AC units stopped cooling due to gas leakage.",
    outcome: "Technician pressure-tested gas lines, refilled R410a coolant, and restored ice-cold airflow.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const { data } = await fetchAllReviews();
      if (data && data.length > 0) {
        const formatted = data.map((r) => ({
          name: r.customer_name || "Guest Customer",
          location: `${r.service_type} Client`,
          service: r.service_type,
          text: r.comment || `Rated ${r.rating} stars for outstanding service.`,
          rating: r.rating
        }));
        setLiveReviews(formatted);
      }
    }
    loadReviews();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CLIENT_OUTCOMES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = CLIENT_OUTCOMES[activeIndex];
  const allReviews = [...liveReviews, ...fallbackReviews];

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
            <span className="text-sky-600">ACROSS NIGERIA</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed">
            Real verified reviews from homeowners who got their repairs done seamlessly.
          </p>
        </motion.div>

        {/* Split Interactive Container matching exact candidate card UI layout (Writeup on LEFT, Card on RIGHT) */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-slate-50 border border-slate-200 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 shadow-xl relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Writeup & Metrics (Matching "Meet candidates worth meeting" writeup on LEFT in image) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8 order-1">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
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

              {/* Minimalist Pill Slider Progress Indicators (Matching Image candidate slider indicator) */}
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

              {/* Big Bold Stat Metric (Matching 70% Interview rate UI in reference image) */}
              <div className="pt-4 border-t border-slate-200/80 flex items-baseline gap-4">
                <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-heading">
                  {current.metricValue}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[160px]">
                  {current.metricLabel}
                </span>
              </div>

            </div>

            {/* RIGHT COLUMN: Candidate / Client Showcase Image Card (Matching Kiara Washington card on RIGHT in image) */}
            <div className="lg:col-span-7 relative order-2">
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
                    alt={current.customerName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/30" />

                  {/* Top Floating Dark Glass Badge */}
                  <div className="relative z-10 self-start p-4 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/15 max-w-xs shadow-lg">
                    <h5 className="text-lg font-black text-white tracking-tight">
                      {current.customerName}
                    </h5>
                    <p className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mt-0.5">
                      → {current.customerRole}
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

          </div>

          {/* Bottom Step Tabs (01 - 04) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-200">
            {CLIENT_OUTCOMES.map((item, idx) => {
              const active = activeIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
                    active
                      ? "bg-slate-900 text-white border-sky-500 shadow-lg scale-102 ring-2 ring-sky-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${active ? "text-sky-400" : "text-slate-400"}`}>
                      Review {item.id}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider truncate block mt-0.5">
                      {item.tabLabel}
                    </span>
                  </div>
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.id}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Verified Customer Reviews Grid */}
        <div className="pt-16 border-t border-slate-100 mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Verified Client Outcomes &amp; Ratings
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Real verified reviews from homeowners who got their repairs done seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allReviews.map((t, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                key={index} 
                className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-sky-100/80 shadow-2xs hover:shadow-lg hover:border-sky-300 transition-all relative flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          size={16} 
                          fill={s <= (t.rating ?? 5) ? "currentColor" : "none"} 
                          className={s <= (t.rating ?? 5) ? "text-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md uppercase">
                      {t.service || "Home Service"}
                    </span>
                  </div>
                  
                  {t.problem && t.outcome ? (
                    <div className="space-y-3 mb-6 text-xs">
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                        <span className="font-extrabold text-rose-800 uppercase text-[10px] block mb-1">Problem:</span>
                        <p className="text-slate-700 font-medium leading-relaxed">{t.problem}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <span className="font-extrabold text-emerald-800 uppercase text-[10px] block mb-1">Outcome:</span>
                        <p className="text-slate-700 font-medium leading-relaxed">{t.outcome}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium">
                      &quot;{t.text}&quot;
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}`}
                    alt={t.name}
                    className="w-10 h-10 rounded-full bg-sky-50 shadow-sm shrink-0 border border-sky-200 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">{t.location || t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
