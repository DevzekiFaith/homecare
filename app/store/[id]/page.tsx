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
  Flame, 
  Wrench, 
  Plus, 
  Minus, 
  Share2, 
  Zap, 
  Radio, 
  Cpu, 
  PackageCheck,
  CheckCircle2,
  Compass
} from "lucide-react";
import { PRODUCTS, Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductCard from "@/app/components/ProductCard";
import { toast } from "sonner";
import { getStoreMetadataForProduct } from "@/lib/store-data";
import StoreVendorCard from "@/app/components/store/StoreVendorCard";
import DeliverySection from "@/app/components/store/DeliverySection";
import FlashDeal from "@/app/components/store/FlashDeal";
import BuyerProtection from "@/app/components/store/BuyerProtection";
import CustomerReviews from "@/app/components/store/CustomerReviews";
import MobileBar from "@/app/components/store/MobileBar";

interface PageProps {
  params: Promise<{ id: string }>;
}

const PACK_VARIANTS = [
  { id: "1pack", name: "1x Standard Unit", discountNote: "Standard", multiplier: 1, savings: 0 },
  { id: "2pack", name: "2x Family Pack", discountNote: "Save 10%", multiplier: 1.8, savings: 0.1, badge: "Popular" },
  { id: "4pack", name: "4x Whole-Home Pack", discountNote: "Save 18%", multiplier: 3.28, savings: 0.18, badge: "Best Value" },
];

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { cartItems, addToCart, setIsCartOpen, cartCount } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedPack, setSelectedPack] = useState(PACK_VARIANTS[0]);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "box">("features");
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deliveryState, setDeliveryState] = useState("Lagos");

  // Find product by id
  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === resolvedParams.id) || null;
  }, [resolvedParams.id]);

  // Dynamic calculated bundle price based on pack variant
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    return Math.round(product.price * selectedPack.multiplier);
  }, [product, selectedPack]);

  const effectiveOriginalPrice = useMemo(() => {
    if (!product) return 0;
    const baseOriginal = product.originalPrice || Math.round((product.price * 1.52) / 500) * 500;
    const count = selectedPack.id === "1pack" ? 1 : selectedPack.id === "2pack" ? 2 : 4;
    return Math.round(baseOriginal * count);
  }, [product, selectedPack]);

  // Store metadata
  const storeMetadata = useMemo(() => {
    if (!product) return null;
    return getStoreMetadataForProduct(product.category, product.sourceOrigin);
  }, [product]);

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
            The smart appliance you are looking for is currently unavailable or has been relocated.
          </p>
          <Link
            href="/store"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-md shadow-sky-600/25"
          >
            <ArrowLeft size={14} /> Back to Smart Store
          </Link>
        </div>
      </div>
    );
  }

  // Customized product payload with real pack details
  const variantProduct: Product = {
    ...product,
    id: selectedPack.id === "1pack" ? product.id : `${product.id}-${selectedPack.id}`,
    name: selectedPack.id === "1pack"
      ? product.name
      : `${product.name} (${selectedPack.name})`,
    price: effectivePrice,
    originalPrice: effectiveOriginalPrice,
  };

  const handleAddToCart = () => {
    addToCart(variantProduct, quantity);
    setJustAdded(true);
    toast.success("Added to Cart!", {
      description: `${quantity}x ${variantProduct.name} added to your shopping cart.`
    });
    setTimeout(() => setJustAdded(false), 2000);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(variantProduct, quantity);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("homecare_selected_state", deliveryState);
      } catch {}
    }
    router.push(`/store/checkout?state=${encodeURIComponent(deliveryState)}`);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden pb-32 sm:pb-28 lg:pb-14">
      {/* Top Banner Navigation matching Store Home */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-6 sm:pt-8 pb-10 sm:pb-14 px-3.5 sm:px-6 rounded-b-[28px] md:rounded-b-[48px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4">
            <Link
              href="/store"
              className="flex items-center gap-1.5 sm:gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={14} /> Back to Store
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/store/track"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 text-[11px] font-bold transition-all border border-white/20"
              >
                <Compass size={13} />
                <span>Track Order</span>
              </Link>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-100 text-[11px] font-bold transition-all border border-white/20 cursor-pointer"
                title="Share product"
              >
                <Share2 size={13} />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-400 hover:bg-sky-300 text-blue-950 text-[11px] font-black uppercase tracking-widest transition-all shadow-md shadow-sky-400/25 cursor-pointer"
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

          {/* Breadcrumb & Trust Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-sky-100/90 pt-3 border-t border-sky-500/30">
            <div className="flex items-center gap-2 text-[11px]">
              <Link href="/" className="hover:text-white transition-colors">HOME</Link>
              <span className="text-sky-300">/</span>
              <Link href="/store" className="hover:text-white transition-colors">STORE</Link>
              <span className="text-sky-300">/</span>
              <span className="text-cyan-200 uppercase font-black">{product.category}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-sky-100">
              <span className="flex items-center gap-1.5 bg-blue-950/60 px-2.5 py-1 rounded-full border border-sky-400/30 text-sky-200">
                <Truck size={13} className="text-cyan-300" />
                <span>Express Nigerian Delivery</span>
              </span>

              <span className="hidden md:inline text-sky-300">•</span>

              <span className="hidden md:flex items-center gap-1 text-sky-100">
                <ShieldCheck size={13} className="text-cyan-300" />
                <span>₦1,500 On-Time Guarantee</span>
              </span>

              <span className="hidden md:inline text-sky-300">•</span>

              <span className="hidden md:flex items-center gap-1 text-sky-100">
                <RotateCcw size={13} className="text-cyan-300" />
                <span>30-Day Defect Shield</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Product Showcase Section */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-12 py-5 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* Left Column (5 Cols): Product Media, Store Details, and Buyer Protection */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Image Gallery Box */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md flex items-center justify-center group">
              {product.badge && (
                <div
                  className={`absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xs flex items-center gap-1 ${
                    product.badge === "Best Seller"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : product.badge === "New"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : product.badge === "Hot Deal"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-sky-50 border-sky-200 text-sky-800"
                  }`}
                >
                  {product.badge === "Hot Deal" && <Flame size={11} className="fill-rose-500 text-rose-500" />}
                  {product.badge}
                </div>
              )}

              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 shadow-2xs">
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
                  <span className="text-xs font-bold uppercase tracking-wider">HomeCare Smart Appliance</span>
                </div>
              )}
            </div>

            {/* Quick Guarantees Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1.5">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-[11px] font-black text-slate-900">{product.warrantyMonths || 12}m Warranty</p>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">Rapid Replacement</p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1.5">
                  <Truck size={16} />
                </div>
                <p className="text-[11px] font-black text-slate-900">Swift Dispatch</p>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">Within 24 Hours</p>
              </div>

              <div className="bg-white rounded-2xl p-3 border border-slate-200 text-center shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1.5">
                  <RotateCcw size={16} />
                </div>
                <p className="text-[11px] font-black text-slate-900">30-Day Returns</p>
                <p className="text-[9px] text-slate-500 font-medium mt-0.5">Zero Risk</p>
              </div>
            </div>

            {/* Official Store Card */}
            {storeMetadata && (
              <StoreVendorCard store={storeMetadata} productName={product.name} />
            )}

            {/* Escrow & Buyer Protection Card */}
            <BuyerProtection />
          </div>

          {/* Right Column (7 Cols): Deal, Title, Variants, Nigeria Delivery, and Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Flash Deal Bar & Price */}
            <FlashDeal
              price={effectivePrice}
              originalPrice={effectiveOriginalPrice}
              soldCount={product.soldCount || (product.reviewCount ? product.reviewCount * 4 : 1420)}
              stock={product.stock || 25}
            />

            {/* Product Title & Basic Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-800 px-2.5 py-1 rounded-md border border-sky-200">
                  {product.sourceOrigin || "Official HomeCare Certified"}
                </span>

                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  In Stock ({product.stock || 25} units at Lagos Hub)
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Review summary */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      className={
                        star <= Math.round(product.rating || 4.9)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {product.rating || 4.9} <span className="text-slate-400">({product.reviewCount || 340} verified reviews)</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-emerald-700">
                  99% customer satisfaction
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Product Variants Section (Bundle Pack Options) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Select Pack / Quantity Bundle
                </span>
                {selectedPack.savings > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {selectedPack.discountNote}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PACK_VARIANTS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  const packPrice = Math.round(product.price * pack.multiplier);
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-sky-600 bg-sky-50/70 ring-2 ring-sky-600/20 shadow-xs"
                          : "border-slate-200 hover:border-sky-300 hover:bg-slate-50 bg-white"
                      }`}
                    >
                      {pack.badge && (
                        <span className="absolute -top-2 right-3 text-[9px] font-black uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                          {pack.badge}
                        </span>
                      )}
                      <div>
                        <p className={`text-xs ${isSelected ? "font-black text-sky-950" : "font-bold text-slate-800"}`}>
                          {pack.name}
                        </p>
                        <p className="text-[10px] text-sky-700 font-extrabold mt-0.5">
                          {pack.discountNote}
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-900 mt-2 font-heading">
                        ₦{packPrice.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Selected Pack Summary */}
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-sky-600 shrink-0" />
                  <span className="text-slate-600 text-[11px]">
                    Selected: <strong className="text-slate-900">{selectedPack.name}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded-md">
                  Ready to Dispatch
                </span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">Quantity</span>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {inCartCount > 0 && (
                  <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    {inCartCount} already in your cart
                  </span>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-13 rounded-full px-6 text-xs font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>{justAdded ? "Added to Cart!" : "Add to Cart"}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-13 rounded-full px-6 text-xs font-black uppercase tracking-wider bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
                >
                  <Zap size={16} className="text-sky-200 fill-sky-200" />
                  <span>Buy Now (Instant Checkout)</span>
                </button>
              </div>

              {/* Professional Installation Addon */}
              <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Wrench size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Need Professional Installation in Nigeria?</p>
                    <p className="text-[10px] text-slate-500 font-medium">Book a vetted HomeCare certified technician in Lagos, Abuja or PH.</p>
                  </div>
                </div>
                <Link
                  href={`/request?service=${encodeURIComponent(product.serviceLink[0] || "Electrician")}`}
                  className="px-3.5 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shrink-0 shadow-xs"
                >
                  Book Pro
                </Link>
              </div>
            </div>

            {/* Nigerian Delivery Section */}
            <DeliverySection
              initialState={deliveryState}
              onStateChange={(state) => setDeliveryState(state)}
            />

            {/* Technical Specifications Accordion Tabs */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
                {[
                  { id: "features" as const, label: "Smart Features", icon: Radio },
                  { id: "specs" as const, label: "Tech Specifications", icon: Cpu },
                  { id: "box" as const, label: "In the Box", icon: PackageCheck },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {activeTab === "features" && (
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-sky-600 shrink-0 mt-0.5" />
                    <span><strong>Nigerian Voltage Adaptation:</strong> Engineered for wide AC 100V - 240V voltage swings with built-in surge cut-off to safeguard against NEPA spikes and generator fluctuations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-sky-600 shrink-0 mt-0.5" />
                    <span><strong>Smart Home Ecosystem:</strong> Seamless mobile app integration with Tuya, Smart Life, Amazon Alexa, and Google Home with family sharing controls.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check size={16} className="text-sky-600 shrink-0 mt-0.5" />
                    <span><strong>Ultra-Low Power Standby:</strong> Inverter and solar battery friendly — consumes less than 0.2W on standby to prolong your backup run-time.</span>
                  </li>
                </ul>
              )}

              {activeTab === "specs" && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Voltage Standard</span>
                    <p className="font-black text-slate-900 mt-0.5">AC 100-240V, 50/60Hz</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nigerian Plug Standard</span>
                    <p className="font-black text-slate-900 mt-0.5">UK 3-Pin Fused (Type G)</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Connectivity</span>
                    <p className="font-black text-slate-900 mt-0.5">WiFi 2.4GHz + Bluetooth 5.0</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Certifications</span>
                    <p className="font-black text-slate-900 mt-0.5">CE, RoHS, ISO9001, FCC</p>
                  </div>
                </div>
              )}

              {activeTab === "box" && (
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    <span>1x {product.name} (Factory Sealed)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                    <span>1x Mounting Hardware & UK Fused Connector Kit</span>
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

        {/* Customer Reviews Section */}
        <section className="mt-12">
          <CustomerReviews
            rating={product.rating || 4.9}
            reviewCount={product.reviewCount || 340}
            productName={product.name}
          />
        </section>

        {/* Related Smart Home Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Frequently Paired Devices
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Complete Your Smart Setup
                </h2>
              </div>
              <Link
                href="/store"
                className="text-xs font-black uppercase tracking-wider text-sky-700 hover:text-sky-800 transition-colors"
              >
                View All Appliances →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} priority={idx < 4} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar for Mobile Viewport */}
      <MobileBar
        product={variantProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        justAdded={justAdded}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
