"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  PackageOpen,
  CheckCircle2,
  Truck,
  Tag,
  Wrench,
  Zap,
} from "lucide-react";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/store-data";
import { PRODUCTS } from "@/lib/products";
import { toast } from "sonner";

const ESTIMATED_BASE_DELIVERY = 2000;

export default function CartDrawer() {
  const router = useRouter();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    toggleInstallation,
    clearCart,
    cartTotal,
    itemsSubtotal,
    installationTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
    addToCart,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const isFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : ESTIMATED_BASE_DELIVERY;
  const finalTotal = Math.max(0, cartTotal - discount) + deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_DELIVERY_THRESHOLD) * 100));

  // High-demand, low-friction smart accessories for 1-tap free delivery unlocking
  const freeShippingAddons = PRODUCTS.filter(
    (p) => !cartItems.some((item) => item.product.id === p.id) && p.price <= 15000
  ).slice(0, 4);

  // Total customer savings compared to open market retail
  const totalMarketSavings = cartItems.reduce((acc, item) => {
    const orig = item.product.originalPrice || Math.round((item.product.price * 1.5) / 500) * 500;
    return acc + Math.max(0, orig - item.product.price) * item.quantity;
  }, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (res.success) {
      toast.success("Voucher Applied!", { description: res.message });
      setInputCoupon("");
    } else {
      toast.error(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info("Voucher Removed", {
      description: "Voucher discount was removed from your cart.",
      duration: 2500,
    });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast.info("Removed from Cart", {
      description: `${productName} was removed.`,
      duration: 2500,
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[80] w-full sm:max-w-md h-[100dvh] bg-white border-l border-slate-200 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <ShoppingBag size={20} className="text-sky-600" />
                <h2 className="text-base sm:text-lg font-heading font-extrabold text-slate-900">
                  Shopping Cart
                </h2>
                {cartCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-black text-sky-700">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {cartItems.length > 0 && (
              <div className="px-4 sm:px-6 py-3 bg-sky-50/70 border-b border-sky-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5 text-sky-900">
                    <Truck size={14} className="text-sky-600" />
                    {isFreeDelivery ? (
                      <strong className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" /> You unlocked Free Nigerian Delivery!
                      </strong>
                    ) : (
                      <span>
                        Add <strong>₦{(FREE_DELIVERY_THRESHOLD - cartTotal).toLocaleString()}</strong> for Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-black text-sky-800">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFreeDelivery ? "bg-emerald-600" : "bg-sky-600"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 1-Tap Free Shipping Add-ons Shelf */}
                {!isFreeDelivery && freeShippingAddons.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-sky-100/90">
                    <div className="flex items-center justify-between text-[10px] font-bold text-sky-900 mb-1.5">
                      <span className="flex items-center gap-1 font-extrabold uppercase tracking-wider text-sky-800">
                        <Zap size={11} className="text-amber-500 fill-amber-500" />
                        Add to Unlock Free Shipping:
                      </span>
                      <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                        Save ₦2,000 Delivery
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      {freeShippingAddons.map((addon) => (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            addToCart(addon, 1);
                            toast.success("Added to Cart!", {
                              description: `${addon.name} (₦${addon.price.toLocaleString()}) added!`,
                            });
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-sky-50 border border-sky-200/90 text-[10px] text-slate-800 font-bold shrink-0 transition-all shadow-2xs hover:border-sky-400 group cursor-pointer"
                        >
                          <Plus size={11} className="text-sky-600 group-hover:scale-125 transition-transform" />
                          <span className="truncate max-w-[120px] text-slate-700 font-semibold">{addon.name}</span>
                          <span className="text-sky-700 font-black shrink-0">+₦{addon.price.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HomeCare Certified Installation Banner with Brand Logo */}
            {cartItems.length > 0 && (
              <div className="mx-4 sm:mx-6 mt-3 p-3 bg-gradient-to-r from-slate-900 to-sky-950 rounded-2xl border border-sky-900/40 text-white flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-xl bg-white p-1 border border-white/20 shrink-0 flex items-center justify-center shadow-xs">
                    <Image
                      src="/hclogo.png"
                      alt="HomeCare Brand Logo"
                      width={22}
                      height={22}
                      className="object-contain rounded-md"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase text-white truncate">
                      Home<span className="text-cyan-300">Care</span>™ Certified Installation
                    </p>
                    <p className="text-[9px] text-sky-200/70 font-medium leading-tight truncate">
                      240V NEPA surge testing &amp; escrow guarantee available.
                    </p>
                  </div>
                </div>

                <Link
                  href="/request"
                  onClick={() => setIsCartOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shrink-0 transition-colors"
                >
                  Book Pro
                </Link>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 sm:mb-6 shadow-xs">
                    <PackageOpen
                      size={28}
                      className="text-sky-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-5 sm:mb-6 leading-relaxed">
                    Browse our smart appliances store and add products to your cart.
                  </p>
                  <Link
                    href="/store"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-xs font-black uppercase tracking-widest bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                  >
                    <span>Browse Smart Store</span> <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition-all shadow-2xs space-y-2.5"
                      >
                        <div className="flex gap-3 sm:gap-4">
                          {/* Thumbnail */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                              unoptimized
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {item.product.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span className="text-[9px] sm:text-[10px] text-sky-600 font-bold uppercase tracking-wider">
                                  {item.product.category}
                                </span>
                                {item.withInstallation && (
                                  <span className="text-[9px] font-black uppercase tracking-tight text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    + Pro Install
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="mt-1">
                              <p suppressHydrationWarning className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                                <span className="text-sky-600 text-[11px] mr-0.5 font-bold">
                                  ₦
                                </span>
                                {(
                                  (item.product.price + (item.withInstallation ? (item.installationFee || 7500) : 0)) * item.quantity
                                ).toLocaleString()}
                              </p>
                              {item.withInstallation && (
                                <p className="text-[9px] text-slate-500 font-medium">
                                  Appliance: ₦{(item.product.price * item.quantity).toLocaleString()} + Install: ₦{((item.installationFee || 7500) * item.quantity).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                        {/* Controls */}
                        <div className="flex flex-col items-end justify-between shrink-0 pl-1">
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                            className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>

                          <div className="flex items-center gap-1.5 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
                            <button
                              onClick={() =>
                                item.quantity === 1
                                  ? handleRemoveItem(item.product.id, item.product.name)
                                  : updateQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                              }
                              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:text-rose-600 transition-all shadow-2xs cursor-pointer border border-slate-200"
                            >
                              <Minus size={11} strokeWidth={2.5} />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-slate-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-xs cursor-pointer"
                            >
                              <Plus size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                        </div>

                        {/* Interactive Pro Installation Card with 1-Click Toggle */}
                        <div className={`p-2.5 rounded-xl border transition-all ${
                          item.withInstallation
                            ? "bg-sky-50/90 border-sky-300 ring-1 ring-sky-300/40 shadow-2xs"
                            : "bg-slate-50 border-slate-200/80 hover:border-sky-200"
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                item.withInstallation
                                  ? "bg-sky-600 text-white shadow-xs"
                                  : "bg-white text-slate-500 border border-slate-200"
                              }`}>
                                <Wrench size={13} />
                              </div>
                              <div className="min-w-0 text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] font-black uppercase text-slate-900">
                                    HomeCare™ Installation
                                  </span>
                                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                                    item.withInstallation
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-slate-200 text-slate-700"
                                  }`}>
                                    +₦{((item.installationFee || 7500) * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[9.5px] text-slate-500 font-medium leading-tight truncate mt-0.5">
                                  {item.withInstallation
                                    ? "Verified technician will test & calibrate 240V NEPA surge on delivery."
                                    : "Add vetted technician to mount, wire and calibrate on delivery."}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                toggleInstallation(item.product.id);
                                toast.success(
                                  !item.withInstallation
                                    ? "HomeCare™ Certified Installation Added!"
                                    : "Installation Removed from Item"
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                                item.withInstallation
                                  ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200"
                                  : "bg-sky-600 hover:bg-sky-700 text-white shadow-xs hover:scale-102"
                              }`}
                            >
                              {item.withInstallation ? "Remove" : "+ Add"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Clear Cart */}
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors py-2 cursor-pointer"
                  >
                    Clear All Items
                  </button>
                </>
              )}
            </div>

            {/* Footer / Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6 space-y-4 bg-white shadow-lg">
                
                {/* Voucher Code Box */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  {couponCode ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <Tag size={13} className="text-emerald-600" />
                          <span>
                            Voucher <strong>{couponCode}</strong> applied {discount > 0 ? `(-₦${discount.toLocaleString()})` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[10px] font-extrabold uppercase text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      {["WELCOME2500", "WELCOME2K", "WELCOME", "FIRSTORDER"].includes(couponCode) && cartTotal < 15000 && cartTotal > 0 && (
                        <p className="text-[10px] text-emerald-700 font-medium">
                          15% off applied (-₦{discount.toLocaleString()}) · Add ₦{(15000 - cartTotal).toLocaleString()} more for full ₦2,500 flat discount!
                        </p>
                      )}
                      {["FREEINSTALL", "INSTALLFREE"].includes(couponCode) && installationTotal === 0 && (
                        <p className="text-[10px] text-amber-700 font-medium">
                          Toggle HomeCare™ Installation on any item to waive the ₦7,500 fee!
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Voucher code (e.g. WELCOME2500)"
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs uppercase font-mono placeholder:normal-case placeholder:font-sans outline-none focus:border-sky-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 font-medium">Tap to apply:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const res = applyCoupon("WELCOME2500");
                            if (res.success) toast.success("Voucher Applied!", { description: res.message });
                          }}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          🏷️ WELCOME2500 (-₦2,500)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const res = applyCoupon("SAVE10");
                            if (res.success) toast.success("Voucher Applied!", { description: res.message });
                          }}
                          className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          🏷️ SAVE10 (-10%)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Appliances Subtotal</span>
                    <span suppressHydrationWarning className="font-bold text-slate-900">
                      ₦{itemsSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {installationTotal > 0 && (
                    <div className="flex items-center justify-between text-xs sm:text-sm text-sky-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Wrench size={13} className="text-sky-600" />
                        HomeCare™ Pro Installation
                      </span>
                      <span>+₦{installationTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> Voucher ({couponCode})
                      </span>
                      <span>-₦{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-500 font-medium">Delivery</span>
                    <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                      {deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  {totalMarketSavings > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 font-extrabold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200/70">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                        Direct Factory Savings
                      </span>
                      <span>-₦{totalMarketSavings.toLocaleString()} vs Retail</span>
                    </div>
                  )}

                  <div className="h-px bg-slate-200 my-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Estimated Total
                    </span>
                    <span suppressHydrationWarning className="text-lg sm:text-xl font-black text-sky-600 font-heading">
                      ₦{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/store/checkout");
                  }}
                  className="flex items-center justify-center gap-2 w-full h-12 sm:h-13 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-sky-600/30 active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span> <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-sky-600 transition-colors py-1 cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
