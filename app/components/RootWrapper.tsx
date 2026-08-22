"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { playSound } from "@/lib/audio-fx";
import { toast } from "sonner";
import { Bell } from "lucide-react";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("./CartDrawer"), { ssr: false });
const PromoOverlay = dynamic(() => import("./PromoOverlay"), { ssr: false });
const WhatsAppButton = dynamic(() => import("./WhatsAppButton"), { ssr: false });
const SupportModal = dynamic(() => import("./SupportModal"), { ssr: false });

export default function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Immediate live notification on all devices
    const channel = supabase
      .channel("global-service-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_requests",
        },
        (payload: any) => {
          const newReq = payload.new;
          if (newReq) {
            playSound("scan");
            toast.info("🚨 New Live Service Request!", {
              description: `${newReq.service_type} requested at ${newReq.address.split(",")[0]}`,
              duration: 8000,
              icon: <Bell className="text-sky-500 animate-bounce" />,
              action: {
                label: "View Portal",
                onClick: () => {
                  // Direct to correct portal based on path or let them click
                  if (typeof window !== "undefined") {
                    window.location.href = "/worker/dashboard";
                  }
                }
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Define paths where footer should be hidden (focused/minimalist views)
  const hideFooterPaths = [
    "/", // The Cover Page / Landing
    "/auth/customer/login",
    "/auth/customer/register",
    "/auth/worker/login",
    "/auth/worker/register",
  ];

  const shouldHideFooter = hideFooterPaths.includes(pathname);
  const isStore = pathname.startsWith("/store");

  return (
    <>
      {children}
      {!shouldHideFooter && <Footer />}
      <CartDrawer />
      {isStore && <PromoOverlay />}
      <WhatsAppButton />
      <SupportModal />
    </>
  );
}

