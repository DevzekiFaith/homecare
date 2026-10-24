"use client";

import { useState } from "react";
import { Star, ThumbsUp, CheckCircle2 } from "lucide-react";
import { SAMPLE_NIGERIAN_REVIEWS, NigerianReview } from "@/lib/store-data";
import { toast } from "sonner";

interface CustomerReviewsProps {
  rating?: number;
  reviewCount?: number;
  productName: string;
}

export default function CustomerReviews({
  rating = 4.9,
  reviewCount = 340,
  productName,
}: CustomerReviewsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [reviews, setReviews] = useState<NigerianReview[]>(SAMPLE_NIGERIAN_REVIEWS);
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});

  const filters = [
    { label: "All", count: reviewCount },
    { label: "Fast Delivery Lagos", count: 142 },
    { label: "Verified Purchase", count: reviewCount },
    { label: "Inverter Compatible", count: 86 },
    { label: "Easy Setup", count: 54 },
  ];

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
      )
    );
    setHelpfulVoted((prev) => ({ ...prev, [reviewId]: true }));
    toast.success("Feedback submitted!", {
      description: "Thank you for letting other shoppers know this review was helpful.",
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Fast Delivery Lagos") return r.tag?.includes("Delivery");
    if (selectedFilter === "Inverter Compatible") return r.tag?.includes("Inverter");
    if (selectedFilter === "Easy Setup") return r.tag?.includes("Setup");
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Reviews Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Customer Feedback
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
            Verified Reviews for Nigerian Homes
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from verified purchasers across Lagos, Abuja, Port Harcourt, and Ibadan.
          </p>
        </div>

        {/* Rating Breakdown Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <div className="text-center pr-3 border-r border-slate-200">
            <span className="text-3xl font-black text-slate-900 font-heading">{rating.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-bold block">/ 5.0</span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  className={
                    star <= Math.round(rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200"
                  }
                />
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-600 mt-1">
              {reviewCount.toLocaleString()} verified ratings (99% positive)
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setSelectedFilter(f.label)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedFilter === f.label
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>{f.label}</span>
            <span className="ml-1.5 opacity-60 text-[10px]">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Review Cards List */}
      <div className="space-y-4 pt-2">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-3 transition-colors hover:border-slate-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${rev.avatarColor} text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-2xs`}
                >
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{rev.name}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={10} className="text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{rev.location} · {rev.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= rev.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
                {rev.tag && (
                  <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    {rev.tag}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {rev.comment}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 text-[11px] text-slate-500">
              <span className="text-[10px] text-slate-400">Purchased for: {productName}</span>

              <button
                type="button"
                onClick={() => handleHelpfulClick(rev.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  helpfulVoted[rev.id]
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold"
                    : "hover:bg-slate-200 text-slate-600"
                }`}
              >
                <ThumbsUp size={12} />
                <span>Helpful ({rev.helpfulCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
