"use client";

import { motion } from "framer-motion";
import { FileText, UserCheck, Tag, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "TELL US WHAT YOU NEED",
      desc: "Describe the problem or upload a photo/video on the booking request page.",
      icon: FileText,
    },
    {
      step: "02",
      title: "GET MATCHED",
      desc: "HomeCare pairs you with accredited, location-verified local professionals.",
      icon: UserCheck,
    },
    {
      step: "03",
      title: "AGREE BEFORE WORK STARTS",
      desc: "Know the expected price quote and full scope of work before any job commences.",
      icon: Tag,
    },
    {
      step: "04",
      title: "GET THE JOB DONE",
      desc: "The assigned professional arrives on time and completes the work safely.",
      icon: Wrench,
    },
    {
      step: "05",
      title: "APPROVE & RELEASE PAYMENT",
      desc: "Payment is held safely in HomeCare Protection and released only when you confirm satisfaction.",
      icon: ShieldCheck,
      highlight: true,
    },
  ];

  return (
    <section className="py-20 px-6 bg-white relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 inline-block mb-3">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            How HomeCare <span className="text-sky-600">Works</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium">
            From problem request to protected payout — zero guesswork at every stage.
          </p>
        </div>

        {/* 5-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              className={`p-6 rounded-3xl border flex flex-col justify-between relative cursor-pointer ${
                item.highlight
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl"
                  : "bg-slate-50 text-slate-900 border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xl font-black font-mono ${item.highlight ? "text-sky-400" : "text-sky-600"}`}>
                    {item.step}
                  </span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    item.highlight ? "bg-sky-500/20 text-sky-300" : "bg-white text-slate-700 shadow-2xs border border-slate-200"
                  }`}>
                    <item.icon size={18} />
                  </div>
                </div>

                <h3 className="text-xs font-black uppercase tracking-wider mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className={`text-[11px] font-medium leading-relaxed ${item.highlight ? "text-slate-300" : "text-slate-500"}`}>
                  {item.desc}
                </p>
              </div>

              {item.highlight && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck size={13} />
                  <span>Safest Payment Process</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Link
            href="/request"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Book a Service Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
