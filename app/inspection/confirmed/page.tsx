"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Phone,
  MessageSquare,
  FileText,
  Award,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  UserCheck,
  Activity,
  Check,
  ChevronRight,
  HardHat,
  Share2,
  Building,
  Navigation,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getMatchingCandidates, MatchedWorker } from "@/lib/matching";

interface InspectionOrder {
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  total: number;
  status: string;
  items?: Array<{
    name: string;
    price: number;
    id?: string;
  }>;
  assigned_worker?: MatchedWorker | null;
}

function InspectionConfirmedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refParam = searchParams.get("ref") || "";
  const paymentTypeParam = searchParams.get("payment") || "";
  const amountParam = searchParams.get("amount");

  const [order, setOrder] = useState<InspectionOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<MatchedWorker[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<MatchedWorker | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(2); // 1: Escrow, 2: Inspector, 3: On-Site, 4: Report

  useEffect(() => {
    async function loadOrderAndEngineers() {
      try {
        setLoading(true);
        const supabase = createClient();

        let orderData: InspectionOrder | null = null;

        if (refParam) {
          const { data, error } = await supabase
            .from("store_orders")
            .select("*")
            .eq("order_ref", refParam)
            .maybeSingle();

          if (!error && data) {
            let assigned: MatchedWorker | null = null;
            if (data.notes && data.notes.includes("[ASSIGNED_PRO:")) {
              try {
                const match = data.notes.match(/\[ASSIGNED_PRO:(.*?)\]/);
                if (match && match[1]) {
                  assigned = JSON.parse(decodeURIComponent(match[1]));
                }
              } catch (e) {
                console.warn("Could not parse assigned pro from notes", e);
              }
            }

            orderData = {
              order_ref: data.order_ref,
              customer_name: data.customer_name || "Valued Property Owner",
              customer_email: data.customer_email || "",
              customer_phone: data.customer_phone || "",
              delivery_address: data.delivery_address || "Lagos, Nigeria",
              notes: data.notes || "",
              total: data.total || (amountParam ? Number(amountParam) : 50000),
              status: data.status || (paymentTypeParam === "transfer" ? "pending_transfer" : "paid"),
              items: data.items || [],
              assigned_worker: assigned,
            };
          }
        }

        // Fallback default order data if loaded without ref parameter
        if (!orderData) {
          orderData = {
            order_ref: refParam || `INSP-${Date.now().toString(36).toUpperCase()}`,
            customer_name: "Valued Property Owner",
            customer_email: "customer@homecare.com.ng",
            customer_phone: "+234 800 000 0000",
            delivery_address: "Lekki Phase 1, Lagos, Nigeria",
            notes: "Preferred Inspection Time: Tomorrow, 10:00 AM",
            total: amountParam ? Number(amountParam) : 50000,
            status: paymentTypeParam === "transfer" ? "pending_transfer" : "paid",
            items: [{ name: "Property Inspection (Standard)", price: 50000 }],
            assigned_worker: null,
          };
        }

        setOrder(orderData);
        if (orderData.assigned_worker) {
          setSelectedWorker(orderData.assigned_worker);
          setCurrentStage(2);
        }

        // Load Top Certified Engineers
        setLoadingCandidates(true);
        const city = orderData.delivery_address.toLowerCase().includes("enugu") ? "Enugu" : "Lagos";
        const matchedList = await getMatchingCandidates("Property Inspector", city, "elite", orderData.total);
        setCandidates(matchedList);
        setLoadingCandidates(false);
      } catch (err) {
        console.error("Error loading inspection confirmation:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrderAndEngineers();
  }, [refParam, amountParam, paymentTypeParam]);

  const handleSelectWorker = async (worker: MatchedWorker) => {
    try {
      setIsAssigning(true);
      setSelectedWorker(worker);
      setCurrentStage(2);

      const supabase = createClient();
      if (order?.order_ref) {
        const serializedPro = encodeURIComponent(JSON.stringify(worker));
        const updatedNotes = `${order.notes || ""}\n[ASSIGNED_PRO:${serializedPro}]`;

        await supabase
          .from("store_orders")
          .update({
            notes: updatedNotes,
            status: "processing",
          })
          .eq("order_ref", order.order_ref);

        // Also create or link a service_request for live field tracking
        const { data: session } = await supabase.auth.getSession();
        await supabase.from("service_requests").insert({
          customer_id: session.session?.user?.id || null,
          service_type: "Property Inspection",
          description: `Certified Engineering Audit for ${order.items?.[0]?.name || "Property"}.\nAddress: ${order.delivery_address}\nAssigned Lead Inspector: ${worker.full_name}`,
          address: order.delivery_address,
          status: "in_progress",
          assigned_worker_id: worker.id?.startsWith("pro-") ? null : worker.id,
        });
      }

      toast.success(`Lead Inspector ${worker.full_name} assigned!`, {
        description: "Your inspection appointment has been locked in.",
      });
    } catch (err) {
      console.error("Failed to assign worker:", err);
      toast.error("Inspector selected locally.");
    } finally {
      setIsAssigning(false);
    }
  };

  const propertyTitle = order?.items?.[0]?.name || "Comprehensive Property Engineering Audit";
  const isPaid = order?.status === "paid" || order?.status === "processing" || paymentTypeParam !== "transfer";

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `HomeCare Engineering Inspection - ${propertyTitle}`
  )}&details=${encodeURIComponent(
    `Certified 7-System Engineering Audit at ${order?.delivery_address || ""}. Assigned Lead Inspector: ${
      selectedWorker?.full_name || "HomeCare Lead Engineer"
    }`
  )}&location=${encodeURIComponent(order?.delivery_address || "Lagos, Nigeria")}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased pb-28">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border-b border-white/10 pt-10 pb-12 px-4 sm:px-6">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full uppercase tracking-wider">
                Ref: {order?.order_ref || refParam || "INSP-ONLINE"}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={12} /> {isPaid ? "Escrow Protected" : "Payment Pending"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-sky-400" />
              <span>Inspection Booking Confirmed</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              Property <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Engineering Audit</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-medium leading-relaxed">
              Your inspection request is anchored in HomeCare Escrow. Review your 4-stage audit lifecycle and select your preferred verified lead engineer below.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
        
        {/* ======================================================== */}
        {/* 1. REAL-TIME 4-STAGE PROGRESS TRACKER                    */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 block">
                Live Audit Lifecycle
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase mt-0.5">
                4-Stage Inspection Progress Tracker
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Stage 1 */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                isPaid
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/40"
                  : "bg-amber-950/20 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  {isPaid ? "Completed" : "Action Needed"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Payment in Escrow</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ₦{(order?.total || 50000).toLocaleString()} held in secure escrow. Released only after certified report sign-off.
              </p>
            </div>

            {/* Stage 2 */}
            <div
              className={`p-4.5 rounded-2xl border transition-all ${
                selectedWorker
                  ? "bg-sky-950/40 border-sky-500/50 text-sky-200 shadow-lg shadow-sky-950/40"
                  : "bg-blue-950/20 border-blue-500/30 text-blue-300 animate-pulse"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="h-7 w-7 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  selectedWorker ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300"
                }`}>
                  {selectedWorker ? "Assigned" : "Select Below"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                <UserCheck size={16} className="text-sky-400 shrink-0" />
                <span>Lead Inspector</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {selectedWorker
                  ? `Assigned: ${selectedWorker.full_name}`
                  : "Pick your preferred verified COREN / MEP lead engineer below."}
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-4.5 rounded-2xl border border-white/5 bg-white/[0.02] text-slate-400">
              <div className="flex items-center justify-between mb-3">
                <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500">
                  3
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-500">
                  Upcoming
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-1">
                <HardHat size={16} className="text-slate-500 shrink-0" />
                <span>On-Site 7-System Audit</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Acoustic pipe leak detection, electrical safety stress test, ceiling dampness & roof inspection.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-4.5 rounded-2xl border border-white/5 bg-white/[0.02] text-slate-400">
              <div className="flex items-center justify-between mb-3">
                <span className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-slate-500">
                  4
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-500">
                  Final Output
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-1">
                <Award size={16} className="text-slate-500 shrink-0" />
                <span>Digital PDF Certificate</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Certified engineering PDF audit report with property health score and repair recommendations.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* 2. DETAILED PROPERTY & LOCATION CARD                     */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Property & Appointment Details (2 Cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 block">
                  Property & Scope
                </span>
                <h3 className="text-lg font-black text-white uppercase mt-0.5">
                  Inspection Venue & Schedule
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-xl">
                {propertyTitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <MapPin size={14} className="text-sky-400" />
                  <span>Property Address</span>
                </div>
                <p className="text-sm font-extrabold text-white leading-snug">
                  {order?.delivery_address}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    order?.delivery_address || "Lagos, Nigeria"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors pt-1"
                >
                  <Navigation size={12} /> Open in Google Maps <ExternalLink size={10} />
                </a>
              </div>

              {/* Schedule */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Calendar size={14} className="text-cyan-400" />
                  <span>Appointment Schedule</span>
                </div>
                <p className="text-sm font-extrabold text-white leading-snug">
                  {order?.notes?.replace(/\[ASSIGNED_PRO:.*?\]/g, "") || "Scheduled On-Demand"}
                </p>
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
                >
                  <Calendar size={12} /> Add to Google Calendar <ExternalLink size={10} />
                </a>
              </div>

              {/* Client Contact */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Smartphone size={14} className="text-amber-400" />
                  <span>Client Contact</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {order?.customer_name}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  {order?.customer_phone} · {order?.customer_email}
                </p>
              </div>

              {/* Escrow Status */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Audit Escrow Fee</span>
                </div>
                <p className="text-lg font-black text-emerald-400">
                  ₦{(order?.total || 50000).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Zero hidden call-out fees. 100% money-back audit warranty.
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Engineer Card or Quick Dispatch Action */}
          <div className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 block">
                Assigned Lead Professional
              </span>
              <h3 className="text-lg font-black text-white uppercase mt-0.5">
                Audit Lead Engineer
              </h3>
            </div>

            {selectedWorker ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedWorker.avatar_url || "/hclogo.png"}
                    alt={selectedWorker.full_name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-sky-400/40 shadow-lg shadow-sky-950/50"
                  />
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {selectedWorker.full_name}
                    </h4>
                    <p className="text-xs text-sky-400 font-semibold">
                      {selectedWorker.service_type || "Senior MEP Auditor"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1">
                      <span className="text-amber-400">★ {selectedWorker.rating || 4.98}</span>
                      <span>•</span>
                      <span>{selectedWorker.completed_jobs_count || 120}+ Audits</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Award size={13} /> {selectedWorker.match_reason || "COREN Accredited Lead Inspector"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {selectedWorker.specialization || "Acoustic Leak Detection & Infrared Thermography"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${selectedWorker.phone || "+2348000000000"}`}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/30"
                  >
                    <Phone size={14} /> Call Pro
                  </a>
                  <a
                    href={`https://wa.me/${(selectedWorker.phone || "").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="h-14 w-14 rounded-full bg-sky-500/10 border border-sky-400/20 flex items-center justify-center mx-auto text-sky-400 animate-pulse">
                  <UserCheck size={24} />
                </div>
                <p className="text-xs font-bold text-slate-300">
                  No engineer assigned yet.
                </p>
                <p className="text-[11px] text-slate-500">
                  Please review the verified audit engineers below and click to confirm your lead inspector.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 text-[10px] text-slate-500 flex items-center justify-between">
              <span>HomeCare Verified Shield</span>
              <span className="text-emerald-400 font-bold">NIMC & Biometric Checked</span>
            </div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* 3. INTERACTIVE TOP CERTIFIED ENGINEERS SELECTION GRID    */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-slate-950/80 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                  Available Verified Auditors
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">
                  {candidates.length} Available in Area
                </span>
              </div>
              <h3 className="text-xl font-black text-white uppercase mt-0.5">
                Select Your Lead Property Inspector
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Each engineer is equipped with calibrated acoustic leak sensors, thermal cameras, and electrical load testers.
            </p>
          </div>

          {loadingCandidates ? (
            <div className="text-center py-12 space-y-3">
              <RefreshCw size={24} className="animate-spin text-sky-400 mx-auto" />
              <p className="text-xs font-bold text-slate-400">
                Fetching certified lead engineers in {order?.delivery_address?.split(",")[0] || "your area"}...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((worker) => {
                const isSelected = selectedWorker?.id === worker.id;

                return (
                  <motion.div
                    key={worker.id}
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/30 shadow-xl shadow-sky-950/50"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Avatar & Ratings */}
                      <div className="flex items-start justify-between gap-3">
                        <img
                          src={worker.avatar_url || "/hclogo.png"}
                          alt={worker.full_name}
                          className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                        />
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                            ★ {worker.rating || 4.95}
                          </span>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">
                            {worker.completed_jobs_count || 90}+ audits
                          </p>
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="text-sm font-black text-white leading-snug">
                          {worker.full_name}
                        </h4>
                        <p className="text-xs font-bold text-sky-400 mt-0.5">
                          {worker.service_type || "Certified Lead MEP Auditor"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={11} className="text-slate-500" />
                          <span>{worker.area || "Lagos Island / Lekki"}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{worker.eta_mins || 15} mins away</span>
                        </p>
                      </div>

                      {/* Badges / Specialization */}
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 text-[11px]">
                        <p className="font-bold text-sky-300">
                          {worker.match_reason || "COREN Verified Engineer"}
                        </p>
                        <p className="text-slate-400 text-[10.5px] line-clamp-2">
                          {worker.specialization || "Acoustic leak profiling, thermography & electrical load testing"}
                        </p>
                      </div>
                    </div>

                    {/* Select CTA */}
                    <button
                      disabled={isAssigning}
                      onClick={() => handleSelectWorker(worker)}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} strokeWidth={3} /> Assigned Lead Inspector
                        </>
                      ) : (
                        <>
                          Select Inspector <ChevronRight size={14} />
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ======================================================== */}
        {/* 4. FOOTER ACTIONS & SUPPORT                             */}
        {/* ======================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Return to Customer Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/property-management"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Property Management
            </Link>
            <a
              href="tel:+2348000000000"
              className="px-5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Emergency Support Hotline
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function InspectionConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-sky-400 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Loading Inspection Confirmation...
            </p>
          </div>
        </div>
      }
    >
      <InspectionConfirmedContent />
    </Suspense>
  );
}
