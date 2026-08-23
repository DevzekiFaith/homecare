"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock } from "lucide-react";
import dynamic from 'next/dynamic';

const RealTimeMap = dynamic(() => import('./RealTimeMap'), {
  ssr: false,
  loading: () => <div className="w-full aspect-square md:aspect-video lg:aspect-square bg-zinc-900 rounded-3xl animate-pulse flex items-center justify-center border border-white/10 shadow-2xl"><span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Map Engine...</span></div>
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
            <MapPin size={14} className="text-sky-600" />
            <span>Hyper-Local Matching</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-slate-950 mb-6 leading-tight"
          >
            Real-Time Tracking <br />
            <span className="text-sky-600">& Live Provider Map</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-700 text-base md:text-lg font-medium leading-relaxed mb-8"
          >
            Don&apos;t guess when help will arrive. Our interactive map connects you to the closest verified professionals. Watch them arrive in real-time right from your screen.
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
                  Visual location-based GPS radius filtering
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Matches your request with nearest active technicians
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <MapPin size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 block leading-snug">
                  Moving radar pins showing live artisan transit ETA
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Live satellite route updates straight to your doorstep
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Clock size={18} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-900 block leading-snug">
                  Real-time dispatch status: Know exactly who is arriving
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Verified photo ID, NIN badges, and customer ratings
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
