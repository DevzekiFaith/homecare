"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Droplets, 
  ShieldCheck, 
  SlidersHorizontal, 
  Info, 
  Loader2,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";

const ALL_SERVICES = Object.keys(BASE_PRICES);

function getServiceIcon(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("paint")) return Paintbrush;
  if (t.includes("plumb")) return Wrench;
  if (t.includes("elect")) return Zap;
  if (t.includes("carpen") || t.includes("furn")) return Hammer;
  if (t.includes("ac") || t.includes("fridge") || t.includes("cool")) return Snowflake;
  if (t.includes("clean")) return Droplets;
  return Wrench;
}

export default function AdminSurgePage() {
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(ALL_SERVICES[0]);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1.25);

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

  const saveOverridesToServer = async (newOverrides: Record<string, number>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/surge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: newOverrides }),
      });
      if (!res.ok) throw new Error("Failed to deploy overrides");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error("Failed to update surge engine: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = async () => {
    const updated = { ...overrides, [selectedService]: selectedMultiplier };
    setOverrides(updated);
    setShowAddModal(false);
    toast.success(`Surge rule added: ${selectedService} set to ${selectedMultiplier}×`);
    await saveOverridesToServer(updated);
  };

  const handleRemoveRule = async (service: string) => {
    const updated = { ...overrides };
    delete updated[service];
    setOverrides(updated);
    toast.error(`Surge rule removed: ${service} reset to 1.0×`);
    await saveOverridesToServer(updated);
  };

  const handleClearAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/surge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      if (!res.ok) throw new Error("Failed to clear overrides");
      setOverrides({});
      toast.success("All surge pricing rules cleared. Platform running on 1.0× baseline.");
    } catch (err: any) {
      toast.error("Error clearing surge rules: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeServices = useMemo(() => Object.keys(overrides), [overrides]);
  const activeCount = activeServices.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-sky-600 mb-1">Pricing & Algorithms</p>
          <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900">Dynamic Surge Pricing</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Manage active surge pricing rules across trades, peak hours, and regional dispatch zones.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} /> Clear All Rules
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Surge Rule
          </button>
        </div>
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demand Engine</p>
            <p className="text-sm font-black text-slate-900 mt-1">
              {activeCount > 0 ? `${activeCount} Custom Rule(s) Active` : "Standard 1.0× Baseline"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`h-2 w-2 rounded-full ${activeCount > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              <span className="text-[11px] text-slate-500 font-semibold">
                {activeCount > 0 ? "Active rule adjustment" : "Zero surge surcharges"}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Active Rules Counter */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Surge Rules</p>
            <p className="text-xl font-black text-slate-900 mt-1">{activeCount}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {activeCount > 0 ? "Custom multipliers enabled" : "Cleared · 0 active rules"}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activeCount > 0 ? "bg-amber-50 border border-amber-200 text-amber-600" : "bg-slate-100 border border-slate-200 text-slate-500"}`}>
            <SlidersHorizontal size={18} />
          </div>
        </div>
      </div>

      {/* Services Surge Grid / Empty State */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="animate-spin text-sky-600" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Surge Engine...</p>
          </div>
        ) : activeServices.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-6">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-heading font-black text-slate-900">No Active Surge Rules Configured</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              All platform services are operating at standard base booking rates (1.0× baseline multiplier) with zero surge surcharges applied.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Custom Surge Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <div className="min-w-[700px]">
              {/* Table Header */}
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1fr] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Service Category</span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Base Price</span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Surge Multiplier</span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">Live Final Price</span>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 text-right">Actions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeServices.map((service, i) => {
                  const mult = overrides[service] ?? 1.0;
                  const surgePrice = getSurgePrice(service, mult);
                  const Icon = getServiceIcon(service);

                  return (
                    <motion.div
                      key={service}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-[1.6fr_1fr_1fr_1.1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-sky-50/40 transition-colors"
                    >
                      {/* Service Name & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900">{service}</p>
                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold mt-0.5">
                            Custom Rule Active
                          </span>
                        </div>
                      </div>

                      {/* Base Price */}
                      <p className="text-xs font-mono font-bold text-slate-700">
                        ₦{(BASE_PRICES[service] ?? 0).toLocaleString()}
                      </p>

                      {/* Multiplier Badge */}
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {mult}×
                        </span>
                      </div>

                      {/* Final Price */}
                      <div>
                        <p className="text-sm font-black text-slate-900 whitespace-nowrap">{surgePrice}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">+{(Math.round((mult - 1) * 100))}% over base</p>
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveRule(service)}
                          className="inline-flex items-center gap-1.5 p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer text-xs font-bold"
                          title="Remove surge rule"
                        >
                          <Trash2 size={15} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <span>
            {activeCount > 0
              ? `${activeCount} custom surge rule(s) actively deployed to customer booking engine.`
              : "Platform is running in 100% standard baseline mode (zero active markups)."}
          </span>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 size={14} /> Synchronized Live
            </span>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-heading font-black text-slate-900">Add Surge Pricing Rule</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Apply custom multiplier to a specific service trade.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Service Category</label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    {ALL_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s} (Base: ₦{(BASE_PRICES[s] ?? 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Surge Multiplier</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[1.15, 1.25, 1.40, 1.50].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMultiplier(m)}
                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          selectedMultiplier === m
                            ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        {m}×
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min={1.05}
                    max={3.0}
                    step={0.05}
                    value={selectedMultiplier}
                    onChange={(e) => setSelectedMultiplier(parseFloat(e.target.value) || 1.0)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Effective Price: <strong className="text-slate-900 font-black">{getSurgePrice(selectedService, selectedMultiplier)}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRule}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Activate Rule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing Policy Card */}
      <div className="p-6 space-y-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-sky-600" />
          <p className="text-xs font-black uppercase tracking-wider text-slate-900">Standard Pricing Architecture</p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          HomeCare operates on a transparent flat-fee baseline across all Nigerian cities. Surge multipliers are strictly controlled and only take effect when custom rules are enabled by administrators.
        </p>
      </div>
    </div>
  );
}
