"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  MapPin,
  TrendingUp,
  ArrowLeft,
  ShoppingBag,
  Lock,
  ShieldCheck,
  Home,
  Star,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import AdminLockScreen from "@/app/components/admin/AdminLockScreen";
import { isAdminUnlocked, lockAdmin } from "@/lib/admin-auth";
import { playSound } from "@/lib/audio-fx";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/jobs", label: "Jobs", icon: ClipboardList },
  { href: "/admin/workers", label: "Workers", icon: Users },
  { href: "/admin/store-orders", label: "Store Orders", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", icon: ShieldCheck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/cities", label: "Cities", icon: MapPin },
  { href: "/admin/surge", label: "Surge Pricing", icon: TrendingUp },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(isAdminUnlocked());
  }, []);

  const handleLock = () => {
    playSound("click");
    lockAdmin();
    setUnlocked(false);
  };

  // Prevent flash of content during hydration
  if (unlocked === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Biometric & Passcode Lock Guard */}
      {!unlocked && (
        <AdminLockScreen onUnlock={() => setUnlocked(true)} />
      )}

      {/* Subtle Sky Ambient Glow */}
      <div className="fixed inset-x-0 -top-[20%] -z-10 h-[60%] w-full rounded-full bg-sky-200/40 opacity-70 blur-[130px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
              title="Go back to previous page"
            >
              <ArrowLeft size={14} className="text-sky-600" />
              Go Back
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors shadow-2xs"
            >
              <Home size={14} className="text-sky-600" />
              Main Site
            </Link>
            <span className="text-slate-300 font-bold hidden sm:inline">|</span>
            <span className="text-xs font-black uppercase tracking-wider text-sky-600 hidden sm:inline">
              HomeCare Admin Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLock}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all shadow-xs cursor-pointer"
              title="Lock Admin Console"
            >
              <Lock size={13} />
              Lock Console
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-8 px-6 py-8 lg:flex-row flex-col">
        {/* Sidebar nav with brand Blue Buttons */}
        <nav className="flex-shrink-0 w-full lg:w-60 mb-6 lg:mb-0">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <p className="hidden lg:block px-3 py-1.5 text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Navigation
            </p>
            <ul className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-none">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href} className="shrink-0 lg:shrink lg:w-full">
                    <Link
                      href={href}
                      className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                        active
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 font-black"
                          : "text-slate-700 font-bold hover:bg-sky-50 hover:text-sky-700"
                      }`}
                    >
                      <Icon size={16} className={active ? "text-white" : "text-sky-600"} />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Page content */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}


