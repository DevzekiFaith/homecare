import Link from "next/link";
import { 
  ShieldCheck, 
  Fingerprint, 
  UserCheck, 
  Award, 
  Lock, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";

export const metadata = {
  title: "How We Verify Professionals | HomeCare",
  description: "Learn how HomeCare verifies tradespeople through NIMC Government NIN biometric checks, background vetting, skill evaluations, and rating SLAs.",
};

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-black uppercase tracking-widest text-sky-700">
            <ShieldCheck size={16} />
            <span>Verification Architecture &amp; Trust Standard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight font-heading leading-tight">
            HOW WE VERIFY <br />
            <span className="text-sky-600">HOMECARE PROFESSIONALS</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            At HomeCare, trust is built on verifiable data, government identity verification, trade evaluation, and strict service level agreements.
          </p>
        </div>

        {/* 4 Pillars Breakdown */}
        <div className="space-y-8">
          
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black">
                <Fingerprint size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">1. Mandatory Government NIN Verification</h2>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Every professional registering on HomeCare must provide their 11-digit National Identity Number (NIN). Using automated integration with NIMC via licensed biometric identity providers (Dojah and Prembly Pass), we verify:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Full Verified Legal Name</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Date of Birth &amp; Biometric Match</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> State of Origin &amp; LGA</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" /> Verified Photo ID Record</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">2. Address &amp; Background Vetting</h2>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              In addition to identity authentication, professionals undergo physical address confirmation and local reference checks before dispatch eligibility is granted.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black">
                <Award size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">3. Trade Skill &amp; Work Evaluation</h2>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Professionals submit proof of prior trade work, apprenticeships, or certifications (e.g. electrical wiring standards, HVAC gas safety, plumbing pressure seals).
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black">
                <UserCheck size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">4. Continuous Performance &amp; Escrow Guarantee</h2>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Customer ratings and job completion records are tracked after every completed request. Payment is held in neutral HomeCare Escrow and released only after customer inspection confirmation.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-6">
          <h3 className="text-2xl font-black uppercase font-heading">Ready to get your job done without guesswork?</h3>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25"
          >
            <span>REQUEST A SERVICE NOW</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}
