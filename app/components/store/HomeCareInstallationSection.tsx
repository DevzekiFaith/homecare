"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Star, 
  ArrowRight, 
  Check, 
  Zap, 
  Award
} from "lucide-react";

interface HomeCareInstallationSectionProps {
  productName: string;
  category: string;
  serviceTypes?: string[];
  installationFee?: number;
  isSelected?: boolean;
  onToggleInstallation?: (selected: boolean) => void;
  isProductInCart?: boolean;
  productPrice?: number;
}

export default function HomeCareInstallationSection({
  productName,
  category,
  serviceTypes = ["Electrician"],
  installationFee = 7500,
  isSelected = false,
  onToggleInstallation,
  isProductInCart = false,
  productPrice = 0,
}: HomeCareInstallationSectionProps) {
  const primaryService = serviceTypes[0] || "Electrician";

  const technicianTitles: Record<string, string> = {
    Electrician: "Licensed Nigerian Electrician",
    Plumber: "Master Certified Plumber",
    Carpenter: "Biometric Lock & Security Joiner",
    "AC & Fridge Repair": "Certified Cooling & HVAC Specialist",
    "General Handyman": "Accredited Smart Home Installer",
  };

  const tradeTitle = technicianTitles[primaryService] || "HomeCare Accredited Technician";

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#071328] to-[#040e1e] text-white p-5 sm:p-7 border border-sky-900/40 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Official HomeCare Brand Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-white p-1.5 shadow-xl shadow-cyan-500/20 border border-white/20 shrink-0 flex items-center justify-center">
            <Image
              src="/hclogo.png"
              alt="HomeCare Brand Logo"
              width={38}
              height={38}
              className="object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black tracking-wide text-white uppercase font-heading">
                Home<span className="text-sky-400">Care</span> Professional Installation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-black tracking-wider border border-cyan-400/30 flex items-center gap-1">
                <CheckCircle2 size={10} /> CERTIFIED
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-sky-200/80 font-medium mt-0.5">
              Accredited technician dispatch + 240V NEPA surge calibration + 30-day warranty.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/10 text-[10px] font-bold text-sky-200">
            <Award size={13} className="text-cyan-300" />
            <span>Vetted &amp; Escrow Backed</span>
          </div>
        </div>
      </div>

      {/* Technician Match Spotlight Card */}
      <div className="bg-white/[0.06] backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 relative z-10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Wrench size={18} className="text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                Recommended Trade for {category} · {productName}
              </span>
              <h4 className="text-sm font-black text-white">{tradeTitle}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-sky-200/80 self-start sm:self-auto">
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0</span>
            </div>
            <span>•</span>
            <span className="font-semibold">1,280+ Completed Jobs</span>
          </div>
        </div>

        {/* Coverage Cities Pill */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px] text-sky-200/90 font-medium">
          <span className="flex items-center gap-1 text-cyan-300 font-bold">
            <MapPin size={11} /> Active Dispatch:
          </span>
          <span className="bg-white/10 px-2 py-0.5 rounded-md">Lagos (Island &amp; Mainland)</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-md">Abuja FCT</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-md">Port Harcourt</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-md">Enugu</span>
          <span className="bg-white/10 px-2 py-0.5 rounded-md">Ibadan</span>
        </div>
      </div>

      {/* 4 Pillars of HomeCare Installation Guarantee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs relative z-10">
        <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={14} />
          </div>
          <div>
            <h5 className="font-extrabold text-white text-xs">NEPA 240V Surge Calibration</h5>
            <p className="text-[11px] text-sky-200/70 mt-0.5 leading-relaxed">
              Technician validates earthing, polarity, and high-voltage circuit safety before connecting your device.
            </p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck size={14} />
          </div>
          <div>
            <h5 className="font-extrabold text-white text-xs">CarePay Escrow Protection</h5>
            <p className="text-[11px] text-sky-200/70 mt-0.5 leading-relaxed">
              Installation funds are held in escrow and released only after you test and approve the completed job.
            </p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-sky-400/20 text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={14} />
          </div>
          <div>
            <h5 className="font-extrabold text-white text-xs">30-Day Workmanship Warranty</h5>
            <p className="text-[11px] text-sky-200/70 mt-0.5 leading-relaxed">
              Free technician re-visit and diagnostic if any connection or wiring issue occurs within 30 days.
            </p>
          </div>
        </div>

        <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Award size={14} />
          </div>
          <div>
            <h5 className="font-extrabold text-white text-xs">Official Digital QR Certificate</h5>
            <p className="text-[11px] text-sky-200/70 mt-0.5 leading-relaxed">
              Receive a verified digital installation stamp linked to your property record for appliance warranty validation.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Toggle / Booking Strip */}
      <div className="bg-gradient-to-r from-sky-950/90 via-[#07152b] to-blue-950/90 rounded-2xl p-4 sm:p-5 border border-sky-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-600/30 border border-sky-400/40 text-cyan-300 flex items-center justify-center shrink-0">
            <Wrench size={19} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Certified Pro Installation
              </span>
              <span className="text-[10px] font-black text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/25">
                +₦{installationFee.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-sky-200/80 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                Doorstep Setup &amp; Surge Test
              </span>
            </div>
            <p className="text-[11px] text-sky-200/70 font-medium mt-1">
              {isProductInCart
                ? "Attaches verified technician dispatch to the appliance in your cart."
                : "Bundles this appliance together with accredited technician setup."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
          {onToggleInstallation ? (
            <button
              type="button"
              onClick={() => onToggleInstallation(!isSelected)}
              className={`w-full sm:w-auto h-11 px-5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isSelected
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-300"
                  : "bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 shadow-sky-500/25 font-black"
              }`}
            >
              {isSelected ? (
                <>
                  <Check size={15} strokeWidth={3} />
                  <span>✓ Pro Install Added (+₦{installationFee.toLocaleString()})</span>
                </>
              ) : isProductInCart ? (
                <>
                  <Wrench size={14} />
                  <span>+ Add Pro Installation (+₦{installationFee.toLocaleString()})</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="fill-slate-950 text-slate-950" />
                  <span>+ Bundle &amp; Add (₦{(productPrice + installationFee).toLocaleString()})</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/request?service=${encodeURIComponent(primaryService)}&appliance=${encodeURIComponent(productName)}`}
              className="w-full sm:w-auto h-11 px-5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Book Pro Installation</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
