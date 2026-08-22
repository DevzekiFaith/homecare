"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  UserCircle, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  Camera, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Award,
  Sparkles,
  FileCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LocationMapPicker from "@/app/components/LocationMapPicker";
import IdVerificationStatus, { type VerificationStatus } from "@/app/components/IdVerificationStatus";
import Logo from "@/app/components/Logo";
import ErrorAlert from "@/app/components/ErrorAlert";
import NinVerificationCard, { type NinDetails } from "@/app/components/NinVerificationCard";
import { toast } from "sonner";
import { handleAuthError } from "@/lib/auth-errors";

const NIN_LENGTH = 11;

const SKILLS = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Furniture Maker",
  "AC & Fridge Repair",
  "Painter",
  "Tiler",
  "General Handyman",
];



export default function WorkerRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>("idle");
  const [verifyReason, setVerifyReason] = useState<string | undefined>(undefined);
  const [verifyConfidence, setVerifyConfidence] = useState<"high" | "medium" | "low" | null>(null);
  const [aiVerified, setAiVerified] = useState(false);
  const [aiVerifyReason, setAiVerifyReason] = useState<string>("");
  const [ninStatus, setNinStatus] = useState<'idle' | 'verifying' | 'verified' | 'rejected' | 'error'>("idle");
  const [ninDetails, setNinDetails] = useState<NinDetails | undefined>(undefined);
  const [ninVerifyReason, setNinVerifyReason] = useState<string | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [lockedName, setLockedName] = useState("");

  // Location cascade state
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selArea, setSelArea] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setNinError(null);
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract fields
    const email = (formData.get("email") as string)?.trim() ?? "";
    const nin = (formData.get("nin") as string)?.trim() ?? "";
    const phone = (formData.get("phone") as string)?.trim() ?? "";
    const pin = (formData.get("pin") as string)?.trim() ?? "";
    const name = lockedName || fullName || ((formData.get("fullName") as string)?.trim() ?? "");
    const primarySkill = (formData.get("primarySkill") as string)?.trim() ?? "";
    const experience = parseInt((formData.get("experience") as string) || "0", 10);
    const bio = (formData.get("bio") as string)?.trim() ?? "";
    const areas = formData.getAll("areas") as string[];

    if (nin.length !== NIN_LENGTH || !/^\d+$/.test(nin)) {
      setNinError(`NIN must be exactly ${NIN_LENGTH} digits.`);
      setSubmitting(false);
      return;
    }

    const supabase = createClient();

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: pin.length >= 6 ? pin : pin.padEnd(6, "0"),
        options: {
          data: {
            full_name: name,
            role: 'worker'
          }
        }
      });

      if (authError && !authError.message.includes("already registered")) {
        const parsed = handleAuthError(authError, "artisan registration");
        setMessage(`${parsed.title}: ${parsed.description}`);
        return;
      }

      const userId = authData?.user?.id;

      if (!userId) {
        const parsed = handleAuthError(new Error("Could not generate technician account ID. Please try another email."), "artisan registration");
        setMessage(`${parsed.title}: ${parsed.description}`);
        return;
      }

      // 2. Insert or upsert into professionals table
      const { error: dbError } = await supabase.from('professionals').upsert({
        id: userId,
        full_name: name,
        phone: phone,
        nin: nin,
        primary_skill: primarySkill,
        experience_years: experience,
        areas: areas.length > 0 ? areas : ["Enugu Urban"],
        bio: bio,
        is_verified: false,
        ai_verified: aiVerified,
        ai_verification_reason: aiVerifyReason,
      });

      if (dbError) {
        const parsed = handleAuthError(dbError, "profile creation");
        setMessage(`${parsed.title}: ${parsed.description}`);
        return;
      }

      toast.success("Profile submitted successfully! Admin review in progress.");
      setMessage(
        "Profile successfully submitted! Your registration is now live and our admin team will review and approve your technician profile."
      );
      form.reset();
      setFullName("");
      setLockedName("");
      setCertFile(null);
      setPhotoFile(null);
    } catch (err: any) {
      const parsed = handleAuthError(err, "artisan registration");
      setMessage(`${parsed.title}: ${parsed.description}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyNin = async (nin: string) => {
    if (nin.length !== NIN_LENGTH) return;
    
    setNinStatus('verifying');
    setNinError(null);
    
    try {
      const res = await fetch("/api/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nin,
          fullNameInput: fullName || undefined,
        }),
      });
      
      const data = await res.json();
      
      setNinStatus(data.status);
      setNinVerifyReason(data.reason);
      
      if (data.status === 'verified' && data.details) {
        setNinDetails(data.details);
        if (!fullName && data.details.fullName && data.details.fullName !== "Verified Technician") {
          setFullName(data.details.fullName);
        }
        toast.success("NIN Authenticated with NIMC Registry!");
      } else {
        setNinDetails(undefined);
      }
    } catch {
      setNinStatus('error');
      setNinVerifyReason("Connection to identity service failed.");
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased py-8 sm:py-16">
      <div className="relative z-30 mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row px-4 sm:px-6 lg:px-8">
        
        {/* Main Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-10"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Logo size="md" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-black text-sky-700 uppercase tracking-wider">
                <Sparkles size={13} /> Pro Onboarding
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900">
              Technician Verification Portal
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Customer safety is our absolute priority. Provide your verified identity and professional credentials to join our approved technician network.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Sec 1: Personal Info */}
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2.5">
                <UserCircle size={17} className="text-sky-600" /> 1. Personal Details
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Legal Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Full Legal Name
                    </label>
                    {ninStatus === "verified" && (
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> NIMC Linked
                      </span>
                    )}
                  </div>
                  <input
                    required
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Olawale Ibrahim"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone (WhatsApp Active)
                  </label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    placeholder="+234 812 345 6789"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 font-mono"
                  />
                </div>

                {/* PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Security PIN
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="pin"
                      minLength={6}
                      maxLength={6}
                      placeholder="e.g. 123456"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 pr-12 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Residential Address
                </label>
                <input
                  required
                  name="homeAddress"
                  placeholder="e.g. 14 Ogui Road, New Haven, Enugu"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Sec 2: Security & ID */}
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2.5">
                <ShieldCheck size={17} className="text-sky-600" /> 2. Security & Identity Verification
              </h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-6">
                {/* NIN Input & Action */}
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      NIN (National Identity Number)
                    </label>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live NIMC Verification
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Enter your 11-digit NIN. Our system performs a real-time live cross-reference with the National Identity Management Commission.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <input
                        required
                        inputMode="numeric"
                        pattern="[0-9]{11}"
                        maxLength={11}
                        name="nin"
                        id="nin-input"
                        placeholder="e.g. 12345678901"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-mono font-bold text-slate-900 tracking-wider outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-2xs placeholder:text-slate-400"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          e.target.value = val;
                          if (val.length === 11) {
                            setNinError(null);
                            handleVerifyNin(val);
                          } else if (val.length < 11 && ninStatus === "verified") {
                            setNinStatus("idle");
                            setNinDetails(undefined);
                            setLockedName("");
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('nin-input') as HTMLInputElement;
                        if (input && input.value.length === 11) {
                          handleVerifyNin(input.value);
                        } else {
                          setNinError("Please enter all 11 digits to verify.");
                        }
                      }}
                      disabled={ninStatus === 'verifying'}
                      className="h-12 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                    >
                      {ninStatus === 'verifying' ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying...</span>
                        </>
                      ) : ninStatus === 'verified' ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Verified</span>
                        </>
                      ) : (
                        <span>Verify NIN</span>
                      )}
                    </button>
                  </div>
                  {ninError && (
                    <p className="text-xs font-bold text-rose-600 mt-2">
                      {ninError}
                    </p>
                  )}
                  <NinVerificationCard 
                    status={ninStatus} 
                    details={ninDetails} 
                    reason={ninVerifyReason} 
                  />
                </div>

                {/* Upload Clear Photo / Selfie */}
                <div className="pt-2">
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                    Upload Live Photo (Selfie)
                  </label>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Clear face photo for customer job matching card and AI facial screening.
                  </p>
                  
                  <label className="group flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-100/50 hover:border-sky-500 transition-all cursor-pointer">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Camera size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {photoFile ? photoFile.name : "Capture or Upload Selfie"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {photoFile ? `${(photoFile.size / 1024).toFixed(1)} KB selected` : "Supports PNG, JPG (Max 5MB)"}
                        </p>
                      </div>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase tracking-wider shadow-2xs group-hover:bg-sky-500 transition-colors shrink-0">
                      {photoFile ? "Change Photo" : "Choose File"}
                    </span>

                    <input
                      required
                      type="file"
                      name="photo"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        setPhotoFile(file ?? null);
                        if (!file) return;
                        // Trigger AI verification
                        setVerifyStatus("checking");
                        setVerifyReason(undefined);
                        try {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const imageBase64 = ev.target?.result as string;
                            const res = await fetch("/api/verify-id", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ imageBase64, workerName: "" }),
                            });
                            const data = await res.json() as {
                              status: VerificationStatus;
                              confidence?: "high" | "medium" | "low" | null;
                              reason?: string;
                            };
                            setVerifyStatus(data.status);
                            setVerifyReason(data.reason);
                            setVerifyConfidence(data.confidence ?? null);
                            setAiVerified(data.status === "verified");
                            setAiVerifyReason(data.reason ?? "");
                          };
                          reader.readAsDataURL(file);
                        } catch {
                          setVerifyStatus("pending_manual");
                          setVerifyReason("Verification will be completed manually by our team.");
                        }
                      }}
                    />
                  </label>
                  <IdVerificationStatus status={verifyStatus} reason={verifyReason} confidence={verifyConfidence} />
                </div>
              </div>

              {/* Guarantor Details */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Guarantor Full Name
                  </label>
                  <input
                    required
                    name="guarantorName"
                    placeholder="e.g. Chief Emeka Eze"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Guarantor Phone Number
                  </label>
                  <input
                    required
                    name="guarantorPhone"
                    type="tel"
                    placeholder="+234 803 000 0000"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sec 3: Expertise */}
            <div className="space-y-5">
              <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2.5">
                <Award size={17} className="text-sky-600" /> 3. Professional Skills & Coverage
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Primary Skill */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Trade Skill
                  </label>
                  <select
                    required
                    name="primarySkill"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer"
                  >
                    <option value="">Select your main trade</option>
                    {SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Years of Active Experience
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    max={40}
                    name="experience"
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Service Location — Cascading Selector + Live Map */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-sky-600" />
                  Your Primary Service Location
                </label>
                <p className="text-[11px] text-slate-500 font-medium -mt-1">
                  Select your state, city, and area. Customers in this zone will see your profile first.
                </p>

                {/* Hidden inputs so form submission picks up location */}
                <input type="hidden" name="areas" value={selArea || selCity || selState || "Nigeria"} />

                <LocationMapPicker
                  selectedState={selState}
                  selectedCity={selCity}
                  selectedArea={selArea}
                  onStateChange={v => { setSelState(v); setSelCity(""); setSelArea(""); }}
                  onCityChange={v => { setSelCity(v); setSelArea(""); }}
                  onAreaChange={setSelArea}
                />
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Short Professional Bio
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  placeholder="Detail your past projects, specializations, and why customers should choose you."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                />
              </div>

              {/* Trade Certification Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trade Certification / Certificate (Optional)
                </label>
                <label className="flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-sky-400 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <UploadCloud size={20} className="text-sky-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {certFile ? certFile.name : "Upload Trade Certificate (PDF or Image)"}
                      </p>
                      <p className="text-[11px] text-slate-500">Max size: 5MB</p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                    {certFile ? "Change" : "Browse"}
                  </span>
                  <input
                    type="file"
                    name="certification"
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        e.target.value = "";
                        toast.error("File is too large. Max size is 5MB.");
                        return;
                      }
                      setCertFile(file ?? null);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Submission Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                By submitting your application, you agree to our technician safety and performance standards.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-w-[200px] h-13 inline-flex items-center justify-center rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Submitting Application..." : "Submit Identity & Register"}
              </button>
            </div>

            <ErrorAlert 
              error={message && message.includes("failed") ? message : null} 
              onClear={() => setMessage(null)}
              className="mt-4"
            />

            {message && !message.includes("failed") && (
              <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm font-bold leading-relaxed shadow-xs">
                {message}
              </div>
            )}
          </form>
        </motion.section>

        {/* Right Info Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-1/3 space-y-6"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Trust & Safety First</h3>
                <p className="text-xs text-slate-500 font-medium">Guaranteed Verification</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              CarePay customers pay upfront for verified, secure home services. We ensure every pro is certified and vetted against national databases.
            </p>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-black uppercase tracking-wider text-slate-900">Why Join CarePay?</p>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> Fast matching with high-paying customers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> Guaranteed direct payouts upon job completion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> Free customer dispatch telemetry
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> Protection against client defaults
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-500">Already registered as a technician?</p>
              <Link
                href="/auth/worker/login"
                className="block text-center py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-sky-700 transition-colors"
              >
                Log In to Pro Portal
              </Link>
            </div>

            <div className="pt-2 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft size={13} /> Back to Homepage
              </Link>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

