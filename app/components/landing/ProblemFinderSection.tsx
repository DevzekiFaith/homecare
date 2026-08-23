"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wrench, Droplet, Zap, Wind, Lock, ShieldCheck, ArrowRight } from "lucide-react";

const PROBLEMS = [
  {
    symptom: "My AC isn't cooling",
    category: "AC & Fridge Repair",
    desc: "Low gas, compressor issues, or dirty filters.",
    icon: Wind,
    href: "/request?service=AC+%26+Fridge+Repair",
    color: "text-sky-500 bg-sky-50 border-sky-200",
  },
  {
    symptom: "My tap keeps leaking",
    category: "Plumber",
    desc: "Worn washers, valve leakage, or pipe pressure.",
    icon: Droplet,
    href: "/request?service=Plumber",
    color: "text-blue-500 bg-blue-50 border-blue-200",
  },
  {
    symptom: "My socket is sparking",
    category: "Electrician",
    desc: "Overloaded circuit, loose wiring, or breaker trip.",
    icon: Zap,
    href: "/request?service=Electrician",
    color: "text-amber-500 bg-amber-50 border-amber-200",
  },
  {
    symptom: "My water pump stopped working",
    category: "Plumber",
    desc: "Control box failure, suction blockage, or motor trip.",
    icon: Droplet,
    href: "/request?service=Plumber",
    color: "text-cyan-500 bg-cyan-50 border-cyan-200",
  },
  {
    symptom: "My door won't lock",
    category: "Carpentry",
    desc: "Misaligned frame, broken mortise lock, or handle failure.",
    icon: Lock,
    href: "/request?service=Carpentry",
    color: "text-indigo-500 bg-indigo-50 border-indigo-200",
  },
  {
    symptom: "My generator isn't starting",
    category: "Electrician",
    desc: "Carburetor blockage, battery drain, or spark plug.",
    icon: Wrench,
    href: "/request?service=Electrician",
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
];

export default function ProblemFinderSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 240, damping: 20 } },
  };

  return (
    <section className="py-20 px-6 bg-white relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 inline-block mb-3 shadow-2xs">
            Symptom Finder
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            What&apos;s Wrong With <span className="text-sky-600">Your Home?</span>
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium">
            Select what you are experiencing. We will instantly pair you with the exact right technician.
          </p>
        </motion.div>

        {/* 6 Symptom Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          {PROBLEMS.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.025 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href={item.href}
                className="group flex flex-col justify-between p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-lg hover:border-sky-400 transition-all h-full"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${item.color}`}>
                      <item.icon size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                      Matches: {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors mb-1.5">
                    &ldquo;{item.symptom}&rdquo;
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                  <span>Book Technician Now</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"
        >
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Not sure? Describe your issue on the booking form and our team will assign the right specialist.</span>
        </motion.div>

      </div>
    </section>
  );
}
