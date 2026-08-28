"use client";

import Link from "next/link";
import { ShieldCheck, Wallet, Zap, ShoppingCart, Shield, User as UserIcon, Star, QrCode } from "lucide-react";
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
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const supabase = useMemo(() => createClient(), []);

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
      className="sticky top-0 z-50 border-b border-sky-100 bg-white/95 backdrop-blur-xl transition-all shadow-xs"
      aria-label="Main"
    >
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12 relative z-10">
        <Logo 
          size="sm" 
          href="/" 
          className="transition-opacity hover:opacity-80"
          aria-label="HomeCare home"
        />
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
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[10px] font-extrabold transition-all shadow-2xs"
                title="Your Dashboard"
              >
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                  {user.email ? user.email[0] : 'U'}
                </div>
                <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Dashboard</span>
              </Link>
              <Link
                href="/customer/subscription"
                className="hidden lg:flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                title="Manage Tiers"
              >
                <ShieldCheck size={13} />
                <span className="hidden sm:inline">Subscription</span>
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-black text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-xs"
                >
                  <Shield size={12} className="fill-white" />
                  <span>Admin</span>
                </Link>
              )}
              <div className="block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              href="/auth/customer/login"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 transition-all shadow-2xs"
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
              className="hidden sm:flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 hover:text-sky-700 bg-slate-100/90 hover:bg-sky-50 border border-slate-200/80 transition-all shadow-2xs"
              title="Admin Dashboard"
            >
              <Shield size={12} className="text-sky-600" />
              <span>Admin</span>
            </Link>
          )}

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center h-8.5 w-8.5 rounded-full border border-sky-100 bg-sky-50/60 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-100/60 transition-all"
            title="Shopping Cart"
          >
            <ShoppingCart size={15} />
            {cartCount > 0 && (
              <span suppressHydrationWarning className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sky-600 text-white text-[8.5px] font-extrabold ring-2 ring-white animate-in zoom-in duration-200 shadow-xs">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          <Link
            href="/request"
            className="flex items-center rounded-full px-3.5 sm:px-5 py-2 text-[10.5px] font-black uppercase tracking-wider bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/30 transition-all hover:scale-105"
          >
            {user ? "New Request" : "Book Now"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
