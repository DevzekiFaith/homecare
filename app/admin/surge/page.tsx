"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { getSurgeResult, getSurgePrice, BASE_PRICES } from "@/lib/surge";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Zap, 
  Wrench, 
  Paintbrush, 
  Hammer, 
  Snowflake, 
  Sparkles,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  Info,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const SERVICES = Object.keys(BASE_PRICES);

function getServiceIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("paint")) return Paintbrush;
  if (t.includes("plumb")) return Wrench;
  if (t.includes("elect")) return Zap;
  if (t.includes("carpen") || t.includes("furn")) return Hammer;
  if (t.includes("ac") || t.includes("fridge") || t.includes("cool")) return Snowflake;
  if (t.includes("clean")) return Sparkles;
  return Wrench;
}

export default function AdminSurgePage() {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setCurrentTimeStr(
        now.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time active overrides on mount
  useEffect(() => {
    const fetchLiveSurge = async () => {
      try {
        const res = await fetch("/api/surge?all=true");
        if (res.ok) {
          const data = await res.json();
          if (data.overrides) {
            setOverrides(data.overrides);
          }
        }
      } catch (err) {
        console.error("Failed to load real-time surge settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveSurge();
  }, []);

  const handleOverride = (service: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 1 || num > 3) return;
    setOverrides((prev) => ({ ...prev, [service]: Number(num.toFixed(2)) }));
    setSaved(false);
  };

  const applyPreset = (service: string, multiplier: number) => {
    setOverrides((prev) => ({ ...prev, [service]: multiplier }));
    setSaved(false);
    toast.info(`Set ${service} to ${multiplier}×. Click "Save Overrides" to publish live.`);
  };

  const removeOverride = (service: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[service];
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/surge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides }),
      });

      if (!res.ok) throw new Error("Failed to deploy overrides to server");

      const data = await res.json();
      setOverrides(data.overrides || overrides);
      setSaved(true);
      toast.success("Real-time surge overrides saved & deployed to customer booking engine!");
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      toast.error("Error saving overrides: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/surge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });

      if (!res.ok) throw new Error("Failed to clear overrides");

      setOverrides({});
      setSaved(false);
      toast.success("All manual overrides cleared! System is now 100% autonomous.");
    } catch (err: any) {
      toast.error("Error resetting overrides: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Determine current window
  const isNight = currentHour >= 21 || currentHour < 6;
  const isPeak = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 20);
  const windowStatus = isNight ? "Night Premium Active (40%)" : isPeak ? "Peak Rush Hour (15–25%)" : "Standard Operating Window";
  const activeCount = Object.keys(overrides).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-sky-600 mb-1">Pricing & Algorithms</p>
        <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900">Dynamic Surge Pricing</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Real-time multiplier calculation based on live local demand, professional density, and time of day.
        </p>
      </div>

      {/* Live System Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Live Clock Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live System Clock</p>
            <p className="text-xl font-mono font-black text-slate-900 mt-1">{currentTimeStr || "Calculating..."}</p>
            <p className="text-[11px] text-sky-700 font-semibold mt-0.5">West Africa Time (WAT)</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Clock size={18} />
          </div>
        </div>

        {/* Live Demand Phase */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demand Phase</p>
            <p className="text-sm font-black text-slate-900 mt-1">{windowStatus}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`h-2 w-2 rounded-full ${isPeak || isNight ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-[11px] text-slate-500 font-semibold">{isPeak || isNight ? "Dynamic adjustment" : "Base rate"}</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Real-time Overrides Counter */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Overrides</p>
            <p className="text-xl font-black text-slate-900 mt-1">{activeCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {activeCount > 0 ? `${activeCount} custom rule(s) active` : "100% Autonomous"}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeCount > 0 ? "bg-sky-50 border border-sky-100 text-sky-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"}`}>
            <SlidersHorizontal size={18} />
          </div>
        </div>
      </div>

      {/* Services Surge Grid */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1.6fr_1fr_1.1fr_1.1fr_1.6fr] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Service Category</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Base Price</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Auto Surge Multiplier</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Live Final Price</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Manual Multiplier Override</span>
            </div>

            <div className="divide-y divide-slate-100">
              {SERVICES.map((service, i) => {
                const surge = getSurgeResult(service, "Enugu", currentHour);
                const effectiveMultiplier = overrides[service] ?? surge.multiplier;
                const surgePrice = getSurgePrice(service, effectiveMultiplier);
                const hasOverride = !!overrides[service];
                const Icon = getServiceIcon(service);

                return (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-[1.6fr_1fr_1.1fr_1.1fr_1.6fr] gap-4 px-6 py-4 items-center hover:bg-sky-50/40 transition-colors"
                  >
                    {/* Service Name & Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">{service}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{hasOverride ? "Manual rule set" : surge.reason}</p>
                      </div>
                    </div>

                    {/* Base Price */}
                    <p className="text-xs font-mono font-bold text-slate-700">
                      ₦{(BASE_PRICES[service] ?? 0).toLocaleString()}
                    </p>

                    {/* Live Auto Multiplier */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                        surge.level === "high"
                          ? "border-rose-200 bg-rose-50 text-rose-800"
                          : surge.level === "busy"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-sky-200 bg-sky-50 text-sky-800"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          surge.level === "high" ? "bg-rose-500" : surge.level === "busy" ? "bg-amber-500" : "bg-sky-500"
                        }`} />
                        {surge.multiplier}×
                      </span>
                    </div>

                    {/* Effective Calculated Final Price */}
                    <div>
                      <p className="text-sm font-black text-slate-900 whitespace-nowrap">{surgePrice}</p>
                      {hasOverride && (
                        <p className="text-[10px] text-sky-700 font-bold uppercase tracking-wider mt-0.5">Manual Rule Applied</p>
                      )}
                    </div>

                    {/* Manual override input & quick presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => applyPreset(service, 1.15)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 transition-colors cursor-pointer"
                          title="Set +15% surge"
                        >
                          1.15×
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(service, 1.25)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 transition-colors cursor-pointer"
                          title="Set +25% surge"
                        >
                          1.25×
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(service, 1.40)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 transition-colors cursor-pointer"
                          title="Set +40% surge"
                        >
                          1.40×
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={3}
                          step={0.05}
                          placeholder="Auto"
                          value={overrides[service] ?? ""}
                          onChange={(e) => handleOverride(service, e.target.value)}
                          className={`w-16 rounded-xl px-2.5 py-1 text-xs font-bold outline-none border transition-colors shadow-2xs ${
                            hasOverride
                              ? "border-sky-500 bg-sky-50 text-sky-900 font-black"
                              : "border-slate-200 bg-white text-slate-800 focus:border-sky-500"
                          }`}
                        />
                        {hasOverride && (
                          <button
                            type="button"
                            onClick={() => removeOverride(service)}
                            className="text-xs text-rose-600 hover:text-rose-700 font-bold px-1 cursor-pointer"
                            title="Reset to automatic rate"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-600 font-semibold">
            {activeCount > 0
              ? `${activeCount} custom override rule(s) active on this node.`
              : "All service pricing dynamically calculated in real-time."}
          </p>
          <div className="flex items-center gap-2.5">
            {activeCount > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />} Clear All Overrides
              </button>
            )}
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                <CheckCircle2 size={14} /> Deployed Live
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Overrides
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Logic Explainer */}
      <div className="p-6 space-y-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-sky-600" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-900">How Surge Pricing Works</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-600">
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Morning & Evening Peak (15–25%)</p>
            <p>7–9 AM and 5–8 PM increase rates automatically during high repair traffic windows.</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Night Window (40% Premium)</p>
            <p>Requests after 9 PM or before 6 AM carry a late-night professional dispatch premium.</p>
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Weekend Availability (10–15%)</p>
            <p>Saturday & Sunday apply weekend priority matching compensation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}



