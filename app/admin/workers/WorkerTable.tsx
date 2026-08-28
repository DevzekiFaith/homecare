"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  Phone, 
  UserCheck, 
  Sparkles,
  Trash2,
  Award,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export type Worker = {
  id: string;
  full_name: string;
  phone: string;
  primary_skill: string;
  nin: string | null;
  is_verified: boolean;
  ai_verified: boolean | null;
  avatar_url?: string | null;
  tier?: 'starter' | 'elite' | string;
  is_elite?: boolean;
  created_at: string;
};

export default function WorkerTable({ initialWorkers }: { initialWorkers: Worker[] }) {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [togglingTierId, setTogglingTierId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  const supabase = useMemo(() => createClient(), []);

  // Real-time Postgres changes listener on professionals table
  useEffect(() => {
    const channel = supabase
      .channel('admin-workers-table-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'professionals' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newWorker = payload.new as Worker;
            setWorkers((prev) => [newWorker, ...prev.filter((w) => w.id !== newWorker.id)]);
            toast.success("New Pro Registered Live!", {
              description: `${newWorker.full_name || "New Professional"} just joined on ${newWorker.tier === 'elite' ? 'Elite (₦3,500)' : 'Starter (₦1,500)'} tier.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedWorker = payload.new as Worker;
            setWorkers((prev) => prev.map((w) => w.id === updatedWorker.id ? { ...w, ...updatedWorker } : w));
          } else if (payload.eventType === 'DELETE') {
            setWorkers((prev) => prev.filter((w) => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Extract unique skills
  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    workers.forEach((w) => {
      if (w.primary_skill) skills.add(w.primary_skill);
    });
    return Array.from(skills).sort();
  }, [workers]);

  const handleVerify = async (id: string, approve: boolean) => {
    setVerifyingId(id);
    try {
      const { error } = await supabase
        .from("professionals")
        .update({ is_verified: approve })
        .eq("id", id);

      if (error) {
        toast.error("Failed to update status: " + error.message);
        return;
      }

      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, is_verified: approve } : w))
      );
      toast.success(approve ? "Worker approved & verified!" : "Verification revoked.");
    } catch (err: any) {
      toast.error("Action error: " + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleToggleTier = async (id: string, currentTier?: string) => {
    setTogglingTierId(id);
    const newTier = currentTier === 'elite' ? 'starter' : 'elite';
    const isElite = newTier === 'elite';

    try {
      const { error } = await supabase
        .from("professionals")
        .update({ tier: newTier, is_elite: isElite })
        .eq("id", id);

      if (error) {
        toast.error("Failed to toggle tier: " + error.message);
        return;
      }

      setWorkers((prev) =>
        prev.map((w) => (w.id === id ? { ...w, tier: newTier, is_elite: isElite } : w))
      );
      toast.success(`Worker Tier updated to ${newTier.toUpperCase()}`, {
        description: isElite ? "★ Promoted to Elite Pro (Top inDrive placement unlocked)." : "Set to Starter Pro (₦1,500).",
      });
    } catch (err: any) {
      toast.error("Action error: " + err.message);
    } finally {
      setTogglingTierId(null);
    }
  };

  const handleDeleteWorker = (id: string, name: string) => {
    toast(`Delete Worker "${name}"?`, {
      description: "Permanently delete this professional profile record from the system database.",
      action: {
        label: "Confirm Delete",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await fetch("/api/admin/delete-worker", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id }),
            });

            const data = await res.json();
            if (!data.success) {
              toast.error("Failed to delete worker: " + (data.error || "Unknown error"));
              return;
            }

            setWorkers((prev) => prev.filter((w) => w.id !== id));
            toast.error(`Worker "${name}" deleted`, {
              description: "Professional record permanently removed from the database.",
              duration: 4000,
            });
          } catch (err: any) {
            toast.error("Delete error: " + err.message);
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  const filtered = useMemo(() => {
    return workers.filter((worker) => {
      // Status filter
      if (statusFilter === "verified" && !worker.is_verified) return false;
      if (statusFilter === "unverified" && worker.is_verified) return false;
      if (statusFilter === "ai_verified" && !worker.ai_verified) return false;

      // Tier filter
      if (tierFilter === "elite" && !(worker.tier === 'elite' || worker.is_elite)) return false;
      if (tierFilter === "starter" && (worker.tier === 'elite' || worker.is_elite)) return false;

      // Skill filter
      if (skillFilter !== "all" && worker.primary_skill !== skillFilter) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = (worker.full_name || "").toLowerCase().includes(q);
        const matchesPhone = (worker.phone || "").toLowerCase().includes(q);
        const matchesSkill = (worker.primary_skill || "").toLowerCase().includes(q);
        const matchesNin = (worker.nin || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesSkill && !matchesNin) return false;
      }

      return true;
    });
  }, [workers, statusFilter, tierFilter, skillFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTierFilter("all");
    setSkillFilter("all");
  };

  const stats = useMemo(() => {
    const eliteCount = workers.filter((w) => w.tier === "elite" || w.is_elite).length;
    const starterCount = workers.length - eliteCount;
    const rev = (starterCount * 1500) + (eliteCount * 3500);

    return {
      total: workers.length,
      elite: eliteCount,
      starter: starterCount,
      verified: workers.filter((w) => w.is_verified).length,
      revenue: rev,
    };
  }, [workers]);

  return (
    <div className="space-y-6">
      {/* Quick KPI Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "all", label: "Total Professionals", count: stats.total, color: "text-slate-900", bg: "bg-slate-100" },
          { id: "elite", label: "Elite Pros (₦3.5k)", count: stats.elite, color: "text-amber-600", bg: "bg-amber-100" },
          { id: "starter", label: "Starter Pros (₦1.5k)", count: stats.starter, color: "text-sky-700", bg: "bg-sky-100" },
          { id: "revenue", label: "Accreditation Revenue", count: `₦${stats.revenue.toLocaleString()}`, color: "text-emerald-700", bg: "bg-emerald-100", isStatic: true },
        ].map((tab) => {
          const active = !tab.isStatic && (tab.id === 'elite' || tab.id === 'starter' ? tierFilter === tab.id : statusFilter === tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'elite') setTierFilter(tierFilter === 'elite' ? 'all' : 'elite');
                else if (tab.id === 'starter') setTierFilter(tierFilter === 'starter' ? 'all' : 'starter');
                else if (!tab.isStatic) setStatusFilter(tab.id);
              }}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
                active
                  ? "bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tab.label}</p>
                <p className={`text-2xl font-black mt-1 ${tab.color}`}>{tab.count}</p>
              </div>
              <div className={`h-8 w-8 rounded-xl ${tab.bg} flex items-center justify-center font-bold text-xs ${tab.color}`}>
                <Zap size={14} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 font-bold" />
          <input
            type="text"
            placeholder="Search worker name, skill, phone, NIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tier Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Tiers ({workers.length})</option>
              <option value="starter">Starter Pro (₦1,500) ({stats.starter})</option>
              <option value="elite">★ Elite Pro (₦3,500) ({stats.elite})</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex-1 sm:flex-none min-w-[130px]">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Skills</option>
              {availableSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button */}
          {(statusFilter !== "all" || tierFilter !== "all" || skillFilter !== "all" || searchQuery !== "") && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1.1fr_1fr_1fr_1fr_1fr_1.1fr] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Professional &amp; Skill</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Phone</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Tier Package</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">NIN Status</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">AI Background</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Status</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Actions</span>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                  <AlertCircle size={24} />
                </div>
                {workers.length === 0 ? (
                  <>
                    <p className="text-sm font-black text-slate-900">No Service Professionals Registered Yet</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Professionals who register via the professional onboarding portal will appear here live in real-time for verification and background screening.
                    </p>
                    <Link
                      href="/auth/worker/register"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                    >
                      <UserCheck size={14} /> Open Professional Onboarding
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900">No matching professionals found</p>
                    <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} /> Clear All Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filtered.map((worker, i) => {
                    const isElite = worker.tier === 'elite' || worker.is_elite;
                    return (
                      <motion.div
                        key={worker.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.2) }}
                        className="grid grid-cols-[1.5fr_1.1fr_1fr_1fr_1fr_1fr_1.1fr] gap-4 px-6 py-4 items-center hover:bg-sky-50/40 transition-colors"
                      >
                        {/* Name & Skill with Avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={worker.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.full_name || "worker")}`}
                            alt={worker.full_name}
                            className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-200 object-cover shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{worker.full_name}</p>
                            <p className="text-xs text-sky-700 font-bold mt-0.5">{worker.primary_skill || "General"}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-mono font-bold">
                          <Phone size={13} className="text-sky-600 shrink-0" />
                          <span>{worker.phone || "N/A"}</span>
                        </div>

                        {/* Accreditation Tier Badge */}
                        <div>
                          {isElite ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-900 text-[10px] font-black border border-amber-400/50">
                              <Sparkles size={11} className="text-amber-600" /> ★ Elite (₦3.5k)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-[10px] font-black border border-sky-200">
                              Starter (₦1.5k)
                            </span>
                          )}
                        </div>

                        {/* NIN */}
                        <div className="text-xs font-mono font-bold text-slate-600">
                          {worker.nin ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {worker.nin.slice(0, 4)}•••••{worker.nin.slice(-2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Not provided</span>
                          )}
                        </div>

                        {/* AI Check */}
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                              worker.ai_verified ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {worker.ai_verified ? (
                              <>
                                <CheckCircle2 size={14} className="text-emerald-600" /> AI Screened
                              </>
                            ) : (
                              <>
                                <Clock size={14} className="text-amber-600" /> Pending AI
                              </>
                            )}
                          </span>
                        </div>

                        {/* Verified Status Badge */}
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                              worker.is_verified
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border-amber-200 bg-amber-50 text-amber-800"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${worker.is_verified ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {worker.is_verified ? "Verified" : "Unverified"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerify(worker.id, !worker.is_verified)}
                            disabled={verifyingId === worker.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              worker.is_verified
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
                            } disabled:opacity-50`}
                          >
                            {verifyingId === worker.id ? "Updating..." : worker.is_verified ? "Revoke" : "Approve"}
                          </button>

                          {/* Toggle Tier Button */}
                          <button
                            onClick={() => handleToggleTier(worker.id, worker.tier)}
                            disabled={togglingTierId === worker.id}
                            title={isElite ? "Demote to Starter" : "Promote to Elite Pro"}
                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                          >
                            {togglingTierId === worker.id ? "..." : isElite ? "Demote" : "★ Elite"}
                          </button>

                          <button
                            onClick={() => handleDeleteWorker(worker.id, worker.full_name)}
                            disabled={deletingId === worker.id}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Professional"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
