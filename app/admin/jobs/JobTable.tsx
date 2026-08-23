"use client";

import { useState, useMemo } from "react";
import { CITIES } from "@/lib/cities";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Calendar,
  Wrench,
  Paintbrush,
  Zap,
  Hammer,
  Sparkles,
  Snowflake,
  ShieldCheck,
  ChevronDown,
  Layers,
  Trash2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export type Job = {
  id: string;
  service_type: string;
  description: string;
  address: string;
  status: string | null;
  preferred_time: string | null;
  created_at: string;
};

// Helper for dynamic service icons
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

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending: { 
    label: "Pending", 
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200" 
  },
  new: { 
    label: "New", 
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200" 
  },
  in_progress: { 
    label: "In Progress", 
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 border-sky-200" 
  },
  matched: { 
    label: "In Progress", 
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 border-sky-200" 
  },
  accepted: { 
    label: "In Progress", 
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 border-sky-200" 
  },
  completed: { 
    label: "Completed", 
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200" 
  },
  cancelled: { 
    label: "Cancelled", 
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-800 border-rose-200" 
  },
};

export default function JobTable({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) {
        toast.error("Failed to update status: " + error.message);
        return;
      }

      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      toast.success(`Job updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error("Error updating status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteJob = (jobId: string, serviceType: string) => {
    toast(`Delete Request #${jobId.slice(0, 6)}?`, {
      description: `Permanently remove service request for "${serviceType}".`,
      action: {
        label: "Confirm Delete",
        onClick: async () => {
          setDeletingId(jobId);
          try {
            const res = await fetch("/api/admin/delete-job", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: jobId }),
            });

            const data = await res.json();
            if (!data.success) {
              toast.error("Failed to delete job: " + (data.error || "Unknown error"));
              return;
            }

            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            toast.error(`Job Request #${jobId.slice(0, 6)} deleted`, {
              description: `Service request for ${serviceType} has been removed.`,
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
    return jobs.filter((j) => {
      const currentStatus = j.status ?? "pending";
      if (statusFilter !== "all" && currentStatus !== statusFilter) {
        return false;
      }

      // City filter matching
      if (cityFilter !== "all") {
        const selCity = CITIES.find((c) => c.id === cityFilter);
        if (selCity) {
          const addr = (j.address || "").toLowerCase();
          const cityName = selCity.name.toLowerCase();
          const hasCityName = addr.includes(cityName);
          const hasAreaName = (selCity.areas || []).some((area) =>
            addr.includes(area.toLowerCase())
          );
          if (!hasCityName && !hasAreaName) {
            return false;
          }
        }
      }

      // Search query matching
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesService = (j.service_type || "").toLowerCase().includes(q);
        const matchesDesc = (j.description || "").toLowerCase().includes(q);
        const matchesAddr = (j.address || "").toLowerCase().includes(q);
        const matchesId = (j.id || "").toLowerCase().includes(q);
        if (!matchesService && !matchesDesc && !matchesAddr && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [jobs, statusFilter, cityFilter, searchQuery]);

  const resetFilters = () => {
    setStatusFilter("all");
    setCityFilter("all");
    setSearchQuery("");
  };

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      pending: jobs.filter((j) => (j.status ?? "pending") === "pending" || j.status === "new").length,
      inProgress: jobs.filter((j) => j.status === "in_progress" || j.status === "matched" || j.status === "accepted").length,
      completed: jobs.filter((j) => j.status === "completed").length,
    };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Quick KPI Tabs for Immediate 1-Click Filtering */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "all", label: "All Requests", count: stats.total, color: "text-slate-900", bg: "bg-slate-100" },
          { id: "pending", label: "Pending", count: stats.pending, color: "text-amber-700", bg: "bg-amber-100" },
          { id: "in_progress", label: "In Progress", count: stats.inProgress, color: "text-sky-700", bg: "bg-sky-100" },
          { id: "completed", label: "Completed", count: stats.completed, color: "text-emerald-700", bg: "bg-emerald-100" },
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
            placeholder="Search service, address, description, or job ID..."
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

        {/* Filter Controls Group */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Dropdown Filter */}
          <div className="flex-1 sm:flex-none min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Statuses ({jobs.length})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="in_progress">In Progress ({stats.inProgress})</option>
              <option value="completed">Completed ({stats.completed})</option>
              <option value="cancelled">Cancelled ({jobs.filter((j) => j.status === "cancelled").length})</option>
            </select>
          </div>

          {/* City Filter */}
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Cities</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.active ? "Live" : "Upcoming"})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button */}
          {(statusFilter !== "all" || cityFilter !== "all" || searchQuery !== "") && (
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

      {/* Main Table Container */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[800px]">
            {/* Bright, Modern Table Header */}
            <div className="grid grid-cols-[1.4fr_1.4fr_1.1fr_1fr_1.1fr] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50 text-slate-700">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Service & Details</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Location & Date</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Preferred Time</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Status</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Manage Status</span>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                  <AlertCircle size={24} />
                </div>
                <p className="text-sm font-bold text-slate-900">No matching service requests found</p>
                <p className="text-xs text-slate-500">Try adjusting your search query or clearing the active filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} /> Clear All Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {filtered.map((job, i) => {
                    const currentStatus = job.status ?? "pending";
                    const st = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.pending;
                    const isUpdating = updatingId === job.id;
                    const Icon = getServiceIcon(job.service_type);

                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.2) }}
                        className="grid grid-cols-[1.4fr_1.4fr_1.1fr_1fr_1.1fr] gap-4 px-6 py-4 items-center hover:bg-sky-50/40 transition-colors"
                      >
                        {/* Service & Details */}
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 mt-0.5 shadow-2xs">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-slate-900">{job.service_type}</span>
                              <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                                #{job.id.slice(0, 6)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-0.5" title={job.description}>
                              {job.description || "No specific details provided."}
                            </p>
                          </div>
                        </div>

                        {/* Address & Created Date */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                            <MapPin size={13} className="text-sky-600 shrink-0" />
                            <span className="truncate" title={job.address}>{job.address || "Address not specified"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            <span>
                              {new Date(job.created_at).toLocaleDateString("en-NG", { 
                                day: "numeric", 
                                month: "short", 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Preferred Time */}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                            <Clock size={13} className="text-sky-600 shrink-0" />
                            <span>
                              {job.preferred_time
                                ? new Date(job.preferred_time).toLocaleDateString("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Flexible / ASAP"}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge with Live Dot */}
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${st.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>

                        {/* Manage Status Action Dropdown & Delete */}
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isUpdating}
                            value={currentStatus === "matched" || currentStatus === "accepted" ? "in_progress" : currentStatus}
                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                            className="w-full text-xs font-bold rounded-xl bg-white border border-slate-200 hover:border-sky-400 focus:border-sky-500 text-slate-800 px-3 py-2 outline-none transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <option value="pending">Mark: Pending</option>
                            <option value="in_progress">Mark: In Progress</option>
                            <option value="completed">Mark: Completed</option>
                            <option value="cancelled">Mark: Cancelled</option>
                          </select>

                          <button
                            onClick={() => handleDeleteJob(job.id, job.service_type)}
                            disabled={deletingId === job.id}
                            title="Delete Request Record"
                            className="inline-flex items-center justify-center p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
                          >
                            <Trash2 size={14} />
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

        {/* Footer Statistics */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-slate-700">
          <div>
            Showing <span className="text-sky-600 font-black text-sm">{filtered.length}</span> of {jobs.length} total jobs
          </div>
          <div className="flex gap-4 flex-wrap">
            <span className="text-amber-700 font-bold">{stats.pending} pending</span>
            <span className="text-sky-700 font-bold">{stats.inProgress} in progress</span>
            <span className="text-emerald-700 font-bold">{stats.completed} completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

