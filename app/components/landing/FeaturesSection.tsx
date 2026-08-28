"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Award } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-slate-50 relative z-10 border-y border-sky-100/60">
      <div className="max-w-7xl mx-auto">
        
        {/* 2-Column Split directly from Pinterest Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-16">
          
          {/* Left Column: Precision Fitting Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-sky-950/10 border-4 border-white bg-slate-200">
              <Image
                src="/pipe-fitting.jpg"
                alt="Precision Home Repair Engineering"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-950/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-sky-100 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-800">Certified Grade Materials</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">100% Quality Inspected</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Headline & Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200 mb-3">
              Certified Professionals
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight uppercase mb-5">
              Book Your Local <br />
              <span className="text-sky-600">Professional</span> Today
            </h2>

            <p className="text-base text-slate-600 leading-relaxed font-medium mb-6 max-w-xl">
              Don&apos;t let leaking pipes, faulty electrical wiring, or broken furniture disrupt your peace. Our verified local professionals arrive equipped with professional diagnostic tools to fix your home immediately.
            </p>

            <ul className="space-y-3 mb-8 text-sm font-semibold text-slate-700">
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-sky-600" />
                <span>Instant dispatch matching with the closest available pro</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-sky-600" />
                <span>Transparent pre-agreed quotes with zero hidden charges</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-sky-600" />
                <span>100% Money-back satisfaction guarantee on every job</span>
              </li>
            </ul>

            <Link
              href="/request"
              className="h-13 px-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
            >
              <span>Book a Professional Now</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>

        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-slate-200">
          {[
            { title: "30-Day Guarantee", desc: "Free follow-up if any repair requires additional tuning within 30 days.", icon: ShieldCheck },
            { title: "Rapid Matching", desc: "Automated geolocation pairs you with the closest qualified professional in seconds.", icon: Zap },
            { title: "Escrow Protection", desc: "Funds remain safely in escrow until you inspect and approve the completed job.", icon: CheckCircle2 },
            { title: "Certified Network", desc: "Background-checked, identity-verified, and vetted for exceptional workmanship.", icon: Award },
          ].map((item, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white border border-sky-100 shadow-sm flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <item.icon size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
