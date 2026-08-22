"use client";

import { motion } from "framer-motion";
import { Check, ArrowLeft, Home, User, MapPin, Zap, Loader2, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import ModernDatePicker from "@/app/components/ModernDatePicker";
import { createClient } from "@/lib/supabase/client";

const PRICING = {
  bungalow: 50000,
  duplex: 100000,
  commercial: 250000,
} as const;

type PropertyType = keyof typeof PRICING | "";

export default function PropertyInspectionPage() {
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date());
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [propertyType, setPropertyType] = useState<PropertyType>("bungalow");
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const totalFee = propertyType ? PRICING[propertyType] : 50000;

  const propertyLabel = propertyType === 'bungalow' ? 'Bungalow' : propertyType === 'duplex' ? 'Duplex' : propertyType === 'commercial' ? 'Commercial Building' : 'Property';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !propertyType) {
      toast.error("Please fill in property address and type");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Securing appointment and opening Flutterwave Gateway...", { id: "insp-pay" });

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      const orderRef = `INSP-${Date.now().toString(36).toUpperCase()}`;

      // 1. Insert inspection order into store_orders to anchor in the admin dashboard
      const { error: dbError } = await supabase.from("store_orders").insert({
        order_ref: orderRef,
        customer_name: contactName || user?.user_metadata?.full_name || "Property Inspection Customer",
        customer_email: contactEmail || user?.email || "customer@homecare.com.ng",
        customer_phone: contactPhone || user?.user_metadata?.phone || "08000000000",
        delivery_address: address,
        notes: `Preferred Date: ${appointmentDate ? appointmentDate.toLocaleDateString() : 'N/A'}, Time: ${appointmentTime}`,
        items: [{
          id: propertyType,
          name: `Property Inspection (${propertyLabel})`,
          price: totalFee,
          quantity: 1,
          image: "/hclogo.png",
        }],
        subtotal: totalFee,
        delivery_fee: 0,
        total: totalFee,
        status: "pending_payment",
        user_id: user?.id || null,
      });

      if (dbError) {
        console.error("Failed to insert inspection order:", dbError);
        throw new Error(dbError.message);
      }

      // 2. Initialize Flutterwave payment with 6s timeout
      const controller = new AbortController();
      const flwTimeout = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch("/api/payment/flutterwave/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderRef,
            amount: totalFee,
            email: contactEmail || user?.email || "customer@homecare.com.ng",
            name: contactName || user?.user_metadata?.full_name || "Property Inspection Customer",
            phone: contactPhone || user?.user_metadata?.phone || "08000000000",
            title: "HomeCare Engineering Property Inspection",
            description: `Comprehensive ${propertyLabel} inspection audit at ${address.slice(0, 30)}`,
            type: "inspection",
            userId: user?.id || null,
          }),
          signal: controller.signal,
        });

        clearTimeout(flwTimeout);
        const data = await res.json();

        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          toast.info("Inspection booking recorded! Please complete bank transfer to our verified account.", { id: "insp-pay" });
          setSubmitting(false);
        }
      } catch (flwErr) {
        clearTimeout(flwTimeout);
        toast.info("Inspection request logged! Please pay via direct bank transfer.", { id: "insp-pay" });
        setSubmitting(false);
      }
    } catch (err: unknown) {
      console.error("Inspection checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Payment error", { id: "insp-pay" });
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-12 pb-16 md:pb-20 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-6xl relative z-10">
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-3">
              Certified Engineering Audit · Escrow Protected
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              Property <span className="text-cyan-200">Inspection & Audit</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-sky-100/90 font-medium max-w-2xl leading-relaxed">
              Before you sign lease agreements or complete property acquisitions, verified engineers inspect electrical safety, concealed plumbing leaks, and structural roofing integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 py-8 sm:py-10 pb-36 relative z-10 grid gap-8 lg:gap-12 lg:grid-cols-2 lg:items-start">
        
        {/* Left: Value Prop */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">Engineering Audit Scope</h2>

          <div className="space-y-4">
            {[
              "Complete Electrical Safety & High-Load Stress Sweep",
              "Acoustic & Pressure Concealed Pipe Leak Detection",
              "Structural Foundation, Ceiling Dampness & Roof Inspection",
              "Same-Day Official Certified PDF Engineering Report"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
              Audit Total Fee
            </p>
            <p className="text-4xl font-black text-sky-600 tracking-tight">
              ₦{totalFee.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Standard fixed rate for {propertyLabel.toLowerCase()} inspection. Zero hidden fees.
            </p>
          </div>

          <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100 flex items-center gap-3 text-xs text-sky-800 font-semibold">
            <ShieldCheck size={20} className="text-sky-600 shrink-0" />
            <span>Payments securely processed via Flutterwave Escrow. Funds released only upon completed audit report.</span>
          </div>
        </motion.div>

        {/* Right: Intake Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="w-full min-w-0">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="text-lg font-extrabold text-slate-900 mb-4">Book & Pay Online</h3>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Property Address *
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                  Property Type *
                </label>
                <div className="relative">
                  <Home size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    required 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="bungalow">Bungalow (₦50,000)</option>
                    <option value="duplex">Duplex (₦100,000)</option>
                    <option value="commercial">Commercial Building (₦250,000)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Your Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="David Adeleke"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 block mb-2">
                  Preferred Inspection Date & Time
                </label>
                <ModernDatePicker 
                  selectedDate={appointmentDate} 
                  onSelect={(date) => setAppointmentDate(date)} 
                  selectedTime={appointmentTime}
                  onTimeSelect={(time) => setAppointmentTime(time)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-14 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Connecting to Flutterwave...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-amber-300 fill-amber-300" />
                    <span>Pay ₦{totalFee.toLocaleString()} with Flutterwave</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
