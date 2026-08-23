"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  BookOpen, 
  ArrowRight, 
  X, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";

interface ArticleItem {
  id: string;
  type: "Video" | "Article";
  title: string;
  duration: string;
  desc: string;
  image: string;
  author: string;
  category: string;
  videoUrl?: string;
  chapters?: { time: string; text: string }[];
  articleContent?: { title: string; body: string }[];
}

const RESOURCES: ArticleItem[] = [
  {
    id: "faucet-fix",
    type: "Video",
    title: "How to fix a leaky bathroom faucet in 10 mins.",
    duration: "5 min tech",
    desc: "Step-by-step video narration showing how to turn off supply valves, remove worn O-rings, replace washers, and stop annoying drips fast.",
    image: "/slide_plumbing_unique.jpg",
    author: "Engr. Felix · Lead Plumber",
    category: "Plumbing DIY",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Embeddable video URL
    chapters: [
      { time: "0:00", text: "Shutting off the water supply valve under the sink" },
      { time: "1:15", text: "Removing decorative faucet caps & handle screw" },
      { time: "2:40", text: "Extracting the worn cartridge & damaged O-ring seal" },
      { time: "3:50", text: "Installing new rubber washer & applying plumber tape" },
      { time: "4:30", text: "Reassembling faucet and testing water pressure" },
    ],
  },
  {
    id: "generator-signs",
    type: "Article",
    title: "5 signs your generator needs maintenance right now.",
    duration: "Read Guide",
    desc: "Don't get caught in a blackout. Learn the 5 warning signs — from dark exhaust smoke to AVR voltage fluctuations — before total engine breakdown.",
    image: "/slide_generator_repair.jpg",
    author: "Mechanic David · Power Specialist",
    category: "Generator Care",
    articleContent: [
      { title: "1. Difficulty Starting & Excessive Choking", body: "If your petrol or diesel engine requires 10+ pulls or extended cranking, the carburetor is clogged or spark plugs are fouled." },
      { title: "2. Dark Exhaust Smoke & Oil Burning", body: "Black smoke indicates unburnt fuel mixture, while blueish smoke signals oil passing piston rings into combustion chambers." },
      { title: "3. Low Voltage Output & Flickering Lights", body: "Flickering home appliances point to a failing Automatic Voltage Regulator (AVR) or worn carbon brushes." },
      { title: "4. Unusual Knocking or Grinding Sounds", body: "Metallic knocking noises indicate loose connecting rods or dry bearings requiring immediate lubrication overhaul." },
      { title: "5. Visible Fuel or Oil Leaks Under Frame", body: "Fuel leaks present a severe fire hazard. Inspect fuel lines and sump gaskets before starting." },
    ],
  },
  {
    id: "electrician-vs-diy",
    type: "Article",
    title: "Knowing when to call an electrician vs DIY.",
    duration: "Read Guide",
    desc: "Safety-first guide detailing simple tasks you can fix yourself vs high-risk electrical hazards requiring a certified HomeCare electrician.",
    image: "/slide_verified_pro.jpg",
    author: "Babatunde A. · Electrical Pro",
    category: "Electrical Safety",
    articleContent: [
      { title: "SAFE FOR DIY (With Power Main Off)", body: "Replacing a surface socket faceplate, changing light bulbs, or screwing external switch covers after isolating circuit breakers." },
      { title: "CALL AN ELECTRICIAN IMMEDIATELY", body: "Burning smell from wall sockets, warm breaker panels, burning smells, circuit breakers constantly tripping, or re-wiring high-voltage air conditioners." },
      { title: "NIGERIAN BUILDING CODE SAFETY", body: "Improper electrical connections cause 60%+ of domestic fire incidents. Always use NIN-verified licensed electricians for DB panel repairs." },
    ],
  },
];

export default function EducationalResourcesSection() {
  const [selectedResource, setSelectedResource] = useState<ArticleItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"All" | "Video" | "Article">("All");

  const filteredResources = activeTab === "All" 
    ? RESOURCES 
    : RESOURCES.filter(r => r.type === activeTab);

  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-900 text-white relative z-10 overflow-hidden border-y border-slate-800">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Home Maintenance Knowledge Hub</span>
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase font-heading tracking-tight text-white">
              You Can Fix It <span className="text-sky-400">Yourself Too.</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
              Not every issue requires a technician visit. Browse our step-by-step DIY video walkthroughs with narration and expert maintenance guides.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 self-start lg:self-auto">
            {(["All", "Video", "Article"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {tab === "All" ? "All Resources" : `${tab}s`}
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
              className="group cursor-pointer rounded-[32px] overflow-hidden bg-slate-800/80 border border-slate-700/80 hover:border-sky-500/80 transition-all flex flex-col justify-between shadow-2xl relative"
            >
              {/* Top Media Image Header */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${
                    item.type === "Video"
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                  }`}>
                    {item.type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 bg-slate-900/80 backdrop-blur-md border border-white/10">
                    {item.category}
                  </span>
                </div>

                {/* Video Play Overlay Button */}
                {item.type === "Video" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-sky-600/90 text-white flex items-center justify-center shadow-xl border border-sky-400 group-hover:scale-110 transition-transform duration-300">
                      <Play fill="currentColor" size={24} className="ml-1 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-900/80 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <BookOpen size={18} />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-400 transition-colors leading-snug mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {item.author}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{item.duration}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Interactive Modal Reader & Video Narration Player */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-[32px] max-w-4xl w-full overflow-hidden shadow-2xl relative my-8"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Video Player Modal Content */}
              {selectedResource.type === "Video" ? (
                <div>
                  {/* Embedded Video Showcase Container */}
                  <div className="relative bg-black aspect-video w-full overflow-hidden flex items-center justify-center">
                    {/* Simulated High-Def Video Player */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedResource.image}
                      alt={selectedResource.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-950/60" />

                    {/* Central Interactive Narration Player Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-white bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                          <Play size={12} fill="currentColor" />
                          <span>HD Video Narration Active</span>
                        </span>

                        <button 
                          onClick={() => setIsMuted(!isMuted)}
                          className="h-9 px-3 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 hover:bg-slate-800 cursor-pointer"
                        >
                          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                          <span>{isMuted ? "Muted" : "Narration Audio On"}</span>
                        </button>
                      </div>

                      <div className="text-center my-auto">
                        <div className="w-20 h-20 rounded-full bg-sky-600/90 hover:bg-sky-500 text-white mx-auto flex items-center justify-center shadow-2xl border-2 border-white/30 cursor-pointer transition-transform hover:scale-105">
                          <Play fill="currentColor" size={32} className="ml-1" />
                        </div>
                        <p className="text-xs font-extrabold uppercase tracking-widest text-sky-300 mt-3">
                          Click to Start 10-Min Faucet Fix Narration
                        </p>
                      </div>

                      {/* Video Timeline Progress */}
                      <div className="space-y-2">
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-sky-500 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-300">
                          <span>01:45 / 05:00</span>
                          <span>Narration Track: Engr. Felix (Voice Guide Enabled)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Video Details & Narration Chapters */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedResource.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{selectedResource.desc}</p>
                    </div>

                    {/* Step-by-Step Chapters */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>Step-by-Step Narration Timeline Chapters</span>
                      </h4>
                      <div className="space-y-2">
                        {selectedResource.chapters?.map((chap, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs font-medium hover:border-sky-500/50 transition-colors"
                          >
                            <span className="text-slate-300">{chap.text}</span>
                            <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              {chap.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Wrench size={15} className="text-sky-400" />
                        <span>Need a pro plumber instead? We dispatch in 15 mins.</span>
                      </div>
                      <Link
                        href="/request?category=plumbing"
                        onClick={() => setSelectedResource(null)}
                        className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-600/30"
                      >
                        <span>Book Plumber Now</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Article Reader Modal Content */
                <div className="p-6 sm:p-10 space-y-6 max-h-[85vh] overflow-y-auto">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full inline-block">
                      {selectedResource.category} Guide
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">{selectedResource.title}</h3>
                    <p className="text-xs text-slate-400 font-bold">Written by {selectedResource.author}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs leading-relaxed font-medium">
                    {selectedResource.desc}
                  </div>

                  {/* Article Content Chapters */}
                  <div className="space-y-6 pt-4 border-t border-slate-800">
                    {selectedResource.articleContent?.map((sec, sIdx) => (
                      <div key={sIdx} className="space-y-2 p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span>{sec.title}</span>
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {sec.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <ShieldAlert size={16} className="text-amber-400" />
                      <span>If you suspect a dangerous failure, do not risk DIY.</span>
                    </div>
                    <Link
                      href="/request"
                      onClick={() => setSelectedResource(null)}
                      className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-sky-600/30"
                    >
                      <span>Request Pro Inspection</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}

