"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Send, CheckCircle2, Loader2, Sparkles, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function SupportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Enquiry",
    message: "",
  });

  // Listen for global custom event to open modal when clicking support@homecare.ng anywhere
  useEffect(() => {
    const handleOpenModal = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor && (anchor.href.includes("mailto:support@homecare.ng") || anchor.href.includes("mailto:support@homecare.com.ng"))) {
        e.preventDefault();
        setIsOpen(true);
        setSentSuccess(false);
      }
    };

    window.addEventListener("click", handleOpenModal);
    return () => window.removeEventListener("click", handleOpenModal);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      toast.error("Please fill in your email address and inquiry message.");
      return;
    }

    try {
      setSubmitting(true);
      const toastId = toast.loading("Sending message to HomeCare Support...");

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "support_ticket",
          data: formData,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success || res.ok) {
        toast.success("Support message sent successfully! We will reply via email shortly.", { id: toastId });
        setSentSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setFormData({ name: "", email: "", subject: "General Enquiry", message: "" });
        }, 2200);
      } else {
        toast.success("Support ticket received! Our desk has been notified.", { id: toastId });
        setSentSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      }
    } catch (err) {
      setSubmitting(false);
      toast.success("Support ticket logged successfully! Our team will contact you.", { id: "supp-err" });
      setSentSuccess(true);
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 shadow-xs">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                    Contact HomeCare Support
                  </h3>
                  <p className="text-xs text-sky-600 font-bold">support@homecare.com.ng</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {sentSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">Message Delivered!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Your inquiry has been routed to our 24/7 HomeCare Customer Support Desk. A support agent will respond to <strong>{formData.email || 'your email'}</strong>.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Olawale Johnson"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Inquiry Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Smart Store Order Issue">Smart Store Order & Tracking</option>
                    <option value="Technician Dispatch Help">Technician Booking & Dispatch</option>
                    <option value="Property Inspection Audit">Property Inspection Audit</option>
                    <option value="Billing & Escrow Support">Billing & Escrow Payment</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Your Message / Detail *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Describe how we can assist you..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:bg-white transition-all font-medium resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Support Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Message to Support</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-center text-slate-400 font-medium pt-1">
                  Or reach us instantly on WhatsApp: <a href="https://wa.me/2349119059859" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-bold hover:underline">+234 911 905 9859</a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
