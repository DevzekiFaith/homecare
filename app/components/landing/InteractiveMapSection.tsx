"use client";

import { motion } from "framer-motion";
import { Navigation, MessageCircle, Radio, Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';

const RealTimeMap = dynamic(() => import('./RealTimeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square md:aspect-video lg:aspect-square bg-slate-950 rounded-3xl animate-pulse flex items-center justify-center border border-sky-500/20 shadow-2xl">
      <span className="text-sky-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
        <Radio className="animate-spin" size={16} /> Loading Esri ArcGIS Engine...
      </span>
    </div>
  ),
});

export default function InteractiveMapSection() {
  return (
    <section className="py-24 px-6 bg-white text-slate-900 relative z-10 overflow-hidden border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        <div className="lg:w-1/2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-[11px] font-black uppercase tracking-widest text-sky-800 shadow-xs"
          >
            <Radio size={14} className="text-sky-600 animate-pulse" />
            <span>Esri ArcGIS & Leaflet Live Engine</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-slate-950 mb-6 leading-tight"
          >
            Simultaneous Live Tracking <br />
            <span className="text-sky-600">& In-Map Dispatch Chat</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-700 text-base md:text-lg font-medium leading-relaxed mb-8"
          >
            Never wonder where your professional is. Track both your home location and professional in transit at the same time with sub-meter GPS precision, live ETA calculation, and instant in-map messaging.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-3.5"
          >
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-slate-200/80 shadow-xs hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                <Navigation size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 block leading-snug">
                  Dual Simultaneous Live Tracking
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Monitors client home dispatch pin and moving professional vehicle concurrently
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 block leading-snug">
                  Integrated In-Map Live Chat
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Chat directly with the professional on the map without leaving navigation
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 block leading-snug">
                  High-Resolution Esri ArcGIS Topography
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Crystal-clear street navigation, satellite imagery, and topographic overlays
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:w-1/2 w-full relative">
           <RealTimeMap />
        </div>

      </div>
    </section>
  );
}
