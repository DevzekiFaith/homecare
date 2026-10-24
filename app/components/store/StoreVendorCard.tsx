"use client";

import { useState } from "react";
import { 
  Store, 
  CheckCircle2, 
  Star, 
  Heart, 
  MessageSquare, 
  Clock, 
  Award,
  Truck
} from "lucide-react";
import { StoreMetadata } from "@/lib/store-data";
import { toast } from "sonner";

interface StoreVendorCardProps {
  store: StoreMetadata;
  productName: string;
}

export default function StoreVendorCard({ store, productName }: StoreVendorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(42500);

  const handleFollowToggle = () => {
    if (!isFollowing) {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      toast.success("Following Official Store!", {
        description: `You will receive priority stock notifications from ${store.name}.`,
      });
    } else {
      setIsFollowing(false);
      setFollowerCount((prev) => prev - 1);
      toast.info("Unfollowed Store", {
        description: `You will no longer receive alerts from ${store.name}.`,
      });
    }
  };

  const handleChatSeller = () => {
    const encodedMsg = encodeURIComponent(
      `Hello! I am interested in purchasing "${productName}" on HomeCare Smart Store. Is this in stock for express delivery to my location?`
    );
    window.open(`https://wa.me/2348000000000?text=${encodedMsg}`, "_blank");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Top Bar */}
      <div className="bg-slate-900 px-4 sm:px-5 py-3 text-white flex items-center justify-between text-xs font-bold border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Award size={14} className="text-sky-400" />
          <span className="uppercase tracking-wider text-[11px] font-black">
            HomeCare Verified Manufacturer
          </span>
        </div>

        <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
          {store.verifiedBadge}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Main Store Identity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-sky-500/20 shrink-0">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                  {store.name}
                </h4>
                <CheckCircle2 size={15} className="text-sky-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {store.tagline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFollowToggle}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              isFollowing
                ? "bg-slate-900 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <Heart size={13} className={isFollowing ? "fill-rose-500 text-rose-500" : ""} />
            <span>{isFollowing ? "Following" : "Follow"}</span>
            <span className="text-[10px] opacity-75">({(followerCount / 1000).toFixed(1)}k)</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-slate-900 font-black text-xs sm:text-sm">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span>{store.rating}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Store Rating</p>
          </div>

          <div className="border-x border-slate-200/80 px-1">
            <div className="text-slate-900 font-black text-xs sm:text-sm">{store.itemsSold}</div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Dispatched</p>
          </div>

          <div>
            <div className="text-emerald-700 font-black text-xs sm:text-sm">{store.positiveRate}</div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Positive Reviews</p>
          </div>
        </div>

        {/* Dispatch Metrics */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
            <Clock size={12} className="text-sky-600 shrink-0" />
            <span>Response: <strong className="text-slate-900">{store.responseRate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-100">
            <Truck size={12} className="text-sky-600 shrink-0" />
            <span>Dispatch: <strong className="text-slate-900">{store.dispatchRate}</strong></span>
          </div>
        </div>

        {/* WhatsApp Chat CTA */}
        <button
          type="button"
          onClick={handleChatSeller}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider transition-all"
        >
          <MessageSquare size={14} className="text-emerald-600" />
          <span>Ask Question via WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
