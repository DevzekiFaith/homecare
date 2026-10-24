"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, Product } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import {
  Search,
  ShoppingCart,
  ArrowLeft,
  ArrowUpDown,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  Compass,
  X,
  Star,
  CheckCircle2,
  Gift,
  BadgeCheck,
  Flame,
  Droplets,
  Lock,
  BatteryCharging,
  Plus,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

type SortOption = "default" | "price-asc" | "price-desc" | "rating" | "newest";
type PriceFilter = "all" | "under50k" | "50k-150k" | "above150k";

interface SpotlightItem {
  productId: string;
  tabLabel: string;
  tagline: string;
  sweetNote: string;
  badge: string;
  strikePrice: number;
}

const SPOTLIGHT_DEVICES: SpotlightItem[] = [
  {
    productId: "sp-power-1",
    tabLabel: "Surge Guard",
    tagline: "Instant 0.01s Voltage Cutoff",
    sweetNote: "Trips crazy NEPA voltage surges before they blow your fridge, TV, or inverter battery.",
    badge: "Bestseller #1",
    strikePrice: 13500,
  },
  {
    productId: "sp-power-6",
    tabLabel: "65W Laptop Bank",
    tagline: "40,000mAh Power Reserve",
    sweetNote: "Powers MacBooks & phones through prolonged blackout. Remote work essential in Nigeria.",
    badge: "Work Anywhere",
    strikePrice: 38000,
  },
  {
    productId: "sp-sec-1",
    tabLabel: "AI Smart Lock",
    tagline: "Fingerprint & Card AI Entry",
    sweetNote: "Keyless freedom for your family. No more locked doors, rusty padlocks, or lost key panic.",
    badge: "Security Upgrade",
    strikePrice: 95000,
  },
];

const QUICK_TAGS = [
  { label: "⚡ Surge Plugs", query: "surge" },
  { label: "🔋 65W Laptop Bank", query: "power bank" },
  { label: "💧 Tank Water Monitor", query: "water" },
  { label: "🔐 Biometric Locks", query: "lock" },
  { label: "❄️ Rechargeable Fans", query: "fan" },
  { label: "💡 Touch Switches", query: "switch" },
];

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const { cartCount, cartTotal, setIsCartOpen, addToCart } = useCart();

  const categories = [
    "All",
    "Power & Protection",
    "Fans & Cooling",
    "Water Automation",
    "Security & Access",
    "Smart Lighting",
    "Kitchen Essentials",
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: PRODUCTS.length };
    for (const p of PRODUCTS) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredProducts = useMemo(() => {
    let results = PRODUCTS.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      let matchesPrice = true;
      if (priceFilter === "under50k") matchesPrice = product.price < 50000;
      else if (priceFilter === "50k-150k") matchesPrice = product.price >= 50000 && product.price <= 150000;
      else if (priceFilter === "above150k") matchesPrice = product.price > 150000;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case "price-asc":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        results = [...results].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        break;
      case "newest":
        results = [...results].sort((a, b) =>
          (a.badge === "New" ? -1 : 1) - (b.badge === "New" ? -1 : 1)
        );
        break;
    }

    return results;
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  const activeSpotlightConfig = SPOTLIGHT_DEVICES[spotlightIndex];
  const activeProduct = PRODUCTS.find((p) => p.id === activeSpotlightConfig.productId) || PRODUCTS[0];

  const handleSpotlightAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success("Added to Cart!", {
      description: `${product.name} (₦${product.price.toLocaleString()}) added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
      duration: 3500,
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* ── FUTURISTIC HIGH-CONVERTING HERO BANNER ── */}
      <section className="relative bg-gradient-to-b from-[#030712] via-[#09152b] to-[#040d1a] text-white pt-6 sm:pt-8 pb-12 sm:pb-16 px-3.5 sm:px-6 rounded-b-[36px] md:rounded-b-[56px] shadow-2xl shadow-sky-950/40 border-b border-sky-900/30 overflow-hidden">
        {/* Ambient Glowing Meshes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf807_1px,transparent_1px),linear-gradient(to_bottom,#38bdf807_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          
          {/* 1. Top Live Logistics Status Ticker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2 px-3.5 sm:px-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-semibold text-sky-100/90 mb-5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold uppercase tracking-widest text-emerald-300">Live Logistics:</span>
              <span className="truncate">24-48h State Dispatch to Lagos, Abuja, Port Harcourt &amp; Ibadan</span>
            </div>

            <div className="flex items-center gap-2 text-sky-200">
              <span className="hidden md:inline text-white/30">•</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                <Gift size={12} className="text-amber-300" />
                Voucher <strong className="font-mono text-white">WELCOME2500</strong> for ₦2,500 OFF
              </span>
            </div>
          </div>

          {/* 2. Top Navigation & Cart Bar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-300 hover:text-white transition-colors w-fit group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                <BadgeCheck size={13} className="text-emerald-400" />
                <span>Verified Nigerian Hardware Hub</span>
              </div>

              <Link
                href="/store/track"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 text-[11px] font-bold transition-all border border-white/20 cursor-pointer"
              >
                <Compass size={13} />
                <span>Track Order</span>
              </Link>

              {/* Cart Header Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-600/30 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ShoppingCart size={15} />
                {cartCount > 0 ? (
                  <span>Cart · ₦{cartTotal.toLocaleString()}</span>
                ) : (
                  <span>Cart</span>
                )}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sky-900 text-[9px] font-black ring-2 ring-sky-600 animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 3. Main Hero Dual-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column (7 cols): Hero Copy & Integrated Search */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-xs">
                <Zap size={12} className="text-cyan-400 fill-cyan-400 animate-pulse" />
                <span>Smart Living Architecture · Built For Nigeria</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase font-heading tracking-tight text-white leading-tight">
                UPGRADE YOUR HOME. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300">
                  ZERO NEPA HEADACHES.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-sky-100/85 font-medium leading-relaxed max-w-2xl">
                Never worry about crazy high voltage blowing your freezer or running out of water unannounced. We curate genuine smart sockets, 65W laptop power banks, ultrasonic water tank monitors, and biometric locks calibrated for Nigerian 240V power swings — backed by CarePay Escrow and 1-click certified electrician installation.
              </p>

              {/* 4 Sweet Relief Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold text-sky-100">
                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black">
                    <Zap size={13} /> 0.01s Trip
                  </div>
                  <span className="text-[10px] text-sky-200/70 font-medium leading-tight block mt-0.5">
                    Instant NEPA surge cutoff
                  </span>
                </div>

                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black">
                    <Droplets size={13} /> Tank Alerts
                  </div>
                  <span className="text-[10px] text-sky-200/70 font-medium leading-tight block mt-0.5">
                    Zero dry taps on phone
                  </span>
                </div>

                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black">
                    <Lock size={13} /> AI Biometric
                  </div>
                  <span className="text-[10px] text-sky-200/70 font-medium leading-tight block mt-0.5">
                    Zero lost keys or anxiety
                  </span>
                </div>

                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black">
                    <BatteryCharging size={13} /> 65W Backup
                  </div>
                  <span className="text-[10px] text-sky-200/70 font-medium leading-tight block mt-0.5">
                    MacBook &amp; phone reserve
                  </span>
                </div>
              </div>

              {/* Integrated Futuristic Search Bar */}
              <div className="pt-2 space-y-2.5">
                <div className="relative max-w-xl group/search">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/70 group-focus-within/search:text-cyan-300 transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search smart sockets, surge plugs, laptop power banks, locks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-sky-400/30 bg-white/[0.09] backdrop-blur-xl pl-11 sm:pl-12 pr-10 py-3.5 sm:py-4 text-xs sm:text-sm text-white placeholder:text-sky-200/50 outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/20 shadow-xl transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-300/60 hover:text-white p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Quick Discovery Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-sky-200">
                  <span className="text-white/40 uppercase tracking-widest text-[9px] mr-1">Popular:</span>
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => {
                        setSearchQuery(tag.query);
                        const el = document.getElementById("store-catalog");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-cyan-400/20 hover:text-cyan-200 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Interactive Futuristic Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                {/* Spotlight Switcher Tabs */}
                <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 mb-4">
                  {SPOTLIGHT_DEVICES.map((dev, idx) => (
                    <button
                      key={dev.productId}
                      onClick={() => setSpotlightIndex(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer truncate ${
                        spotlightIndex === idx
                          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                          : "text-sky-200/70 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {dev.tabLabel}
                    </button>
                  ))}
                </div>

                {/* Selected Spotlight Device Presentation */}
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900/60 border border-white/15">
                    <Image
                      src={activeProduct.image}
                      alt={activeProduct.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                    {/* Floating Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                      <Flame size={10} className="fill-amber-400 text-amber-400" />
                      <span>{activeSpotlightConfig.badge}</span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-white border border-white/20 flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>{activeProduct.rating || 4.9}</span>
                      <span className="text-white/50 text-[9px]">({activeProduct.reviewCount || 100}+)</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white truncate font-heading">
                      {activeProduct.name}
                    </h3>
                    <p className="text-xs text-sky-100/80 font-medium leading-relaxed mt-1 line-clamp-2">
                      {activeSpotlightConfig.sweetNote}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/10">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-cyan-300 font-heading">
                          ₦{activeProduct.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-sky-300/50 line-through">
                          ₦{activeSpotlightConfig.strikePrice.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={10} /> In Stock · Ready to Dispatch
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpotlightAddToCart(activeProduct)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus size={14} strokeWidth={3} />
                      <span>Add to Cart</span>
                    </button>
                  </div>

                  <Link
                    href={`/store/${activeProduct.id}`}
                    className="block text-center text-[11px] font-extrabold uppercase tracking-wider text-sky-300 hover:text-white transition-colors"
                  >
                    View Full Product Specs &amp; Details →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* 4. Sweet Bottom Value Props Bar */}
          <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sky-100">
            <div className="flex items-start gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="p-2 rounded-xl bg-sky-500/20 text-cyan-300 shrink-0">
                <Truck size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">24-48h State Dispatch</h4>
                <p className="text-[10px] text-sky-200/70 font-medium leading-tight mt-0.5">
                  Lagos, Abuja, PH &amp; 33 states delivery
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">CarePay Escrow Safety</h4>
                <p className="text-[10px] text-sky-200/70 font-medium leading-tight mt-0.5">
                  Payment held until unboxed &amp; approved
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                <Wrench size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">1-Click Pro Electrician</h4>
                <p className="text-[10px] text-sky-200/70 font-medium leading-tight mt-0.5">
                  Pair with verified HomeCare technician
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <BadgeCheck size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Up to 24m Warranty</h4>
                <p className="text-[10px] text-sky-200/70 font-medium leading-tight mt-0.5">
                  Real replacement &amp; WhatsApp support
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Store Catalog Content */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-12 py-8 sm:py-10 pb-36 relative z-10 space-y-6">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search appliances (surge protectors, blenders, water heaters, locks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            {/* Sort selector */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-200 bg-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-700 shadow-xs w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5 text-sky-700">
                <ArrowUpDown size={13} />
                <span className="text-[10px] text-slate-400 font-bold hidden xs:inline">Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent outline-none text-slate-800 cursor-pointer pr-2 text-[11px] sm:text-xs font-bold"
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Filter Chips */}
        <div className="flex overflow-x-auto pb-1.5 sm:pb-0 gap-1.5 sm:gap-2 scrollbar-none items-center text-xs font-bold text-slate-600">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden sm:inline">Price:</span>
          <button
            onClick={() => setPriceFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
              priceFilter === "all" ? "bg-sky-600 text-white shadow-xs" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            All Prices
          </button>
          <button
            onClick={() => setPriceFilter("under50k")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
              priceFilter === "under50k" ? "bg-sky-600 text-white shadow-xs" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            &lt; ₦50k
          </button>
          <button
            onClick={() => setPriceFilter("50k-150k")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
              priceFilter === "50k-150k" ? "bg-sky-600 text-white shadow-xs" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            ₦50k - ₦150k
          </button>
          <button
            onClick={() => setPriceFilter("above150k")}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 cursor-pointer ${
              priceFilter === "above150k" ? "bg-sky-600 text-white shadow-xs" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            &gt; ₦150k
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-1.5 sm:gap-2 scrollbar-none">
          {categories.map((category) => {
            const count = categoryCounts[category] || 0;
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                  isSelected
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 scale-[1.02]"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-sky-50 shadow-xs"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <p>
            Showing <span className="text-slate-900 font-extrabold">{filteredProducts.length}</span> smart appliance{filteredProducts.length !== 1 ? "s" : ""}
          </p>
          {(searchQuery || selectedCategory !== "All" || priceFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setPriceFilter("all");
              }}
              className="text-sky-700 hover:underline font-extrabold uppercase text-[10px] tracking-wider cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 8} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-3">
              <SlidersHorizontal size={24} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No matching products found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or switching category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setPriceFilter("all");
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-sky-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-sky-700 transition-colors shadow-xs cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Floating Cart Summary Bar (Mobile) */}
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-4 sm:right-4 z-[65] md:hidden"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white shadow-xl shadow-sky-950/30 active:scale-[0.98] transition-transform font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} />
                <span className="text-[11px] font-extrabold uppercase tracking-widest">
                  {cartCount} item{cartCount !== 1 ? "s" : ""} in cart
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">₦{cartTotal.toLocaleString()}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-lg">Checkout →</span>
              </div>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
