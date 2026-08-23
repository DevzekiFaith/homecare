"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, UserCheck, CheckCircle2, ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

export default function WalletEscrowSection() {
  const flowSteps = [
    { label: "Customer", sub: "Places Order", icon: UserCheck },
    { label: "Payment", sub: "Held Safely", icon: Wallet },
    { label: "HomeCare Protection", sub: "Locked in Escrow", icon: Lock, highlight: true },
    { label: "Job Completed", sub: "Technician Finishes", icon: CheckCircle2 },
    { label: "Customer Confirms", sub: "Inspection Done", icon: ShieldCheck },
    { label: "Payment Released", sub: "Pro Disbursed", icon: ArrowRight, end: true },
  ];

  return (
    <section className="py-24 px-6 bg-slate-950 text-white relative z-10 overflow-hidden border-b border-slate-800">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-4">
            <ShieldCheck size={14} />
            <span>Escrow &amp; Payment Safeguard</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase font-heading leading-tight">
            Your Money <span className="text-emerald-400">Stays Protected.</span>
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            Payment is held securely according to HomeCare&apos;s payment protection process until the job reaches the agreed completion stage and you explicitly approve.
          </p>
        </div>

        {/* Animated Visual Flow Diagram */}
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl mb-12">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-8">
            How Escrow Protection Works Step-by-Step
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
            {flowSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center relative ${
                  step.highlight
                    ? "bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30 ring-2 ring-sky-400/40"
                    : step.end
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                    : "bg-slate-950 text-slate-200 border-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white/10">
                  <step.icon size={18} />
                </div>
                <p className="text-xs font-extrabold uppercase tracking-tight leading-snug">
                  {step.label}
                </p>
                <p className="text-[10px] opacity-80 font-medium mt-0.5">
                  {step.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/request"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Book With Payment Protection</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
