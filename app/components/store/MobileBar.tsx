"use client";

import { ShoppingCart, Store, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/products";

interface MobileBarProps {
  product: Product;
  onAddToCart: () => void;
  onBuyNow: () => void;
  justAdded: boolean;
  cartCount: number;
  onOpenCart?: () => void;
  includeInstallation?: boolean;
  installationFee?: number;
}

export default function MobileBar({
  product,
  onAddToCart,
  onBuyNow,
  justAdded,
  cartCount,
  onOpenCart,
  includeInstallation = false,
  installationFee = 7500,
}: MobileBarProps) {
  const strikePrice = product.originalPrice || Math.round((product.price * 1.52) / 500) * 500;

  const handleChat = () => {
    const encoded = encodeURIComponent(
      `Hello! I want to inquire about purchasing "${product.name}" on HomeCare Smart Store.`
    );
    window.open(`https://wa.me/2348000000000?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 sm:px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] shadow-2xl lg:hidden flex items-center justify-between gap-2 sm:gap-3 transition-all">
      {/* Left Quick Navigation Icons */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/store"
          className="flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl text-slate-600 hover:text-sky-700 active:scale-95 transition-transform"
          title="Store Catalog"
        >
          <Store size={17} />
          <span className="text-[9px] font-bold mt-0.5">Store</span>
        </Link>

        <button
          onClick={handleChat}
          className="flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl text-slate-600 hover:text-emerald-700 active:scale-95 transition-transform"
          title="Chat on WhatsApp"
        >
          <MessageSquare size={17} />
          <span className="text-[9px] font-bold mt-0.5">Chat</span>
        </button>

        {onOpenCart && (
          <button
            onClick={onOpenCart}
            className="relative flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl text-slate-600 hover:text-sky-700 active:scale-95 transition-transform"
            title="Open Cart"
          >
            <ShoppingCart size={17} />
            <span className="text-[9px] font-bold mt-0.5">Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-white text-[9px] font-black ring-1 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Price Info Preview */}
      <div className="hidden xs:flex flex-col leading-tight shrink-0 pl-1">
        <span className="text-xs sm:text-sm font-black text-slate-900 font-heading">
          ₦{(product.price + (includeInstallation ? installationFee : 0)).toLocaleString()}
        </span>
        {includeInstallation ? (
          <span className="text-[8px] font-black uppercase tracking-tight text-emerald-700">
            + Pro Install
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 line-through">
            ₦{strikePrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-1 flex items-center gap-1.5 sm:gap-2 max-w-xs ml-auto">
        <button
          onClick={onAddToCart}
          className="flex-1 h-10 sm:h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
        >
          <ShoppingCart size={13} className="shrink-0" />
          <span className="truncate">{justAdded ? "Added!" : "Add Cart"}</span>
        </button>

        <button
          onClick={onBuyNow}
          className="flex-1 h-10 sm:h-11 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-sky-600/30 active:scale-95 transition-all"
        >
          <Zap size={13} className="text-sky-200 fill-sky-200 shrink-0" />
          <span className="truncate">Buy Now</span>
        </button>
      </div>
    </div>
  );
}
