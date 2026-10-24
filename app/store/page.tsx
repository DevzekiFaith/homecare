"use client";

import { useState, useMemo } from "react";
import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/app/components/ProductCard";
import {
  Search,
  ShoppingCart,
  ArrowLeft,
  ArrowUpDown,
  Package,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
  SlidersHorizontal,
  Compass,
  X
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";

type SortOption = "default" | "price-asc" | "price-desc" | "rating" | "newest";
type PriceFilter = "all" | "under50k" | "50k-150k" | "above150k";

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const { cartCount, cartTotal, setIsCartOpen } = useCart();

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

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-10 pb-14 md:pb-16 px-4 sm:px-6 rounded-b-[36px] md:rounded-b-[48px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/store/track"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 text-[11px] font-bold transition-all border border-white/20"
              >
                <Compass size={13} />
                <span>Track Order</span>
              </Link>

              {/* Cart Header Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-sky-400 hover:bg-sky-300 text-blue-950 text-[11px] font-extrabold uppercase tracking-widest transition-all shadow-lg shadow-sky-400/25 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ShoppingCart size={15} />
                {cartCount > 0 ? (
                  <span>Cart · ₦{cartTotal.toLocaleString()}</span>
                ) : (
                  <span>Cart</span>
                )}
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-extrabold ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 mb-3">
                <Zap size={12} className="text-cyan-300 fill-cyan-300" />
                <span>Smart Living · Built for Nigerian Homes</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-heading">
                HomeCare <span className="text-cyan-200">Smart Store</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-sky-100/90 font-medium max-w-2xl leading-relaxed">
                Essential surge protectors, rechargeable fans, automatic water tank monitors, biometric locks, smart switches, and kitchen gear with certified installation support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-white">
                <Package size={18} className="text-cyan-300" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-sky-200">Catalog</p>
                  <p className="text-xs font-black tracking-wider text-white">
                    {PRODUCTS.length} Smart Devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props Bar */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-sky-100 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-cyan-300 shrink-0" />
              <span>24-48h Delivery in Lagos</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-300 shrink-0" />
              <span>Up to 24m Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-cyan-300 shrink-0" />
              <span>Pro Installation Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-cyan-300 shrink-0" />
              <span>Escrow Protected Payment</span>
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
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-4 sm:right-4 z-[55] md:hidden"
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
