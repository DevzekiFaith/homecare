"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, ExternalLink, AlertCircle, CheckCircle2, Navigation, ClipboardList, Check, MessageCircle, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";
import dynamic from "next/dynamic";

const ChatModal = dynamic(() => import("@/app/components/ChatModal"), { ssr: false });

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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'my-jobs' | 'completed'>('radar');
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
  const [chatJob, setChatJob] = useState<ServiceRequest | null>(null);
  const [qrCodeJob, setQrCodeJob] = useState<ServiceRequest | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const [origin, setOrigin] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
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
       
       toast.success("Job Completed!", {
         description: "Well done, Pro! Earnings updated."
       });
       
       // Get the job details to display in the QR modal
       const completedJob = requests.find(r => r.id === jobId);
       if (completedJob) {
         setQrCodeJob({ ...completedJob, status: 'completed' });
       }
       
       fetchRequests();
     } catch (err: unknown) {
       toast.error("Update failed", { description: err instanceof Error ? err.message : "Error" });
     }
  };

  const handleDeleteJobWorker = async (jobId: string) => {
    if (!confirm("Decline/Remove this request from your worker feed?")) return;
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "cancelled" })
        .eq("id", jobId);

      if (error) {
        toast.error("Failed to remove job: " + error.message);
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== jobId));
      toast.success("Job request removed from your feed.");
    } catch (err: any) {
      toast.error("Remove job error: " + err.message);
    }
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
    if (!file || !user) return;

    const toastId = toast.loading("Uploading profile image...");
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `avatars/${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage (job-photos bucket)
      const { error: uploadErr } = await supabase.storage
        .from("job-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // 2. Retrieve public URL
      const { data: publicUrlData } = supabase.storage
        .from("job-photos")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error("Could not retrieve image URL.");

      // 3. Update profiles table
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (profileErr) throw profileErr;

      // 4. Update professionals table
      const { error: proErr } = await supabase
        .from("professionals")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (proErr) console.warn("Professional avatar update warning:", proErr.message);

      // 5. Update state
      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error("Upload failed", { description: err.message, id: toastId });
    }
  };

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);  const radarJobs = requests.filter(r => r.status === 'pending' || r.status === 'new' || !r.assigned_worker_id);
  const myActiveJobs = requests.filter(r => r.assigned_worker_id === user?.id && r.status === 'in_progress');
  const myCompletedJobs = requests.filter(r => r.assigned_worker_id === user?.id && r.status === 'completed');
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
            <div className="relative group cursor-pointer" onClick={() => document.getElementById("avatar-file-input")?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.user_metadata?.full_name || "worker")}`}
                alt="Profile Avatar"
                className="w-14 h-14 rounded-2xl border border-white/10 group-hover:border-sky-500 transition-colors bg-white/5 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
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
          {/* Earnings stats */}
          <div className="grid gap-4 sm:grid-cols-3">
             {/* ... same stats as before ... */}
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium border-brand-primary/20">
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary">Wallet Balance</p>
              <p className="mt-2 text-3xl font-heading font-extrabold text-foreground">₦{balance.toLocaleString()}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Jobs completed</p>
              <p className="mt-2 text-3xl font-heading font-extrabold text-foreground">
                {requests.filter(r => r.status === 'completed' && r.assigned_worker_id === user?.id).length}
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="glass-panel p-6 shadow-premium">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Rating</p>
              <p className="mt-2 text-3xl font-heading font-extrabold text-foreground tracking-tighter">4.9<span className="text-brand-primary ml-1 text-2xl">★</span></p>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-fit flex-wrap gap-1 sm:gap-0">
            <button 
              onClick={() => setActiveTab('radar')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'radar' ? 'bg-brand-primary text-background font-black' : 'text-zinc-500 hover:text-foreground'}`}
            >
              <Navigation size={14} /> Area Radar
            </button>
            <button 
              onClick={() => setActiveTab('my-jobs')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'my-jobs' ? 'bg-brand-primary text-background font-black' : 'text-zinc-500 hover:text-foreground'}`}
            >
              <ClipboardList size={14} /> My Active Jobs 
              {myActiveJobs.length > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">{myActiveJobs.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-grow sm:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'completed' ? 'bg-brand-primary text-background font-black' : 'text-zinc-500 hover:text-foreground'}`}
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
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                              {job.address.slice(0, 30)}{job.address.length > 30 ? '...' : ''}
                            </p>
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
                                  onClick={() => setChatJob(job)}
                                  className="flex items-center gap-2 h-9 px-6 bg-white/5 text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                >
                                  <MessageCircle size={14} /> Chat
                                </button>
                                <button
                                  onClick={() => toggleTracking(job.id)}
                                  className={`flex items-center gap-2 h-9 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-premium transition-all cursor-pointer ${
                                    trackingJobId === job.id 
                                      ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20' 
                                      : 'bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20'
                                  }`}
                                >
                                  <Navigation size={14} className={trackingJobId === job.id ? 'animate-pulse' : ''} /> 
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `https://www.homecare.com.ng/review?request_id=${qrCodeJob.id}`
                  )}`}
                  alt="Review QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-1.5 text-left bg-white/5 p-4 rounded-2xl border border-white/5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Service Type:</span>
                  <span className="font-bold text-white uppercase">{qrCodeJob.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Artisan Pro:</span>
                  <span className="font-bold text-white">{user?.user_metadata?.full_name || "Verified Pro"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-bold text-white truncate max-w-[150px]">{qrCodeJob.address.split(',')[0]}</span>
                </div>
              </div>
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
