"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, MapPin, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Service {
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    price: string;
    time: string;
    image?: string;
}

interface ServiceGridProps {
    services: Service[];
    selectedService: string | null;
    onSelectService: (label: string | null) => void;
}

export default function ServiceGrid({ services, selectedService, onSelectService }: ServiceGridProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredServices = useMemo(() => {
        return services.filter(service =>
            service.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [services, searchQuery]);

    return (
        <section className="py-20 bg-slate-50 relative z-10 border-t border-sky-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200">
                            Instant Booking Rates
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mt-2 uppercase">
                            Our Verified Services
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Transparent starting rates. Select a service to pair with verified local professionals.
                        </p>
                    </div>
                    <div className="relative w-full sm:w-80 group">
                        <input
                            type="text"
                            placeholder="Search plumber, electrician, AC..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100 shadow-xs relative z-20"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4 transition-colors group-focus-within:text-sky-600 z-30" />
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredServices.length > 0 ? (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filteredServices.map((service, idx) => {
                                const isSelected = selectedService === service.label;
                                return (
                                    <motion.button
                                        layout
                                        key={service.label}
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.35, delay: idx * 0.04 }}
                                        onClick={() => onSelectService(service.label)}
                                        className={`group flex flex-col items-start rounded-3xl transition-all duration-300 overflow-hidden text-left w-full p-4 border ${
                                            isSelected
                                                ? "bg-sky-600 text-white border-sky-600 shadow-xl shadow-sky-600/30 scale-[1.02]"
                                                : "bg-white text-slate-900 border-sky-100/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10"
                                        }`}
                                    >
                                        {/* Service Image Visual */}
                                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-4 bg-slate-100 shrink-0">
                                            {service.image ? (
                                                <Image
                                                    src={service.image}
                                                    alt={service.label}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-600">
                                                    <service.icon size={36} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                            {/* Price pill pinned on top right */}
                                            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-100">
                                                <span className="text-xs font-extrabold text-slate-900">
                                                    {service.price.split(' ')[0]}
                                                </span>
                                                <span className="text-[9px] font-bold text-sky-600 uppercase ml-1">
                                                    {service.price.split(' ').slice(1).join(' ')}
                                                </span>
                                            </div>

                                            {/* Icon pill pinned on top left */}
                                            <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md text-sky-600 flex items-center justify-center shadow-sm">
                                                <service.icon size={18} strokeWidth={2} />
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex flex-col flex-grow w-full px-1">
                                            <div className="flex items-center justify-between w-full mb-3">
                                                <h3 className={`text-lg font-extrabold tracking-tight ${isSelected ? "text-white" : "text-slate-900 group-hover:text-sky-600 transition-colors"}`}>
                                                    {service.label}
                                                </h3>
                                                <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${isSelected ? "text-cyan-200" : "text-sky-600"}`} />
                                            </div>

                                            {/* Service Meta Specs */}
                                            <div className={`flex items-center justify-between w-full pt-3 border-t text-[11px] font-semibold ${isSelected ? "border-white/20 text-sky-100" : "border-slate-100 text-slate-500"}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className={isSelected ? "text-cyan-200" : "text-sky-600"} />
                                                    <span>{service.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={13} className={isSelected ? "text-cyan-200" : "text-sky-600"} />
                                                    <span>Local Pros</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <ShieldCheck size={13} className={isSelected ? "text-cyan-200" : "text-emerald-500"} />
                                                    <span className={isSelected ? "text-white" : "text-emerald-600"}>Verified</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="py-20 text-center rounded-3xl bg-white border border-slate-100 p-8 w-full"
                        >
                            <h3 className="text-lg font-bold text-slate-900">No services found</h3>
                            <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm mx-auto">We couldn&apos;t find any results for &quot;{searchQuery}&quot;. Try a broader search keyword.</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-6 h-10 px-6 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
