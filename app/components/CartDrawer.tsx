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
  const [showCouponInput, setShowCouponInput] = useState(false);
  const isFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : ESTIMATED_BASE_DELIVERY;
  const finalTotal = Math.max(0, cartTotal - discount) + deliveryFee;
  const progressPercent = Math.min(100, Math.round((cartTotal / FREE_DELIVERY_THRESHOLD) * 100));

  // High-demand, low-friction smart accessories for 1-tap free delivery unlocking
  const freeShippingAddons = PRODUCTS.filter(
    (p) => !cartItems.some((item) => item.product.id === p.id) && p.price <= 15000
  ).slice(0, 4);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (res.success) {
      toast.success("Voucher Applied!", { description: res.message });
      setInputCoupon("");
      setShowCouponInput(false);
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
      duration: 2000,
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
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-sky-600" />
                <h2 className="text-sm sm:text-base font-heading font-extrabold text-slate-900">
                  Shopping Cart
                </h2>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-black text-sky-700">
                    {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-600 transition-colors px-1 cursor-pointer"
                    title="Clear Cart"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Free Shipping Progress Bar */}
            {cartItems.length > 0 && (
              <div className="px-4 py-2 bg-sky-50/70 border-b border-sky-100 shrink-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-sky-900 truncate">
                    <Truck size={13} className="text-sky-600 shrink-0" />
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1 truncate">
                        <CheckCircle2 size={12} className="text-emerald-600 shrink-0" /> Free Nigerian Delivery Unlocked!
                      </span>
                    ) : (
                      <span className="truncate">
                        Add <strong className="text-sky-900">₦{(FREE_DELIVERY_THRESHOLD - cartTotal).toLocaleString()}</strong> for Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-black text-sky-800 shrink-0 ml-1">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFreeDelivery ? "bg-emerald-600" : "bg-sky-600"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 1-Tap Free Shipping Add-ons Shelf */}
                {!isFreeDelivery && freeShippingAddons.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-sky-100/90">
                    <div className="flex items-center justify-between text-[9.5px] font-bold text-sky-900 mb-1">
                      <span className="flex items-center gap-1 font-extrabold uppercase tracking-wider text-sky-800">
                        <Zap size={10} className="text-amber-500 fill-amber-500" />
                        Quick Add for Free Delivery:
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
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white hover:bg-sky-50 border border-sky-200/90 text-[9.5px] text-slate-800 font-bold shrink-0 transition-all shadow-2xs hover:border-sky-400 group cursor-pointer"
                        >
                          <Plus size={10} className="text-sky-600 group-hover:scale-125 transition-transform" />
                          <span className="truncate max-w-[110px] text-slate-700 font-semibold">{addon.name}</span>
                          <span className="text-sky-700 font-black shrink-0">+₦{addon.price.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items List - Full Scroll View */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center pb-16">
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-xs">
                    <PackageOpen
                      size={28}
                      className="text-sky-600"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    Your cart is empty
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">
                    Browse our smart appliances store and add products to your cart.
                  </p>
                  <Link
                    href="/store"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
                  >
                    <span>Browse Smart Store</span> <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, x: 50 }}
                      className="p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 transition-all shadow-2xs space-y-2"
                    >
                      <div className="flex gap-2.5 sm:gap-3 items-center">
                        {/* Thumbnail */}
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[9px] text-sky-600 font-bold uppercase tracking-wider">
                              {item.product.category}
                            </span>
                            {item.withInstallation && (
                              <span className="text-[8.5px] font-black uppercase tracking-tight text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                + Pro Install
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-baseline justify-between gap-1">
                            <p suppressHydrationWarning className="text-xs sm:text-sm font-black text-slate-900 font-heading">
                              <span className="text-sky-600 text-[11px] mr-0.5 font-bold">
                                ₦
                              </span>
                              {(
                                (item.product.price + (item.withInstallation ? (item.installationFee || 7500) : 0)) * item.quantity
                              ).toLocaleString()}
                            </p>
                            {item.quantity > 1 && (
                              <span className="text-[9px] text-slate-400 font-medium">
                                ₦{(item.product.price + (item.withInstallation ? (item.installationFee || 7500) : 0)).toLocaleString()} ea
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Delete Controls */}
                        <div className="flex flex-col items-end justify-between shrink-0 pl-1 self-stretch">
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                            className="flex h-5 w-5 items-center justify-center rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200 mt-auto">
                            <button
                              onClick={() =>
                                item.quantity === 1
                                  ? handleRemoveItem(item.product.id, item.product.name)
                                  : updateQuantity(
                                      item.product.id,
                                      item.quantity - 1
                                    )
                              }
                              className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-white text-slate-700 hover:text-rose-600 transition-all shadow-2xs cursor-pointer border border-slate-200"
                            >
                              <Minus size={10} strokeWidth={2.5} />
                            </button>
                            <span className="w-4 text-center text-xs font-black text-slate-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-xs cursor-pointer"
                            >
                              <Plus size={10} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Compact 1-line HomeCare Pro Installation Toggle */}
                      <div
                        onClick={() => {
                          toggleInstallation(item.product.id);
                          toast.success(
                            !item.withInstallation
                              ? "HomeCare™ Certified Installation Added!"
                              : "Installation Removed from Item"
                          );
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                          item.withInstallation
                            ? "bg-sky-50 border-sky-300 text-sky-900 font-bold"
                            : "bg-slate-50/80 border-slate-200 text-slate-600 hover:border-sky-300 hover:bg-sky-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Wrench size={12} className={item.withInstallation ? "text-sky-600 shrink-0" : "text-slate-400 shrink-0"} />
                          <span className="truncate text-[10.5px]">HomeCare™ Installation (+₦{(item.installationFee || 7500).toLocaleString()})</span>
                        </div>
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md shrink-0 ml-1.5 ${
                          item.withInstallation
                            ? "bg-sky-600 text-white shadow-2xs"
                            : "bg-white text-slate-600 border border-slate-200"
                        }`}>
                          {item.withInstallation ? "Added ✓" : "+ Add"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Compact Bottom Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 p-3.5 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-4 space-y-2.5 bg-white shadow-lg shrink-0">
                
                {/* Collapsible Voucher Bar */}
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                  {couponCode ? (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Tag size={12} className="text-emerald-600" />
                        <span className="text-[11px]">
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
                  ) : (
                    <div>
                      {!showCouponInput ? (
                        <button
                          type="button"
                          onClick={() => setShowCouponInput(true)}
                          className="flex items-center justify-between w-full text-[11px] font-bold text-sky-700 hover:text-sky-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Tag size={12} /> Have a promo code or voucher?
                          </span>
                          <span className="text-[10px] font-black uppercase text-sky-600 hover:underline">+ Add</span>
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                            <input
                              type="text"
                              value={inputCoupon}
                              onChange={(e) => setInputCoupon(e.target.value)}
                              placeholder="e.g. WELCOME2500"
                              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] uppercase font-mono placeholder:normal-case outline-none focus:border-sky-500"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Apply
                            </button>
                          </form>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                const res = applyCoupon("WELCOME2500");
                                if (res.success) toast.success("Voucher Applied!", { description: res.message });
                              }}
                              className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold cursor-pointer"
                            >
                              🏷️ WELCOME2500 (-₦2,500)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const res = applyCoupon("SAVE10");
                                if (res.success) toast.success("Voucher Applied!", { description: res.message });
                              }}
                              className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[9px] font-bold cursor-pointer"
                            >
                              🏷️ SAVE10 (-10%)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Appliances Subtotal</span>
                    <span suppressHydrationWarning className="font-bold text-slate-900">
                      ₦{itemsSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {installationTotal > 0 && (
                    <div className="flex items-center justify-between text-sky-800 font-bold">
                      <span className="flex items-center gap-1">
                        <Wrench size={11} className="text-sky-600" /> Pro Installation
                      </span>
                      <span>+₦{installationTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag size={11} /> Discount ({couponCode})
                      </span>
                      <span>-₦{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Delivery</span>
                    <span className={`font-bold ${deliveryFee === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                      {deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="h-px bg-slate-200 my-1" />
                  
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      Estimated Total
                    </span>
                    <span suppressHydrationWarning className="text-base sm:text-lg font-black text-sky-600 font-heading">
                      ₦{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/store/checkout");
                  }}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-sky-600/25 active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span> <ArrowRight size={15} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
