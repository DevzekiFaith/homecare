"use client";

import Image from "next/image";
import { Lock, CreditCard, RotateCcw, CheckCircle2, Award, Wrench } from "lucide-react";

export default function BuyerProtection() {
  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 relative z-10 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-white p-1.5 shadow-lg shadow-cyan-500/20 border border-white/20 shrink-0 flex items-center justify-center">
            <Image
              src="/hclogo.png"
              alt="HomeCare Brand Logo"
              width={32}
              height={32}
              className="object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
                HomeCare Buyer Protection & Escrow
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] font-black tracking-wider text-emerald-400 border border-emerald-500/30">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              100% risk-free transactions with Nigerian escrow settlement.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-sky-400">
          <Award size={13} />
          <span>CarePay Certified</span>
        </div>
      </div>

      {/* Trust Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
        <div className="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock size={15} />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs">CarePay Escrow Protection</span>
            <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
              Your payment is safely held in escrow and only disbursed to the vendor after confirmed doorstep delivery.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard size={15} />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs">Secure Nigerian Payment</span>
            <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
              Instant settlement via Flutterwave, Paystack, Verve, Mastercard, Visa, or Direct Bank Transfer.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <RotateCcw size={15} />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs">30-Day Defect Shield</span>
            <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
              Faulty or malfunctioning units qualify for free courier return pickup and prompt replacement.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={15} />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs">Original Sealed Box</span>
            <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
              Factory sealed with official manufacturer warranty card, UK 3-pin plug, and quick setup guide.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/5 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 transition-all sm:col-span-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
            <Wrench size={15} />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs">HomeCare™ Accredited Installation</span>
            <p className="text-[11px] text-slate-300/80 mt-0.5 leading-relaxed">
              Pair any appliance with a verified HomeCare technician for safe 240V NEPA surge testing, professional mounting, and warranty.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Badges Strip */}
      <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold relative z-10">
        <span className="text-slate-400">Accepted Payment Methods:</span>
        <div className="flex flex-wrap items-center gap-1.5 font-bold">
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Flutterwave</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Paystack</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Verve</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Mastercard</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Visa</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-200">Bank Transfer</span>
        </div>
      </div>
    </div>
  );
}
