import Link from "next/link";
import { 
  Building2, 
  Key, 
  ShieldCheck, 
  ClipboardCheck, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";

export const metadata = {
  title: "Property & Facility Maintenance | HomeCare",
  description: "Manage multiple properties, shortlets, and estates with HomeCare. Scheduled sweeps, maintenance records, and NIN-verified trade teams.",
};

export default function PropertyManagementPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-black uppercase tracking-widest text-sky-700">
            <Building2 size={16} />
            <span>Landlord &amp; Property Manager Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight font-heading leading-tight">
            MANAGE YOUR PROPERTY <br />
            <span className="text-sky-600">WITH HOMECARE</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Eliminate repair headaches across your real estate portfolio. From pre-tenant sweeps to emergency dispatch, HomeCare keeps your property running.
          </p>
        </div>

        {/* 4 Core Maintenance Offerings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
              01 · One-Time Repair
            </span>
            <h2 className="text-xl font-black text-slate-900">Emergency &amp; On-Demand Call-outs</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Rapid dispatch of plumbers, electricians, AC technicians, or mechanics to fix urgent leaks, electrical faults, or pump failures.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              02 · Preventive Maintenance
            </span>
            <h2 className="text-xl font-black text-slate-900">Scheduled Inspection Sweeps</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Routine quarterly plumbing, electrical panel, AC gas, and generator health checks before small faults turn into major damages.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              03 · Property Management
            </span>
            <h2 className="text-xl font-black text-slate-900">Tenant Turnaround &amp; Shortlets</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Pre-tenant move-in/move-out sweeps, door lock replacements, wall repainting, and central billing across multiple rental units.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              04 · Facility Maintenance
            </span>
            <h2 className="text-xl font-black text-slate-900">Estates, Offices &amp; Clinics</h2>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Dedicated account coordinator and multi-trade technician teams assigned to manage commercial, clinical, or estate facilities.
            </p>
          </div>

        </div>

        {/* Benefits list */}
        <div className="p-8 rounded-3xl bg-sky-50/80 border border-sky-200 space-y-4">
          <h3 className="text-base font-black text-slate-900 uppercase">Key Advantages For Property Owners:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Multiple property address tracking</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Centralized invoices &amp; transparent receipts</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> 100% NIN Government Verified Technicians</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" /> Escrow payment protection on all repairs</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-3xl bg-slate-900 text-white text-center space-y-6">
          <h3 className="text-2xl font-black uppercase font-heading">Set Up Property Maintenance Today</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/inspection"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25"
            >
              <span>BOOK PROPERTY INSPECTION</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/request"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-white font-black text-xs uppercase tracking-widest transition-all"
            >
              <span>REQUEST REPAIR FOR PROPERTY</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
