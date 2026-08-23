"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  ArrowRight, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  Wrench,
  Clock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface ArticleItem {
  id: string;
  title: string;
  duration: string;
  desc: string;
  image: string;
  author: string;
  category: string;
  articleContent: { step: string; title: string; body: string }[];
}

const RESOURCES: ArticleItem[] = [
  {
    id: "faucet-fix",
    title: "How to fix a leaky bathroom faucet in 10 mins.",
    duration: "5 Min Read",
    desc: "Step-by-step DIY guide showing how to shut off supply valves, remove worn O-rings, replace washers, and stop annoying drips fast.",
    image: "/slide_plumbing_unique.jpg",
    author: "Engr. Felix · Lead Plumber",
    category: "Plumbing DIY",
    articleContent: [
      { 
        step: "01", 
        title: "Shut Off Water Supply Valves", 
        body: "Locate the hot and cold shutoff valves underneath your bathroom sink vanity. Turn both handles clockwise until tight to completely cut off water flow before loosening any fittings." 
      },
      { 
        step: "02", 
        title: "Remove Handle & Decorative Caps", 
        body: "Use a flathead screwdriver to pop off the decorative hot/cold button caps on the handle. Unscrew the internal setscrew with an Allen wrench or Phillips screwdriver and lift off the handle." 
      },
      { 
        step: "03", 
        title: "Extract Cartridge & Inspect O-Rings", 
        body: "Unscrew the retaining nut with an adjustable wrench. Carefully pull out the inner stem cartridge and check the rubber O-rings for cracking, erosion, or mineral buildup." 
      },
      { 
        step: "04", 
        title: "Replace Seat Washer & Apply Teflon Tape", 
        body: "Swap out worn rubber seat washers and springs with exact matching replacement parts. Wrap Teflon plumber's tape 2-3 times clockwise around the threaded connections to ensure a watertight seal." 
      },
      { 
        step: "05", 
        title: "Reassemble & Test Water Flow", 
        body: "Reinsert the cartridge, tighten the retaining nut, reinstall the handle, and slowly reopen the supply valves under the sink to test for a smooth, leak-free stream." 
      },
    ],
  },
  {
    id: "generator-signs",
    title: "5 signs your generator needs maintenance right now.",
    duration: "4 Min Read",
    desc: "Don't get caught in a blackout. Learn the 5 warning signs — from dark exhaust smoke to AVR voltage fluctuations — before total engine breakdown.",
    image: "/slide_generator_repair.jpg",
    author: "Mechanic David · Power Specialist",
    category: "Generator Care",
    articleContent: [
      { 
        step: "01", 
        title: "Difficulty Starting & Repeated Cord Pulls", 
        body: "If your petrol or diesel generator requires 10+ pull-recoil cranks or extended key turning, your carburetor jets are clogged with varnish or spark plugs are fouled." 
      },
      { 
        step: "02", 
        title: "Dark Exhaust Smoke & Burning Smell", 
        body: "Black smoke signals unburnt fuel mixture from air filter blockage, while blue smoke indicates engine oil blowing past piston rings into the combustion chamber." 
      },
      { 
        step: "03", 
        title: "Voltage Output Drops & Appliance Flickering", 
        body: "Flickering lights and sensitive electronic resets indicate a degrading Automatic Voltage Regulator (AVR) or worn alternator carbon brushes." 
      },
      { 
        step: "04", 
        title: "Unusual Knocking or Grinding Engine Noise", 
        body: "Severe metallic knocking sounds point to dry main bearings or worn connecting rods that demand an immediate oil flush and mechanical overhaul." 
      },
      { 
        step: "05", 
        title: "Visible Fuel or Oil Puddles Under Frame", 
        body: "Fuel leaks present a severe fire hazard. Regularly inspect fuel lines, petcocks, and crankcase sump gaskets before powering heavy home loads." 
      },
    ],
  },
  {
    id: "electrician-vs-diy",
    title: "Knowing when to call an electrician vs DIY.",
    duration: "6 Min Read",
    desc: "Safety-first guide detailing simple tasks you can fix yourself vs high-risk electrical hazards requiring a certified HomeCare electrician.",
    image: "/slide_verified_pro.jpg",
    author: "Babatunde A. · Electrical Pro",
    category: "Electrical Safety",
    articleContent: [
      { 
        step: "01", 
        title: "SAFE FOR DIY: Replacing Surface Faceplates", 
        body: "Swapping cracked plastic light switch plates or cosmetic socket covers is safe as long as the main circuit breaker is switched off and tested with a voltage pen." 
      },
      { 
        step: "02", 
        title: "SAFE FOR DIY: Resetting Tripped Breakers", 
        body: "Resetting a tripped MCB switch in your consumer unit is simple. Turn off overloaded appliances first, then firmly push the breaker lever up." 
      },
      { 
        step: "03", 
        title: "CALL A PRO: Sparking Sockets & Burning Smells", 
        body: "If wall outlets emit sparks, popping sounds, or acrid burning odors, disconnect power immediately. Internal arcing can melt wiring and ignite wall insulation." 
      },
      { 
        step: "04", 
        title: "CALL A PRO: Main DB Board & Earthing Rod Faults", 
        body: "Upgrading main distribution boards, installing changeover switches, or driving copper earth rods requires certified load calculations and professional tools." 
      },
      { 
        step: "05", 
        title: "CALL A PRO: High-Voltage Appliance Rewiring", 
        body: "Connecting 2HP+ air conditioners, water heaters, or pumping machines to dedicated circuit breakers demands proper cable gauge selection and NIN-verified technicians." 
      },
    ],
  },
];

export default function EducationalResourcesSection() {
  const [selectedResource, setSelectedResource] = useState<ArticleItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredResources = activeCategory === "All" 
    ? RESOURCES 
    : RESOURCES.filter(r => r.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <section className="py-24 px-4 sm:px-6 bg-white text-slate-900 relative z-10 overflow-hidden border-y border-slate-200">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 border border-sky-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs">
                <Sparkles size={13} />
                <span>Home Maintenance Knowledge Hub</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-heading tracking-tight text-slate-900">
              NOT EVERY PROBLEM <span className="text-sky-600">NEEDS A PROFESSIONAL.</span>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              We believe in honest, customer-first service. Choose the right path for your situation:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-left">
                <span className="text-[10px] font-black uppercase text-sky-700 tracking-wider block mb-0.5">1. FIX IT YOURSELF</span>
                <span className="text-xs text-slate-600 font-medium">Follow step-by-step DIY guides for simple tasks.</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-left">
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider block mb-0.5">2. GET A DIAGNOSIS</span>
                <span className="text-xs text-slate-600 font-medium">Identify root causes with symptom finder.</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-left">
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block mb-0.5">3. BOOK A PRO</span>
                <span className="text-xs text-slate-600 font-medium">Dispatch NIN-verified pros for complex trades.</span>
              </div>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start lg:self-auto shadow-2xs">
            {(["All", "Plumbing", "Generator", "Electrical"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {cat === "All" ? "All Guides" : `${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Grid Cards Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredResources.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedResource(item)}
              className="group cursor-pointer rounded-[32px] overflow-hidden bg-slate-50 border border-slate-200 hover:border-sky-400 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xl relative"
            >
              {/* Top Media Image Header */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                {/* Type & Category Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-600 text-white border border-sky-400 shadow-xs">
                    Article Guide
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-200 bg-slate-900/80 backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-900/80 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-md group-hover:scale-110 transition-transform">
                    <BookOpen size={18} />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    {item.author}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{item.duration}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Interactive Modal Article Reader */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            {/* Fixed Top-Right Screen Close Button */}
            <button
              onClick={() => setSelectedResource(null)}
              aria-label="Close modal"
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[70] h-10 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-2xl border border-white/20 transition-all hover:scale-105 cursor-pointer"
            >
              <X size={16} />
              <span>Close</span>
            </button>

            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl relative my-6 text-slate-900"
            >
              {/* Internal Modal Card Header Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600 flex items-center gap-2">
                  <BookOpen size={14} />
                  <span>Expert DIY Home Guide</span>
                </span>

                <button
                  onClick={() => setSelectedResource(null)}
                  className="h-8 px-3 rounded-full bg-slate-200 hover:bg-red-600 text-slate-700 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X size={14} />
                  <span>Close</span>
                </button>
              </div>

              {/* Article Content Header & Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full">
                      {selectedResource.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {selectedResource.duration}
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {selectedResource.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 font-bold">
                    Written by {selectedResource.author}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-sky-950 text-xs leading-relaxed font-medium">
                  {selectedResource.desc}
                </div>

                {/* Step-by-Step Article Steps */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Step-by-Step DIY Guide Instructions
                  </h4>

                  {selectedResource.articleContent.map((sec, sIdx) => (
                    <div key={sIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {sec.step}
                        </span>
                        <h5 className="text-sm font-extrabold text-slate-900">
                          {sec.title}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium pl-10">
                        {sec.body}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                    <span>Prefer an accredited pro? We dispatch in 15 mins.</span>
                  </div>
                  <Link
                    href="/request"
                    onClick={() => setSelectedResource(null)}
                    className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                  >
                    <span>Book Technician Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}



