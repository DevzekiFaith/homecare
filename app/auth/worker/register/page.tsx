"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  UserCircle, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ArrowLeft, 
  MapPin, 
  Award, 
  Sparkles, 
  FileCheck,
  CreditCard,
  Building2,
  Lock,
  Copy,
  ExternalLink,
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import LocationMapPicker from "@/app/components/LocationMapPicker";
import IdVerificationStatus, { type VerificationStatus } from "@/app/components/IdVerificationStatus";
import Logo from "@/app/components/Logo";
import ErrorAlert from "@/app/components/ErrorAlert";
import NinVerificationCard, { type NinDetails } from "@/app/components/NinVerificationCard";
import { toast } from "sonner";
import { handleAuthError } from "@/lib/auth-errors";
import { PAYMENT_ACCOUNT } from "@/lib/payment-details";

const NIN_LENGTH = 11;
const ACCREDITATION_FEE = 3500;

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

function WorkerRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ninError, setNinError] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>("idle");
  const [verifyReason, setVerifyReason] = useState<string | undefined>(undefined);
  const [verifyConfidence, setVerifyConfidence] = useState<"high" | "medium" | "low" | null>(null);
  const [aiVerified, setAiVerified] = useState(false);
  const [aiVerifyReason, setAiVerifyReason] = useState<string>("");
  const [ninStatus, setNinStatus] = useState<'idle' | 'verifying' | 'verified' | 'rejected' | 'error'>("idle");
  const [ninDetails, setNinDetails] = useState<NinDetails | undefined>(undefined);
  const [ninVerifyReason, setNinVerifyReason] = useState<string | undefined>(undefined);
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [nin, setNin] = useState("");
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [primarySkill, setPrimarySkill] = useState("");
  const [experience, setExperience] = useState("3");
  const [bio, setBio] = useState("");

  // Payment & Accreditation state
  const [selectedTier, setSelectedTier] = useState<'starter' | 'elite'>('starter');
  const [accreditationPaid, setAccreditationPaid] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [isInitializingFlw, setIsInitializingFlw] = useState(false);
  const [showManualTransfer, setShowManualTransfer] = useState(false);
  const [manualTransferRef, setManualTransferRef] = useState("");

  // Location cascade state
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selArea, setSelArea] = useState("");

  const currentFee = selectedTier === 'starter' ? 1500 : 3500;

  // Refs for smooth scroll targetting
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Check URL query parameters for Flutterwave verified callback
  useEffect(() => {
    const paidParam = searchParams.get("paid");
    const refParam = searchParams.get("ref");
    const amountParam = searchParams.get("amount");
    if (paidParam === "true" && refParam) {
      setAccreditationPaid(true);
      setPaymentRef(refParam);
      if (amountParam && Number(amountParam) >= 3000) {
        setSelectedTier('elite');
      }
      toast.success("Accreditation Payment Confirmed!", {
        description: `Flutterwave Ref: ${refParam}. Please proceed with legal name and identity verification.`,
      });
    }

    // Load any saved draft from sessionStorage
    try {
      const saved = sessionStorage.getItem("homecare_pro_reg_draft");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.fullName) setFullName(d.fullName);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.homeAddress) setHomeAddress(d.homeAddress);
        if (d.primarySkill) setPrimarySkill(d.primarySkill);
        if (d.experience) setExperience(d.experience);
        if (d.bio) setBio(d.bio);
        if (d.selState) setSelState(d.selState);
        if (d.selCity) setSelCity(d.selCity);
        if (d.selArea) setSelArea(d.selArea);
        if (d.nin) setNin(d.nin);
        if (d.selectedTier) setSelectedTier(d.selectedTier);
        if (d.manualTransferRef) setManualTransferRef(d.manualTransferRef);
        if (d.accreditationPaid) setAccreditationPaid(true);
      }
    } catch {
      // Ignore parse errors
    }
  }, [searchParams]);

  // Save draft before leaving
  const saveDraft = () => {
    try {
      sessionStorage.setItem("homecare_pro_reg_draft", JSON.stringify({
        fullName,
        email,
        phone,
        homeAddress,
        primarySkill,
        experience,
        bio,
        selState,
        selCity,
        selArea,
        nin,
        selectedTier,
        manualTransferRef,
        accreditationPaid
      }));
    } catch {
      // Ignore
    }
  };

  // Status checks for progressive unlock
  const isPaymentValid = accreditationPaid || manualTransferRef.trim().length >= 4;
  const isPersonalValid = fullName.trim().length >= 3 && email.trim().length >= 5 && phone.trim().length >= 10 && pin.length === 6 && homeAddress.trim().length >= 5;
  const isNinValid = ninStatus === "verified";
  const isPhotoValid = Boolean(photoFile);
  const isTradeValid = Boolean(primarySkill);
  const isAllComplete = isPaymentValid && isPersonalValid && isNinValid && isPhotoValid && isTradeValid;

  // Primary Payment Route: Flutterwave Gateway (No. 1 Priority)
  const handleFlutterwavePayment = async () => {
    if (!email) {
      toast.error("Email Required First", {
        description: "Please enter your email address in Step 2 so we can link your payment receipt.",
      });
      const emailInput = document.getElementById("pro-email-input");
      if (emailInput) {
        emailInput.focus();
        emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      setIsInitializingFlw(true);
      saveDraft();
      toast.loading("Connecting to Flutterwave Gateway...", { id: "flw-pro-acc" });

      const txRef = `PRO-ACC-${Date.now().toString(36).toUpperCase()}`;

      const res = await fetch("/api/payment/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: txRef,
          amount: currentFee,
          email: email.trim(),
          name: fullName.trim() || "HomeCare Professional",
          phone: phone.trim() || "08000000000",
          title: selectedTier === 'starter' ? "Starter Pro Accreditation" : "Elite Pro Accelerator",
          description: selectedTier === 'starter' 
            ? "₦1,500 NIMC Verification + Pro Handbook (PDF)" 
            : "₦3,500 Elite Accreditation + Top inDrive Placement",
          type: "pro_accreditation",
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        toast.success("Redirecting to Flutterwave...", { id: "flw-pro-acc" });
        window.location.href = data.paymentUrl;
      } else {
        toast.info(data.error || "Gateway connection busy. You can use direct bank transfer below.", { id: "flw-pro-acc" });
        setShowManualTransfer(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gateway connection timed out. Please try again or use direct bank transfer.", { id: "flw-pro-acc" });
      setShowManualTransfer(true);
    } finally {
      setIsInitializingFlw(false);
    }
  };

  // NIN NIMC Verification with Mandatory Name Enforcement & Payment Check
  const handleVerifyNin = async (inputNin: string) => {
    const cleanNin = inputNin.replace(/\D/g, "");
    
    // 1. Validate payment first
    if (!isPaymentValid) {
      toast.error("Accreditation Fee Required", {
        description: "Please pay or confirm your ₦3,500 accreditation fee in Step 1 first before verifying with NIMC.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Validate Full Legal Name
    if (!fullName || fullName.trim().length < 3) {
      toast.error("NIMC Legal Name Required", {
        description: "Please enter your Full Legal Name in Step 2 first as registered with NIMC before verifying your NIN.",
      });
      setNinError("Please enter your Full Legal Name in Step 2 first before verifying your NIN.");
      const nameInput = document.getElementById("pro-full-name-input");
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (cleanNin.length !== NIN_LENGTH) {
      setNinError(`NIN must be exactly ${NIN_LENGTH} digits.`);
      return;
    }
    
    setNinStatus("verifying");
    setNinError(null);
    
    try {
      const res = await fetch("/api/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nin: cleanNin,
          fullNameInput: fullName.trim(),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok || data.status === "error") {
        setNinStatus("error");
        setNinVerifyReason(data.reason || "NIN verification error.");
        setNinError(data.reason || "Verification error.");
        toast.error("NIN Verification Failed", { description: data.reason });
        return;
      }

      setNinStatus(data.status);
      setNinVerifyReason(data.reason);
      
      if (data.status === "verified" && data.details) {
        setNinDetails(data.details);
        toast.success("NIN Authenticated with NIMC Registry!", {
          description: `Identity confirmed for ${data.details.fullName || fullName}. Photo screening is now unlocked.`,
        });
      } else {
        setNinDetails(undefined);
        if (data.reason) {
          setNinError(data.reason);
          toast.error("NIN Mismatch", { description: data.reason });
        }
      }
    } catch {
      setNinStatus("error");
      setNinVerifyReason("Connection to identity service failed.");
      setNinError("Connection to identity service failed.");
    }
  };

  // Guard for Selfie Photo File Upload: Only allows opening if top details + NIN verified
  const handlePhotoClick = (e: React.MouseEvent) => {
    if (!isPaymentValid) {
      e.preventDefault();
      toast.error("Step 1 Incomplete", {
        description: "Please pay or confirm the ₦3,500 accreditation fee before uploading your face photo.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!fullName || fullName.trim().length < 3) {
      e.preventDefault();
      toast.error("Step 2 Incomplete", {
        description: "Please enter your Full Legal Name in Step 2 before uploading your photo.",
      });
      const nameInput = document.getElementById("pro-full-name-input");
      if (nameInput) {
        nameInput.focus();
        nameInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (ninStatus !== "verified") {
      e.preventDefault();
      toast.error("NIN Authentication Required", {
        description: "Please enter your 11-digit NIN and verify with NIMC before uploading your live selfie.",
      });
      const ninInput = document.getElementById("nin-input");
      if (ninInput) {
        ninInput.focus();
        ninInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
  };

  // Guard for Certificate upload
  const handleCertClick = (e: React.MouseEvent) => {
    if (!primarySkill) {
      e.preventDefault();
      toast.error("Select Trade First", {
        description: "Please select your primary trade skill before attaching a trade certificate.",
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setNinError(null);

    // Strict Gate 1: Flutterwave / Accreditation Payment
    if (!isPaymentValid) {
      toast.error("₦3,500 Accreditation Payment Required", {
        description: "Flutterwave accreditation payment must be completed before your profile can be submitted.",
      });
      setErrorMessage("Accreditation fee of ₦3,500 is required to authenticate your profile against national databases.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Strict Gate 2: Personal Legal Information
    if (!fullName || fullName.trim().length < 3) {
      toast.error("Missing Full Name", { description: "Please enter your full legal name as on your ID." });
      setErrorMessage("Please enter your full legal name.");
      const nameInput = document.getElementById("pro-full-name-input");
      if (nameInput) nameInput.focus();
      return;
    }

    if (!email) {
      toast.error("Missing Email Address", { description: "Please enter your email address." });
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!phone) {
      toast.error("Missing Phone Number", { description: "Please enter your WhatsApp phone number." });
      setErrorMessage("Please enter your phone number.");
      return;
    }

    if (!pin || pin.length !== 6) {
      toast.error("Invalid Security PIN", { description: "Please enter a 6-digit security PIN." });
      setErrorMessage("Please enter a 6-digit security PIN.");
      return;
    }

    // Strict Gate 3: NIN NIMC Verification
    const cleanNin = nin.replace(/\D/g, "");
    if (cleanNin.length !== NIN_LENGTH) {
      toast.error("Invalid NIN", { description: `NIN must be exactly ${NIN_LENGTH} digits.` });
      setNinError(`NIN must be exactly ${NIN_LENGTH} digits.`);
      return;
    }

    if (ninStatus !== "verified") {
      toast.error("NIN Verification Required", {
        description: "Please click 'Verify NIN' to authenticate your identity with NIMC before submitting.",
      });
      setErrorMessage("Please authenticate your 11-digit NIN with the National Identity Registry.");
      return;
    }

    // Strict Gate 4: Live Photo
    if (!photoFile) {
      toast.error("Live Selfie Photo Required", { description: "Please upload or capture a live selfie photo for AI facial screening." });
      setErrorMessage("Please upload your live selfie photo to complete biometric screening.");
      return;
    }

    // Strict Gate 5: Trade Skill
    if (!primarySkill) {
      toast.error("Select Trade Skill", { description: "Please select your primary trade skill." });
      setErrorMessage("Please select your primary trade skill.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      // 1. Sign up auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: pin.length >= 6 ? pin : pin.padEnd(6, "0"),
        options: {
          data: {
            full_name: fullName.trim(),
            role: "worker"
          }
        }
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") || authError.status === 422) {
          setErrorMessage("An account with this email address is already registered. Please log in to your Pro Portal or use another email.");
          toast.error("Email Already Registered", {
            description: "An account with this email already exists. Please log in to your Pro Portal."
          });
        } else {
          const parsed = handleAuthError(authError, "professional registration");
          toast.error(parsed.title, { description: parsed.description });
          setErrorMessage(`${parsed.title}: ${parsed.description}`);
        }
        setSubmitting(false);
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setErrorMessage("Could not generate professional account ID. Please try another email.");
        setSubmitting(false);
        return;
      }

      // Upload selfie photo
      let avatarUrl: string | null = null;
      if (photoFile) {
        try {
          const fileExt = photoFile.name.split(".").pop() || "jpg";
          const fileName = `avatars/${userId}.${fileExt}`;
          
          const { error: uploadErr } = await supabase.storage
            .from("job-photos")
            .upload(fileName, photoFile, { upsert: true });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("job-photos")
              .getPublicUrl(fileName);
            avatarUrl = publicUrlData?.publicUrl || null;
          }
        } catch (uploadErr) {
          console.warn("Selfie upload warning:", uploadErr);
        }
      }

      const activeArea = selArea || selCity || selState || "Nigeria";

      // 2. Insert into professionals table
      const { error: dbError } = await supabase.from("professionals").upsert({
        id: userId,
        full_name: fullName.trim(),
        phone: phone.trim(),
        nin: cleanNin,
        primary_skill: primarySkill,
        experience_years: parseInt(experience || "0", 10),
        areas: [activeArea],
        bio: bio.trim(),
        is_verified: true,
        ai_verified: aiVerified || true,
        ai_verification_reason: aiVerifyReason || `NIMC Authenticated with ${selectedTier === 'starter' ? '₦1,500 Starter' : '₦3,500 Elite'} Accreditation`,
        avatar_url: avatarUrl,
        tier: selectedTier,
        is_elite: selectedTier === 'elite',
      });

      if (dbError) {
        console.error("Pro DB Insert Error:", dbError);
      }

      // Clear draft
      try {
        sessionStorage.removeItem("homecare_pro_reg_draft");
      } catch {
        // Ignore
      }

      toast.success("Accreditation & Registration Complete!", {
        description: "Welcome to HomeCare Pro Network. Redirecting to your dashboard...",
      });
      setSuccessMessage("Your professional credentials and payment have been authenticated. Redirecting to your Pro Portal...");

      setTimeout(() => {
        router.push("/worker/dashboard");
      }, 1500);

    } catch (err: unknown) {
      const parsed = handleAuthError(err, "professional registration");
      setErrorMessage(`${parsed.title}: ${parsed.description}`);
    } finally {
      setSubmitting(false);
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
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-900 uppercase">
              Professional Verification &amp; Accreditation Portal
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Complete each required stage sequentially. All steps connect and authenticate together for guaranteed platform accreditation.
            </p>

            {/* Modern Progressive Flow Audit Tracker */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold uppercase tracking-wider">
              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${isPaymentValid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-white text-slate-500 border border-slate-200"}`}>
                {isPaymentValid ? <Check size={13} className="text-emerald-600 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px]">1</span>}
                <span className="truncate">₦3.5k Fee {isPaymentValid ? "Paid" : "Pending"}</span>
              </div>
              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${isPersonalValid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-white text-slate-500 border border-slate-200"}`}>
                {isPersonalValid ? <Check size={13} className="text-emerald-600 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px]">2</span>}
                <span className="truncate">Legal Name</span>
              </div>
              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${isNinValid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-white text-slate-500 border border-slate-200"}`}>
                {isNinValid ? <Check size={13} className="text-emerald-600 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px]">3</span>}
                <span className="truncate">NIMC Checked</span>
              </div>
              <div className={`p-2 rounded-xl flex items-center gap-1.5 ${isPhotoValid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-white text-slate-500 border border-slate-200"}`}>
                {isPhotoValid ? <Check size={13} className="text-emerald-600 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[8px]">4</span>}
                <span className="truncate">Selfie Photo</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-10">

            {/* STEP 1: Professional Accreditation Package (BEFORE Security & ID) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                  <Award size={17} className="text-sky-600" /> 1. Select Accreditation &amp; Growth Package
                </h2>
                {isPaymentValid && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Gate 1 Verified
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Dual Tier Selector Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tier 1: Starter Pro */}
                  <div
                    onClick={() => !accreditationPaid && setSelectedTier('starter')}
                    className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                      accreditationPaid && selectedTier !== 'starter'
                        ? "opacity-50 cursor-not-allowed border-slate-200 bg-white"
                        : selectedTier === 'starter'
                        ? "border-sky-600 bg-sky-50/70 shadow-md ring-2 ring-sky-500/20 cursor-pointer"
                        : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                          Starter Pro
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTier === 'starter' ? "border-sky-600 bg-sky-600 text-white" : "border-slate-300"
                        }`}>
                          {selectedTier === 'starter' && <Check size={12} />}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        ₦1,500 <span className="text-xs font-bold text-slate-500 lowercase">one-time</span>
                      </h3>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                        Low-friction verified onboarding with official training handbook.
                      </p>

                      <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>Live NIMC NIN &amp; Biometric Vetting</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span><strong>Pro Master Handbook (PDF Guide)</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          <span>100% Guaranteed Escrow Payouts</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-400">
                          <span className="w-3.5 h-0.5 bg-slate-300 rounded-full shrink-0" />
                          <span>Standard Radar Proximity Listing</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-bold text-sky-700">
                      Ideal for new professionals starting out
                    </div>
                  </div>

                  {/* Tier 2: Elite Accelerator */}
                  <div
                    onClick={() => !accreditationPaid && setSelectedTier('elite')}
                    className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                      accreditationPaid && selectedTier !== 'elite'
                        ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-900 text-white"
                        : selectedTier === 'elite'
                        ? "border-amber-400 bg-slate-900 text-white shadow-xl ring-2 ring-amber-400/30 cursor-pointer"
                        : "border-slate-800 bg-slate-900 text-white hover:border-slate-700 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={11} /> ★ Recommended · 3x Bookings
                        </span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTier === 'elite' ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-600"
                        }`}>
                          {selectedTier === 'elite' && <Check size={12} />}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-white tracking-tight">
                        ₦3,500 <span className="text-xs font-bold text-slate-400 lowercase">one-time</span>
                      </h3>
                      <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed">
                        Top candidate inDrive placement, priority radar alerts, &amp; 0% instant payout fees.
                      </p>

                      <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-200">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                          <span><strong>Top 1–3 inDrive Candidate Placement (+30 pts)</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                          <span><strong>60s Priority Lead Time on New Job Alerts</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                          <span>Gold Elite Pro Badge on Profile</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                          <span>0% Free Instant NIBSS Bank Payouts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                          <span>Includes Pro Master Handbook (PDF)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-bold text-amber-300">
                      Best choice for high-earning tradespeople
                    </div>
                  </div>
                </div>

                {/* Payment Checkout Box */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md space-y-4">
                  {accreditationPaid ? (
                    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-black uppercase text-emerald-200">
                            {selectedTier === 'starter' ? "Starter Pro (₦1,500)" : "Elite Pro (₦3,500)"} Payment Confirmed
                          </p>
                          <p className="text-[11px] text-emerald-300/80 font-mono">Ref: {paymentRef || "FLW-VERIFIED"}</p>
                        </div>
                      </div>
                      <Link
                        href="/worker/handbook"
                        target="_blank"
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <BookOpen size={13} /> Handbook
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Primary Flutterwave Button */}
                      <button
                        type="button"
                        onClick={handleFlutterwavePayment}
                        disabled={isInitializingFlw}
                        className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-101 cursor-pointer disabled:opacity-50 ${
                          selectedTier === 'elite'
                            ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25"
                            : "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/25"
                        }`}
                      >
                        {isInitializingFlw ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                            <span>Connecting Flutterwave Gateway...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={17} />
                            <span>
                              Pay ₦{currentFee.toLocaleString()} with Flutterwave ({selectedTier === 'starter' ? 'Starter' : 'Elite'})
                            </span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1"><Lock size={12} className="text-emerald-400" /> Instant automated confirmation</span>
                        <button
                          type="button"
                          onClick={() => setShowManualTransfer(!showManualTransfer)}
                          className="text-sky-300 hover:underline font-bold cursor-pointer"
                        >
                          {showManualTransfer ? "Hide Bank Transfer Details" : "Alternative: Globus Bank Deposit →"}
                        </button>
                      </div>

                      {/* Secondary Alternative: Globus Bank Deposit */}
                      {showManualTransfer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs pt-3"
                        >
                          <div className="flex justify-between items-center text-slate-300 border-b border-white/10 pb-2">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                              Alternative Bank Transfer (Backup)
                            </span>
                            <span className="text-[10px] text-slate-300 font-bold uppercase">{PAYMENT_ACCOUNT.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Account Number:</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(PAYMENT_ACCOUNT.accountNumber);
                                toast.success(`Account Number Copied: ${PAYMENT_ACCOUNT.accountNumber}`);
                              }}
                              className="font-mono font-black text-white hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>{PAYMENT_ACCOUNT.accountNumber}</span>
                              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-sky-300">Copy</span>
                            </button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Account Name:</span>
                            <span className="font-bold text-white text-[11px]">{PAYMENT_ACCOUNT.accountName}</span>
                          </div>
                          <div className="pt-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                              Transfer Reference / Sender Name:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Olawale Ibrahim / 1000501179 Ref"
                              value={manualTransferRef}
                              onChange={(e) => setManualTransferRef(e.target.value)}
                              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 outline-none focus:border-sky-400"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Personal Details & NIMC Registered Full Legal Name */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                  <UserCircle size={17} className="text-sky-600" /> 2. Personal Details
                </h2>
                {isPersonalValid && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Gate 2 Filled
                  </span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Legal Name (Must be entered first before NIN verification) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Full Legal Name (As Registered on NIN) <span className="text-rose-500">*</span>
                    </label>
                    {ninStatus === "verified" && (
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" /> NIMC Linked
                      </span>
                    )}
                  </div>
                  <input
                    id="pro-full-name-input"
                    required
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Olawale Babatunde Ibrahim"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Enter your exact legal name registered with NIMC. This name is required to authenticate your 11-digit NIN.
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="pro-email-input"
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-2xs"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      WhatsApp Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Active WhatsApp</span>
                  </div>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08123456789 or +234..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 font-mono shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Must be your active WhatsApp number so clients can message you immediately upon booking.
                  </p>
                </div>

                {/* 6-Digit PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Security PIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="pin"
                      minLength={6}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 pr-12 placeholder:text-slate-400 shadow-2xs"
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

                {/* Residential Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Verified Residential Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    name="homeAddress"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="e.g. 14 Ogui Road, New Haven, Enugu"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: Security & Identity Verification (NIN & Live NIMC Validation) */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                  <ShieldCheck size={17} className="text-sky-600" /> 3. Security &amp; Identity Verification
                </h2>
                {isNinValid && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Gate 3 NIMC Confirmed
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-6">
                {/* NIN Input with Pre-Name Check */}
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      National Identity Number (NIN) <span className="text-rose-500">*</span>
                    </label>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live NIMC Verification
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Enter your 11-digit NIN. The system cross-references your entered legal name with NIMC database records.
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
                        value={nin}
                        placeholder="e.g. 12345678901"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-mono font-bold text-slate-900 tracking-wider outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 shadow-2xs placeholder:text-slate-400"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setNin(val);
                          if (val.length === 11) {
                            setNinError(null);
                            handleVerifyNin(val);
                          } else if (val.length < 11 && ninStatus === "verified") {
                            setNinStatus("idle");
                            setNinDetails(undefined);
                          }
                        }}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleVerifyNin(nin)}
                      disabled={ninStatus === "verifying"}
                      className="h-12 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0 flex items-center justify-center gap-2"
                    >
                      {ninStatus === "verifying" ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying...</span>
                        </>
                      ) : ninStatus === "verified" ? (
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
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 mt-3">
                      <AlertCircle size={15} className="shrink-0 text-rose-600" />
                      <span>{ninError}</span>
                    </div>
                  )}

                  <NinVerificationCard 
                    status={ninStatus} 
                    details={ninDetails} 
                    reason={ninVerifyReason} 
                  />
                </div>

                {/* Upload Clear Photo / Live Selfie (LOCKED until Name + NIN verified) */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                      Upload Live Photo (Selfie) <span className="text-rose-500">*</span>
                    </label>
                    {isNinValid ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Check size={11} /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Lock size={11} /> Locked (Verify NIN First)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    Clear face photo for customer dispatch match and AI biometric screening. File upload unlocks automatically once your NIN is authenticated.
                  </p>
                  
                  <div className="space-y-3">
                    <div 
                      onClick={handlePhotoClick}
                      className={`relative rounded-2xl border-2 transition-all p-4 ${
                        !isNinValid
                          ? "border-slate-200 bg-slate-100/80 opacity-75 cursor-not-allowed"
                          : photoFile
                          ? "border-emerald-400 bg-emerald-50/40"
                          : "border-dashed border-slate-300 bg-white hover:border-sky-500 cursor-pointer"
                      }`}
                    >
                      <input
                        ref={photoInputRef}
                        type="file"
                        name="photo"
                        accept="image/*"
                        disabled={!isNinValid}
                        className={`w-full text-xs text-slate-600 font-medium file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider ${
                          !isNinValid 
                            ? "file:bg-slate-300 file:text-slate-500 cursor-not-allowed pointer-events-none" 
                            : "file:bg-sky-600 file:text-white hover:file:bg-sky-500 file:cursor-pointer cursor-pointer"
                        }`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          setPhotoFile(file ?? null);
                          if (!file) {
                            setPhotoPreview(null);
                            return;
                          }
                          setPhotoPreview(URL.createObjectURL(file));
                          setVerifyStatus("checking");
                          setVerifyReason(undefined);
                          try {
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              try {
                                const imageBase64 = ev.target?.result as string;
                                const res = await fetch("/api/verify-id", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ imageBase64, workerName: fullName || "" }),
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
                              } catch (err) {
                                console.error("AI verification error:", err);
                                setVerifyStatus("pending_manual");
                                setVerifyReason("Verification will be completed manually by our team.");
                              }
                            };
                            reader.readAsDataURL(file);
                          } catch {
                            setVerifyStatus("pending_manual");
                            setVerifyReason("Verification will be completed manually by our team.");
                          }
                        }}
                      />

                      {!isNinValid && (
                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                          <Lock size={14} className="text-slate-600" />
                          <span>Complete Step 1 (₦3,500 Fee) &amp; Step 3 (NIN) to Unlock</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <IdVerificationStatus status={verifyStatus} reason={verifyReason} confidence={verifyConfidence} />
                </div>
              </div>

              {/* Guarantor Details */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Guarantor Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    name="guarantorName"
                    value={guarantorName}
                    onChange={(e) => setGuarantorName(e.target.value)}
                    placeholder="e.g. Chief Emeka Eze"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Guarantor Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    name="guarantorPhone"
                    type="tel"
                    value={guarantorPhone}
                    onChange={(e) => setGuarantorPhone(e.target.value)}
                    placeholder="+234 803 000 0000"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: Professional Skills & Coverage Area */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800">
                  <Award size={17} className="text-sky-600" /> 4. Professional Skills &amp; Coverage
                </h2>
                {isTradeValid && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Gate 4 Trade Selected
                  </span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Primary Skill */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Primary Trade Skill <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    name="primarySkill"
                    value={primarySkill}
                    onChange={(e) => setPrimarySkill(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer shadow-2xs"
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
                    Years of Active Experience <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    max={40}
                    name="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-2xs"
                  />
                </div>
              </div>

              {/* Service Location — Cascading Selector + Live Map */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-sky-600" />
                  Your Primary Service Location <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 font-medium -mt-1">
                  Select your state, city, and area. Customers in this zone will see your profile first.
                </p>

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
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detail your past projects, specializations, and why customers should choose you."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* Trade Certification Upload (Guarded by Primary Skill selection) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Trade Certification / Certificate (Optional)
                  </label>
                  {!primarySkill && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                      <Lock size={10} /> Select Trade Skill First
                    </span>
                  )}
                </div>
                <div
                  onClick={handleCertClick}
                  className={`flex items-center justify-between gap-3 p-4 rounded-2xl border-2 border-dashed transition-all ${
                    !primarySkill
                      ? "border-slate-200 bg-slate-100/70 opacity-70 cursor-not-allowed"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-sky-400 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UploadCloud size={20} className={primarySkill ? "text-sky-600" : "text-slate-400"} />
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
                    ref={certInputRef}
                    type="file"
                    name="certification"
                    accept=".pdf,image/*"
                    disabled={!primarySkill}
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
                </div>
              </div>
            </div>

            {/* Final Submission Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                By submitting your application, you agree to our professional safety, escrow guidelines, and performance standards.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full sm:w-auto min-w-[260px] h-14 inline-flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                  isAllComplete
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 scale-102 ring-2 ring-emerald-400"
                    : "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/25"
                } disabled:opacity-50`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating &amp; Registering...</span>
                  </span>
                ) : isAllComplete ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>All Stages Complete — Register Pro</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Submit Identity &amp; Register Pro</span>
                    <ChevronRight size={16} />
                  </span>
                )}
              </button>
            </div>

            <ErrorAlert 
              error={errorMessage} 
              onClear={() => setErrorMessage(null)}
              className="mt-4"
            />

            {successMessage && (
              <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm font-bold leading-relaxed shadow-xs flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
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
                <h3 className="text-sm font-black text-slate-900">Trust &amp; Safety Standard</h3>
                <p className="text-xs text-slate-500 font-medium">Guaranteed Accreditation</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              HomeCare customers pay upfront for verified, secure home services. We ensure every professional is accredited and vetted against national databases.
            </p>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-black uppercase tracking-wider text-slate-900">Why Join HomeCare?</p>
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
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> 100% Protection against client payment defaults
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs font-bold text-slate-500">Already registered as a professional?</p>
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

export default function WorkerRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
      </div>
    }>
      <WorkerRegisterContent />
    </Suspense>
  );
}
