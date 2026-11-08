"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  AlertCircle, 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin,
  Calendar,
  Layers,
  Trash2
} from "lucide-react";
import { DEMO_STORE_ORDER_REFS } from "@/lib/store-data";

export type StoreOrder = {
  id: string;
  order_ref: string;
  customer_name: string;
  total: number;
  status: string;
  items: any;
  delivery_address?: string;
  notes?: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  pending_payment: {
    label: "Pending Payment",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  processing: {
    label: "Processing (Paid)",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-800 border-sky-200",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-purple-500",
    badge: "bg-purple-50 text-purple-800 border-purple-200",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

export default function StoreOrdersTable({ initialOrders }: { initialOrders: StoreOrder[] }) {
  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    let list = initialOrders.filter(
      (o) => !(DEMO_STORE_ORDER_REFS as readonly string[]).includes(o.order_ref)
    );
    if (typeof window !== "undefined") {
      try {
        const cleared = JSON.parse(localStorage.getItem("hc_cleared_store_orders") || "[]");
        list = list.filter((o) => !cleared.includes(o.order_ref));
      } catch {}
    }
    return list;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleDeleteOrder = (orderId: string, orderRef: string) => {
    toast(`Delete Order ${orderRef}?`, {
      description: "Permanently remove this order from the admin dashboard.",
      action: {
        label: "Confirm Delete",
        onClick: async () => {
          setDeletingId(orderId);
          try {
            await fetch("/api/admin/delete-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: orderId, order_ref: orderRef }),
            });
            setOrders((prev) => prev.filter((o) => o.id !== orderId && o.order_ref !== orderRef));
            if (typeof window !== "undefined") {
              try {
                const cleared = JSON.parse(localStorage.getItem("hc_cleared_store_orders") || "[]");
                if (!cleared.includes(orderRef)) {
                  cleared.push(orderRef);
                  localStorage.setItem("hc_cleared_store_orders", JSON.stringify(cleared));
                }
              } catch {}
            }
            toast.error(`Order ${orderRef} removed from dashboard`);
          } catch (err: any) {
            toast.error("Failed to delete order: " + err.message);
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 6000,
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("store_orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        toast.error("Failed to update order status: " + error.message);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to ${newStatus.replace("_", " ").toUpperCase()}`);
    } catch (err: any) {
      toast.error("Update error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "processing" && order.status !== "processing" && order.status !== "paid") {
          return false;
        } else if (statusFilter !== "processing" && order.status !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesRef = (order.order_ref || "").toLowerCase().includes(q);
        const matchesCustomer = (order.customer_name || "").toLowerCase().includes(q);
        const matchesAddr = (order.delivery_address || "").toLowerCase().includes(q);
        const matchesNotes = (order.notes || "").toLowerCase().includes(q);
        let matchesItems = false;
        if (Array.isArray(order.items)) {
          matchesItems = order.items.some((i: any) =>
            (i.name || i.product?.name || "").toLowerCase().includes(q)
          );
        }
        if (!matchesRef && !matchesCustomer && !matchesAddr && !matchesNotes && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending_payment").length,
      paid: orders.filter((o) => o.status === "processing" || o.status === "paid").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Quick KPI Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "all", label: "All Store Orders", count: stats.total, color: "text-slate-900", bg: "bg-slate-100" },
          { id: "pending_payment", label: "Pending Payment", count: stats.pending, color: "text-amber-700", bg: "bg-amber-100" },
          { id: "processing", label: "Paid / Processing", count: stats.paid, color: "text-emerald-700", bg: "bg-emerald-100" },
          { id: "delivered", label: "Delivered", count: stats.delivered, color: "text-purple-700", bg: "bg-purple-100" },
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
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 font-bold" />
          <input
            type="text"
            placeholder="Search order ref, customer name, items, address..."
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
          {/* Status Filter */}
          <div className="flex-1 sm:flex-none min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">All Orders ({orders.length})</option>
              <option value="pending_payment">
                Pending Payment ({stats.pending})
              </option>
              <option value="processing">
                Processing / Paid ({stats.paid})
              </option>
              <option value="shipped">
                Shipped ({stats.shipped})
              </option>
              <option value="delivered">
                Delivered ({stats.delivered})
              </option>
              <option value="cancelled">
                Cancelled ({orders.filter((o) => o.status === "cancelled").length})
              </option>
            </select>
          </div>

          {/* Reset Filter Button */}
          {(statusFilter !== "all" || searchQuery !== "") && (
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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Order Ref</th>
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Customer & Items</th>
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Total</th>
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Status</th>
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Update Status</th>
                  <th className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                          <AlertCircle size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-900">No matching store orders found</p>
                        <p className="text-xs text-slate-500">Try changing your search keyword or status filter.</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md hover:bg-sky-500 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={13} /> Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending_payment;
                    const isUpdating = updatingId === order.id;

                    return (
                      <tr key={order.id} className="hover:bg-sky-50/40 transition-colors">
                        {/* Order Ref */}
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                            {order.order_ref}
                          </span>
                        </td>

                        {/* Customer & Items */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">{order.customer_name}</p>
                          <div className="text-xs text-slate-600 mt-1 max-w-sm font-medium">
                            {order.order_ref.startsWith("INSP-") ? (
                              <div className="flex items-center gap-1 text-slate-700">
                                <MapPin size={12} className="text-sky-600 shrink-0" />
                                <span className="font-semibold">{order.delivery_address || "Location requested"}</span>
                                {order.notes && <span className="text-sky-700 font-bold ml-1">· {order.notes}</span>}
                              </div>
                            ) : Array.isArray(order.items) && order.items.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {order.items.map((it: any, idx: number) => (
                                  <span key={idx} className="inline-block bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-[11px] text-slate-700 font-semibold">
                                    {it.quantity}x {it.name || it.product?.name || "Item"}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500">Store Order Item</span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-sm font-black text-slate-900 whitespace-nowrap">
                          ₦{(order.total ?? 0).toLocaleString()}
                        </td>

                        {/* Status Badge with Live Dot */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${cfg.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {order.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Update Status Dropdown & Delete Action */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              disabled={isUpdating}
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="text-xs font-bold bg-white border border-slate-200 hover:border-sky-400 focus:border-sky-500 rounded-xl px-3 py-2 text-slate-800 outline-none cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                            >
                              <option value="pending_payment">Pending Payment</option>
                              <option value="processing">Processing (Paid)</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              onClick={() => handleDeleteOrder(order.id, order.order_ref)}
                              disabled={deletingId === order.id}
                              title="Delete Order"
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-black uppercase tracking-wider text-slate-700">
          <div>
            Showing <span className="text-sky-600 font-black text-sm">{filtered.length}</span> of {orders.length} orders
          </div>
          <div className="flex gap-4 flex-wrap">
            <span className="text-amber-700 font-bold">{stats.pending} pending payment</span>
            <span className="text-emerald-700 font-bold">{stats.paid} paid / processing</span>
            <span className="text-purple-700 font-bold">{stats.delivered} delivered</span>
          </div>
        </div>
      </div>
    </div>
  );
}



