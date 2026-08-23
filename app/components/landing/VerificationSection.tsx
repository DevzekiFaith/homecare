"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  UserCheck, 
  Fingerprint, 
  Award, 
  Lock, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";
import Link from "next/link";

const VERIFICATION_STEPS = [
  {
    step: "01",
    title: "Government NIN Identity Check",
    icon: Fingerprint,
    desc: "Every professional submits their 11-digit National Identity Number (NIN), cross-referenced directly with national identity databases via accredited identity providers (Dojah / Prembly).",
    badge: "Official NIMC Verification",
  },
  {
    step: "02",
    title: "Criminal & Background Vetting",
    icon: ShieldCheck,
    desc: "Background checks and physical address verification ensure we know exactly who is entering your private residence.",
    badge: "Background Checked",
  },
  {
    step: "03",
    title: "Trade Skill & Experience Evaluation",
    icon: Award,
    desc: "Technicians undergo trade history verification, previous project reviews, and skill testing before receiving active dispatch status.",
    badge: "Trade Accredited",
  },
  {
    step: "04",
    title: "Continuous SLA & Rating Monitoring",
    icon: UserCheck,
    desc: "Pros maintain minimum 4.5★ performance ratings. Any breach of safety, pricing inflation, or misconduct results in immediate suspension.",
    badge: "Strict SLA Enforcement",
  },
];

export default function VerificationSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-900 text-white relative z-10 overflow-hidden rounded-[36px] mx-4 sm:mx-6 my-12 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-black uppercase tracking-widest text-cyan-300 mb-4 backdrop-blur-md">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Transparency &amp; Trust Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-heading leading-tight">
            HOW WE VERIFY <br />
            <span className="text-cyan-300">PROFESSIONALS</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Trust doesn&apos;t come from exaggerated marketing claims. It comes from transparent processes, government ID cross-referencing, and real performance accountability.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {VERIFICATION_STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between hover:border-cyan-400/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-black text-slate-500 font-mono">
                      PHASE {item.step}
                    </span>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full inline-block mb-3">
                    {item.badge}
                  </span>

                  <h3 className="text-base font-extrabold text-white mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-700/60 flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 size={14} />
                  <span>Enforced On Every Pro</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Banner CTA */}
        <div className="bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Want full details on our verification protocol?</h4>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Read about NIMC background checks, accreditation, and dispute protections.</p>
            </div>
          </div>

          <Link
            href="/verification"
            className="h-12 px-6 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            <span>Read Verification Standard</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
