"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Wallet, LogOut, ShoppingBag, ShoppingCart, LogIn, Shield, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.warn("Mobile nav auth check failed:", err);
      }
    };
    checkUser();

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        try {
          setUser(session?.user ?? null);
        } catch (err) {
          console.error("Mobile nav auth state change error:", err);
        }
      });
      subscription = sub;
    } catch (err) {
      console.error("Mobile nav failed to subscribe to auth changes:", err);
    }

    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (err) {
        console.error("Mobile nav failed to unsubscribe:", err);
      }
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const toastId = toast.loading("Logging out...");
      
      // Perform signOut via Supabase with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Logout timeout")), 5000)
      );
      
      await Promise.race([signOutPromise, timeoutPromise]);

      toast.success("Logged out", { id: toastId });
      
      // Clear storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Hard redirect is the most reliable way to clear all React state and caches
      window.location.href = "/";
    } catch (err) {
      console.error("Mobile logout failed:", err);
      window.location.href = '/';
    }
  };

  // Base nav items visible to everyone
  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Reviews", href: "/reviews", icon: Star },
    { label: "Store", href: "/store", icon: ShoppingBag },
    { label: "Admin", href: "/admin", icon: Shield },
  ];

  // Add logged-in or guest items
  if (user) {
    navItems.push(
      { label: "Wallet", href: "/customer/wallet", icon: Wallet },
      { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    );
  } else {
    navItems.push(
      { label: "Login", href: "/auth/customer/login", icon: LogIn },
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-t border-sky-100 px-4 pb-safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-between h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-sky-600 font-extrabold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <item.icon 
                size={20} 
                fill={isActive ? "currentColor" : "none"} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}

        {/* Cart button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span suppressHydrationWarning className="absolute -top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-white text-[8px] font-extrabold">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
        </button>

        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
