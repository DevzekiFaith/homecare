"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, CheckCircle2, UserCheck, Lock, Award } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
  };

  return (
    <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-16 pb-28 lg:pb-32 px-6 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-2xl shadow-blue-900/20">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-300/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column: Core Positioning Headlines & CTAs */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 flex flex-col items-start text-left"
        >
          <motion.div 
            variants={itemVariants} 
            className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-black uppercase tracking-widest text-sky-100 backdrop-blur-md"
          >
            <ShieldCheck size={14} className="text-cyan-300" />
            <span>The Trust Layer for Home Services</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants} 
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6 uppercase font-heading"
          >
            A Professional <br />
            For The Job. <br />
            <span className="text-cyan-200">
              Without The Guesswork.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants} 
            className="text-base sm:text-lg text-sky-100/90 font-medium max-w-xl leading-relaxed mb-8"
          >
            Verified plumbers, electricians, AC technicians, carpenters and other home-service professionals — matched to your needs, with your payment protected until you&apos;re satisfied.
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
            <Link
              href="/request"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center gap-3 text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl shadow-sky-500/35 hover:scale-102 transition-all cursor-pointer border border-sky-400/40"
            >
              <span>Book a Service</span> <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/worker/register"
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-blue-900/60 hover:bg-blue-900/90 border border-white/25 text-white flex items-center justify-center text-xs sm:text-sm font-extrabold uppercase tracking-widest transition-all backdrop-blur-md cursor-pointer"
            >
              <span>Join as a Professional</span>
            </Link>
          </motion.div>

          {/* 3 Core Trust Pillars */}
          <motion.div variants={itemVariants} className="w-full pt-6 border-t border-white/15 grid grid-cols-3 gap-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/20">
                <UserCheck size={16} />
              </div>
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-white">✓ Verified</span>
                <span className="text-[10px] text-sky-100/80 font-medium hidden sm:block">Identity &amp; Skills</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/20">
                <Award size={16} />
              </div>
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-white">✓ Transparent</span>
                <span className="text-[10px] text-sky-100/80 font-medium hidden sm:block">Agreed Quotes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/20">
                <Lock size={16} />
              </div>
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-white">✓ Protected</span>
                <span className="text-[10px] text-sky-100/80 font-medium hidden sm:block">Escrow Guarantee</span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Right Column: Hero Visual with Verified Technician */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 relative flex justify-center"
        >
          <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-900">
            <Image
              src="/hero-technician-v2.jpg"
              alt="HomeCare Verified Technician"
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 450px"
            />
            
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Floating pro trust badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3.5 border border-sky-500/30">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">Identity & Skill Verified</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Payment protected until satisfaction</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
