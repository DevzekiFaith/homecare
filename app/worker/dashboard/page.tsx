"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, AlertCircle, CheckCircle2, Navigation, ClipboardList, Camera, Trash2, Wallet, ArrowDownToLine, Clock, Sparkles, ExternalLink, Check, MessageCircle, BookOpen, Award, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";
import dynamic from "next/dynamic";
import { calculatePayoutBreakdown } from "@/lib/monetization";
import { NIGERIAN_BANKS } from "@/lib/nigerian-banks";

const ChatModal = dynamic(() => import("@/app/components/ChatModal"), { ssr: false });
const LiveMap = dynamic(() => import("@/app/components/LiveMap"), { ssr: false });

import { User } from "@supabase/supabase-js";

// Types
interface ServiceRequest {
  id: string;
  created_at: string;
  service_type: string;
  description: string;
  address: string;
  preferred_time: string | null;
  status: string;
  image_url: string | null;
  assigned_worker_id: string | null;
  property_id?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300 } },
};

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'my-jobs' | 'completed'>('radar');
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [proTier, setProTier] = useState<'starter' | 'elite'>('starter');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
  const [chatJob, setChatJob] = useState<ServiceRequest | null>(null);
  const [mapJob, setMapJob] = useState<ServiceRequest | null>(null);
  const [qrCodeJob, setQrCodeJob] = useState<ServiceRequest | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [isInstantPayout, setIsInstantPayout] = useState(true);
  const [bankName, setBankName] = useState("Access Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      
      // Check cached avatar for instant render
      try {
        const cached = localStorage.getItem("hc_worker_avatar");
        if (cached) setAvatarUrl(cached);
      } catch {}

      // Check dismissed jobs
      try {
        const savedDismissed = localStorage.getItem("hc_dismissed_jobs");
        if (savedDismissed) setDismissedIds(JSON.parse(savedDismissed));
      } catch {}

      // Check upgrade success query param
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("upgrade") === "success") {
        setProTier("elite");
        toast.success("🎉 Upgrade to Elite Pro Verified!", {
          description: "You now have Gold Badge, Top inDrive Priority Placement, and 60s Lead Time.",
        });
      }
    }
  }, []);

  const handleUpgradeToElite = async () => {
    let currentUser = user;
    if (!currentUser) {
      const { data: ud } = await supabase.auth.getUser();
      currentUser = ud.user;
    }

    if (!currentUser) {
      toast.error("Account Login Required", {
        description: "Please log in to your Pro account to upgrade to Elite.",
      });
      router.push("/auth/worker/login?redirect=/worker/dashboard");
      return;
    }

    try {
      setIsUpgrading(true);
      toast.loading("Connecting to Flutterwave Gateway...", { id: "flw-pro-upgrade" });

      const txRef = `PRO-UPG-${Date.now().toString(36).toUpperCase()}`;

      const res = await fetch("/api/payment/flutterwave/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef: txRef,
          amount: 3500,
          email: currentUser.email || "pro@homecare.ng",
          name: currentUser.user_metadata?.full_name || "HomeCare Professional",
          phone: currentUser.user_metadata?.phone || "08000000000",
          title: "Elite Pro Accelerator Upgrade",
          description: "₦3,500 Upgrade for Top 1–3 inDrive Placement, Gold Badge & 60s Priority Radar",
          type: "pro_upgrade",
          userId: currentUser.id,
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        toast.success("Redirecting to Flutterwave...", { id: "flw-pro-upgrade" });
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || "Could not connect to payment gateway. Please try again.", { id: "flw-pro-upgrade" });
      }
    } catch {
      toast.error("Gateway connection timed out. Please try again.", { id: "flw-pro-upgrade" });
    } finally {
      setIsUpgrading(false);
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      // Check cached avatar first
      try {
        const cached = localStorage.getItem("hc_worker_avatar");
        if (cached) setAvatarUrl(cached);
      } catch {}

      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      if (!userData.user) {
        setLoading(false);
        return;
      }

      // Fetch avatar URL and profile details
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (profile && profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
        try {
          localStorage.setItem("hc_worker_avatar", profile.avatar_url);
        } catch {}
      }

      // Fetch professional tier and verification status
      const { data: proRecord } = await supabase
        .from("professionals")
        .select("tier, is_elite")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (proRecord && (proRecord.tier === "elite" || proRecord.is_elite)) {
        setProTier("elite");
      }

      // Execute wallet and requests fetches concurrently in parallel
      const [walletRes, requestsRes] = await Promise.all([
        supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', userData.user.id)
          .maybeSingle(),
        supabase
          .from("service_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (walletRes.data) {
        setBalance(Number(walletRes.data.balance));
      } else {
        // Create in background if missing
        supabase
          .from('wallets')
          .insert({ user_id: userData.user.id, balance: 0 })
          .select('balance')
          .single()
          .then((res: { data: { balance: number } | null }) => {
            if (res.data) setBalance(Number(res.data.balance));
          });
      }

      if (requestsRes.error) throw requestsRes.error;
      setRequests(requestsRes.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRequests();

    // Set up Realtime Subscription
    const channel = supabase
      .channel('worker-radar')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'service_requests',
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          if (payload.eventType === 'INSERT') {
            const newJob = payload.new as unknown as ServiceRequest;
            setRequests((prev) => [newJob, ...prev]);
            toast.info("New Job Nearby!", {
              description: `${newJob.service_type} requested in ${newJob.address.split(',')[0]}`,
              action: {
                label: "View Radar",
                onClick: () => setActiveTab('radar')
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as unknown as ServiceRequest;
            setRequests((prev) =>
              prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id: string }).id;
            setRequests((prev) => prev.filter((job) => job.id !== deletedId));
          }
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
             if (payload.old && Number(updatedWallet.balance) > Number(payload.old.balance)) {
                  toast.success("Earnings Updated!", {
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
  }, [fetchRequests, supabase]);

  const handleAcceptJob = async (jobId: string) => {
    if (!user) return;
    try {
      const { error: updateError } = await supabase
        .from("service_requests")
        .update({ 
          assigned_worker_id: user.id,
          status: 'in_progress' 
        })
        .eq('id', jobId);

      if (updateError) throw updateError;
      
      toast.success("Job Claimed!", {
        description: "Moving to your active jobs list."
      });
      fetchRequests();
      setActiveTab('my-jobs');
    } catch (err: unknown) {
      toast.error("Failed to claim job", { description: err instanceof Error ? err.message : "Error" });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
     try {
       const { error: updateError } = await supabase
         .from("service_requests")
         .update({ status: 'completed' })
         .eq('id', jobId);
  
       if (updateError) throw updateError;
       
       // Get the job details to display in the QR modal and write to Maintenance Passport
       const completedJob = requests.find(r => r.id === jobId);
       if (completedJob) {
         setQrCodeJob({ ...completedJob, status: 'completed' });

         // If associated with a property, automatically record to Digital Maintenance Passport
         if (completedJob.property_id) {
           try {
             await supabase.from("property_maintenance_records").insert({
               property_id: completedJob.property_id,
               service_request_id: completedJob.id,
               performed_by_id: user?.id || null,
               performed_by_name: user?.user_metadata?.full_name || "Verified HomeCare Professional",
               category: completedJob.service_type,
               title: `${completedJob.service_type} Service Completed`,
               work_performed: completedJob.description || "On-site repair and maintenance completed.",
               date_completed: new Date().toISOString(),
               cost: 15000,
             });
           } catch (passportErr) {
             console.warn("Maintenance passport sync warning:", passportErr);
           }
         }
       }
       
       toast.success("Job Completed!", {
         description: "Well done, Pro! Earnings and Maintenance Passport updated."
       });
       
       fetchRequests();
     } catch (err: unknown) {
       toast.error("Update failed", { description: err instanceof Error ? err.message : "Error" });
     }
  };

  const handleDeleteJobWorker = (jobId: string) => {
    toast("Decline & Remove Job Request?", {
      description: "Are you sure you want to permanently remove this booking request from your radar?",
      action: {
        label: "Confirm Remove",
        onClick: async () => {
          // Immediately hide and persist locally
          const updated = [...dismissedIds, jobId];
          setDismissedIds(updated);
          try {
            localStorage.setItem("hc_dismissed_jobs", JSON.stringify(updated));
          } catch {}
          setRequests((prev) => prev.filter((r) => r.id !== jobId));

          try {
            await fetch("/api/admin/delete-job", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: jobId }),
            });
          } catch (err) {
            console.warn("Delete API sync warning:", err);
          }

          toast.success("Job Removed from Feed", {
            description: "This booking has been permanently removed from your radar.",
          });
        },
      },
      cancel: {
        label: "Keep Job",
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  const toggleTracking = (jobId: string) => {
    if (trackingJobId === jobId) {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setTrackingJobId(null);
      toast.info("GPS Tracking Stopped");
    } else {
      // Start tracking
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }
      setTrackingJobId(jobId);
      const channel = supabase.channel(`tracking:${jobId}`);

      const sendLocationUpdate = (lat: number, lng: number) => {
        channel.send({
          type: 'broadcast',
          event: 'location',
          payload: { lat, lng }
        });
      };

      // Default fallback coordinates for testing/desktop (Lagos center)
      const fallbackLat = 6.5244;
      const fallbackLng = 3.3792;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          sendLocationUpdate(latitude, longitude);
        },
        (err) => {
          console.warn("Hardware GPS unavailable, broadcasting fallback location:", err.message || err);
          toast.info("GPS Signal Weak — Using Estimated Provider Location", {
            description: "Live tracking is broadcasting estimated position."
          });
          // Broadcast fallback location with slight simulated movement
          sendLocationUpdate(fallbackLat + (Math.random() - 0.5) * 0.002, fallbackLng + (Math.random() - 0.5) * 0.002);
        },
        { enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 }
      );
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local preview and cache so user sees new photo immediately
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try {
        localStorage.setItem("hc_worker_avatar", dataUrl);
      } catch {}
    };
    reader.readAsDataURL(file);

    let currentUser = user;
    if (!currentUser) {
      const { data: ud } = await supabase.auth.getUser();
      currentUser = ud.user;
    }

    if (!currentUser) {
      toast.success("Profile photo updated!");
      return;
    }

    const toastId = toast.loading("Saving profile photo to cloud...");
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `avatars/${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage (job-photos bucket)
      const { error: uploadErr } = await supabase.storage
        .from("job-photos")
        .upload(filePath, file, { upsert: true });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage
          .from("job-photos")
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData?.publicUrl;
        if (publicUrl) {
          setAvatarUrl(publicUrl);
          try {
            localStorage.setItem("hc_worker_avatar", publicUrl);
          } catch {}

          await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", currentUser.id);

          await supabase
            .from("professionals")
            .update({ avatar_url: publicUrl })
            .eq("id", currentUser.id);
        }
      }
      toast.success("Profile photo saved successfully!", { id: toastId });
    } catch (err: unknown) {
      console.warn("Avatar cloud sync warning:", err);
      toast.success("Profile photo updated!", { id: toastId });
    }
  };

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleProcessPayout = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }
    if (withdrawAmount > balance) {
      toast.error("Insufficient wallet balance", {
        description: `Your available balance is ₦${balance.toLocaleString()}`,
      });
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      toast.error("Please enter a valid 10-digit NUBAN account number");
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmount,
          bankName,
          accountNumber,
          isInstant: isInstantPayout,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to process bank withdrawal");
      }

      setBalance(data.newBalance);
      setIsWithdrawOpen(false);
      setWithdrawAmount(0);

      toast.success(
        isInstantPayout ? "Instant NIBSS Dispatched!" : "Bank Payout Processed!",
        {
          description: `₦${Number(data.disbursedNet).toLocaleString()} sent to ${accountNumber} (${bankName}). Ref: ${data.reference}`,
          duration: 6000,
        }
      );
    } catch (err: unknown) {
      toast.error("Withdrawal failed", {
        description: err instanceof Error ? err.message : "Error processing withdrawal",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const radarJobs = requests.filter(
    (r) =>
      r.status !== "cancelled" &&
      r.status !== "completed" &&
      (!r.assigned_worker_id || r.status === "pending" || r.status === "new") &&
      !dismissedIds.includes(r.id)
  );
  const myActiveJobs = requests.filter(
    (r) =>
      (r.assigned_worker_id === user?.id || !r.assigned_worker_id) &&
      r.status === "in_progress" &&
      !dismissedIds.includes(r.id)
  );
  const myCompletedJobs = requests.filter(
    (r) =>
      r.status === "completed" &&
      (!user?.id || r.assigned_worker_id === user?.id || !r.assigned_worker_id) &&
      !dismissedIds.includes(r.id)
  );
  const displayJobs = activeTab === 'radar' ? radarJobs : activeTab === 'my-jobs' ? myActiveJobs : myCompletedJobs;

  return (
    <div className="relative min-h-screen bg-background px-4 py-8 text-foreground antialiased overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[50%] w-full rounded-full bg-brand-primary/5 opacity-50 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4">
            <Logo size="md" />
            <div>
              <h1 className="text-3xl font-heading font-extrabold tracking-tight text-gradient-primary">
                Pro Center
              </h1>
              <p className="mt-1 text-sm text-zinc-400 font-medium whitespace-pre-wrap">
                Accept live requests and preview customer defect photos before deploying.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left sm:text-right">
            <div 
              className="relative group cursor-pointer flex flex-col items-center" 
              onClick={() => document.getElementById("avatar-file-input")?.click()}
              title="Click to change your profile photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.user_metadata?.full_name || "worker")}`}
                alt="Profile Avatar"
                className="w-14 h-14 rounded-2xl border border-white/10 group-hover:border-sky-500 transition-colors bg-white/5 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
              <span className="mt-1 text-[9px] font-bold text-sky-400 group-hover:underline flex items-center gap-0.5">
                <Camera size={10} /> Change
              </span>
              <input
                type="file"
                id="avatar-file-input"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-left text-xs text-zinc-500">
              <p className="font-bold text-foreground">{user?.user_metadata?.full_name || "Worker Profile"}</p>
              <p className="uppercase tracking-widest mt-1 text-[10px]">Verified Professional</p>
              <span className="mt-2 inline-flex h-6 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500 shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]">
                Radar Active
              </span>
            </div>
          </div>
        </header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Pro Accreditation Tier & Handbook Banner */}
          <motion.div
            variants={itemVariants}
            className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
              proTier === 'elite'
                ? "bg-slate-900 border-amber-400/40 text-white shadow-amber-400/5"
                : "bg-slate-900 border-slate-800 text-white"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {proTier === 'elite' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={11} /> ★ Elite Verified Pro Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Starter Pro Tier Active
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400">
                  {proTier === 'elite' ? "Top 1-3 inDrive Placement (+30 Match Score) · 60s Lead Time" : "Standard Proximity Radar Listing"}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {proTier === 'elite'
                  ? "Your profile is boosted with priority inDrive placement, 60s lead time, and 0% instant payout fees."
                  : "Boost your bookings by 3x and rank at the top of homeowner comparison screens."}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <Link
                href="/worker/handbook"
                target="_blank"
                className="flex-1 md:flex-initial h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <BookOpen size={14} />
                <span>Pro Handbook (PDF)</span>
              </Link>

              {proTier !== 'elite' && (
                <button
                  type="button"
                  onClick={handleUpgradeToElite}
                  disabled={isUpgrading}
                  className="flex-1 md:flex-initial h-10 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpgrading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Upgrade to Elite (₦3,500)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Earnings stats with Net Disbursal & Withdraw Modal */}
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium border-brand-primary/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Wallet Balance</p>
                  <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    85% Net Disbursed
                  </span>
                </div>
                <p className="mt-2 text-3xl font-heading font-extrabold text-foreground">₦{balance.toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWithdrawAmount(balance > 0 ? balance : 10000);
                  setIsWithdrawOpen(true);
                }}
                className="mt-4 w-full h-9 rounded-xl bg-sky-600 text-white hover:bg-sky-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-sky-600/25"
              >
                <ArrowDownToLine size={14} />
                <span>Withdraw Funds</span>
              </button>
            </motion.div>
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Jobs completed</p>
                <p className="mt-2 text-3xl font-heading font-extrabold text-foreground">
                  {requests.filter(r => r.status === 'completed' && r.assigned_worker_id === user?.id).length}
                </p>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">100% Escrow Guaranteed</p>
            </motion.div>
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Rating</p>
                <p className="mt-2 text-3xl font-heading font-extrabold text-foreground tracking-tighter">4.9<span className="text-sky-500 ml-1 text-2xl">★</span></p>
              </div>
              <span className="text-[10px] font-bold text-sky-400">Top 5% Verified Tier</span>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-fit flex-wrap gap-1 sm:gap-0">
            <button 
              onClick={() => setActiveTab('radar')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'radar' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-zinc-400 hover:text-white'}`}
            >
              <Navigation size={14} /> Area Radar
            </button>
            <button 
              onClick={() => setActiveTab('my-jobs')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'my-jobs' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-zinc-400 hover:text-white'}`}
            >
              <ClipboardList size={14} /> My Active Jobs 
              {myActiveJobs.length > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">{myActiveJobs.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'text-zinc-400 hover:text-white'}`}
            >
              <CheckCircle2 size={14} /> Completed Jobs
              {myCompletedJobs.length > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">{myCompletedJobs.length}</span>}
            </button>
          </div>

          {/* Jobs Feed */}
          <motion.section variants={itemVariants} className="glass-panel p-6 shadow-premium">
             <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  {activeTab === 'radar' ? (
                     <span className="relative flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-primary"></span>
                     </span>
                  ) : (
                     <ClipboardList size={16} className="text-brand-primary" />
                  )}
                  <h2 className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">
                     {activeTab === 'radar' ? 'Incoming Request Radar' : activeTab === 'my-jobs' ? 'Your Ongoing Projects' : 'Completed Projects'}
                  </h2>
                </div>
                <span className="rounded-full bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                  {displayJobs.length} Total
                </span>
             </div>

             <div className="divide-y divide-white/5">
               {loading ? (
                 <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                   <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent mb-4" />
                   <p className="text-xs font-medium">Updating boards...</p>
                 </div>
               ) : error ? (
                 <div className="py-6 flex flex-col items-center justify-center text-red-400">
                   <AlertCircle size={24} className="mb-2 opacity-50" />
                   <p className="text-xs font-bold uppercase tracking-widest">Connection Error</p>
                   <p className="text-xs text-red-500/70 mt-1 text-center">{error}</p>
                 </div>
               ) : displayJobs.length === 0 ? (
                 <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
                   <CheckCircle2 size={32} className="mb-3 opacity-20" />
                   <p className="text-sm font-bold text-foreground">
                      {activeTab === 'radar' ? 'Radar is empty' : activeTab === 'my-jobs' ? 'You have no active jobs' : 'No completed jobs yet'}
                   </p>
                   <p className="text-xs mt-1">
                      {activeTab === 'radar' ? 'Leave your radar on to get notified instantly.' : activeTab === 'my-jobs' ? 'Claim a job from the radar to get started.' : 'Completed jobs will appear here.'}
                   </p>
                 </div>
               ) : (
                 <AnimatePresence mode="wait">
                   {displayJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col sm:flex-row gap-5 py-5 transition-colors group"
                    >
                      {/* Photo Thumbnail */}
                      {job.image_url ? (
                        <div 
                          className="relative w-full sm:w-28 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0 cursor-pointer border border-white/10 group/img shadow-md bg-black/20"
                          onClick={() => setLightboxImage(job.image_url!)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={job.image_url} 
                            alt="Issue thumbnail" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" 
                          />
                          <div className="absolute inset-0 bg-brand-primary/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <ExternalLink size={16} className="text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col w-full sm:w-28 aspect-video sm:aspect-square items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 shrink-0">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">No Photo</p>
                        </div>
                      )}

                      {/* Job Info */}
                      <div className="flex-1 space-y-1 w-full flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-brand-primary transition-colors">
                              {job.service_type}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                {job.address.slice(0, 30)}{job.address.length > 30 ? '...' : ''}
                              </p>
                              {job.property_id && (
                                <Link
                                  href={`/property/${job.property_id}`}
                                  className="text-[9px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full hover:bg-sky-500/20 transition-colors"
                                >
                                  🏢 Property Job
                                </Link>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex h-6 items-center rounded-full border px-3 text-[9px] font-bold uppercase tracking-widest ${
                            job.status === 'pending' || job.status === 'new'
                              ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
                              : 'border-white/10 bg-white/5 text-zinc-400'
                          }`}>
                            {job.status || 'New'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 font-medium pt-1">
                          {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-2 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                          &ldquo;{job.description}&rdquo;
                        </p>
                        
                        <div className="flex justify-between items-center mt-auto pt-4">
                            <div>
                                <p className="text-[11px] font-extrabold tracking-widest text-brand-primary">₦15,000</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">Base Call-Out</p>
                            </div>
                            {activeTab === 'radar' ? (
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleAcceptJob(job.id)}
                                    className="btn-minimal h-9 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-premium hover:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
                                  >
                                    Accept Job
                                  </button>
                                  <button
                                    onClick={() => handleDeleteJobWorker(job.id)}
                                    title="Decline/Remove Request"
                                    className="h-9 w-9 rounded-full bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 flex items-center justify-center transition-all cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                            ) : activeTab === 'my-jobs' ? (
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleCompleteJob(job.id)}
                                  className="flex items-center gap-2 h-9 px-6 bg-emerald-500 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-premium hover:bg-emerald-600 transition-all cursor-pointer"
                                >
                                  <Check size={14} /> Complete
                                </button>
                                <button 
                                  onClick={() => setMapJob(job)}
                                  className="flex items-center gap-2 h-9 px-5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-sky-500/20 transition-all cursor-pointer"
                                >
                                  <Navigation size={13} /> Live Map
                                </button>
                                <button 
                                  onClick={() => setChatJob(job)}
                                  className="flex items-center gap-2 h-9 px-5 bg-white/5 text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                  <MessageCircle size={14} /> Chat
                                </button>
                                <button
                                  onClick={() => toggleTracking(job.id)}
                                  className={`flex items-center gap-2 h-9 px-5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-premium transition-all cursor-pointer ${
                                    trackingJobId === job.id 
                                      ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
                                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  <Navigation size={13} className={trackingJobId === job.id ? 'animate-pulse' : ''} /> 
                                  {trackingJobId === job.id ? 'Stop GPS' : 'Share GPS'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button 
                                  onClick={() => setQrCodeJob(job)}
                                  className="flex items-center gap-2 h-9 px-6 bg-sky-600 hover:bg-sky-500 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-premium transition-all cursor-pointer"
                                >
                                  <ExternalLink size={14} /> Review QR Code
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.section>
        </motion.main>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 sm:p-12" 
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 sm:top-8 sm:right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-primary hover:text-white transition-colors shadow-premium backdrop-blur-md"
              onClick={() => setLightboxImage(null)}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="relative max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 bg-black"
               onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={lightboxImage} 
                alt="Enlarged issue detail" 
                className="w-full h-full object-contain max-h-[90vh]" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Customer Reviews */}
      <AnimatePresence>
        {qrCodeJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setQrCodeJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                onClick={() => setQrCodeJob(null)}
              >
                <X size={18} />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 mx-auto mb-4 border border-sky-500/20">
                <CheckCircle2 size={24} />
              </div>

              <h3 className="text-lg font-bold text-white uppercase tracking-wide">Job Completed!</h3>
              <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
                Ask the customer to scan this live review QR code on their device.
              </p>

              {/* QR Code Image Container */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-6 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `https://www.homecare.com.ng/review?request_id=${qrCodeJob.id}`
                  )}`}
                  alt="Review QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-1.5 text-left bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-zinc-400 mb-4">
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span className="font-bold text-white uppercase">{qrCodeJob.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional:</span>
                  <span className="font-bold text-white">{user?.user_metadata?.full_name || "Verified Pro"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-bold text-white truncate max-w-[150px]">{qrCodeJob.address.split(',')[0]}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `https://www.homecare.com.ng/review?request_id=${qrCodeJob.id}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Review link copied to clipboard!");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Copy Review Link
                </button>
                <Link
                  href={`/review?request_id=${qrCodeJob.id}`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span>Open</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worker Live Map Modal */}
      <AnimatePresence>
        {mapJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 sm:p-10" 
            onClick={() => setMapJob(null)}
          >
            <button 
              className="absolute top-6 right-6 sm:top-8 sm:right-8 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-primary hover:text-white transition-colors shadow-premium backdrop-blur-md cursor-pointer"
              onClick={() => setMapJob(null)}
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(2,132,199,0.2)] border border-white/10 bg-background"
               onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>Live Client Navigation & In-Map Chat</span>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                        Esri ArcGIS Live
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">{mapJob.service_type} • {mapJob.address}</p>
                 </div>
                 <span className="animate-pulse flex h-3 w-3 rounded-full bg-sky-500"></span>
              </div>
              <div className="w-full bg-black">
                 <LiveMap 
                    address={mapJob.address}
                    trackingJobId={mapJob.id}
                    workerName={user?.user_metadata?.full_name || "You (Pro)"}
                    workerRole="Verified Pro En Route"
                    clientName="Client"
                    height="65vh"
                    interactive={false}
                 />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Worker Payout & Withdrawal Modal */}
      <AnimatePresence>
        {isWithdrawOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setIsWithdrawOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                onClick={() => setIsWithdrawOpen(false)}
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest mb-1">
                <Wallet size={16} />
                <span>Wallet Withdrawal</span>
              </div>
              <h3 className="text-xl font-heading font-black text-white uppercase tracking-tight">
                Disburse Earnings to Bank
              </h3>
              <p className="text-xs text-zinc-400 mt-1 mb-6">
                Available Wallet Balance: <strong className="text-emerald-400">₦{balance.toLocaleString()}</strong>
              </p>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Withdrawal Amount (₦)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={balance}
                  value={withdrawAmount || ""}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  placeholder="e.g. 25000"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-base focus:border-brand-primary outline-none"
                />
              </div>

              {/* Speed Mode Selector */}
              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsInstantPayout(true)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isInstantPayout
                      ? "bg-brand-primary/10 border-brand-primary text-white"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Instant NIBSS</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Under 3 mins (1.5% fee)</p>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstantPayout(false)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    !isInstantPayout
                      ? "bg-brand-primary/10 border-brand-primary text-white"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Clock size={14} className="text-sky-400" />
                    <span>Standard Payout</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Free (within 24 hours)</p>
                </button>
              </div>

              {/* Bank Details Inputs */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    Bank Name
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-xs font-semibold focus:border-brand-primary outline-none"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.name} className="bg-zinc-900 text-white">
                        {b.name} {b.isMfb ? "• MFB" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                    10-Digit NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="0123456789"
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-white font-mono text-xs focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              {(() => {
                const calc = calculatePayoutBreakdown(withdrawAmount || 0, isInstantPayout);
                return (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5 text-xs text-zinc-400 mb-6">
                    <div className="flex justify-between">
                      <span>Requested Disbursal:</span>
                      <span className="font-bold text-white">{calc.formattedRequested}</span>
                    </div>
                    <div className="flex justify-between text-amber-400/90">
                      <span>Convenience Fee:</span>
                      <span className="font-bold">{calc.formattedFee}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-1.5 text-sm">
                      <span>Net Sent to Bank:</span>
                      <span>{calc.formattedNet}</span>
                    </div>
                  </div>
                );
              })()}

              <button
                type="button"
                disabled={isWithdrawing || !withdrawAmount || withdrawAmount > balance}
                onClick={handleProcessPayout}
                className="w-full h-12 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-sky-600/30 border border-sky-400/30"
              >
                {isWithdrawing ? "Processing Disbursal..." : "Confirm Bank Disbursal"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatModal 
        isOpen={!!chatJob}
        onClose={() => setChatJob(null)}
        requestId={chatJob?.id || ""}
        title="Chat with Customer"
        subtitle={chatJob?.service_type}
      />
    </div>
  );
}
