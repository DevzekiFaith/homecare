"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, Home, Key, ShieldCheck, ArrowRight, ClipboardCheck } from "lucide-react";

const TARGETS = [
  {
    title: "HOMEOWNERS",
    subtitle: "Single Family Residences",
    desc: "Routine preventive maintenance, electrical audits, and emergency repair dispatch before issues cause costly structural damage.",
    icon: Home,
    perks: ["Routine call-outs", "Emergency priority", "Appliance protection"],
  },
  {
    title: "LANDLORDS",
    subtitle: "Residential Apartments & Units",
    desc: "Seamless tenant move-in/move-out inspection sweeps, water pump servicing, and rapid response for multi-unit properties.",
    icon: Key,
    perks: ["Pre-tenant sweeps", "Plumbing & wiring audits", "Centralized invoicing"],
  },
  {
    title: "PROPERTY MANAGERS",
    subtitle: "Estates & Gated Communities",
    desc: "Dedicated account manager, assigned multi-trade technician teams, and scheduled preventive sweeps across multiple locations.",
    icon: Building2,
    perks: ["Multi-property contracts", "24/7 Dispatch SLA", "Dedicated Account Manager"],
  },
  {
    title: "BUSINESSES & FACILITIES",
    subtitle: "Commercial & Office Spaces",
    desc: "Office AC & generator servicing, water filter maintenance, and routine safety audits for corporate and retail environments.",
    icon: ClipboardCheck,
    perks: ["Commercial AC plans", "Generator maintenance", "Preferred B2B pricing"],
  },
];

export default function PropertyFacilitySection() {
  return (
    <section className="py-20 px-6 bg-slate-50 relative z-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100 inline-block mb-3">
            B2B &amp; Property Maintenance
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 uppercase font-heading tracking-tight">
            Keep Your Property <span className="text-sky-600">Running.</span>
          </h2>
          <p className="mt-2 text-slate-600 text-sm sm:text-base font-medium">
            HomeCare goes beyond emergency repairs. We provide recurring maintenance contracts and preventive inspection sweeps.
          </p>
        </div>

        {/* 4 Target Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TARGETS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 border border-sky-100">
                  <item.icon size={22} />
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 block mb-1">
                  {item.subtitle}
                </span>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                  {item.desc}
                </p>

                <ul className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  {item.perks.map((perk, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                      <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/inspection"
                className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>Schedule Inspection</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
