"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Wallet,
  Zap,
  ShoppingCart,
  Shield,
  User as UserIcon,
  Star,
  QrCode,
  PlusCircle,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  LayoutDashboard,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import LogoutButton from "./LogoutButton";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const supabase = useMemo(() => createClient(), []);

  // Close mobile menu on page transition without cascading render effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu modal is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user ?? null;
        setUser(authUser);
        
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .maybeSingle();
          if (profile) setRole(profile.role);
        }
      } catch (err) {
        console.error("Nav auth check failed:", err);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          const authUser = session?.user ?? null;
          setUser(authUser);
          if (authUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', authUser.id)
              .maybeSingle();
            if (profile) setRole(profile.role);
          } else {
            setRole(null);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        }
      });
      subscription = sub;
    } catch (err) {
      console.error("Failed to subscribe to auth changes:", err);
    }

    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (err) {
        console.error("Failed to unsubscribe:", err);
      }
    };
  }, [supabase]);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 border-b border-sky-100/60 bg-white/80 backdrop-blur-md transition-all shadow-xs"
      aria-label="Main"
    >
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-12 relative z-10">
        <Logo 
          size="sm" 
          href="/" 
          className="transition-opacity hover:opacity-80 shrink-0"
          aria-label="HomeCare home"
        />
        
        {/* Desktop & Tablet Menu Items */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {pathname !== "/" && (
                <Link
                  href="/customer/wallet"
                  className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  title="Your Wallet"
                >
                  <Wallet size={13} />
                  <span>Wallet</span>
                </Link>
              )}
              <Link
                href="/customer/dashboard"
                className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[10px] font-extrabold transition-all shadow-2xs"
                title="Your Dashboard"
              >
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                  {user.email ? user.email[0] : 'U'}
                </div>
                <span className="uppercase tracking-wider text-[10px]">Dashboard</span>
              </Link>
              <Link
                href="/customer/subscription"
                className="hidden lg:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                title="Manage Tiers"
              >
                <ShieldCheck size={13} />
                <span>Subscription</span>
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-black text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-xs"
                >
                  <Shield size={12} className="fill-white" />
                  <span>Admin</span>
                </Link>
              )}
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/auth/customer/login"
              className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 transition-all shadow-2xs"
            >
              <UserIcon size={13} className="text-sky-600" />
              <span>Login</span>
            </Link>
          )}

          <Link
            href="/qr"
            className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            title="Outdoor Customer QR Code"
          >
            <QrCode size={13} className="text-sky-600" />
            <span>Outdoor QR</span>
          </Link>

          <Link
            href="/reviews"
            className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Star size={13} className="text-sky-600" />
            <span>Reviews</span>
          </Link>

          <Link
            href="/store"
            className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Zap size={13} className="text-sky-600" />
            <span>Store</span>
          </Link>

          {/* Admin Portal Link for non-logged-in/regular users */}
          {role !== 'admin' && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 hover:text-sky-700 bg-slate-100/90 hover:bg-sky-50 border border-slate-200/80 transition-all shadow-2xs"
              title="Admin Dashboard"
            >
              <Shield size={12} className="text-sky-600" />
              <span>Admin</span>
            </Link>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center h-8.5 w-8.5 rounded-full border border-sky-100 bg-sky-50/60 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-100/60 transition-all cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingCart size={15} />
            {cartCount > 0 && (
              <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-600 text-white text-[8.5px] font-extrabold ring-2 ring-white animate-in zoom-in duration-200 shadow-xs">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Primary CTA */}
          <Link
            href="/request"
            className="flex items-center rounded-full px-3.5 sm:px-5 py-2 text-[10.5px] font-black uppercase tracking-wider bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/30 transition-all hover:scale-102 shrink-0"
          >
            {user ? "New Request" : "Book Now"}
          </Link>

          {/* Framer Motion Animated Hamburger Button */}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className={`md:hidden relative flex flex-col items-center justify-center h-9 w-9 rounded-full transition-colors cursor-pointer ml-0.5 focus:outline-hidden ${
              mobileMenuOpen
                ? "bg-sky-50 text-sky-700 ring-2 ring-sky-300/80 shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200/90 text-slate-700"
            }`}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
            <div className="w-4.5 h-3.5 flex flex-col justify-between items-center relative">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                className="w-4.5 h-0.5 rounded-full bg-current block origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.15 }}
                className="w-3.5 h-0.5 rounded-full bg-current block origin-center self-start"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                className="w-4.5 h-0.5 rounded-full bg-current block origin-center"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Redesigned Mobile Navigation Modal with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Scrim */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 top-16 bg-slate-950/45 backdrop-blur-xs z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Modal Sheet */}
            <motion.div
              key="mobile-nav-modal"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed top-16 inset-x-0 z-50 md:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-white/98 backdrop-blur-2xl border-b border-sky-100 shadow-2xl"
            >
              {/* Live Network Dispatch Ribbon */}
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-sky-50 border-b border-sky-100/70 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-slate-800">24/7 Verified Network</span>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-white/80 border border-sky-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                  Lagos · Abuja · PH · 12+ States
                </span>
              </div>

              <div className="px-4 pt-3.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] space-y-3.5 max-w-lg mx-auto">
                {/* 4-Card Navigation Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/store"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group relative p-3 rounded-2xl bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border border-amber-200/70 hover:border-amber-300 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Zap size={16} className="fill-amber-500" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                        Store
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                      Smart Store
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      NEPA surge gear & parts
                    </div>
                  </Link>

                  <Link
                    href="/reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group relative p-3 rounded-2xl bg-gradient-to-br from-sky-50/60 via-white to-sky-50/30 border border-sky-200/70 hover:border-sky-300 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Star size={16} className="fill-amber-400 text-amber-500" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded-md">
                        4.9 ★
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                      Live Reviews
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      3,800+ Verified Nigerian jobs
                    </div>
                  </Link>

                  <Link
                    href="/qr"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group relative p-3 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 border border-indigo-200/70 hover:border-indigo-300 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <QrCode size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded-md">
                        Fast
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Outdoor Gate QR
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Instant scan for repairs
                    </div>
                  </Link>

                  <Link
                    href="/customer/subscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group relative p-3 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 border border-emerald-200/70 hover:border-emerald-300 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                        -20% Off
                      </span>
                    </div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      CarePay Protect
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      Subscribed home coverage
                    </div>
                  </Link>
                </div>

                {/* Customer Account & Escrow Hub */}
                {user ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-xs shrink-0">
                          {user.email ? user.email[0] : "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {user.email || "Verified Member"}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                              Verified
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">CarePay Customer</span>
                          </div>
                        </div>
                      </div>
                      {role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-xs hover:bg-slate-800 shrink-0"
                        >
                          <Shield size={11} className="text-sky-400" />
                          <span>Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/customer/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-800 hover:text-sky-700 transition-colors shadow-2xs"
                      >
                        <LayoutDashboard size={15} className="text-sky-600 shrink-0" />
                        <div className="min-w-0 text-left">
                          <div className="text-[11px] font-bold">Dashboard</div>
                          <div className="text-[9.5px] text-slate-500 font-medium truncate">My Bookings</div>
                        </div>
                      </Link>
                      <Link
                        href="/customer/wallet"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-800 hover:text-emerald-700 transition-colors shadow-2xs"
                      >
                        <Wallet size={15} className="text-emerald-600 shrink-0" />
                        <div className="min-w-0 text-left">
                          <div className="text-[11px] font-bold">Escrow Wallet</div>
                          <div className="text-[9.5px] text-slate-500 font-medium truncate">₦ Protection Vault</div>
                        </div>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <LogoutButton />
                      <Link
                        href="/request"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider shadow-xs transition-colors"
                      >
                        <PlusCircle size={12} />
                        <span>New Booking</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-50 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        CarePay Account
                      </div>
                      <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-600" />
                        <span>Escrow Protected</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/auth/customer/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-800 hover:text-sky-700 font-bold text-xs shadow-2xs transition-all active:scale-[0.98]"
                      >
                        <UserIcon size={14} className="text-sky-600" />
                        <span>Customer Login</span>
                      </Link>
                      <Link
                        href="/auth/worker/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs shadow-2xs transition-all active:scale-[0.98]"
                      >
                        <Wrench size={14} className="text-sky-600" />
                        <span>Artisan Portal</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">New to HomeCare?</span>
                      <Link
                        href="/auth/customer/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-extrabold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                      >
                        <span>Create free account</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Emergency WhatsApp Hotline */}
                <a
                  href="https://wa.me/2349021234567?text=Hello%20CarePay%20HomeCare%2C%20I%20need%20urgent%20artisan%20repair%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-200/80 hover:border-emerald-300 transition-all text-emerald-950 group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle size={16} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <span>Emergency WhatsApp Hotline</span>
                        <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black uppercase">
                          Rapid
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-medium">
                        Direct connection · Response in &lt;3 minutes
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-emerald-700 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </a>

                {/* Primary Booking CTA */}
                <Link
                  href="/request"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-600/25 transition-all active:scale-[0.99]"
                >
                  <Zap size={15} className="fill-white" />
                  <span>{user ? "Book a Verified Artisan" : "Book Repair in 2 Minutes"}</span>
                  <ArrowRight size={15} />
                </Link>

                {/* Trust and Safety Badges */}
                <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-sky-600" />
                    CarePay Escrow
                  </span>
                  <span>•</span>
                  <span>NIN &amp; CAC Verified</span>
                  <span>•</span>
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
