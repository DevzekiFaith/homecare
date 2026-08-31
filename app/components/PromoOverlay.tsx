"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, Flame, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";

const PROMO_INTERVAL_MS = 60000; // Show a new product every 60 seconds

// Get a pool of featured products (prioritize badged items, then all)
function getPromoPool() {
  const badged = PRODUCTS.filter((p) => p.badge);
  return badged.length >= 3 ? badged : PRODUCTS;
}

export default function PromoOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const pool = getPromoPool();
    return Math.floor(Math.random() * pool.length);
  });
  const { addToCart, setIsCartOpen } = useCart();

  const pool = getPromoPool();
  const product = pool[currentIndex % pool.length];

  // Show the first promo after initial delay — DISABLED for now to prevent "stiff" UI
  /*
  useEffect(() => {
    const firstTimer = setTimeout(() => {
      setIsVisible(true);
    }, PROMO_DELAY_MS);

    return () => clearTimeout(firstTimer);
  }, [pool.length]);
  */

  // Set up the rotation interval — after dismiss, show next product after interval
  useEffect(() => {
    if (isVisible) return; // Don't start interval while popup is showing

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % pool.length);
      setIsVisible(true);
    }, PROMO_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isVisible, pool.length]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleAddToCart = useCallback(() => {
    addToCart(product, 1);
    setIsVisible(false);
    setIsCartOpen(true);
  }, [product, addToCart, setIsCartOpen]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl border border-slate-700/80 bg-slate-900 shadow-[0_0_60px_rgba(2,132,199,0.25)] text-slate-100">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Top Banner */}
              <div className="relative bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-sky-500/20 px-6 py-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Flame
                    size={16}
                    className="text-sky-400 animate-pulse"
                  />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-300">
                    Featured Deal — Limited Stock
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col sm:flex-row gap-0">
                {/* Image */}
                <div className="relative w-full sm:w-1/2 aspect-video sm:aspect-auto sm:min-h-[280px] bg-slate-800/50 shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 250px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent sm:bg-gradient-to-r" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-bold uppercase tracking-widest text-rose-400 backdrop-blur-md">
                      🔥 {product.badge}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-400 mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-heading font-extrabold text-white mb-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={
                              star <= Math.round(product.rating!)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-600"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span suppressHydrationWarning className="text-2xl font-extrabold text-white">
                      <span className="text-sky-400 text-base mr-0.5 font-black">
                        ₦
                      </span>
                      {product.price.toLocaleString()}
                    </span>
                    {product.stock && product.stock <= 20 && (
                      <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:from-sky-700 active:to-blue-700 text-white text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-sky-600/30 cursor-pointer border border-sky-400/30"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                    <Link
                      href="/store"
                      onClick={handleDismiss}
                      className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase tracking-[0.15em] text-white transition-all px-5 cursor-pointer shadow-sm"
                    >
                      View Store <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
