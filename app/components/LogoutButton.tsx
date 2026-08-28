"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useMemo } from "react";

export default function LogoutButton() {
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      // Fire local sign out in background without blocking navigation
      supabase.auth.signOut({ scope: "local" }).catch(() => {});
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all shadow-2xs cursor-pointer"
      title="Logout"
    >
      <LogOut size={12} />
      <span>Logout</span>
    </button>
  );
}

