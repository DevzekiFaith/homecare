"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HERO_IMAGE = "/hero-technician-v2.jpg";

export default function Hero() {

    return (
        <header className="relative w-full min-h-[85vh] flex flex-col justify-center overflow-hidden bg-background pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 glass-panel text-foreground text-xs font-semibold mb-8 uppercase tracking-widest hover:border-orange-500/50 transition-colors"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Verified Pros Active
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-[14vw] sm:text-7xl md:text-8xl lg:text-9xl font-heading font-extrabold tracking-tighter text-foreground leading-[0.9]"
                >
                    Book it. <br />
                    <span className="text-gradient-primary">Fix it.</span> <br />
                    Done.
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 max-w-xl text-lg md:text-xl text-zinc-500 font-medium leading-relaxed"
                >
                    A premium approach to finding reliable plumbers, electricians, and handymen. Book in 2 minutes, we handle the rest.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-12 flex flex-col w-full sm:w-auto sm:flex-row gap-4 items-center"
                >
                    <Link
                        href="/request"
                        className="group flex w-full sm:w-auto h-14 items-center justify-center gap-2 rounded-full px-8 sm:px-10 text-xs sm:text-sm uppercase tracking-widest bg-sky-600 hover:bg-sky-500 text-white font-extrabold shadow-xl shadow-sky-600/30 transition-all hover:scale-105"
                    >
                        Book Now
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/auth/worker/register"
                        className="flex w-full sm:w-auto h-14 items-center justify-center rounded-full px-8 sm:px-10 text-xs sm:text-sm font-extrabold uppercase tracking-widest bg-white dark:bg-slate-900 border-2 border-sky-600 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white transition-all shadow-md"
                    >
                        Join as Pro
                    </Link>
                </motion.div>
            </div>

            {/* Static Background Image - Optimized */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.10] dark:opacity-5">
                <Image
                    src={HERO_IMAGE}
                    alt="Background"
                    fill
                    className="object-cover object-center grayscale mix-blend-overlay"
                    priority
                    sizes="100vw"
                    quality={75}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent" />
            </div>
        </header>
    );
}

