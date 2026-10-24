"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, ChevronUp, Globe, CheckCircle2 } from "lucide-react";
import { type CityConfig } from "@/lib/cities";

export default function CityList({ cities }: { cities: CityConfig[] }) {
  const [expanded, setExpanded] = useState<string | null>("enugu");

  return (
    <div className="space-y-3">
      {cities.map((city, idx) => {
        const isOpen = expanded === city.id;
        return (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-xs"
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : city.id)}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-sky-50/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-600 shadow-2xs">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{city.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{city.state} · {city.areas.length} active service areas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {city.active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Market
                  </span>
                )}
                {city.launchSoon && !city.active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-800">
                    Coming Soon
                  </span>
                )}
                {!city.active && !city.launchSoon && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Planned
                  </span>
                )}
                {isOpen ? <ChevronUp size={16} className="text-sky-600" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </button>

            {/* Expanded area list */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100 bg-slate-50/60 overflow-hidden"
                >
                  <div className="px-6 py-5">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                      Covered Neighborhoods & Service Districts
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {city.areas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-sky-300 transition-colors px-3 py-1.5 text-xs font-semibold text-slate-800"
                        >
                          <Globe size={11} className="text-sky-600" />
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

