"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  RotateCcw, 
  AlertCircle, 
  Phone, 
  UserCheck, 
  ShieldCheck, 
  User,
  Sparkles,
  Trash2
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
  created_at: string;
};

export default function WorkerTable({ initialWorkers }: { initialWorkers: Worker[] }) {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  const supabase = useMemo(() => createClient(), []);

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

  const handleDeleteWorker = (id: string, name: string) => {
    toast(`Delete Worker "${name}"?`, {
      description: "Permanently delete this technician profile record from the system database.",
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
  }, [workers, statusFilter, skillFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSkillFilter("all");
  };

  const stats = useMemo(() => {
    return {
      total: workers.length,
      verified: workers.filter((w) => w.is_verified).length,
      unverified: workers.filter((w) => !w.is_verified).length,
      ai_verified: workers.filter((w) => w.ai_verified).length,
    };
  }, [workers]);

  return (
    <div className="space-y-6">
      {/* Quick KPI Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "all", label: "Total Workers", count: stats.total, color: "text-slate-900", bg: "bg-slate-100" },
          { id: "verified", label: "Verified Pros", count: stats.verified, color: "text-emerald-700", bg: "bg-emerald-100" },
          { id: "unverified", label: "Pending Verification", count: stats.unverified, color: "text-amber-700", bg: "bg-amber-100" },
          { id: "ai_verified", label: "AI Screened", count: stats.ai_verified, color: "text-sky-700", bg: "bg-sky-100" },
        ].map((tab) => {
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
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
                {tab.count}
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
          {/* Verification Status Filter */}
          <div className="flex-1 sm:flex-none min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Statuses ({workers.length})</option>
              <option value="verified">Verified ({stats.verified})</option>
              <option value="unverified">Unverified ({stats.unverified})</option>
              <option value="ai_verified">AI Verified ({stats.ai_verified})</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
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
          {(statusFilter !== "all" || skillFilter !== "all" || searchQuery !== "") && (
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
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1.6fr_1.1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Professional & Skill</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Phone</span>
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
                      Technicians who register via the technician onboarding portal will appear here live in real-time for verification and background screening.
                    </p>
                    <Link
                      href="/auth/worker/register"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                    >
                      <UserCheck size={14} /> Open Technician Onboarding
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
                  {filtered.map((worker, i) => (
                    <motion.div
                      key={worker.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.2) }}
                      className="grid grid-cols-[1.6fr_1.1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-sky-50/40 transition-colors"
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
                        {!worker.is_verified ? (
                          <button
                            onClick={() => handleVerify(worker.id, true)}
                            disabled={verifyingId === worker.id}
                            className="inline-flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {verifyingId === worker.id ? "…" : "Approve"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(worker.id, false)}
                            disabled={verifyingId === worker.id}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle size={13} />
                            Revoke
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteWorker(worker.id, worker.full_name)}
                          disabled={deletingId === worker.id}
                          title="Delete Worker Record"
                          className="inline-flex items-center justify-center p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-slate-700">
          <div>
            Showing <span className="text-sky-600 font-black text-sm">{filtered.length}</span> of {workers.length} registered professionals
          </div>
          <div className="flex gap-4 flex-wrap">
            <span className="text-emerald-700 font-bold">{stats.verified} verified</span>
            <span className="text-amber-700 font-bold">{stats.unverified} pending verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}




