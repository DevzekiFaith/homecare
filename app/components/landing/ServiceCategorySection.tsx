"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wrench, Sparkles, Home, Zap, Droplet, ArrowRight } from "lucide-react";

const heroCards = [
  {
    title: "Leak Repair",
    desc: "Fast diagnosis and emergency fixes for leaking pipes, faucets, drainage systems, and toilet cisterns.",
    icon: Droplet,
    color: "bg-sky-500",
    badgeColor: "bg-sky-100 text-sky-700",
    isFeatured: false,
    link: "/request?category=plumbing",
  },
  {
    title: "Pipe Fixing",
    desc: "Complete pipeline installation, high-pressure fittings, valve swaps, and water tank connections.",
    icon: Wrench,
    color: "bg-blue-600",
    badgeColor: "bg-blue-100 text-blue-700",
    isFeatured: false,
    link: "/request?category=plumbing",
  },
  {
    title: "Drain Cleaning",
    desc: "Heavy-duty unclogging for kitchens, bathrooms, inspection chambers, and underground drainage channels.",
    icon: Sparkles,
    color: "bg-cyan-400",
    badgeColor: "bg-cyan-100 text-cyan-900",
    isFeatured: true, // Vibrant featured card like in Pinterest reference
    link: "/request?category=plumbing",
  },
];

const secondaryCategories = [
  { name: "Electrical & Wiring", icon: Zap, count: "120+ Pros", link: "/request?category=electrical" },
  { name: "AC & Refrigeration", icon: Sparkles, count: "85+ Pros", link: "/request?category=ac" },
  { name: "Carpentry & Furniture", icon: Home, count: "90+ Pros", link: "/request?category=carpentry" },
  { name: "Painting & Masonry", icon: Droplet, count: "65+ Pros", link: "/request?category=painting" },
  { name: "Generator Repair", icon: Zap, count: "70+ Pros", link: "/request?category=generator" },
  { name: "General Handyman", icon: Wrench, count: "150+ Pros", link: "/request?category=general" },
];

export default function ServiceCategorySection() {
  return (
    <section className="relative z-20 px-6 -mt-20 md:-mt-24 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* 3 Floating Cards Directly from Pinterest Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {heroCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                card.isFeatured
                  ? "bg-gradient-to-b from-sky-600 to-blue-700 text-white shadow-2xl shadow-sky-600/30 border border-sky-400/30"
                  : "bg-white text-slate-900 shadow-xl shadow-slate-200/60 border border-sky-100/80 hover:border-sky-300"
              }`}
            >
              <div>
                {/* Top Icon Circle */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md ${
                    card.isFeatured ? "bg-white text-sky-600" : "bg-sky-50 text-sky-600"
                  }`}
                >
                  <card.icon size={28} />
                </div>

                <h3 className={`text-2xl font-extrabold mb-3 ${card.isFeatured ? "text-white" : "text-slate-900"}`}>
                  {card.title}
                </h3>

                <p className={`text-sm leading-relaxed mb-6 font-medium ${card.isFeatured ? "text-sky-100" : "text-slate-500"}`}>
                  {card.desc}
                </p>
              </div>

              <Link
                href={card.link}
                className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest pt-4 border-t transition-colors ${
                  card.isFeatured
                    ? "border-white/20 text-cyan-200 hover:text-white"
                    : "border-slate-100 text-sky-600 hover:text-sky-700"
                }`}
              >
                <span>Book Service</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Secondary Category Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-sky-100"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Full Service Coverage
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Explore All Home Repair Categories
              </h2>
            </div>
            <Link
              href="/request"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 uppercase tracking-widest hover:translate-x-1 transition-transform"
            >
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {secondaryCategories.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -5, scale: 1.05 }}
              >
                <Link
                  href={item.link}
                  className="group p-5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 transition-all flex flex-col items-center text-center h-full shadow-2xs hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-sky-600 text-sky-600 group-hover:text-white shadow-xs flex items-center justify-center mb-3 transition-all duration-300 group-hover:rotate-6">
                    <item.icon size={22} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold mt-1">
                    {item.count}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
