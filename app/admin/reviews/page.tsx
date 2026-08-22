"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAllReviews, Review } from "@/lib/reviews";
import { Star, Search, Filter, MessageSquare, AlertTriangle, ShieldCheck, UserCheck, Calendar } from "lucide-react";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      const { data, isFallback: fallback } = await fetchAllReviews();
      setReviews(data);
      setIsFallback(fallback);
      setLoading(false);
    }
    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : "0.0";
    const starsBreakdown = [0, 0, 0, 0, 0]; // Index 0 is 1 star, Index 4 is 5 stars
    reviews.forEach((r) => {
      const idx = Math.max(1, Math.min(5, r.rating)) - 1;
      starsBreakdown[idx]++;
    });
    return { total, avg, starsBreakdown: starsBreakdown.reverse() };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Rating filter
      if (ratingFilter !== "all" && r.rating.toString() !== ratingFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesWorker = (r.worker_name || "").toLowerCase().includes(q);
        const matchesCustomer = (r.customer_name || "").toLowerCase().includes(q);
        const matchesComment = (r.comment || "").toLowerCase().includes(q);
        const matchesService = (r.service_type || "").toLowerCase().includes(q);
        if (!matchesWorker && !matchesCustomer && !matchesComment && !matchesService) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, ratingFilter, searchQuery]);

  return (
    <div className="space-y-6 text-slate-800">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-sky-600 mb-1">Quality Assurance</p>
        <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900">Customer Feedback & Reviews</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Live feed of customer reviews submitted for completed service requests.
        </p>
      </div>

      {isFallback && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 shadow-2xs">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Developer Fallback Active</h4>
            <p className="text-[11px] text-amber-700 mt-1 leading-normal">
              The remote Supabase `reviews` table was not detected. The dashboard is currently displaying cached mock review data stored in your local browser storage. Run the SQL migration `20260822_reviews.sql` in your Supabase SQL editor to enable persistent remote database storage.
            </p>
          </div>
        </div>
      )}

      {/* Analytics widgets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Feedback</p>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs font-bold text-slate-500">Verified reviews</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Average Rating</p>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.avg}</span>
              <div className="flex text-amber-400">
                <Star size={18} fill="currentColor" />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">Out of 5.0 stars</span>
          </div>
        </div>

        {/* Rating stars bar graphs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Rating Distribution</p>
          {stats.starsBreakdown.map((count, idx) => {
            const starNum = 5 - idx;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={starNum} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-10 text-right">{starNum} Star</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-6 text-right font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by pro worker, service type or comments..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-sky-500 rounded-xl text-xs font-medium outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Filter className="text-slate-400" size={16} />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="flex-1 sm:flex-none py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none transition-all"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews logs list */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Loading Reviews Feed...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-slate-400 max-w-sm mx-auto">
            <MessageSquare size={36} className="mx-auto text-slate-200 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">No Reviews Found</h3>
            <p className="text-xs mt-1 text-slate-500 leading-normal">
              {reviews.length === 0
                ? "Reviews left by customers scanning worker QR codes will log here."
                : "No reviews match your current search queries or rating filters."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-start gap-4">
                {/* Score badge & details */}
                <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start gap-2 shrink-0 md:w-44">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className={i < review.rating ? "" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded mt-1">
                    {review.service_type}
                  </span>
                </div>

                {/* Review Body */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-medium text-slate-700 leading-relaxed italic">
                    &ldquo;{review.comment || "No written comments provided."}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 text-slate-600">
                      <UserCheck size={12} className="text-sky-600" />
                      <span>Pro:</span>
                      <strong className="text-slate-800 font-extrabold">{review.worker_name}</strong>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>Customer:</span>
                      <span className="text-slate-500 font-semibold">{review.customer_name || "Guest User"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar size={12} />
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
