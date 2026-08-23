"use client";

import { motion } from "framer-motion";
import { Play, BookOpen, ArrowRight } from "lucide-react";

const articles = [
  { type: "Video", title: "How to fix a leaky bathroom faucet in 10 mins.", duration: "5 min tech" },
  { type: "Article", title: "5 signs your generator needs maintenance right now.", duration: "Read Guide" },
  { type: "Article", title: "Knowing when to call an electrician vs DIY.", duration: "Read Guide" },
];

export default function EducationalResourcesSection() {
  return (
    <section className="py-24 px-6 bg-slate-100/60 border-y border-slate-200/50 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
        
        <div className="lg:w-1/3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">You can fix it yourself too.</h2>
          <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">
            Not every problem requires a professional call out. Browse our library of free DIY videos and how-to articles to tackle simple domestic projects safely.
          </p>
          <button className="flex items-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-widest hover:text-brand-primary-hover transition-colors">
            Explore All Resources <ArrowRight size={16} />
          </button>
        </div>

        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {articles.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              key={i}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-sky-400 transition-all flex flex-col h-full shadow-2xs hover:shadow-lg"
            >
              <div className="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors" />
                {item.type === "Video" ? (
                  <div className="w-12 h-12 rounded-full bg-slate-900/10 flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                    <Play fill="currentColor" className="text-brand-primary ml-0.5" size={16} />
                  </div>
                ) : (
                  <BookOpen size={32} className="text-brand-primary transition-colors" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-brand-primary mb-2 block">{item.type}</span>
                   <h4 className="font-bold text-sm text-slate-800 mb-4 line-clamp-2">{item.title}</h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-brand-primary transition-colors">{item.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
