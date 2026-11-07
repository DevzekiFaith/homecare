"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Bell, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  Trash2, 
  Package, 
  Layers, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface WaitlistEntry {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  quantity: number;
  status: "pending" | "notified" | "fulfilled" | "cancelled" | string;
  created_at: string;
  ref?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending: {
    label: "Awaiting Stock",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-900 border-amber-300",
  },
  notified: {
    label: "Alert Sent",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-900 border-sky-300",
  },
  fulfilled: {
    label: "Converted / Ordered",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-900 border-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-900 border-rose-300",
  },
};

export default function AdminRestockWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    let remoteEntries: WaitlistEntry[] = [];

    try {
      const { data, error } = await supabase
        .from("stock_waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        remoteEntries = data as WaitlistEntry[];
      }
    } catch (err) {
      console.warn("Waitlist fetch warning:", err);
    }

    // Merge any localStorage guest submissions for 100% data visibility
    let localEntries: WaitlistEntry[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("hc_stock_waitlist") || "[]");
        localEntries = stored.map((item: any, idx: number) => ({
          id: item.ref || `local-${idx}-${Date.now()}`,
          ref: item.ref,
          product_id: item.productId || "sp-water-5",
          product_name: item.productName || "Smart Device",
          customer_name: item.name || "Customer",
          customer_phone: item.phone || "",
          customer_email: item.email || "",
          quantity: item.quantity || 1,
          status: item.status || "pending",
          created_at: item.date || new Date().toISOString(),
        }));
      } catch {}
    }

    // Merge without duplicates based on phone and product_id
    const mergedMap = new Map<string, WaitlistEntry>();
    remoteEntries.forEach((r) => mergedMap.set(`${r.customer_phone}-${r.product_id}`, r));
    localEntries.forEach((l) => {
      const key = `${l.customer_phone}-${l.product_id}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, l);
      }
    });

    const finalEntries = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setEntries(finalEntries);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();

    // Subscribe to live Postgres inserts & updates on stock_waitlist
    const channel = supabase
      .channel("admin-stock-waitlist-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_waitlist" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newEntry = payload.new as WaitlistEntry;
            setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
            toast.success("New Restock Lead Added!", {
              description: `${newEntry.customer_name} locked in ${newEntry.quantity} unit(s) of ${newEntry.product_name}.`,
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as WaitlistEntry;
            setEntries((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
          } else if (payload.eventType === "DELETE") {
            setEntries((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, supabase]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      // 1. Update in Supabase
      const { error } = await supabase
        .from("stock_waitlist")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.warn("Remote update:", error.message);
      }

      // 2. Update local state
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      // 3. Update localStorage cache if present
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("hc_stock_waitlist") || "[]");
          const updated = stored.map((item: any) =>
            item.ref === id || item.id === id ? { ...item, status: newStatus } : item
          );
          localStorage.setItem("hc_stock_waitlist", JSON.stringify(updated));
        } catch {}
      }

      toast.success(`Restock Lead updated to "${newStatus.toUpperCase()}"`);
    } catch (err: any) {
      toast.error("Status update error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this restock entry?")) return;
    try {
      await supabase.from("stock_waitlist").delete().eq("id", id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("hc_stock_waitlist") || "[]");
          const filtered = stored.filter((item: any) => item.ref !== id && item.id !== id);
          localStorage.setItem("hc_stock_waitlist", JSON.stringify(filtered));
        } catch {}
      }
      toast.info("Restock lead removed.");
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const handleSendWhatsApp = (entry: WaitlistEntry) => {
    let cleanPhone = entry.customer_phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "234" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("234")) {
      cleanPhone = "234" + cleanPhone;
    }

    const message = encodeURIComponent(
      `Hello ${entry.customer_name}! 📦 Great news from HomeCare Nigeria: The "${entry.product_name}" you reserved (${entry.quantity} unit(s)) has arrived at our Lagos distribution hub! Your priority allocation is now active. Complete your order here with same-day Lagos dispatch: https://homecare.com.ng/store/${entry.product_id}#waitlist`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    handleStatusUpdate(entry.id, "notified");
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error("No restock entries to export.");
      return;
    }
    const headers = ["Name", "Phone", "Email", "Product ID", "Product Name", "Quantity", "Status", "Date"];
    const rows = entries.map((e) => [
      `"${e.customer_name}"`,
      `"${e.customer_phone}"`,
      `"${e.customer_email}"`,
      `"${e.product_id}"`,
      `"${e.product_name}"`,
      e.quantity,
      `"${e.status}"`,
      `"${new Date(e.created_at).toLocaleDateString()}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `homecare_restock_waitlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = (entry.customer_name || "").toLowerCase().includes(q);
        const matchesPhone = (entry.customer_phone || "").toLowerCase().includes(q);
        const matchesProduct = (entry.product_name || "").toLowerCase().includes(q);
        const matchesId = (entry.product_id || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesProduct && !matchesId) return false;
      }
      return true;
    });
  }, [entries, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = entries.length;
    const units = entries.reduce((sum, e) => sum + (Number(e.quantity) || 1), 0);
    const pending = entries.filter((e) => e.status === "pending").length;
    const notified = entries.filter((e) => e.status === "notified").length;
    const fulfilled = entries.filter((e) => e.status === "fulfilled").length;
    return { total, units, pending, notified, fulfilled };
  }, [entries]);

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Inventory Demand
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs font-bold text-slate-500">Live Customer Reservations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900">
            Restock Waitlist &amp; Demand Radar
          </h1>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            Real customers waiting for sold-out appliances. Trigger automated WhatsApp arrival alerts when cargo touches down in Lagos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Data"
          >
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Total Leads</span>
            <Bell size={18} className="text-sky-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">{stats.total}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">Unique buyer reservations</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">Units Demanded</span>
            <Package size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900 font-heading">{stats.units}</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">Total physical units booked</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">Awaiting Cargo</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-amber-900 font-heading">{stats.pending}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">Ready for arrival alert</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Fulfilled</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-900 font-heading">{stats.fulfilled + stats.notified}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Alerted or converted</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or product title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0 hidden sm:inline">Status:</span>
          {["all", "pending", "notified", "fulfilled", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`h-9 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {st === "all" ? "All Entries" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Clock size={28} className="animate-spin mx-auto mb-2 text-sky-600" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading restock registrations...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Bell size={36} className="mx-auto mb-3 text-slate-300" />
            <h3 className="text-sm font-black text-slate-900 uppercase">No Restock Leads Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No entries match your search filters. Try clearing your search."
                : "When customers request out-of-stock items, their WhatsApp details and requested quantity will populate right here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Reserved Item</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEntries.map((entry) => {
                  const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Customer Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-950">{entry.customer_name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                            <Phone size={11} className="text-slate-400" />
                            <span className="font-mono">{entry.customer_phone}</span>
                          </div>
                          {entry.customer_email && entry.customer_email !== "unspecified@waitlist.homecare.ng" && (
                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                              {entry.customer_email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <Link
                            href={`/store/${entry.product_id}`}
                            target="_blank"
                            className="text-xs font-black text-sky-700 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[280px]">{entry.product_name}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </Link>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            SKU: {entry.product_id}
                          </p>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-black text-slate-900 font-heading">
                          {entry.quantity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${cfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>

                          <select
                            value={entry.status}
                            disabled={updatingId === entry.id}
                            onChange={(e) => handleStatusUpdate(entry.id, e.target.value)}
                            className="text-[10px] font-bold rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none text-slate-700 cursor-pointer hover:border-slate-300"
                          >
                            <option value="pending">Awaiting Stock</option>
                            <option value="notified">Alert Sent</option>
                            <option value="fulfilled">Converted</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 font-semibold whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(entry)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            title="Send WhatsApp Arrival Notification"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp Alert</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(entry.id)}
                            className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
