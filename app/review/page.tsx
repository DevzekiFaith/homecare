"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/audio-fx";
import { submitReview, hasRequestBeenReviewed } from "@/lib/reviews";
import { Star, ShieldCheck, User, ArrowLeft, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";

function ReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("request_id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [workerDetails, setWorkerDetails] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      setError("Invalid review link. Missing request reference.");
      return;
    }

    async function loadDetails() {
      if (requestId === "demo-job-id") {
        setRequestDetails({
          id: "demo-job-id",
          customer_id: null,
          service_type: "Electrical",
          assigned_worker_id: "demo-worker-id",
        });
        setWorkerDetails({
          id: "demo-worker-id",
          full_name: "Ezekiel Oghojafor",
          primary_skill: "Electrical",
          experience_years: 8,
          is_verified: true,
        });
        setLoading(false);
        return;
      }

      try {
        // 1. Check if already reviewed
        const reviewed = await hasRequestBeenReviewed(requestId!);
        if (reviewed) {
          setAlreadyReviewed(true);
          setLoading(false);
          return;
        }

        // 2. Fetch service request details
        const { data: request, error: reqErr } = await supabase
          .from("service_requests")
          .select("*")
          .eq("id", requestId)
          .maybeSingle();

        if (reqErr) throw reqErr;
        if (!request) {
          setError("We couldn't locate this service record.");
          setLoading(false);
          return;
        }

        setRequestDetails(request);

        // 3. Fetch worker professional profile
        if (request.assigned_worker_id) {
          const { data: worker, error: workerErr } = await supabase
            .from("professionals")
            .select("*")
            .eq("id", request.assigned_worker_id)
            .maybeSingle();

          if (workerErr) throw workerErr;
          setWorkerDetails(worker);
        } else {
          setError("No professional is assigned to this service request yet.");
        }
      } catch (err: any) {
        console.error("Load details error:", err);
        setError("Failed to fetch service details. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [requestId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please tap a star rating before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const { isFallback, error: submitErr } = await submitReview({
        request_id: requestId!,
        customer_id: requestDetails?.customer_id || null,
        worker_id: requestDetails?.assigned_worker_id!,
        rating,
        comment,
        worker_name: workerDetails?.full_name || "Verified Pro",
        customer_name: requestDetails?.customer_id ? undefined : "Guest Customer",
        service_type: requestDetails?.service_type || "Homecare Service",
      });

      if (submitErr) throw submitErr;

      setIsLocalFallback(isFallback);
      setSubmitted(true);
      playSound("success");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Service Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Review Link Inactive</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    );
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Review Completed</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          You have already submitted a rating and review for this job. Thank you for your feedback!
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-sky-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/10 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="h-16 w-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Review Submitted!</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Thank you for helping us maintain high standards. Your feedback is now live on the platform!
        </p>
        
        {isLocalFallback && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left flex gap-2">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={14} />
            <div className="text-[10px] text-amber-800 leading-normal">
              <strong>Offline Mode Cache</strong>: Your review was successfully cached locally in local storage. To persist this permanently, please run the SQL database migrations in your Supabase Editor.
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="mt-8 inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full bg-sky-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/20 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow design */}
      <div className="absolute inset-x-0 -top-[20%] -z-10 h-[60%] w-full rounded-full bg-sky-200/40 opacity-70 blur-[130px] pointer-events-none" />

      <header className="mb-6 flex flex-col items-center">
        <Logo size="md" />
        <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-sky-600">Live Customer Rating</span>
      </header>

      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6 relative"
      >
        {/* Worker Profile Header inside Review Card */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(workerDetails?.full_name || "worker")}`}
            alt={workerDetails?.full_name || "Worker"}
            className="w-12 h-12 rounded-2xl bg-sky-50 shadow-md shrink-0 border border-sky-200 object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-900 truncate">
                {workerDetails?.full_name || "Artisan Professional"}
              </h3>
              {workerDetails?.is_verified && (
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" fill="currentColor" />
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate mt-0.5">
              {workerDetails?.primary_skill || requestDetails?.service_type} Pro
            </p>
            {workerDetails?.experience_years !== undefined && (
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {workerDetails.experience_years} years of service history
              </p>
            )}
          </div>
        </div>

        {/* Rating description bar */}
        <div className="text-center">
          <label className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-3">
            Rate service quality
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating);
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => {
                    setRating(star);
                    playSound("click");
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-95 duration-150 cursor-pointer"
                >
                  <Star
                    size={36}
                    className={`transition-all ${
                      active 
                        ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" 
                        : "text-slate-200"
                    }`}
                    fill={active ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs font-bold text-slate-400 mt-2 h-4 uppercase tracking-widest text-[9px]">
            {rating === 1 && "Poor Quality"}
            {rating === 2 && "Fair / Needs Improvement"}
            {rating === 3 && "Satisfactory Standard"}
            {rating === 4 && "Great Service"}
            {rating === 5 && "Outstanding Professional"}
          </p>
        </div>

        {/* Comment input area */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MessageSquare size={13} className="text-sky-600" /> Share your experience
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Help other customers by describing the quality, speed, and attitude of the worker..."
            maxLength={500}
            className="w-full rounded-2xl border border-slate-200 p-4 text-xs font-medium text-slate-700 placeholder-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none resize-none bg-slate-5/20"
          />
          <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {comment.length} / 500 characters
          </div>
        </div>

        {/* Submit action */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/10 cursor-pointer"
        >
          {submitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Loading Form...</p>
      </div>
    }>
      <ReviewForm />
    </Suspense>
  );
}
