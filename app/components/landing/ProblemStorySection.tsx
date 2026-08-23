"use client";

import { motion } from "framer-motion";
import { UserCheck, Tag, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProblemStorySection() {
  const problems = [
    {
      question: "WHO IS TRUSTWORTHY?",
      subtext: "Inviting a stranger into your private home without knowing their history or identity background.",
      solutionTitle: "VERIFIED PROFESSIONALS",
      solutionDesc: "Every professional undergoes mandatory government ID/NIN verification, background screening, and skill assessment.",
      icon: UserCheck,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      question: "WHAT WILL IT COST?",
      subtext: "Artisans changing prices mid-way, adding surprise extra charges, or overcharging for standard parts.",
      solutionTitle: "AGREED PRICING",
      solutionDesc: "You know the exact expected price and scope of work upfront before any job commences. Zero hidden surprises.",
      icon: Tag,
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    },
    {
      question: "WHAT IF THE JOB GOES WRONG?",
      subtext: "Artisans taking upfront money and abandoning the work or doing a poor job with no recourse.",
      solutionTitle: "PROTECTED PAYMENTS",
      solutionDesc: "Your funds stay safely held in HomeCare Payment Protection and are only released when you inspect and approve the completed job.",
      icon: ShieldCheck,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-black uppercase tracking-widest text-rose-400 mb-4">
            <HelpCircle size={14} />
            <span>The Reality of Home Repairs</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-heading leading-tight">
            Finding Someone To Fix Your Home <br />
            <span className="text-rose-400">Shouldn&apos;t Feel Like A Gamble.</span>
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base font-medium max-w-2xl mx-auto">
            Traditional home repairs are full of uncertainty. HomeCare replaces guesswork with structured trust, transparent quotes, and payment protection.
          </p>
        </div>

        {/* 3 Problem vs Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between hover:border-sky-500/40 transition-all shadow-xl"
            >
              <div>
                {/* Problem Question */}
                <div className="pb-6 border-b border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 block mb-1">
                    Problem #{index + 1}
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">
                    {item.question}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    {item.subtext}
                  </p>
                </div>

                {/* HomeCare Solution */}
                <div className="pt-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.badgeColor} mb-3`}>
                    <item.icon size={13} />
                    <span>HomeCare Answer</span>
                  </div>
                  <h4 className="text-base font-extrabold text-sky-300 uppercase mb-2">
                    {item.solutionTitle}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {item.solutionDesc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="text-center">
          <Link
            href="/request"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Experience Stress-Free Repairs Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
