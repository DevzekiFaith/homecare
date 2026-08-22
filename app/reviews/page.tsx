"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAllReviews, Review } from "@/lib/reviews";
import { Star, ShieldCheck, User, MessageSquare, ArrowRight, Activity, Search, Filter } from "lucide-react";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    async function loadReviews() {
      setLoading(true);
      const { data } = await fetchAllReviews();
      setReviews(data);
      setLoading(false);
    }
    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : "0.0";
    return { total, avg };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating.toString() !== ratingFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesWorker = (r.worker_name || "").toLowerCase().includes(q);
        const matchesComment = (r.comment || "").toLowerCase().includes(q);
        const matchesService = (r.service_type || "").toLowerCase().includes(q);
        if (!matchesWorker && !matchesComment && !matchesService) return false;
      }
      return true;
    });
  }, [reviews, ratingFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-24">
      {/* Premium Gradient Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-16 pb-20 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/10 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10 text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/25 inline-block">
            Accredited Quality
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Client <span className="text-cyan-200">Reviews</span> & Feedback
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
            Real customer ratings, testimonials, and comments collected from completed services.
          </p>

          {/* Core Stats Pill */}
          <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-md mt-4">
            <div className="text-left border-r border-white/25 pr-6">
              <p className="text-[9px] font-bold uppercase tracking-wider text-sky-200">Average Rating</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-black text-white">{stats.avg}</span>
                <Star size={16} className="text-amber-300 fill-amber-300" />
              </div>
            </div>
            <div className="text-left">
              <p className="text-[9px] font-bold uppercase tracking-wider text-sky-200">Total Reviews</p>
              <p className="text-xl font-black text-white mt-0.5">{stats.total}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content grid */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 relative z-10">
        
        {/* Artisan Live Review QR Code Simulator card */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Left Column: Interactive QR Code Image */}
          <div className="shrink-0 bg-white p-4 rounded-2xl border border-white/10 shadow-lg text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                `${origin}/review?request_id=demo-job-id`
              )}`}
              alt="Artisan Review QR Code"
              className="w-36 h-36 mx-auto"
            />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mt-2">
              Scan with Mobile Phone
            </span>
          </div>

          {/* Right Column: Description & Simulation Button */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 inline-block">
              Interactive UI Simulator
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              Artisan Live Review QR Code
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
              This is the QR code presented by professionals (like Electricians or Plumbers) upon completing a job. Scan it with your phone to open the rating page instantly, or click below to open the mobile simulator directly in your browser.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Link
                href="/review?request_id=demo-job-id"
                className="h-10 px-6 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <span>Launch Review Simulator</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Search & filters panel */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, skill, service type or comment..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-medium outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Filter className="text-slate-400" size={16} />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="flex-1 sm:flex-none py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none transition-all cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>
        </div>

        {/* Dynamic Reviews Feed */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Loading Reviews Feed...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 text-center text-slate-400 max-w-sm mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <MessageSquare size={36} className="mx-auto text-slate-200 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">No Reviews Yet</h3>
            <p className="text-xs mt-1 text-slate-500 leading-normal">
              No verified review matches your search filters. Be the first to book a service and leave feedback!
            </p>
            <Link
              href="/request"
              className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Book a Service <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredReviews.map((review) => (
              <div 
                key={review.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-sky-300 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-16 w-16 bg-sky-500/2 rounded-bl-full pointer-events-none group-hover:bg-sky-500/5 transition-colors" />
                
                <div>
                  {/* Testimonial Stars */}
                  <div className="flex gap-0.5 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "currentColor" : "none"}
                        className={i < review.rating ? "" : "text-slate-200"}
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed mb-6 font-medium italic">
                    &ldquo;{review.comment || `Rated ${review.rating} stars for outstanding service quality.`}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase shrink-0 border border-sky-400">
                    {review.worker_name ? review.worker_name[0] : <User size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">{review.worker_name}</h4>
                      <ShieldCheck size={14} className="text-emerald-500 shrink-0" fill="currentColor" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                      {review.service_type} Specialist
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">
                      Reviewed on {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global CTA */}
        <section className="mt-16 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white p-8 sm:p-12 rounded-[32px] border border-slate-800 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-sky-500/5 blur-xl pointer-events-none" />
          <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wide">Experience Certified Quality</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Book our vetted professional network for fast, escrow-protected repairs in your home today.
          </p>
          <Link
            href="/request"
            className="mt-8 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Book a Pro Now</span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
