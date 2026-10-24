"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Plus, Check, Minus, Star, ShoppingBag, Flame } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
  onAddStep?: (product: Product) => void;
  isAdded?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  product,
  onAddStep,
  isAdded,
  priority = false,
}: ProductCardProps) {
  const { cartItems, addToCart, updateQuantity, removeFromCart, setIsCartOpen } =
    useCart();
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    setIsCartOpen(true);
  };

  return (
    <div className="group relative flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden">
      {/* Background Subtle Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

      {/* Badge */}
      {product.badge && (
        <div
          className={`absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border shadow-xs transition-transform duration-300 group-hover:scale-105 flex items-center gap-1 ${
            product.badge === "Best Seller"
              ? "bg-amber-50 border-amber-200 text-amber-700"
              : product.badge === "New"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : product.badge === "Hot Deal"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-sky-50 border-sky-200 text-sky-700"
          }`}
        >
          {product.badge === "Hot Deal" && <Flame size={10} className="mr-0.5 fill-rose-600 text-rose-600" />}
          {product.badge}
        </div>
      )}

      <div className="relative z-10 flex flex-col flex-grow">
        <Link href={`/store/${product.id}`} className="block relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 shrink-0 flex items-center justify-center group/image border border-slate-100 cursor-pointer">
          {!imgError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={priority}
              unoptimized={product.image.startsWith("http")}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
              <ShoppingBag size={48} strokeWidth={1} className="opacity-50" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Image Pending</span>
            </div>
          )}

          {/* Category Tag */}
          <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-[9px] font-bold uppercase tracking-widest text-slate-700 shadow-2xs">
            {product.category}
          </div>
        </Link>

        <div className="mt-4 flex flex-col flex-grow">
          <Link href={`/store/${product.id}`}>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 hover:underline">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow">
            {product.description}
          </p>

          {product.sourceOrigin && (
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 font-bold">
              <span className="truncate">⭐ {product.sourceOrigin}</span>
              {product.warrantyMonths && (
                <span className="shrink-0 font-extrabold text-emerald-700 ml-1.5">{product.warrantyMonths}m Warranty</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            {/* Rating */}
            {product.rating ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= Math.round(product.rating!)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  {product.rating} <span className="opacity-70">({product.reviewCount})</span>
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Stock indicator */}
            {product.stock !== undefined && product.stock <= 25 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-600">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                </span>
                <p className="text-[9px] font-bold uppercase tracking-wider">
                  {product.stock} left
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price and Actions */}
      <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
        <p suppressHydrationWarning className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3 flex items-start font-heading">
          <span className="text-sky-600 text-xs sm:text-sm mr-0.5 font-bold mt-1">
            ₦
          </span>
          {product.price.toLocaleString()}
        </p>

        {/* Booking flow button */}
        {onAddStep && (
          <button
            onClick={() => onAddStep(product)}
            className={`w-full flex items-center justify-center gap-2 h-10 rounded-xl border transition-all duration-300 text-[10px] font-bold uppercase tracking-widest cursor-pointer ${
              isAdded
                ? "bg-sky-50 border-sky-300 text-sky-800 shadow-xs"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-500 hover:text-sky-700 hover:bg-sky-50 active:scale-[0.98]"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} strokeWidth={2.5} className="animate-in zoom-in duration-300" /> 
                <span>Added to Job</span>
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} /> 
                <span>Add to Job</span>
              </>
            )}
          </button>
        )}

        {/* Cart Controls */}
        {!onAddStep && (
          <div className="flex flex-col gap-2">
            {quantity > 0 ? (
              <div className="flex items-center flex-1 w-full h-11">
                <div className="flex items-center w-full h-full justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-1 shadow-2xs">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? removeFromCart(product.id)
                        : updateQuantity(product.id, quantity - 1)
                    }
                    className="flex h-full aspect-square items-center justify-center rounded-lg bg-white text-slate-700 hover:text-rose-600 transition-all shadow-xs active:scale-95 border border-slate-200 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="text-sm font-black text-slate-900 select-none w-8 text-center tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="flex h-full aspect-square items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-xs active:scale-95 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="group/btn relative w-full overflow-hidden flex items-center justify-center gap-2 h-11 rounded-xl bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-sky-700 shadow-md shadow-sky-600/20 active:scale-[0.98] cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check size={16} strokeWidth={2.5} className="animate-in zoom-in duration-200" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} className="transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            )}
            {/* View Cart / Checkout button */}
            {quantity > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-sky-300 bg-sky-50 text-[10px] font-extrabold uppercase tracking-widest text-sky-800 hover:bg-sky-100 active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShoppingCart size={12} />
                <span>View Cart & Checkout</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
