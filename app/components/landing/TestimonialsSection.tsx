"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAllReviews } from "@/lib/reviews";

const stats = [
  { value: "41%", label: "Faster Dispatch", desc: "Instant matching algorithm connects you to nearby pros in under 15 mins." },
  { value: "28%", label: "Cost Savings", desc: "Transparent upfront pricing eliminates unvetted middleman markups." },
  { value: "35%", label: "Repeat Bookings", desc: "Homeowners consistently trust our network for ongoing maintenance." },
  { value: "100%", label: "Warranty Protected", desc: "All repair jobs come with a mandatory 30-day service guarantee." },
];

const testimonials = [
  {
    name: "Temiloluwa",
    role: "Homeowner · Lagos",
    text: "Got a professional plumber within 15 minutes to fix an age-long pipe burst in our kitchen. Exceptional quality and very polite artisan!",
  },
  {
    name: "Tony O.",
    role: "Resident · Enugu",
    text: "HomeCare has been a lifesaver. Handled our full borehole pump rewire seamlessly with escrow payment safety.",
  },
  {
    name: "Temilade A.",
    role: "New Homeowner · Abeokuta",
    text: "Found a stellar carpenter and painter to prep our home before move-in. Clean, on time, and completely stress-free.",
  },
  {
    name: "Dr. Biola",
    role: "Clinic Administrator",
    text: "We use HomeCare for all our facility maintenance. Rapid response and verifiable IDs make it safe and dependable.",
  },
];

export default function TestimonialsSection() {
  const [liveReviews, setLiveReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const { data } = await fetchAllReviews();
      if (data && data.length > 0) {
        const formatted = data.map((r) => ({
          name: r.customer_name || "Guest Customer",
          role: `${r.service_type} Pro Review`,
          text: r.comment || `Rated ${r.rating} stars for outstanding service.`,
          rating: r.rating
        }));
        setLiveReviews(formatted);
      }
    }
    loadReviews();
  }, []);

  const allTestimonials = [...liveReviews, ...testimonials];

  return (
    <section className="py-20 px-6 bg-white relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Metric & Artisan Split directly from Pinterest Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left Column: 4 Metric Percentages & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 mb-3">
              Proven Track Record
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight uppercase mb-8">
              Why Thousands of Homes <br />
              <span className="text-sky-600">Choose HomeCare</span>
            </h2>

            {/* 2x2 Metric Grid */}
            <div className="grid grid-cols-2 gap-6 sm:gap-8 w-full mb-8">
              {stats.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 mb-1">
                    {item.value}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <Link
              href="/request"
              className="h-13 px-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
            >
              <span>Explore Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right Column: High Quality Technician Photo */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-sky-950/10 border-4 border-white bg-slate-100">
              <Image
                src="/tech-working.jpg"
                alt="Smiling Professional Technician at work"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-sky-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">Certified Repair Standards</p>
                  <p className="text-[10px] text-slate-500 font-semibold">15,000+ Completed Projects</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Customer Reviews Header & Cards */}
        <div className="pt-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              Loved by Homeowners Across Nigeria
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Real verified reviews from residents who got their repairs done seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allTestimonials.map((t, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-sky-100/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={16} 
                        fill={s <= (t.rating ?? 5) ? "currentColor" : "none"} 
                        className={s <= (t.rating ?? 5) ? "text-amber-400" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  
                  <p className="text-slate-700 text-base leading-relaxed mb-6 font-medium">
                    &quot;{t.text}&quot;
                  </p>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                  <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">{t.role}</span>
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
