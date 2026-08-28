"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ShieldCheck, Star, Zap, Award, Download, Printer, Lock, ThumbsUp, AlertTriangle, Sparkles } from "lucide-react";
import Logo from "@/app/components/Logo";

export default function ProHandbookPage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Nav */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/worker/dashboard"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Pro Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Handbook Header */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Logo size="md" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <Award size={13} /> Official Pro Accreditation Handbook
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white uppercase mt-4">
              The HomeCare Pro <span className="text-sky-400">Master Guide</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              Standard Operating Procedures, Customer Excellence, Nigerian Safety Codes, Escrow Disbursals, and How to Maintain a 5-Star Rating.
            </p>
          </div>
        </div>

        {/* Content Chapters */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-10">

          {/* Chapter 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xs">1</span>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 uppercase">
                Arrival, Appearance &amp; Client Communication
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                As an accredited HomeCare professional, your reputation directly drives your placement in the customer matching radar. First impressions determine client tips, repeat bookings, and 5-star ratings.
              </p>
              <ul className="grid gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span><strong>Punctuality Rule:</strong> Always arrive within 5 minutes of your estimated ETA. If traffic occurs, message the client immediately on WhatsApp.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span><strong>Identification:</strong> Show your HomeCare Pro ID &amp; Verified QR code to the estate security guard and homeowner upon arrival.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span><strong>Professional Attire:</strong> Clean work clothes, closed-toe safety boots, and your basic diagnostic kit ready before knocking.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Chapter 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">2</span>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 uppercase">
                Safety Standards &amp; Technical Diagnosis
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                Never start a repair without explaining the diagnosis to the homeowner first. Transparent diagnostic tests build trust and prevent disputes.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black uppercase text-[11px]">
                    <AlertTriangle size={14} className="text-amber-600" />
                    Electrical &amp; Inverters
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    Always isolate the main changeover breaker before probing panels. Check earthing continuity and neutral load balances before powering on.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-black uppercase text-[11px]">
                    <ShieldCheck size={14} className="text-sky-600" />
                    Plumbing &amp; Pressure Lines
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    Shut off the overhead tank gate valve before cutting PPR or PVC lines. Test joints under working pressure for 10 minutes before sealing tiles.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">3</span>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 uppercase">
                Escrow Payouts &amp; Job Completion Protocol
              </h2>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                HomeCare uses a **100% Guaranteed Escrow Protocol**. You never have to chase clients for payment. Follow these steps to ensure instant disbursal:
              </p>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono font-black text-slate-400 text-xs mt-0.5">01</span>
                  <p className="text-xs font-semibold text-slate-700">
                    <strong>Before work starts:</strong> Confirm in your Pro Dashboard that the job shows <span className="text-emerald-700 font-black">₦ Locked in Escrow</span>.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono font-black text-slate-400 text-xs mt-0.5">02</span>
                  <p className="text-xs font-semibold text-slate-700">
                    <strong>Upon job finish:</strong> Demonstrate the working repair to the homeowner (turn on the light, test the water flow, or check AC cooling temperature).
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono font-black text-slate-400 text-xs mt-0.5">03</span>
                  <p className="text-xs font-semibold text-slate-700">
                    <strong>Sign-Off &amp; Disbursal:</strong> The customer approves on their screen, releasing <strong>85% Net Disbursal</strong> instantly into your Pro Wallet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 4: Stepping up to Elite */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs">4</span>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900 uppercase">
                Stepping Up to Elite Pro &amp; Multiplying Bookings
              </h2>
            </div>
            <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
                  <Sparkles size={18} />
                  <span>How to Earn More on HomeCare</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
                  Tier 2 Accelerator
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Professionals with an **Elite Pro Badge** receive top-3 placement in the inDrive candidate comparison list, 60 seconds earlier job alerts, and 0% withdrawal fees.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-400 font-semibold">Ready to boost your dispatch radar?</p>
                <Link
                  href="/worker/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                >
                  Upgrade to Elite on Dashboard
                </Link>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
