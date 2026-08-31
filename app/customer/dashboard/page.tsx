"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { X, MessageCircle, Navigation, Star } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const LiveMap = dynamic(() => import("@/app/components/LiveMap"), { ssr: false });
const ChatModal = dynamic(() => import("@/app/components/ChatModal"), { ssr: false });

interface Request {
  id: string;
  service_type: string;
  description: string;
  address: string;
  preferred_time: string | null;
  status: string;
  created_at: string;
  image_url?: string | null;
  customer_id?: string;
  assigned_worker_id?: string;
}

interface Order {
  id: string;
  order_ref: string;
  items: { product_id: string; quantity: number; price: number }[];
  total: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

interface PropertyItem {
  id: string;
  property_id: string;
  name: string;
  property_type: string;
  address: string;
  city: string;
  health_score?: number | null;
  health_status: string;
  created_at: string;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300 } } };

export default function CustomerDashboardPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState<'basic' | 'pro' | 'elite'>('basic');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'orders' | 'properties'>('requests');
  const [trackingJob, setTrackingJob] = useState<Request | null>(null);
  const [chatJob, setChatJob] = useState<Request | null>(null);
  const isFetchingRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async (isSilent = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      if (!isSilent) setLoading(true);

      // Instant session resolution (< 1ms from client cache)
      const { data: sessionData } = await supabase.auth.getSession();
      let currentUser = sessionData.session?.user;

      if (!currentUser) {
        const { data: userData } = await supabase.auth.getUser();
        currentUser = userData.user;
      }

      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // Execute all 5 queries concurrently in parallel
      const [reqRes, orderRes, propRes, walletRes, profileRes] = await Promise.all([
        supabase
          .from('service_requests')
          .select('*')
          .eq('customer_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('store_orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('*')
          .eq('owner_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', currentUser.id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', currentUser.id)
          .maybeSingle(),
      ]);

      setRequests(reqRes.data || []);
      setOrders(orderRes.data || []);
      setProperties(propRes.data || []);

      if (walletRes.data) {
        setBalance(Number(walletRes.data.balance));
      } else {
        // Create wallet in background if missing
        supabase
          .from('wallets')
          .insert({ user_id: currentUser.id, balance: 0 })
          .select('balance')
          .single()
          .then((res: { data: { balance: number } | null }) => {
            if (res.data) setBalance(Number(res.data.balance));
          });
      }

      if (profileRes.data) {
        setTier(profileRes.data.subscription_tier || 'basic');
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Set up Realtime Subscription
    const channel = supabase
      .channel('customer-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
        },
        (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => {
          const updatedReq = payload.new as unknown as Request;
          // Check if this update is for the current customer (safety check)
          supabase.auth.getUser().then((res: { data: { user: User | null } }) => {
            const authUser = res.data.user;
            if (authUser && updatedReq.customer_id === authUser.id) {
               // Show contextual toasts
               if (payload.old.status !== 'in_progress' && updatedReq.status === 'in_progress') {
                  toast.success("Pro matched!", {
                    description: `A professional has accepted your ${updatedReq.service_type} request.`
                  });
               } else if (payload.old.status !== 'completed' && updatedReq.status === 'completed') {
                  toast.success("Job Completed!", {
                    description: `Your ${updatedReq.service_type} request is marked as finished.`,
                    icon: <CheckCircle2 className="text-emerald-500" />
                  });
               }
               fetchData(true);
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
        },
        async (payload: { new: { user_id: string; balance: number }; old: { balance: number } }) => {
          const updatedWallet = payload.new;
          const { data } = await supabase.auth.getUser();
          if (data.user && updatedWallet.user_id === data.user.id) {
             setBalance(Number(updatedWallet.balance));
             // Optional contextual toast if balance increased
             if (payload.old && Number(updatedWallet.balance) > Number(payload.old.balance)) {
                 toast.success("Wallet Credited!", {
                   description: `Your balance is now ₦${Number(updatedWallet.balance).toLocaleString()}`,
                   icon: <CheckCircle2 className="text-emerald-500" />
                 });
             }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, supabase]);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-12 pb-16 md:pb-20 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[11px] font-bold text-sky-100">
              <span className="capitalize">{tier} Plan</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-3">
                Customer Portal
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                Welcome <span className="text-cyan-200">Back</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-sky-100/90 font-medium max-w-md leading-relaxed">
                Track your jobs, manage your wallet, and view service warranties.
              </p>
            </div>

            {/* Wallet Quick Pill */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white sm:min-w-[240px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Wallet Balance</p>
              <div className="flex items-baseline justify-between gap-3 mt-1">
                <p className="text-2xl sm:text-3xl font-black text-white">₦{balance.toLocaleString()}</p>
                <Link
                  href="/customer/wallet"
                  className="px-4 py-1.5 rounded-full bg-sky-400 hover:bg-sky-300 text-blue-950 text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-md shadow-sky-400/25"
                >
                  Fund
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-8 sm:py-10 pb-36 relative z-10">
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Total Requests</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{requests.length}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-sky-200 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-sky-600">Completed Jobs</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {requests.filter(r => r.status?.toLowerCase() === 'completed').length}
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">In Progress</p>
              <p className="mt-2 text-3xl font-black text-slate-900">
                {requests.filter(r => r.status?.toLowerCase() !== 'completed').length}
              </p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.section variants={itemVariants} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h2 className="mb-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/request"
                className="inline-flex items-center justify-center rounded-full px-6 h-11 text-xs font-extrabold uppercase tracking-wider bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/25 transition-all"
              >
                + Book New Service
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center justify-center rounded-full px-6 h-11 text-xs font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all"
              >
                Store & Parts
              </Link>
              <Link
                href="/customer/subscription"
                className="inline-flex items-center justify-center rounded-full px-6 h-11 text-xs font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all"
              >
                Subscription
              </Link>
              <Link
                href="/inspection"
                className="inline-flex items-center justify-center rounded-full px-6 h-11 text-xs font-extrabold uppercase tracking-wider bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                Property Inspection
              </Link>
            </div>
          </motion.section>

          {/* Recent requests */}
          <motion.section variants={itemVariants} className="glass-panel p-4 sm:p-6 shadow-premium">
            <div className="mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
              <h2 className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                Recent requests
              </h2>
              <Link
                href="/request"
                className="text-[10px] sm:text-xs font-bold text-brand-primary hover:text-brand-glow transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="flex gap-4 mb-6 border-b border-white/5 flex-wrap">
               <button 
                 onClick={() => setActiveTab('requests')}
                 className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                   activeTab === 'requests' ? 'text-brand-primary' : 'text-zinc-500 hover:text-zinc-300'
                 }`}
               >
                 Service Requests ({requests.length})
                 {activeTab === 'requests' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
               </button>
               <button 
                 onClick={() => setActiveTab('properties')}
                 className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                   activeTab === 'properties' ? 'text-brand-primary' : 'text-zinc-500 hover:text-zinc-300'
                 }`}
               >
                 My Properties ({properties.length})
                 {activeTab === 'properties' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
               </button>
               <button 
                 onClick={() => setActiveTab('orders')}
                 className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                   activeTab === 'orders' ? 'text-brand-primary' : 'text-zinc-500 hover:text-zinc-300'
                 }`}
               >
                 Product Orders ({orders.length})
                 {activeTab === 'orders' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
               </button>
            </div>
            
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={24} />
              </div>
            ) : activeTab === 'requests' ? (
              requests.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
                   <p className="text-sm font-bold text-foreground">No recent requests</p>
                   <p className="text-xs mt-1">When you book a professional, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:py-4 sm:px-4 gap-4 glass-panel glass-panel-hover rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* Photo Thumbnail */}
                        {request.image_url ? (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/20 overflow-hidden shrink-0 border border-white/10 group-hover:border-brand-primary/30 transition-colors pointer-events-none">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={request.image_url} alt="Uploaded issue" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-zinc-600 transition-colors">
                            <ImageIcon size={14} className="sm:size-16" />
                          </div>
                        )}
                        
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-xs sm:text-sm font-bold text-foreground group-hover:text-brand-primary transition-colors">
                            {request.service_type}
                          </p>
                          <p className="text-[10px] sm:text-xs font-medium text-zinc-400 truncate max-w-[150px] sm:max-w-xs">{request.description}</p>
                          <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-zinc-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
  
                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex shrink-0 h-6 items-center rounded-full border px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${
                            !request.status || request.status.toLowerCase() === 'pending' || request.status.toLowerCase() === 'new'
                              ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                              : request.status.toLowerCase() === 'completed'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                              : 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                          }`}>
                            {request.status === 'in_progress' ? 'Active' : request.status || 'New'}
                          </span>
                          
                          {(request.status?.toLowerCase() === 'in_progress' || request.status?.toLowerCase() === 'active') && (
                             <div className="flex gap-2">
                               <button 
                                 onClick={() => setChatJob(request)}
                                 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-foreground flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                               >
                                 <MessageCircle size={10} /> Chat
                               </button>
                               <button 
                                 onClick={() => setTrackingJob(request)}
                                 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-glow flex items-center gap-1 bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20 hover:bg-brand-primary/20 transition-all cursor-pointer"
                               >
                                 <Navigation size={10} /> Track Pro
                               </button>
                             </div>
                          )}
                          
                          {request.status?.toLowerCase() === 'completed' && (
                             <div className="flex gap-2">
                               <Link 
                                 href={`/review?request_id=${request.id}`}
                                 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                               >
                                 <Star size={10} fill="currentColor" /> Review Pro
                               </Link>
                             </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              )
            ) : activeTab === 'properties' ? (
              properties.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-zinc-500 text-center space-y-3">
                   <p className="text-sm font-bold text-foreground">No Registered Properties</p>
                   <p className="text-xs max-w-sm text-zinc-400">Register your house, apartment, clinic, or office building to generate an outdoor Property QR and Digital Maintenance Passport.</p>
                   <Link href="/property/register" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-sky-600/30 transition-all">
                     + Register Your Property
                   </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2">
                    <p className="text-xs text-zinc-400">All properties registered under your account</p>
                    <Link
                      href="/property/register"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs hover:bg-sky-500 transition-all"
                    >
                      + Add Property
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-500/40 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
                              {prop.property_id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              prop.health_status === 'healthy'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : prop.health_status === 'attention'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : prop.health_status === 'critical'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : 'bg-white/5 border-white/10 text-zinc-400'
                            }`}>
                              {prop.health_status.replace('_', ' ')}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-foreground">{prop.name}</h3>
                          <p className="text-xs text-zinc-400 line-clamp-1">📍 {prop.address}</p>
                          
                          <div className="pt-1 flex items-center gap-2 text-[10px] text-zinc-400">
                            <span className="capitalize">{prop.property_type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>Health Score: <strong className="text-foreground">{prop.health_score !== null && prop.health_score !== undefined ? `${prop.health_score}/100` : 'Unassessed'}</strong></span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                          <Link
                            href={`/property/${prop.property_id}`}
                            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                          >
                            <span>Open Digital Passport</span> →
                          </Link>
                          <Link
                            href={`/request?property_id=${prop.property_id}&address=${encodeURIComponent(prop.address)}`}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Book Repair
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              orders.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-zinc-500">
                   <p className="text-sm font-bold text-foreground">No orders yet</p>
                   <p className="text-xs mt-1">Visit the HomeCare Store to browse products.</p>
                   <Link href="/store" className="mt-4 text-xs font-bold text-brand-primary uppercase tracking-widest hover:underline">Go to Store</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 glass-panel glass-panel-hover rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0 border border-brand-primary/20 text-brand-primary">
                          <ImageIcon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{order.order_ref}</p>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">₦{order.total.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{order.items.length} item(s) • {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <span className={`inline-flex h-6 items-center rounded-full border px-3 text-[9px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' 
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' 
                            : 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <Link 
                          href={`/store/track?ref=${order.order_ref}&email=${user?.email}`}
                          className="h-8 px-4 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-foreground hover:bg-white/10 transition-all"
                        >
                          Track Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </motion.section>

          {/* Referral */}
          <motion.section variants={itemVariants} className="glass-panel p-6 shadow-premium relative overflow-hidden group">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors blur-xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">Invite friends, get rewarded</h3>
                <p className="mt-1 text-xs font-medium text-zinc-400 max-w-md">
                  Share HomeCare with your network. When they book their first pro, you both receive ₦500 in service credits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const shareText = "Check out HomeCare - Nigeria's #1 verified home repairs and maintenance platform!";
                  const shareUrl = "https://www.homecare.com.ng";
                  if (navigator.share) {
                    navigator.share({ title: "HomeCare", text: shareText, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    toast.success("Link Copied!", { description: "Send it to your friends to earn ₦500." });
                  }
                }}
                className="btn-minimal inline-flex shrink-0 h-10 items-center justify-center rounded-full px-6 text-xs font-bold uppercase tracking-widest"
              >
                Share & Get ₦500
              </button>
            </div>
          </motion.section>
        </motion.main>
      </div>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 sm:p-12" 
            onClick={() => setTrackingJob(null)}
          >
            <button 
              className="absolute top-6 right-6 sm:top-8 sm:right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-primary hover:text-white transition-colors shadow-premium backdrop-blur-md"
              onClick={() => setTrackingJob(null)}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.15)] border border-white/10 bg-background"
               onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <div>
                    <h3 className="text-sm font-bold text-foreground">Live Tracking</h3>
                    <p className="text-xs text-zinc-400 mt-1">{trackingJob.service_type} • {trackingJob.address}</p>
                 </div>
                 <span className="animate-pulse flex h-3 w-3 rounded-full bg-brand-primary"></span>
              </div>
              <div className="w-full bg-black">
                 <LiveMap 
                    address={trackingJob.address}
                    trackingJobId={trackingJob.id}
                    workerName={`${trackingJob.service_type} Specialist`}
                    workerRole="Verified Professional En Route"
                    clientName="You"
                    height="65vh"
                    interactive={false}
                 />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatModal 
        isOpen={!!chatJob}
        onClose={() => setChatJob(null)}
        requestId={chatJob?.id || ""}
        title="Message Your Pro"
        subtitle={chatJob?.service_type}
      />
    </div>
  );
}
