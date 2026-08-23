"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, UserCheck, ShieldCheck, Briefcase, CheckCircle2, Star } from "lucide-react";

export default function DualAudienceSection() {
  const workerSteps = [
    "Create Your Profile",
    "Verify Identity (NIN/ID)",
    "Select Your Services",
    "Set Your Location & Area",
    "Get Matched With Jobs",
    "Complete Work & Get Paid",
  ];

  return (
    <section className="py-20 px-6 bg-white text-slate-900 relative overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 inline-block mb-3">
            Two-Sided Marketplace
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            Built For Customers <span className="text-sky-600">&amp; Skilled Artisans</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium">
            Connecting homeowners who need quality repairs with verified professionals who take pride in their work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Customer Conversion Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md hover:border-sky-400 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100/80 px-3 py-1 rounded-full border border-sky-200 mb-4">
                <UserCheck size={14} />
                <span>For Homeowners &amp; Renters</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
                Need A Professional?
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Get the right person for the job without the stress of random artisans, price guessing, or unfinished work.
              </p>

              <ul className="space-y-3 mb-8 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-sky-600 shrink-0" />
                  <span>Government NIN &amp; background verified technicians</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-sky-600 shrink-0" />
                  <span>Upfront agreed quotes with zero surprise charges</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-sky-600 shrink-0" />
                  <span>100% HomeCare Payment Protection until job completion</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/request"
                className="w-full h-14 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-sky-600/25 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Book A Service</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Professional Conversion Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-400 transition-all"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 mb-4">
                <Briefcase size={14} />
                <span>For Skilled Artisans</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mb-3">
                Are You A Skilled Professional?
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Get discovered by qualified customers who are ready to hire and pay for quality craftsmanship.
              </p>

              {/* Professional Journey Steps */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {workerSteps.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-2 shadow-2xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Link
                href="/auth/worker/register"
                className="w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Join HomeCare as a Professional</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
