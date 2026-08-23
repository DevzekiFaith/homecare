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
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      question: "WHAT WILL IT COST?",
      subtext: "Artisans changing prices mid-way, adding surprise extra charges, or overcharging for standard parts.",
      solutionTitle: "AGREED PRICING",
      solutionDesc: "You know the exact expected price and scope of work upfront before any job commences. Zero hidden surprises.",
      icon: Tag,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      question: "WHAT IF THE JOB GOES WRONG?",
      subtext: "Artisans taking upfront money and abandoning the work or doing a poor job with no recourse.",
      solutionTitle: "PROTECTED PAYMENTS",
      solutionDesc: "Your funds stay safely held in HomeCare Payment Protection and are only released when you inspect and approve the completed job.",
      icon: ShieldCheck,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 20 } },
  };

  return (
    <section className="py-20 px-6 bg-white text-slate-900 relative overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
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

        {/* 3 Problem vs Solution Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          {problems.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between hover:border-sky-400 hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Problem Question */}
                <div className="pb-6 border-b border-slate-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 block mb-1">
                    Problem #{index + 1}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                    {item.question}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.subtext}
                  </p>
                </div>

                {/* HomeCare Solution */}
                <div className="pt-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${item.badgeColor} mb-3`}>
                    <item.icon size={13} />
                    <span>HomeCare Answer</span>
                  </div>
                  <h4 className="text-base font-extrabold text-sky-700 uppercase mb-2">
                    {item.solutionTitle}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {item.solutionDesc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Callout */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
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
