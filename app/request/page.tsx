"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { PAYMENT_ACCOUNT } from "@/lib/payment-details";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import SurgeBadge from "@/app/components/SurgeBadge";
import type { SurgeResult } from "@/lib/surge";

import { Wrench, Zap, Hammer, Armchair, Snowflake, Paintbrush, PenTool, Camera, X, Loader2, ShoppingBag, Copy, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import ErrorAlert from "@/app/components/ErrorAlert";
import ModernDatePicker from "@/app/components/ModernDatePicker";
import { PRODUCTS, Product } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { User } from "@supabase/supabase-js";

const REQUEST_HERO_IMAGE = "/su4.jpg";

const SERVICES = [
  { label: "Plumber", icon: Wrench, price: "₦15,000 Start", image: "/services/plumber.jpg" },
  { label: "Electrician", icon: Zap, price: "₦18,000 Start", image: "/services/electrician.jpg" },
  { label: "Carpenter", icon: Hammer, price: "₦20,000 Start", image: "/services/carpenter.jpg" },
  { label: "Furniture Maker", icon: Armchair, price: "₦25,000 Start", image: "/services/furniture.jpg" },
  { label: "AC & Fridge Repair", icon: Snowflake, price: "₦20,000 Start", image: "/services/ac-repair.jpg" },
  { label: "Painter", icon: Paintbrush, price: "₦22,000 Start", image: "/services/painter.jpg" },
  { label: "General Handyman", icon: PenTool, price: "₦15,000 Start", image: "/services/handyman.jpg" },
];


function RequestContent() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [surgeData, setSurgeData] = useState<(SurgeResult & { displayPrice: string }) | null>(null);
  const [surgeLoading, setSurgeLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0, email: "", phone: "", name: "", txRef: "" });
  const [paymentCompleted] = useState(false);
  
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(new Date());
  const [appointmentTime, setAppointmentTime] = useState("09:00");

  const [user, setUser] = useState<User | null>(null);
  const [selectedParts, setSelectedParts] = useState<Product[]>([]);
  const searchParams = useSearchParams();

  // Handle pre-selected part from store
  useEffect(() => {
    const partId = searchParams.get('part');
    if (partId) {
      const part = PRODUCTS.find(p => p.id === partId);
      if (part) {
        setSelectedParts(prev => prev.some(p => p.id === partId) ? prev : [...prev, part]);
        if (part.serviceLink.length > 0) {
           setSelectedService(part.serviceLink[0]);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch {
        // Supabase unavailable (e.g. paused) — proceed as guest
      }
    };
    checkUser();
  }, []);


  const [copied, setCopied] = useState(false);

  const handleServiceSelect = async (label: string) => {
    const isActive = selectedService === label;
    const next = isActive ? null : label;
    setSelectedService(next);
    setSurgeData(null);
    if (!next) return;
    setSurgeLoading(true);
    try {
      const res = await fetch(`/api/surge?service=${encodeURIComponent(next)}&city=Enugu`);
      const data = await res.json() as SurgeResult & { displayPrice: string };
      setSurgeData(data);
    } catch {
      // Surge fetch failed — non-breaking, just don't show badge
    } finally {
      setSurgeLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(false);
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const email = ((formData.get("email") as string) || "").trim();
      const phone = ((formData.get("phone") as string) || "").trim();
      const pin = ((formData.get("pin") as string) || "").trim();
      const fullName = ((formData.get("fullName") as string) || "").trim();
      const address = ((formData.get("address") as string) || "").trim();
      const serviceType = selectedService || "";
      const details = ((formData.get("details") as string) || "").trim();

      if (!serviceType) {
        toast.error("Service required", {
          description: "Please select a service above."
        });
        setErrorMsg("Please select a service above.");
        return;
      }

      const supabase = createClient();
      let currentUserId = user?.id;

      // If NOT logged in, perform "Seamless Auth" (Signup/Signin)
      if (!currentUserId) {
        if (!email || !pin) {
          toast.error("Missing information", { description: "Email and 6-digit PIN are required for bookings." });
          setErrorMsg("Email and PIN are required for new bookings.");
          return;
        }

        if (pin.length !== 6) {
          toast.error("Invalid PIN", { description: "PIN must be exactly 6 digits." });
          setErrorMsg("PIN must be exactly 6 digits.");
          return;
        }

        // Try initial signup first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: pin,
        });

        const isUserAlreadyRegistered = 
          Boolean(signUpError && (signUpError.message.toLowerCase().includes("already") || signUpError.status === 400)) ||
          Boolean(!signUpError && signUpData?.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0);

        if (isUserAlreadyRegistered) {
          // User exists, try signing in instead
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: pin,
          });

          if (signInError) {
            toast.error("Incorrect PIN", { description: "Incorrect PIN for this account. If you've forgotten it, please use the login page." });
            setErrorMsg("Incorrect PIN for this account. If you've forgotten it, please visit the login page.");
            return;
          }
          currentUserId = signInData.user?.id;
          toast.info("Welcome back!", { description: "Resuming booking with your saved details." });
        } else if (signUpError) {
          toast.error("Authentication Error", { description: signUpError.message });
          setErrorMsg(`Authentication Error: ${signUpError.message}`);
          return;
        } else {
          currentUserId = signUpData?.user?.id;
          toast.success("Account created!", { description: "We've saved your progress for next time." });
        }
      }

      if (!currentUserId) {
        toast.error("Authentication Failed", { description: "Could not authenticate your account. Please try again." });
        setErrorMsg("Failed to authenticate user.");
        return;
      }

      // ENSURE PROFILE EXISTS (This prevents the FK violation if user was created but profile was not)
      await supabase.from('profiles').upsert({
        id: currentUserId,
        full_name: fullName || user?.user_metadata?.full_name || 'Customer',
        phone: phone || user?.user_metadata?.phone || '',
        address: address || ''
      }, { onConflict: 'id' });

      let preferredTime: string | null = null;
      if (appointmentDate) {
        try {
          const [hours, minutes] = (appointmentTime || "09:00").split(':').map(Number);
          const d = new Date(appointmentDate);
          d.setHours(isNaN(hours) ? 9 : hours, isNaN(minutes) ? 0 : minutes, 0, 0);
          preferredTime = d.toISOString();
        } catch {
          preferredTime = new Date().toISOString();
        }
      }

      // Handle Image Upload First
      let imageUrl = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop() || 'jpg';
          const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('job-photos')
            .upload(fileName, imageFile, { upsert: true });

          if (uploadError) {
            console.warn("Storage upload warning:", uploadError.message);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from('job-photos')
              .getPublicUrl(fileName);
            imageUrl = publicUrlData?.publicUrl || null;
          }
        } catch (uploadErr) {
          console.warn("Storage upload error caught:", uploadErr);
        }
      }

      // Insert Request
      const { error: requestError } = await supabase.from('service_requests').insert({
        customer_id: currentUserId,
        service_type: serviceType,
        description: selectedParts.length > 0
          ? `${details}\n\n[SELECTED PARTS FROM STORE]\n${selectedParts.map(p => `- ${p.name} (₦${p.price})`).join('\n')}`
          : details,
        address: address,
        preferred_time: preferredTime,
        image_url: imageUrl
      });

      if (requestError) {
        toast.error("Submission failed", {
          description: requestError.message
        });
        setErrorMsg(`Failed to submit request: ${requestError.message}`);
        return;
      }

      toast.success("Booking confirmed!", {
        description: "A professional will be assigned to you shortly."
      });

      const calculatedAmount = selectedParts.reduce((acc, p) => acc + p.price, 0) || 2000;
      setPaymentDetails({
        amount: calculatedAmount,
        email: email || user?.email || "",
        phone: phone || user?.user_metadata?.phone || "",
        name: fullName || user?.user_metadata?.full_name || "",
        txRef: `REQ-${Date.now().toString(36).toUpperCase()}`
      });

      setSubmitted(true);
      // Don't reset form yet so the user can pay
    } catch (err: unknown) {
      console.error("Booking error:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred while submitting your booking. Please try again.";
      toast.error("Submission error", { description: msg });
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-12 pb-16 md:pb-20 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors mb-6 w-fit"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-3">
                Verified Artisan Dispatch
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                Book a <span className="text-cyan-200">Professional</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-sky-100/90 font-medium max-w-md leading-relaxed">
                Fastest matching in Nigeria. {user ? "Your details are pre-filled." : "Signup instantly during checkout."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Request Booking Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <main className="grid flex-1 gap-8 sm:gap-12 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Select Service</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {SERVICES.map((service) => {
                  const isActive = selectedService === service.label;
                  return (
                    <button
                      key={service.label}
                      type="button"
                      onClick={() => handleServiceSelect(service.label)}
                      className={`group flex flex-col items-start rounded-2xl border transition-all duration-300 overflow-hidden text-left w-full p-2.5 sm:p-3 relative ${
                        isActive
                          ? "bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-md shadow-sky-500/10 scale-[1.02]"
                          : "bg-white border-sky-100 hover:border-sky-300 hover:shadow-md shadow-xs"
                      }`}
                    >
                      {/* Top Image Preview */}
                      <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden mb-2.5 bg-slate-100 shrink-0">
                        {service.image ? (
                          <Image
                            src={service.image}
                            alt={service.label}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, 200px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-600">
                            <service.icon size={24} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                        
                        {/* Icon badge overlay */}
                        <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg backdrop-blur-md flex items-center justify-center shadow-xs ${
                          isActive ? "bg-sky-600 text-white" : "bg-white/90 text-sky-600"
                        }`}>
                          <service.icon size={14} strokeWidth={2} />
                        </div>
                      </div>

                      <h3 className={`text-xs sm:text-sm font-extrabold tracking-tight mb-1 truncate w-full ${
                        isActive ? "text-sky-700" : "text-slate-800 group-hover:text-sky-600 transition-colors"
                      }`}>
                        {service.label}
                      </h3>

                      <div className="flex items-center justify-between w-full pt-1.5 border-t border-slate-100">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-900">
                          {service.price.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-sky-600">
                          {service.price.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Surge Pricing Badge */}
              {selectedService && !surgeLoading && surgeData && (
                <SurgeBadge
                  level={surgeData.level}
                  label={surgeData.label}
                  reason={surgeData.reason}
                  multiplier={surgeData.multiplier}
                  displayPrice={surgeData.displayPrice}
                  service={selectedService}
                />
              )}
              {surgeLoading && (
                <div className="flex items-center gap-2 mt-4">
                  <Loader2 className="animate-spin text-zinc-500" size={14} />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Calculating live rate...</span>
                </div>
              )}

              {/* Recommended Parts Section */}
              {selectedService && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      1b. Recommended Parts
                    </h2>
                    <Link href="/store" className="text-[9px] font-bold uppercase tracking-widest text-brand-primary hover:underline">
                      View Full Store
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {PRODUCTS.filter(p => p.serviceLink.includes(selectedService)).map((product, idx) => {
                      const isSelected = selectedParts.find(p => p.id === product.id);
                      return (
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={idx < 2}
                          isAdded={!!isSelected}
                          onAddStep={(p) => {
                            if (isSelected) {
                              setSelectedParts(prev => prev.filter(x => x.id !== p.id));
                            } else {
                              setSelectedParts(prev => [...prev, p]);
                              toast.success("Part added to job", {
                                description: `${p.name} will be brought by the professional.`
                              });
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {selectedParts.length > 0 && (
                     <div className="mt-6 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <ShoppingBag size={14} className="text-brand-primary" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                              {selectedParts.length} item(s) to be brought for you
                           </span>
                        </div>
                        <span className="text-xs font-extrabold text-brand-primary">
                           +₦{selectedParts.reduce((acc, p) => acc + p.price, 0).toLocaleString()}
                        </span>
                     </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-10">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">
                2. Your Details
              </h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {!user && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid gap-4 sm:grid-cols-3 mb-6">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Full Name
                        </label>
                        <input
                          required
                          name="fullName"
                          placeholder="John Doe"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Email Address
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Phone Number
                        </label>
                        <input
                          required
                          type="tel"
                          name="phone"
                          placeholder="+234..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-xs"
                        />
                      </div>
                    </motion.div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Service Address
                    </label>
                    <input
                      required
                      name="address"
                      placeholder="House number, street, area"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                  {!user && (
                     <div className="space-y-2">
                       <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                         6-Digit PIN <span className="text-slate-400 font-normal lowercase">(To login later)</span>
                       </label>
                       <input
                         required
                         type="password"
                         name="pin"
                         maxLength={6}
                         minLength={6}
                         placeholder="e.g. 123456"
                         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400 shadow-xs"
                       />
                     </div>
                  )}
                </div>

                <div className="pt-8 border-t border-slate-200 space-y-8">
                  <ModernDatePicker 
                    selectedDate={appointmentDate} 
                    onSelect={(date) => setAppointmentDate(date)} 
                    selectedTime={appointmentTime}
                    onTimeSelect={(time) => setAppointmentTime(time)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Work Description
                  </label>
                  <textarea
                    required
                    name="details"
                    rows={4}
                    placeholder="Describe the issue. Detailed descriptions help us match the right pro."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Photo of Issue (Optional)
                  </label>
                  <div className="relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 transition-all hover:border-sky-400 hover:bg-sky-50/50 group shadow-xs">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Issue preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setImageFile(null); 
                            setImagePreview(null); 
                          }}
                          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-slate-800 hover:bg-red-500 hover:text-white transition-all shadow-md"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors mb-3">
                          <Camera size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-800">Tap to take a photo</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">or upload from gallery</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImageFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      name="whatsapp"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600"
                    />
                    Contact me on WhatsApp for faster updates
                  </label>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-13 w-full sm:w-auto min-w-[220px] rounded-full px-8 text-xs font-extrabold uppercase tracking-widest bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/25 disabled:opacity-50 flex items-center justify-center gap-3 transition-all hover:scale-105"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Processing...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>

                <ErrorAlert 
                  error={errorMsg} 
                  onClear={() => setErrorMsg(null)}
                  className="mt-6"
                />

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-3xl bg-white border border-sky-100 shadow-xl"
                  >
                    {paymentDetails.amount > 0 && !paymentCompleted ? (
                      <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <div>
                              <h3 className="text-xl font-heading font-extrabold text-slate-900">Complete Payment</h3>
                              <p className="text-xs text-slate-500 font-medium mt-1">Funds are protected in escrow until job completion.</p>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-sky-600">₦{paymentDetails.amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-sky-50/70 rounded-2xl p-5 border border-sky-100 space-y-3 mb-6">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-wider">Bank Name</span>
                              <span className="text-slate-900 font-bold">{PAYMENT_ACCOUNT.bankName}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-wider">Account Number</span>
                              <span className="text-slate-900 font-extrabold font-mono text-sm">{PAYMENT_ACCOUNT.accountNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-wider">Account Name</span>
                              <span className="text-slate-900 font-bold">{PAYMENT_ACCOUNT.accountName}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  toast.loading("Opening Flutterwave Escrow...", { id: "req-flw" });
                                  const controller = new AbortController();
                                  const flwTimeout = setTimeout(() => controller.abort(), 6000);

                                  const res = await fetch("/api/payment/flutterwave/initialize", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      orderRef: paymentDetails.txRef || `REQ-${Date.now().toString(36).toUpperCase()}`,
                                      amount: paymentDetails.amount,
                                      email: paymentDetails.email || "customer@homecare.com.ng",
                                      name: paymentDetails.name || "HomeCare Customer",
                                      phone: paymentDetails.phone || "08000000000",
                                      title: "HomeCare Artisan Escrow Deposit",
                                      description: `Escrow payment for ${selectedService || "Service Booking"}`,
                                      type: "service_request",
                                      userId: user?.id || null,
                                    }),
                                    signal: controller.signal,
                                  });
                                  clearTimeout(flwTimeout);
                                  const data = await res.json();
                                  if (data.success && data.paymentUrl) {
                                    window.location.href = data.paymentUrl;
                                  } else {
                                    toast.info("Online gateway busy. Please complete payment using the verified bank transfer details shown above.", { id: "req-flw" });
                                  }
                                } catch (err: unknown) {
                                  toast.info("Connection timed out. Please pay via direct bank transfer to the account above.", { id: "req-flw" });
                                }
                              }}
                              className="h-13 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 transition-all hover:scale-102 cursor-pointer"
                            >
                              <Zap size={16} className="text-amber-300 fill-amber-300" />
                              <span>Pay ₦{paymentDetails.amount.toLocaleString()} with Flutterwave</span>
                            </button>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(PAYMENT_ACCOUNT.accountNumber);
                                  setCopied(true);
                                  toast.success("Account number copied!");
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="h-11 rounded-full px-6 bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-2xs hover:border-sky-400 hover:text-sky-600 transition-all flex-1"
                              >
                                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                <span>{copied ? "Copied!" : "Manual Transfer (Globus)"}</span>
                              </button>
                              <Link
                                href="/customer/dashboard"
                                className="h-11 rounded-full px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-extrabold uppercase tracking-wider transition-all"
                              >
                                Dashboard
                              </Link>
                            </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">Booking Confirmed!</h3>
                        <p className="mt-2 text-sm text-slate-500 font-medium">Your request has been successfully recorded and is being processed.</p>
                        
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                          <Link
                            href="/customer/dashboard"
                            className="h-12 rounded-full px-8 bg-sky-600 text-white flex items-center justify-center text-xs font-extrabold uppercase tracking-wider shadow-md shadow-sky-600/25 hover:bg-sky-700 w-full sm:w-auto"
                          >
                            Track Status
                          </Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </form>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-white border-4 border-white shadow-xl shadow-sky-950/5">
              <Image
                src={REQUEST_HERO_IMAGE}
                alt="Expert Professional"
                fill
                priority
                className="object-cover object-top scale-[1.02] transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-sm border border-sky-100 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">Verified Pros on Duty</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">100% Guaranteed</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-sm">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-sky-600 mb-6">
                How It Works
              </h2>
              <ol className="space-y-6">
                <li className="flex gap-4 group">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 font-extrabold text-xs group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Submit Details</p>
                    <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Provide task specifics, upload any photos, and select your preferred date & time.</p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 font-extrabold text-xs group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Match & Confirm</p>
                    <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">We algorithmically assign a vetted pro and confirm transparent pricing directly.</p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 font-extrabold text-xs group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-xs">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Execution & Review</p>
                    <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">Fast, reliable resolution with escrow protection and 30-day service guarantee.</p>
                  </div>
                </li>
              </ol>
            </div>
          </motion.aside>
        </main>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32} /></div>}>
      <RequestContent />
    </Suspense>
  );
}
