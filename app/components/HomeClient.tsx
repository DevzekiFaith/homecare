"use client";

import Image from "next/image";
import { useState } from "react";
import SmartStorePreviewSection from "./landing/SmartStorePreviewSection";
import Hero from "./Hero";
import ServiceGrid from "./ServiceGrid";
import QuickRequestForm from "./QuickRequestForm";
import { Wrench, Zap, Hammer, Armchair, Snowflake, Paintbrush, PenTool } from "lucide-react";

const PRO_IMAGES = [
  { src: "/su10.jpg", alt: "Electrician at work" },
  { src: "/su11.jpg", alt: "Handyman with tools" },
  { src: "/su12.jpg", alt: "Professional repairing" },
];

const SERVICES = [
  { label: "Plumber", icon: Wrench, price: "₦15,000 Start", time: "2-4 hrs", image: "/services/plumber.jpg" },
  { label: "Electrician", icon: Zap, price: "₦18,000 Start", time: "2-5 hrs", image: "/services/electrician.jpg" },
  { label: "Carpenter", icon: Hammer, price: "₦20,000 Start", time: "3-6 hrs", image: "/services/carpenter.jpg" },
  { label: "Furniture Maker", icon: Armchair, price: "₦25,000 Start", time: "4-8 hrs", image: "/services/furniture.jpg" },
  { label: "AC & Fridge Repair", icon: Snowflake, price: "₦20,000 Start", time: "2-4 hrs", image: "/services/ac-repair.jpg" },
  { label: "Painter", icon: Paintbrush, price: "₦22,000 Start", time: "4-8 hrs", image: "/services/painter.jpg" },
  { label: "General Handyman", icon: PenTool, price: "₦15,000 Start", time: "2-5 hrs", image: "/services/handyman.jpg" },
];

const JOBS_COMPLETED = 85;

export default function HomeClient() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased w-full overflow-x-hidden">
      <Hero />
      <ServiceGrid
        services={SERVICES}
        selectedService={selectedService}
        onSelectService={setSelectedService}
      />

      <SmartStorePreviewSection />

      <section className="pt-16 sm:pt-24 pb-36 relative bg-background border-t border-zinc-200/50 dark:border-zinc-800/50">
        {/* Subtle orange glow overlay for layout integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-16 relative z-10">
          <div className="space-y-16">
            <QuickRequestForm
              selectedService={selectedService}
              onServiceChange={setSelectedService}
              services={SERVICES}
            />

            <div className="glass-panel glass-panel-hover rounded-3xl p-8 sm:p-10 border-orange-500/20 shadow-[0_8px_32px_-4px_rgba(249,115,22,0.15)] bg-gradient-to-br from-orange-500/10 to-transparent">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Refer & Get ₦500</h2>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
                Share HomeCare with your community safely, and both you and your friend get <span className="text-brand-primary font-bold">₦500 credit</span> on your next booking.
              </p>
              <button
                type="button"
                onClick={() => {
                  const shareText = encodeURIComponent("Check out HomeCare - book handymen in 2 mins! Book it. Fix it. Done.");
                  const shareUrl = window.location.origin;
                  if (navigator.share) {
                    navigator.share({ title: "HomeCare", text: shareText, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    alert("Referral link copied!");
                  }
                }}
                className="h-12 px-8 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-sky-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                Share Link
              </button>
            </div>

            <div 
               id="faq" 
               className="space-y-8 glass-panel p-8 sm:p-10 rounded-3xl"
            >
              <h2 className="text-2xl font-heading font-bold text-foreground">Common Questions</h2>
              <div className="space-y-6 max-w-2xl">
                <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6 group">
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">How do I pay?</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Pay to our Globus Bank account before the job. Bank details are shown after your request.</p>
                </div>
                <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6 group">
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">How quickly will someone come?</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Usually same-day or next day, confirmed within minutes on WhatsApp.</p>
                </div>
                <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 group">
                  <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-brand-primary transition-colors">Are workers verified?</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">Yes. All workers register with their NIN for tracking and verification.</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-12 relative pt-12 lg:pt-0">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">Pros at work</h2>
              <div className="grid grid-cols-3 gap-3">
                {PRO_IMAGES.map(({ src, alt }) => (
                  <div 
                    key={src} 
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 group"
                  >
                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mix-blend-color" />
                    <Image src={src} alt={alt} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="120px" loading="lazy" quality={75} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl glass-panel glass-panel-hover p-8 sm:p-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-6">How it works</h2>
              <ol className="space-y-8">
                <li className="flex gap-4 group">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] group-hover:bg-brand-primary group-hover:text-white transition-all">1</span>
                  <div className="pt-1">
                    <p className="text-base font-bold text-foreground">Submit Details</p>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Description & location.</p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] group-hover:bg-brand-primary group-hover:text-white transition-all">2</span>
                  <div className="pt-1">
                    <p className="text-base font-bold text-foreground">Match & Confirm</p>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Pro confirms visit & price.</p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] group-hover:bg-brand-primary group-hover:text-white transition-all">3</span>
                  <div className="pt-1">
                    <p className="text-base font-bold text-foreground">Pay & Fix</p>
                    <p className="text-sm font-medium text-zinc-500 mt-1">Pay to bank, job gets done.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="rounded-3xl glass-panel bg-gradient-to-tr from-brand-primary to-rose-500 p-8 shadow-[0_12px_40px_-8px_rgba(249,115,22,0.6)] text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" />
              <p className="text-center text-xs font-bold text-white/80 relative z-10">
                <span suppressHydrationWarning className="text-4xl font-heading font-extrabold text-white drop-shadow-md">
                  {JOBS_COMPLETED.toLocaleString()}+
                </span>
                <br />
                <span className="text-[10px] uppercase tracking-widest mt-2 block opacity-90">Jobs completed monthly</span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
