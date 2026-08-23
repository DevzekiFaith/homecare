"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Zap, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function SmartStorePreviewSection() {
  const { addToCart, setIsCartOpen } = useCart();
  // Highlight top 4 everyday Nigerian essential smart devices
  const featured = PRODUCTS.slice(0, 4);

  return (
    <section className="py-20 bg-white text-slate-900 relative overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 mb-3">
              <Sparkles size={12} />
              <span>Smart Home Store &amp; Installation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-heading tracking-tight text-slate-900">
              SMART HARDWARE <span className="text-sky-600">+ PROFESSIONAL INSTALLATION.</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl font-medium leading-relaxed">
              Don&apos;t risk DIY electrical hazards. Buy genuine smart sockets, surge protectors, and solar devices — paired with verified electrician installation and long-term maintenance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/request?service=Electrician"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 bg-slate-100 hover:bg-slate-200 text-sky-700 border border-slate-300 text-xs font-black uppercase tracking-widest transition-all"
            >
              <span>Need Pro Installation?</span>
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-sky-600/25 hover:scale-105 active:scale-95 w-fit"
            >
              <span>Explore Store</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between bg-slate-50 rounded-3xl p-5 border border-slate-200 hover:border-sky-400 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
            >
              <div>
                <Link
                  href={`/store/${product.id}`}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-slate-200 block mb-4"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={product.image.startsWith("http")}
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-sky-600 text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}
                </Link>

                <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 mb-1">
                  {product.category}
                </div>
                <Link href={`/store/${product.id}`}>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Price</span>
                    <span className="text-base font-black text-slate-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      setIsCartOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag size={12} />
                    <span>Buy Device</span>
                  </button>
                </div>

                <Link
                  href="/request?service=Electrician"
                  className="text-[10px] font-bold text-sky-600 hover:underline flex items-center justify-center gap-1 pt-1"
                >
                  <span>Need help installing? Book electrician →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
