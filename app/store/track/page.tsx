"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Loader2,
  AlertCircle,
  Download,
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  User,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";
import OrderReceipt from "@/app/components/OrderReceipt";
import { Suspense } from "react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  order_ref: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  delivery_fee: number;
  items: OrderItem[];
  total: number;
  delivery_address: string;
  customer_phone?: string;
  notes?: string;
}

// HomeCare Logistics delivery stages
const DELIVERY_STEPS = [
  { step: 1, key: "placed", title: "Order Placed", desc: "Order recorded in system" },
  { step: 2, key: "confirmed", title: "Payment Verified", desc: "Warehouse preparing items" },
  { step: 3, key: "shipped", title: "In Transit", desc: "Departed sorting facility" },
  { step: 4, key: "out_for_delivery", title: "Out for Delivery", desc: "With local courier associate" },
  { step: 5, key: "delivered", title: "Delivered", desc: "Package handed over & signed" },
];

export function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [orderRef, setOrderRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Auto-fetch if order reference is in URL parameters (e.g. redirected from checkout/order-confirmation)
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      const cleanRef = refParam.trim().toUpperCase();
      setOrderRef(cleanRef);
      fetchRealOrder(cleanRef);
    }
  }, [searchParams]);

  // Real-time Supabase subscription: whenever admin changes the status, update live on screen
  useEffect(() => {
    if (!order?.order_ref) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order-live-tracking-${order.order_ref}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "store_orders",
          filter: `order_ref=eq.${order.order_ref}`,
        },
        (payload: { new?: Record<string, unknown> }) => {
          if (payload.new) {
            setOrder((prev) => (prev ? { ...prev, ...(payload.new as unknown as Order) } : (payload.new as unknown as Order)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.order_ref]);

  const fetchRealOrder = async (ref: string, emailQuery?: string) => {
    if (!ref || ref.trim() === "") return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    try {
      let query = supabase.from("store_orders").select("*").eq("order_ref", ref.trim().toUpperCase());
      
      if (emailQuery && emailQuery.trim() !== "") {
        query = query.eq("customer_email", emailQuery.trim().toLowerCase());
      }

      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError(`No package found for Waybill reference "${ref}". Please check the reference number or confirm your email.`);
        setOrder(null);
      } else {
        setOrder(data);
        if (data.customer_email && !email) {
          setEmail(data.customer_email);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to reach logistics server. Please try again.";
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRealOrder(orderRef.trim().toUpperCase(), email.trim().toLowerCase());
  };

  // Determine current progression index (1 through 5)
  const currentStep = useMemo(() => {
    if (!order) return 1;
    switch (order.status) {
      case "pending_payment":
        return 1;
      case "paid":
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "out_for_delivery":
        return 4;
      case "delivered":
        return 5;
      case "cancelled":
        return 0;
      default:
        return 2;
    }
  }, [order?.status]);

  // Destination hub parsing from customer's address
  const destinationHub = useMemo(() => {
    if (!order?.delivery_address) return "Destination Delivery Station";
    const parts = order.delivery_address.split(",");
    if (parts.length > 1) {
      return `${parts[parts.length - 2]?.trim() || parts[0]?.trim()} Station`;
    }
    return `${parts[0]?.trim()} Station`;
  }, [order?.delivery_address]);

  // Chronological activity logs
  const activityLogs = useMemo(() => {
    if (!order) return [];
    const createdDate = new Date(order.created_at || Date.now());

    const formatTimestamp = (minutesAfter: number) => {
      const d = new Date(createdDate.getTime() + minutesAfter * 60000);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const logs = [];

    // Step 1: Created
    logs.push({
      date: formatTimestamp(0),
      status: "Order Created & Registered",
      location: "HomeCare Digital Network (Storefront)",
      desc: "Waybill generated and uploaded to carrier sorting database.",
      completed: true,
      current: currentStep === 1,
    });

    // Step 2: Payment & Warehouse Packing
    if (currentStep >= 2) {
      logs.push({
        date: formatTimestamp(35),
        status: "Payment Confirmed & Package Received at Hub",
        location: "HomeCare Central Fulfillment Center (Ikeja, Lagos)",
        desc: "Items verified, quality inspected, and packaged with security seal.",
        completed: true,
        current: currentStep === 2,
      });
    }

    // Step 3: Departed Sorting Hub / In Transit
    if (currentStep >= 3) {
      logs.push({
        date: formatTimestamp(110),
        status: "Departed Facility in Transit to Destination Hub",
        location: "Lagos Central Arterial Corridor",
        desc: "Package consolidated into line-haul express vehicle for inter-hub transit.",
        completed: true,
        current: currentStep === 3,
      });
    }

    // Step 4: Arrived at Local Station / Out for Delivery
    if (currentStep >= 4) {
      logs.push({
        date: formatTimestamp(185),
        status: "Arrived at Delivery Station & Out with Courier Associate",
        location: destinationHub,
        desc: "Package sorted to last-mile route. Dispatch rider en route to delivery address.",
        completed: true,
        current: currentStep === 4,
      });
    }

    // Step 5: Delivered
    if (currentStep === 5) {
      logs.push({
        date: formatTimestamp(240),
        status: "Successfully Delivered & Signed",
        location: order.delivery_address,
        desc: "Package received and confirmed by customer.",
        completed: true,
        current: true,
      });
    }

    // Show latest activity first
    return logs.reverse();
  }, [order, currentStep, destinationHub]);

  // Delivery status badge styling
  const statusBadge = useMemo(() => {
    if (!order) return null;
    switch (order.status) {
      case "pending_payment":
        return {
          label: "PENDING PAYMENT",
          bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          desc: "We are awaiting confirmation of your payment before handing to dispatch.",
        };
      case "paid":
      case "processing":
        return {
          label: "PROCESSING AT WAREHOUSE",
          bg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          desc: "Payment confirmed. Items are currently being packed and quality-inspected.",
        };
      case "shipped":
        return {
          label: "IN TRANSIT",
          bg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
          desc: "Package has departed the main sorting facility and is traveling to your local station.",
        };
      case "out_for_delivery":
        return {
          label: "OUT FOR DELIVERY",
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          desc: "Our delivery associate has picked up your package and is heading to your doorstep.",
        };
      case "delivered":
        return {
          label: "DELIVERED",
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          desc: "This shipment has been delivered successfully to the recipient.",
        };
      case "cancelled":
        return {
          label: "CANCELLED",
          bg: "bg-red-500/10 text-red-500 border-red-500/20",
          desc: "This order has been cancelled.",
        };
      default:
        return {
          label: "ACTIVE IN LOGISTICS",
          bg: "bg-sky-500/10 text-sky-500 border-sky-500/20",
          desc: "Package is active in our regional delivery network.",
        };
    }
  }, [order?.status]);

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased py-10 sm:py-20 px-4">
      {/* Background radial gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 h-96 w-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl">
        {/* Navigation / Brand Header */}
        <header className="mb-10 text-center">
          <div className="inline-block mb-6">
            <Logo size="md" href="/store" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-foreground mb-2">
            Track Your Order
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Enter your order details below to see the current status of your delivery.
          </p>
        </header>

        {/* Layout Grid: Search Card on Left, Tracking Dashboard on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">
          {/* Tracking Search Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-zinc-200 dark:border-white/10">
              <div className="h-9 w-9 rounded-xl bg-sky-600/10 border border-sky-600/20 flex items-center justify-center text-sky-600">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Shipment Search</h3>
                <p className="text-[11px] text-zinc-400">HomeCare Express Standard</p>
              </div>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Order Reference
                </label>
                <div className="relative">
                  <input
                    required
                    placeholder="e.g. HC-XXXXX"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 text-sm font-mono text-sky-600 dark:text-sky-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-sky-600 transition-all uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[9px] text-zinc-400 font-normal">(Optional if Ref matches)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 text-sm text-foreground placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-sky-600 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                Locate Order
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5"
                >
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={15} />
                  <p className="text-xs text-red-500 dark:text-red-400 leading-relaxed font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <ShieldCheck size={15} className="text-emerald-500" />
                <span>Verified HomeCare Logistics</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Direct integration with regional dispatch stations in Lagos, Abuja, Port Harcourt, and major cities nationwide.
              </p>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              {order ? (
                <motion.div
                  key={order.order_ref}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-6"
                >
                  {/* HomeCare Main Status Card */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-lg space-y-6">
                    {/* Top Bar with Tracking No & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Waybill / Tracking No
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-600/10 text-sky-600 border border-sky-600/20">
                            EXPRESS
                          </span>
                        </div>
                        <h2 className="text-2xl font-mono font-black text-foreground tracking-wider mt-1">
                          {order.order_ref}
                        </h2>
                      </div>

                      {statusBadge && (
                        <div className="self-start sm:self-auto">
                          <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider border ${statusBadge.bg}`}>
                            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                            {statusBadge.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Origin to Destination Hub Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-sky-600/10 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Origin Facility</p>
                          <p className="text-xs font-bold text-foreground">HomeCare Central Hub</p>
                          <p className="text-[11px] text-zinc-500">Ikeja Logistics Depot, Lagos</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 sm:border-l sm:border-zinc-200 dark:sm:border-white/5 sm:pl-4">
                        <div className="h-8 w-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                          <MapPin size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Destination Station</p>
                          <p className="text-xs font-bold text-foreground">{destinationHub}</p>
                          <p className="text-[11px] text-zinc-500 truncate max-w-xs">{order.delivery_address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Multi-Step Progression Bar */}
                    <div className="py-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                        Delivery Milestone Progress
                      </p>

                      <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="absolute top-5 left-6 right-6 h-1 bg-zinc-200 dark:bg-white/10 hidden sm:block -z-0">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-700"
                            style={{
                              width: `${Math.min(Math.max(((currentStep - 1) / 4) * 100, 0), 100)}%`,
                            }}
                          />
                        </div>

                        {/* Step Nodes */}
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                          {DELIVERY_STEPS.map((s) => {
                            const isPassed = currentStep >= s.step;
                            const isCurrent = currentStep === s.step;

                            return (
                              <div key={s.step} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2.5">
                                <div
                                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                    isPassed
                                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-4 ring-emerald-500/20"
                                      : isCurrent
                                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 ring-4 ring-sky-600/20 animate-pulse"
                                      : "bg-zinc-100 dark:bg-white/10 text-zinc-400 border border-zinc-200 dark:border-white/10"
                                  }`}
                                >
                                  {isPassed ? <CheckCircle2 size={18} /> : s.step}
                                </div>
                                <div className="text-left sm:text-center">
                                  <p className={`text-xs font-bold ${isPassed ? "text-foreground" : "text-zinc-400"}`}>
                                    {s.title}
                                  </p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                                    {s.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HomeCare Waybill Activity History Table */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-lg space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-sky-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Shipment Audit Trail & Logs
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {activityLogs.length} Events Logged
                      </span>
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/10">
                      {activityLogs.map((log, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div
                            className={`absolute -left-6 sm:-left-8 top-1 h-5 w-5 rounded-full flex items-center justify-center border-2 ${
                              idx === 0
                                ? "bg-emerald-500 border-white text-white ring-4 ring-emerald-500/20"
                                : "bg-zinc-200 dark:bg-zinc-800 border-zinc-400 text-zinc-600"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          </div>

                          <div className="flex-1 p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <p className="text-xs font-bold text-foreground">{log.status}</p>
                              <span className="text-[10px] font-mono text-zinc-400">{log.date}</span>
                            </div>
                            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{log.location}</p>
                            <p className="text-[11px] text-zinc-500 leading-relaxed">{log.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consignee & Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Consignee / Delivery Address */}
                    <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-400 pb-2 border-b border-zinc-200 dark:border-white/10">
                        <User size={15} />
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                          Recipient & Destination
                        </h4>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-foreground">{order.customer_name}</p>
                        <p className="text-zinc-500 leading-relaxed">{order.delivery_address}</p>
                        {order.customer_phone && (
                          <p className="text-zinc-400 font-mono pt-1">Phone: {order.customer_phone}</p>
                        )}
                        <p className="text-zinc-400 font-mono">Email: {order.customer_email}</p>
                      </div>
                    </div>

                    {/* Order Items & Receipt */}
                    <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Package size={15} />
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                            Package Summary ({order.items?.length || 0})
                          </h4>
                        </div>
                        <button
                          onClick={() => setShowReceipt(true)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-sky-600 hover:underline uppercase tracking-wider cursor-pointer"
                        >
                          <FileText size={12} /> View Receipt
                        </button>
                      </div>

                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400 truncate max-w-[200px]">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-mono font-bold text-foreground">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-between items-center text-xs font-bold">
                        <span className="text-zinc-400">Total Charged:</span>
                        <span className="text-sm font-heading font-black text-foreground">
                          ₦{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Support & Dispatch Contact */}
                  <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">Need assistance with this shipment?</p>
                      <p className="text-[11px] text-zinc-500">Contact HomeCare logistics customer dispatch desk.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={`https://wa.me/2348000000000?text=Hello%20HomeCare%2C%20inquiring%20about%20my%20order%20${order.order_ref}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        <MessageCircle size={14} /> WhatsApp Support
                      </a>
                      <a
                        href="tel:+2348000000000"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-white/10"
                      >
                        <Phone size={14} /> Call Desk
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : !loading && (
                /* Clean Empty State: Ready to track */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center p-12 sm:p-16 glass-panel rounded-3xl border-dashed border-2 border-zinc-200 dark:border-white/10"
                >
                  <div className="w-20 h-20 rounded-3xl bg-sky-600/10 border border-sky-600/20 flex items-center justify-center text-sky-600 mb-6 shadow-inner">
                    <Package size={38} strokeWidth={1.5} />
                  </div>

                  <h2 className="text-xl font-heading font-black text-foreground">
                    Ready to track?
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400 max-w-sm leading-relaxed">
                    Enter your order reference above (e.g. <span className="font-mono text-sky-600 font-bold">HC-XXXXX</span>) to see real-time shipment progress, delivery milestones, and dispatch logs.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {showReceipt && order && (
        <OrderReceipt 
          orderRef={order.order_ref}
          date={order.created_at}
          customerName={order.customer_name}
          customerEmail={order.customer_email}
          address={order.delivery_address}
          items={order.items}
          subtotal={order.subtotal}
          deliveryFee={order.delivery_fee}
          total={order.total}
          status={order.status}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-600" size={32} />
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
