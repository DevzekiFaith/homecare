"use client";

import { use, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Wrench, 
  Plus, 
  Minus, 
  Share2, 
  Zap, 
  Radio, 
  Cpu, 
  PackageCheck,
  CheckCircle2
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductCard from "@/app/components/ProductCard";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { cartItems, addToCart, setIsCartOpen, cartCount } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "box" | "installation">("features");
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Find product by id
  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === resolvedParams.id) || null;
  }, [resolvedParams.id]);

  // Related products in similar category
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCategory = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category);
    const otherCategory = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...sameCategory, ...otherCategory].slice(0, 4);
  }, [product]);

  const cartItem = product ? cartItems.find((item) => item.product.id === product.id) : null;
  const inCartCount = cartItem?.quantity || 0;

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Product Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            The smart appliance you are looking for is unavailable or has been relocated.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-sky-600 text-white text-xs font-extrabold uppercase tracking-widest hover:bg-sky-700 transition-all shadow-md shadow-sky-600/25"
          >
            <ArrowLeft size={14} /> Back to Smart Store
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    toast.success("Added to Cart!", {
      description: `${quantity}x ${product.name} added to your shopping cart.`
    });
    setTimeout(() => setJustAdded(false), 2000);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/store/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link Copied!", {
        description: "Product link copied to your clipboard."
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-10 pb-16 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link
              href="/store"
              className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={14} /> Back to Smart Store
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 text-[11px] font-bold transition-all border border-white/20"
                title="Share product"
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-400 hover:bg-sky-300 text-blue-950 text-[11px] font-extrabold uppercase tracking-widest transition-all shadow-md shadow-sky-400/25"
              >
                <ShoppingCart size={14} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-extrabold ml-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-200/90">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/store" className="hover:text-white transition-colors">Store</Link>
            <span>/</span>
            <span className="text-cyan-200">{product.category}</span>
          </div>
        </div>
      </section>

      {/* Main Product Details Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Product Showcase & Image */}
          <div className="space-y-6">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border-4 border-white shadow-xl shadow-sky-950/5 flex items-center justify-center group">
              {product.badge && (
                <div
                  className={`absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1 ${
                    product.badge === "Best Seller"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : product.badge === "New"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : product.badge === "Hot Deal"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-sky-50 border-sky-200 text-sky-800"
                  }`}
                >
                  {product.badge === "Hot Deal" && <Sparkles size={11} />}
                  {product.badge}
                </div>
              )}

              <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 shadow-xs">
                {product.category}
              </div>

              {!imgError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  unoptimized={product.image.startsWith("http")}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Zap size={48} className="text-sky-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">High-Tech Smart Appliance</span>
                </div>
              )}
            </div>

            {/* Quality & Trust Feature Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-[11px] font-extrabold text-slate-900">{product.warrantyMonths || 12}m Warranty</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Factory Certified</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <Truck size={18} />
                </div>
                <p className="text-[11px] font-extrabold text-slate-900">Swift Dispatch</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Lagos & Nationwide</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                  <RotateCcw size={18} />
                </div>
                <p className="text-[11px] font-extrabold text-slate-900">Escrow Protected</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">30-Day Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs & Buy Actions */}
          <div className="space-y-6">
            <div>
              {product.sourceOrigin && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 mb-3">
                  <Cpu size={13} className="text-sky-600" />
                  <span>{product.sourceOrigin}</span>
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      className={
                        star <= Math.round(product.rating || 4.8)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.rating || 4.8} <span className="text-slate-400">({product.reviewCount || 120} verified customer reviews)</span>
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-sky-600 tracking-tight">
                  ₦{product.price.toLocaleString()}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">VAT & Delivery Included</span>
              </div>

              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> In Stock ({product.stock || 25} units available at warehouse)
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Quantity</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-xs">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {inCartCount > 0 && (
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {inCartCount} already in your cart
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-13 rounded-full px-8 text-xs font-extrabold uppercase tracking-widest bg-sky-600 text-white hover:bg-sky-700 shadow-md shadow-sky-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-102"
                >
                  <ShoppingCart size={16} />
                  <span>{justAdded ? "Added to Cart!" : "Add to Cart"}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-13 rounded-full px-8 text-xs font-extrabold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 flex items-center justify-center gap-2.5 transition-all hover:scale-102"
                >
                  <Zap size={16} className="text-cyan-300" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>

              {/* Pro Installation Option */}
              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Wrench size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Need Professional Installation?</p>
                    <p className="text-[11px] text-slate-500 font-medium">Add a verified HomeCare professional during checkout.</p>
                  </div>
                </div>
                <Link
                  href={`/request?service=${encodeURIComponent(product.serviceLink[0] || "Electrician")}`}
                  className="px-4 py-2 rounded-full bg-white border border-sky-200 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider hover:bg-sky-600 hover:text-white transition-all shrink-0 shadow-2xs"
                >
                  Book Pro
                </Link>
              </div>
            </div>

            {/* Technical Specifications Accordion Tabs */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: "features" as const, label: "Smart Features", icon: Radio },
                  { id: "specs" as const, label: "Tech Specs", icon: Cpu },
                  { id: "box" as const, label: "In the Box", icon: PackageCheck },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                      activeTab === id
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-600"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                {activeTab === "features" && (
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Universal Ecosystem Compatibility:</strong> Seamlessly pairs with Tuya, Smart Life, Amazon Alexa, and Google Assistant.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Smart Energy Efficiency:</strong> Ultra-low standby power consumption engineered for Nigerian voltage conditions (110V - 240V).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Real-Time Smartphone Control:</strong> Instant push alerts, timer automation schedules, and family sharing permissions.</span>
                    </li>
                  </ul>
                )}

                {activeTab === "specs" && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Voltage</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">AC 100-240V, 50/60Hz</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Wireless Protocol</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">WiFi 2.4GHz / Bluetooth 5.0</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Certifications</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">CE, RoHS, ISO9001</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Material</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">Aerospace Grade Alloy / Tempered Glass</p>
                    </div>
                  </div>
                )}

                {activeTab === "box" && (
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>1x {product.name} (Main Unit)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>1x Complete Mounting Hardware & Screw Kit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>1x Quick Setup English & Visual User Manual</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>1x HomeCare Official Warranty Card & QR Code</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Related Smart Home Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Smart Home Ecosystem
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Frequently Paired Devices
                </h2>
              </div>
              <Link
                href="/store"
                className="text-xs font-extrabold uppercase tracking-wider text-sky-600 hover:text-sky-700 transition-colors"
              >
                View All Appliances →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} priority={idx < 4} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
