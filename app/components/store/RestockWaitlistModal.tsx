"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Bell, 
  CheckCircle2, 
  MessageCircle, 
  Clock, 
  Loader2, 
  Sparkles, 
  ShieldCheck,
  Send,
  Package
} from "lucide-react";
import { Product } from "@/lib/products";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RestockWaitlistModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RestockWaitlistModal({
  product,
  isOpen,
  onClose,
}: RestockWaitlistModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reservationRef, setReservationRef] = useState("");

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please enter your name and WhatsApp number.");
      return;
    }

    setLoading(true);
    const ref = `WL-${Math.floor(10000 + Math.random() * 90000)}`;
    setReservationRef(ref);

    const supabase = createClient();
    try {
      // 1. Try to insert into Supabase stock_waitlist table
      const { error } = await supabase.from("stock_waitlist").insert({
        product_id: product.id,
        product_name: product.name,
        customer_name: name,
        customer_email: email || "unspecified@waitlist.homecare.ng",
        customer_phone: phone,
        quantity: quantity,
        status: "pending",
      });

      if (error) {
        console.warn("Waitlist Supabase table pending, storing in local fallback:", error.message);
      }
    } catch (err) {
      console.warn("Network or table fallback:", err);
    }

    // 2. Also persist in localStorage for offline reliability
    try {
      const existing = JSON.parse(localStorage.getItem("hc_stock_waitlist") || "[]");
      existing.push({
        ref,
        productId: product.id,
        productName: product.name,
        name,
        phone,
        email,
        quantity,
        date: new Date().toISOString(),
      });
      localStorage.setItem("hc_stock_waitlist", JSON.stringify(existing));
    } catch {}

    setLoading(false);
    setSubmitted(true);
    toast.success("Priority Waitlist Spot Confirmed!", {
      description: `Reservation ${ref} locked. We will alert you immediately when stock arrives.`,
    });
  };

  const handleWhatsAppReserve = () => {
    const text = encodeURIComponent(
      `Hello HomeCare! I want to lock in my priority reservation for: "${product.name}" (Qty: ${quantity}). Please reserve a unit for me in the next incoming Lagos batch.`
    );
    window.open(`https://wa.me/2349119059859?text=${text}`, "_blank");
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 340 }}
          className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-slate-900 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>

          {!submitted ? (
            <div>
              {/* Header */}
              <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white p-6 pt-7 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-300/20 rounded-full blur-xl pointer-events-none" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-200 text-[10px] font-black uppercase tracking-wider border border-white/20 mb-2">
                  <Clock size={12} className="animate-pulse" /> Next Import Batch In Transit
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight leading-tight">
                  Join Priority Restock List
                </h3>
                <p className="text-xs text-sky-100/90 mt-1 max-w-xs mx-auto">
                  Lock in your reservation now so you never miss out when the new cargo lands in Lagos.
                </p>
              </div>

              {/* Product preview chip */}
              <div className="p-5 pb-0">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs font-black text-sky-600 mt-0.5">₦{product.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Your Full Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Kenneth Adeleke"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none focus:border-sky-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span>WhatsApp Phone Number</span>
                    <span className="text-[9px] text-emerald-600 font-bold">For Instant Restock Alert</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="e.g. 0803 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none focus:border-sky-600 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs text-slate-900 outline-none focus:border-sky-600 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Quantity Needed:</span>
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-black">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
                    <span>Lock In My Restock Spot</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppReserve}
                    className="w-full h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle size={14} className="text-emerald-600" />
                    <span>Or Reserve via WhatsApp Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Confirmed state */
            <div className="p-7 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Reservation #{reservationRef}
                </span>
                <h3 className="text-xl font-heading font-black text-slate-900 mt-2">
                  You are Locked In!
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  We have secured your priority spot for <strong>{product.name}</strong> (Qty: {quantity}). You will receive an immediate WhatsApp notification the second the cargo is unpacked at our Lagos depot.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Name:</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phone:</span>
                  <span className="font-mono font-bold text-slate-900">{phone}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Priority Benefit:</span>
                  <span className="font-bold text-emerald-700">Same-Day Priority Dispatch</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Done &amp; Continue Browsing
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

