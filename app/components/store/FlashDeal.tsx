"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Clock,
  Eye,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Wrench,
  Check,
  Plus,
} from "lucide-react";

interface FlashDealProps {
  price: number;
  soldCount?: number;
  stock?: number;
  includeInstallation?: boolean;
  installationFee?: number;
  appliancePrice?: number;
  onToggleInstallation?: () => void;
}

export default function FlashDeal({
  price,
  soldCount = 1420,
  stock = 18,
  includeInstallation = false,
  installationFee = 7500,
  appliancePrice,
  onToggleInstallation,
}: FlashDealProps) {
  const fee = installationFee;
  const baseAppliancePrice = appliancePrice ?? (includeInstallation ? Math.max(0, price - fee) : price);
  const currentTotalPrice = includeInstallation ? baseAppliancePrice + fee : baseAppliancePrice;

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 19,
  });

  const [activeViewers, setActiveViewers] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Subtle natural fluctuation for active Nigerian shoppers
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setActiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(16, Math.min(42, prev + delta));
      });
    }, 6000);

    return () => clearInterval(viewerInterval);
  }, []);

  const claimedPercent = 84;

  return (
    <div className="rounded-3xl border border-sky-100 bg-white overflow-hidden shadow-lg shadow-sky-950/5">
      {/* Flash Deal Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-sky-800/40">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 shadow-inner shrink-0">
            <Flame size={17} className="text-sky-300 fill-sky-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                HOMECARE FLASH DEAL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[9px] font-bold text-sky-200">
                LIMITED STOCK
              </span>
            </div>
            <p className="text-[10px] text-sky-200/90 font-medium">
              Official price with full Nigerian warranty
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 text-xs font-bold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-400/20 shadow-inner">
          <div className="flex items-center gap-1.5 text-sky-300">
            <Clock size={13} className="text-sky-300" />
            <span className="text-[10px] uppercase font-bold tracking-wider mr-1">ENDS IN:</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span className="bg-slate-900/90 px-2 py-0.5 rounded-md text-[11px] font-black text-sky-100 border border-sky-500/20 shadow-xs">
              {String(timeLeft.hours).padStart(2, "0")}h
            </span>
            <span className="text-sky-400 font-bold">:</span>
            <span className="bg-slate-900/90 px-2 py-0.5 rounded-md text-[11px] font-black text-sky-100 border border-sky-500/20 shadow-xs">
              {String(timeLeft.minutes).padStart(2, "0")}m
            </span>
            <span className="text-sky-400 font-bold">:</span>
            <span className="bg-slate-900/90 px-2 py-0.5 rounded-md text-[11px] font-black text-sky-200 border border-sky-500/30 shadow-xs">
              {String(timeLeft.seconds).padStart(2, "0")}s
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Price Row */}
        <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
          <span className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            ₦{currentTotalPrice.toLocaleString()}
          </span>

          {includeInstallation && (
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              With Installation
            </span>
          )}

          {/* Best Price (30d) Badge */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
            <TrendingDown size={12} className="text-sky-600" />
            Best Price (30d)
          </span>
        </div>

        {/* Simple & Clean Installation Option Bar */}
        <div
          onClick={onToggleInstallation}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleInstallation?.();
            }
          }}
          className={`rounded-2xl p-3 sm:p-3.5 border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
            includeInstallation
              ? "bg-sky-50 border-sky-300 ring-1 ring-sky-400/20 shadow-xs"
              : "bg-slate-50/80 border-slate-200 hover:border-sky-300 hover:bg-sky-50/30"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                includeInstallation
                  ? "bg-sky-600 text-white border-sky-600 shadow-2xs"
                  : "bg-white text-sky-600 border-slate-200 shadow-2xs"
              }`}
            >
              {includeInstallation ? (
                <Check size={16} strokeWidth={3} className="text-white" />
              ) : (
                <Wrench size={15} className="text-sky-600" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                  {includeInstallation
                    ? "HomeCare™ Certified Installation Included"
                    : "Add HomeCare™ Certified Installation"}
                </span>
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${
                    includeInstallation
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-sky-100 text-sky-900 border-sky-200"
                  }`}
                >
                  +₦{fee.toLocaleString()}
                </span>
                {!includeInstallation && (
                  <span className="text-[10px] font-medium text-slate-500">
                    (Optional)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {includeInstallation
                  ? `Technician doorstep setup & NEPA surge calibration included (+₦${fee.toLocaleString()})`
                  : "Doorstep appliance setup & 240V NEPA surge testing by vetted technician."}
              </p>
            </div>
          </div>

          {onToggleInstallation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleInstallation();
              }}
              className={`h-8.5 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs ${
                includeInstallation
                  ? "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20"
              }`}
            >
              {includeInstallation ? (
                "Remove"
              ) : (
                <>
                  <Plus size={13} strokeWidth={3} />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Claimed Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold gap-2">
            <span className="text-sky-800 flex items-center gap-1 text-[11px]">
              <TrendingUp size={13} className="text-sky-600" />
              <span>{claimedPercent}% CLAIMED</span>
            </span>
            <span className="text-slate-600 font-medium text-[11px]">
              Only <strong className="text-sky-700 font-extrabold">{stock} units remaining</strong>
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full rounded-full bg-sky-600 transition-all duration-500"
              style={{ width: `${claimedPercent}%` }}
            />
          </div>
        </div>

        {/* Live Social Proof Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Eye size={13} className="text-sky-600 animate-pulse shrink-0" />
            <span><strong>{activeViewers} shoppers</strong> looking right now</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <ShoppingBag size={13} className="text-sky-700" />
            <span>{soldCount.toLocaleString()}+ successfully delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
