"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Wrench, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Search,
  MoreVertical,
  Loader2,
  Package,
  ChevronRight,
  Filter,
  RotateCcw,
  RefreshCw,
  XCircle,
  Truck,
  Users,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/app/components/Logo";
import { toast } from "sonner";

interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  delivery_address?: string;
  notes?: string;
}

interface ServiceRequest {
  id: string;
  service_type: string;
  description?: string;
  address: string;
  status: string;
  created_at: string;
}

interface Worker {
  id: string;
  full_name: string;
  phone: string;
  primary_skill: string;
  nin: string | null;
  is_verified: boolean;
  ai_verified: boolean | null;
  avatar_url?: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'requests' | 'workers'>('overview');
  const [searchTerm, setSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [reqStatusFilter, setReqStatusFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: orderData } = await supabase
        .from('store_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 2. Fetch Requests
      const { data: reqData } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Fetch Professionals (Workers)
      const { data: workerData } = await supabase
        .from('professionals')
        .select('id, full_name, phone, primary_skill, nin, is_verified, ai_verified, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (orderData) setOrders(orderData);
      if (reqData) setRequests(reqData);
      if (workerData) setWorkers(workerData);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load dashboard data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateWorkerApproval = async (id: string, approve: boolean) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ is_verified: approve })
        .eq('id', id);

      if (error) {
        toast.error("Failed to update worker status: " + error.message);
        return;
      }

      setWorkers(prev => prev.map(w => w.id === id ? { ...w, is_verified: approve } : w));
      toast.success(approve ? "Worker Approved & Verified!" : "Worker Verification Revoked");
    } catch (err: any) {
      toast.error("Action error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('store_orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to update status: " + error.message);
        return;
      }

      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`Order updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to update request: " + error.message);
        return;
      }

      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`Service request marked as ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const matchesRef = (o.order_ref || "").toLowerCase().includes(q);
        const matchesCust = (o.customer_name || "").toLowerCase().includes(q);
        const matchesAddr = (o.delivery_address || "").toLowerCase().includes(q);
        if (!matchesRef && !matchesCust && !matchesAddr) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, searchTerm]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      if (reqStatusFilter !== "all" && r.status !== reqStatusFilter) return false;
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const matchesType = (r.service_type || "").toLowerCase().includes(q);
        const matchesAddr = (r.address || "").toLowerCase().includes(q);
        const matchesDesc = (r.description || "").toLowerCase().includes(q);
        if (!matchesType && !matchesAddr && !matchesDesc) return false;
      }
      return true;
    });
  }, [requests, reqStatusFilter, searchTerm]);

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      if (workerFilter === "verified" && !w.is_verified) return false;
      if (workerFilter === "unverified" && w.is_verified) return false;
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const matchesName = (w.full_name || "").toLowerCase().includes(q);
        const matchesPhone = (w.phone || "").toLowerCase().includes(q);
        const matchesSkill = (w.primary_skill || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesSkill) return false;
      }
      return true;
    });
  }, [workers, workerFilter, searchTerm]);

  const stats = {
    totalRevenue: orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0),
    activeOrders: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    pendingWorkers: workers.filter(w => !w.is_verified).length,
    totalWorkers: workers.length,
    completedJobs: requests.filter(r => r.status === 'completed').length
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 border-r border-slate-200 bg-white p-6 flex flex-col gap-8">
        <Logo href="/admin" />
        
        <nav className="flex flex-col gap-1.5">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'workers', icon: Users, label: 'Worker Approvals' },
            { id: 'orders', icon: ShoppingBag, label: 'Store Orders' },
            { id: 'requests', icon: Wrench, label: 'Service Requests' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as 'overview' | 'orders' | 'requests' | 'workers')}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-black' 
                  : 'text-slate-700 hover:bg-sky-50 hover:text-sky-700 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} />
                <span>{item.label}</span>
              </div>
              {item.id === 'workers' && stats.pendingWorkers > 0 && (
                <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                  {stats.pendingWorkers}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="h-9 w-9 rounded-xl bg-sky-600 flex items-center justify-center font-bold text-white shadow-xs">
              A
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Admin Console</p>
              <p className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Live Master Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header & Global Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-black tracking-tight text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Management & Fulfillment Control</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-600 font-bold" size={16} />
                <input 
                  type="text"
                  placeholder="Search ref, customer, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none shadow-xs"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
                )}
              </div>
              <button 
                onClick={fetchData}
                title="Refresh Data"
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow-sm shrink-0"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: `₦${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                    { label: 'Worker Approvals', value: `${stats.pendingWorkers} Pending`, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', action: () => setActiveTab('workers') },
                    { label: 'Active Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
                    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                  ].map((stat, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={itemVariants}
                      onClick={stat.action}
                      className={`p-6 border border-slate-200 bg-white rounded-2xl relative overflow-hidden group shadow-sm ${stat.action ? 'cursor-pointer hover:border-sky-400 transition-all' : ''}`}
                    >
                      <div className={`absolute top-0 right-0 p-3.5 ${stat.bg} ${stat.color} border-b border-l rounded-bl-3xl`}>
                        <stat.icon size={18} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">{stat.label}</p>
                      <p className="text-2xl font-heading font-black text-slate-900">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Pending Worker Approvals Alert Card */}
                {stats.pendingWorkers > 0 && (
                  <motion.div variants={itemVariants} className="p-6 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 font-bold shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            {stats.pendingWorkers} Worker(s) Awaiting Review
                          </h3>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            New technicians have registered and require admin approval before accepting customer jobs.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('workers')}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        Review & Approve Now →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Orders */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Recent Orders</h3>
                      <button 
                        onClick={() => setActiveTab('orders')} 
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                      >
                        View all ({orders.length}) →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                              <Package size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{order.customer_name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {order.order_ref} {order.order_ref.startsWith("INSP-") ? "· 🔍 Inspection" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-sky-700">₦{(order.total || 0).toLocaleString()}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'delivered' ? 'text-emerald-700' : 'text-amber-700'
                            }`}>{order.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* New Requests */}
                  <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">New Service Requests</h3>
                      <button 
                        onClick={() => setActiveTab('requests')} 
                        className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                      >
                        View all ({requests.length}) →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {requests.slice(0, 5).map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                              <Wrench size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{req.service_type}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{req.address}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>{req.status}</span>
                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">{new Date(req.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Orders Toolbar with Working Filter */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-sky-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Filter Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-slate-50 hover:bg-white px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                    >
                      <option value="all">All Orders ({orders.length})</option>
                      <option value="pending_payment">Pending Payment</option>
                      <option value="processing">Processing (Paid)</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {(orderStatusFilter !== "all" || searchTerm !== "") && (
                    <button
                      onClick={() => { setOrderStatusFilter("all"); setSearchTerm(""); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={13} /> Clear Filter
                    </button>
                  )}
                </div>

                {/* Orders Table */}
                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <div className="overflow-x-auto scrollbar-thin">
                    <div className="min-w-[720px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-900 text-white">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Order Ref</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Customer</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Total</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Status</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Update Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold">
                                No orders found matching the filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-sky-50/50 transition-colors">
                                <td className="px-6 py-4.5 font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded px-2 py-1">{order.order_ref}</td>
                                <td className="px-6 py-4.5">
                                  <div className="text-xs font-black text-slate-900">{order.customer_name}</div>
                                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                                    {order.delivery_address || (Array.isArray(order.items) ? `${order.items.length} items` : "Order")}
                                  </div>
                                </td>
                                <td className="px-6 py-4.5 text-xs font-black text-sky-700">₦{(order.total || 0).toLocaleString()}</td>
                                <td className="px-6 py-4.5">
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                    order.status === 'delivered' ? 'border border-purple-300 bg-purple-50 text-purple-800' :
                                    order.status === 'shipped' ? 'border border-sky-300 bg-sky-50 text-sky-800' :
                                    order.status === 'processing' || order.status === 'paid' ? 'border border-emerald-300 bg-emerald-50 text-emerald-800' :
                                    'border border-amber-300 bg-amber-50 text-amber-800'
                                  }`}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4.5">
                                  <select 
                                    disabled={updatingId === order.id}
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                                  >
                                    <option value="pending_payment" className="font-bold text-amber-700">Pending Payment</option>
                                    <option value="processing" className="font-bold text-emerald-700">Processing (Paid)</option>
                                    <option value="shipped" className="font-bold text-sky-700">Shipped</option>
                                    <option value="delivered" className="font-bold text-purple-700">Delivered</option>
                                    <option value="cancelled" className="font-bold text-rose-700">Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Requests Toolbar with Filter */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-sky-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Filter Status:</span>
                    <select
                      value={reqStatusFilter}
                      onChange={(e) => setReqStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-slate-50 hover:bg-white px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                    >
                      <option value="all">All Requests ({requests.length})</option>
                      <option value="pending">Pending ({requests.filter(r => (r.status || 'pending') === 'pending' || r.status === 'new').length})</option>
                      <option value="in_progress">In Progress ({requests.filter(r => r.status === 'in_progress' || r.status === 'matched' || r.status === 'accepted').length})</option>
                      <option value="completed">Completed ({requests.filter(r => r.status === 'completed').length})</option>
                      <option value="cancelled">Cancelled ({requests.filter(r => r.status === 'cancelled').length})</option>
                    </select>
                  </div>

                  {(reqStatusFilter !== "all" || searchTerm !== "") && (
                    <button
                      onClick={() => { setReqStatusFilter("all"); setSearchTerm(""); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} /> Clear Filter
                    </button>
                  )}
                </div>

                {/* Service Requests Table */}
                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <div className="overflow-x-auto scrollbar-thin">
                    <div className="min-w-[720px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-900 text-white">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Service</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Address</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Date</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Status</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-white">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRequests.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs font-bold">
                                No service requests found.
                              </td>
                            </tr>
                          ) : (
                            filteredRequests.map((req) => (
                              <tr key={req.id} className="hover:bg-sky-50/50 transition-colors">
                                <td className="px-6 py-4.5 text-xs font-black text-slate-900 flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                                    <Wrench size={14} />
                                  </div>
                                  <span>{req.service_type}</span>
                                </td>
                                <td className="px-6 py-4.5 text-xs text-slate-700 font-bold max-w-[220px] truncate">{req.address}</td>
                                <td className="px-6 py-4.5 text-xs font-semibold text-slate-500">📅 {new Date(req.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4.5">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    req.status === 'completed' ? 'border border-emerald-300 bg-emerald-50 text-emerald-800' :
                                    req.status === 'cancelled' ? 'border border-rose-300 bg-rose-50 text-rose-800' :
                                    req.status === 'in_progress' || req.status === 'matched' || req.status === 'accepted' ? 'border border-sky-300 bg-sky-50 text-sky-800' : 
                                    'border border-amber-300 bg-amber-50 text-amber-800'
                                  }`}>
                                    {req.status === 'in_progress' ? 'In Progress' : req.status || 'pending'}
                                  </span>
                                </td>
                                <td className="px-6 py-4.5">
                                  <select 
                                    disabled={updatingId === req.id}
                                    value={req.status === 'matched' || req.status === 'accepted' ? 'in_progress' : (req.status || 'pending')}
                                    onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                                    className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-sky-500 cursor-pointer shadow-xs"
                                  >
                                    <option value="pending" className="font-bold text-amber-700">Mark: Pending</option>
                                    <option value="in_progress" className="font-bold text-sky-700">Mark: In Progress</option>
                                    <option value="completed" className="font-bold text-emerald-700">Mark: Completed</option>
                                    <option value="cancelled" className="font-bold text-rose-700">Mark: Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'workers' && (
              <motion.div
                key="workers"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-sky-600">Verification & Network Control</span>
                    <h2 className="text-xl font-heading font-black text-slate-900 mt-0.5">Technician Approvals ({workers.length})</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Review registered artisans, verify NIN records, and toggle live job deployment access.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={workerFilter}
                      onChange={(e) => setWorkerFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs"
                    >
                      <option value="all">All Workers ({workers.length})</option>
                      <option value="unverified">Pending Approvals ({workers.filter(w => !w.is_verified).length})</option>
                      <option value="verified">Verified Only ({workers.filter(w => w.is_verified).length})</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                          <th className="p-4">Technician</th>
                          <th className="p-4">Skill & Phone</th>
                          <th className="p-4">NIN Identity</th>
                          <th className="p-4">AI Screening</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Approval Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                        {filteredWorkers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                              No matching worker profiles found.
                            </td>
                          </tr>
                        ) : (
                          filteredWorkers.map((w) => (
                            <tr key={w.id} className="hover:bg-sky-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={w.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(w.full_name || "worker")}`}
                                    alt={w.full_name}
                                    className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 object-cover shrink-0"
                                  />
                                  <div>
                                    <p className="font-extrabold text-slate-900">{w.full_name}</p>
                                    <span className="text-[10px] text-slate-400 font-mono">{w.id.substring(0, 8)}...</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 font-extrabold text-[10px] uppercase tracking-wider border border-sky-200 mb-0.5">
                                  {w.primary_skill}
                                </span>
                                <p className="text-[11px] font-mono text-slate-500">{w.phone}</p>
                              </td>
                              <td className="p-4 font-mono text-slate-700">
                                {w.nin ? w.nin : <span className="text-slate-400 italic">Not Provided</span>}
                              </td>
                              <td className="p-4">
                                {w.ai_verified ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <ShieldCheck size={12} className="text-emerald-600" /> Passed AI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    Pending AI
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                {w.is_verified ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 size={12} className="text-emerald-600" fill="currentColor" /> Approved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    <Clock size={12} className="text-amber-600" /> Pending Admin
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                {updatingId === w.id ? (
                                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest animate-pulse">Updating...</span>
                                ) : w.is_verified ? (
                                  <button
                                    onClick={() => updateWorkerApproval(w.id, false)}
                                    className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateWorkerApproval(w.id, true)}
                                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                                  >
                                    Approve & Verify
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

