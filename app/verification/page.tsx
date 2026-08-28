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

          <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase">Accreditation Packages (From ₦1,500)</h2>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Automated Verification &amp; Growth Portal</p>
                </div>
              </div>
              <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full uppercase">
                Starter &amp; Elite Tiers
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Every applicant chooses between our <strong>Starter Pro (₦1,500)</strong> (covers live NIMC database cross-referencing, biometric facial matching, background checks, and official HomeCare Pro Handbook) or our <strong>Elite Pro Accelerator (₦3,500)</strong> (unlocks top 1–3 inDrive placement, 60s priority radar alerts, and 0% instant payout fees).
            </p>
          </div>

        </div>

        {/* CTA Dual Buttons */}
        <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 text-slate-900 text-center space-y-6">
          <h3 className="text-2xl font-black uppercase font-heading">Get Started on HomeCare</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/request"
              className="w-full sm:w-auto px-8 h-13 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/25 cursor-pointer"
            >
              <span>Book A Verified Professional</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/auth/worker/register"
              className="w-full sm:w-auto px-8 h-13 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Join as a Professional (From ₦1,500)</span>
              <ShieldCheck size={16} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
