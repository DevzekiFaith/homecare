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
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-500/20 mb-3">
              <Sparkles size={12} />
              <span>Smart Home Store &amp; Installation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-heading tracking-tight text-white">
              Make Your Home <span className="text-sky-400">Smarter.</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl">
              Power surge protectors, smart wall sockets, solar appliances, and emergency lighting — paired with verified electrician installation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/request?service=Electrician"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-black uppercase tracking-widest transition-all"
            >
              <span>Need Pro Installation?</span>
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 hover:scale-105 active:scale-95 w-fit"
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
              className="group flex flex-col justify-between bg-slate-800/80 rounded-3xl p-5 border border-slate-700/80 hover:border-sky-500/50 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-sky-500/10"
            >
              <div>
                <Link
                  href={`/store/${product.id}`}
                  className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-700/60 block mb-4"
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
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-sky-500 text-slate-950 shadow-md">
                      {product.badge}
                    </span>
                  )}
                </Link>

                <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 mb-1">
                  {product.category}
                </div>
                <Link href={`/store/${product.id}`}>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Price</span>
                    <span className="text-base font-extrabold text-white">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      setIsCartOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag size={12} />
                    <span>Buy Device</span>
                  </button>
                </div>

                <Link
                  href="/request?service=Electrician"
                  className="text-[10px] font-bold text-sky-400 hover:underline flex items-center justify-center gap-1 pt-1"
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
