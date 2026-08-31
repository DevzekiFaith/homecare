"use client";

import { useState, useRef, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, LayoutGrid, ListFilter, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModernDatePickerProps {
  onSelect: (date: Date) => void;
  selectedDate?: Date | null;
  selectedTime?: string;
  onTimeSelect?: (time: string) => void;
  className?: string;
}

const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export default function ModernDatePicker({ 
  onSelect, 
  selectedDate,
  selectedTime,
  onTimeSelect,
  className = ""
}: ModernDatePickerProps) {
  const [viewMode, setViewMode] = useState<'strip' | 'grid'>('strip');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dates] = useState<Date[]>(() => {
    const nextDates = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      nextDates.push(d);
    }
    return nextDates;
  });

  const monthGridDates = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const grid = [];
    
    // Empty slots before the first day
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= totalDays; i++) {
        grid.push(new Date(year, month, i));
    }
    
    return grid;
  }, [currentMonth]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const formatDay = (date: Date) => new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const formatDate = (date: Date) => date.getDate();

  return (
    <div className={`space-y-6 sm:space-y-8 p-4 sm:p-6 bg-white/[0.02] rounded-3xl border border-white/5 relative overflow-hidden group ${className}`}>
      {/* Decorative Ambience */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] -mr-16 -mt-16 pointer-events-none group-hover:bg-brand-primary/20 transition-colors" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 relative z-10">
        <label className="text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.25em] text-zinc-500 flex items-center gap-2.5">
          <CalendarIcon size={12} className="text-brand-primary shrink-0" strokeWidth={3} />
          <span className="truncate">{viewMode === 'strip' ? "Select Appointment" : `${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`}</span>
        </label>
        
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <button 
                type="button"
                onClick={() => setViewMode('strip')}
                className={`h-7 px-3 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'strip' ? "bg-sky-600 text-white shadow-md shadow-sky-600/30" : "text-zinc-500 hover:text-zinc-300"}`}
            >
                <ListFilter size={10} /> Strip
            </button>
            <button 
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-7 px-3 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${viewMode === 'grid' ? "bg-sky-600 text-white shadow-md shadow-sky-600/30" : "text-zinc-500 hover:text-zinc-300"}`}
            >
                <LayoutGrid size={10} /> Grid
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'strip' ? (
          <motion.div 
            key="strip"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="relative min-w-0 w-full"
          >
            <div className="flex items-center justify-between mb-4">
                 <p className="text-[11px] font-bold text-zinc-400">Next 3 weeks</p>
                 <div className="flex gap-2">
                    <button type="button" onClick={() => handleScroll('left')} className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:border-sky-400/30 transition-all text-zinc-400 cursor-pointer">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={() => handleScroll('right')} className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:border-sky-400/30 transition-all text-zinc-400 cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                 </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {dates.map((date, i) => {
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(date)}
                    className={`flex-shrink-0 snap-center w-[76px] h-[98px] rounded-[28px] flex flex-col items-center justify-center transition-all duration-300 border relative cursor-pointer ${
                      isSelected 
                        ? "bg-sky-600 border-sky-400 shadow-[0_10px_30px_-5px_rgba(2,132,199,0.5)] text-white" 
                        : "glass-panel border-white/5 hover:border-sky-400/30 bg-white/[0.03]"
                    }`}
                  >
                    <span className={`text-[9.5px] font-black uppercase tracking-[0.2em] ${isSelected ? "text-sky-100" : "text-zinc-500"}`}>
                      {formatDay(date)}
                    </span>
                    <span className={`text-2xl font-heading font-extrabold mt-2 leading-none ${isSelected ? "text-white" : "text-foreground"}`}>
                      {formatDate(date)}
                    </span>
                    {isToday && !isSelected && (
                       <div className="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(2,132,199,0.8)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
                 <p className="text-[11px] font-bold text-zinc-400">Select any day</p>
                 <div className="flex gap-2">
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:border-sky-400/30 transition-all text-zinc-400 cursor-pointer">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="h-8 w-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 hover:border-sky-400/30 transition-all text-zinc-400 cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={`day-${i}`} className="h-8 flex items-center justify-center text-[9px] font-black text-zinc-600 uppercase tracking-widest">{d}</div>
                ))}
                {monthGridDates.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const isPast = date < new Date(new Date().setHours(0,0,0,0));

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={isPast}
                            onClick={() => onSelect(date)}
                            className={`aspect-square sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                                isSelected 
                                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/40 border border-sky-400" 
                                    : isPast 
                                        ? "text-zinc-800 opacity-30 cursor-not-allowed"
                                        : "text-zinc-400 hover:bg-white/5 hover:text-sky-400 border border-transparent hover:border-white/10"
                            }`}
                        >
                            {date.getDate()}
                            {isToday && !isSelected && <div className="absolute top-1 right-1 h-1 w-1 rounded-full bg-sky-500" />}
                        </button>
                    );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrated Time Picker */}
      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5 relative z-10">
        <label className="text-[10px] font-bold uppercase tracking-wider sm:tracking-[0.25em] text-zinc-500 flex items-center gap-2.5 mb-4 sm:mb-6">
          <Clock size={12} className="text-sky-500" strokeWidth={3} />
          Available Slots
        </label>
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {TIME_SLOTS.map((time) => {
            const isSelected = selectedTime === time;
            return (
                <motion.button
                key={time}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTimeSelect?.(time)}
                className={`h-11 rounded-2xl text-[11px] font-black border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                    isSelected 
                    ? "bg-sky-600 border-sky-400 text-white shadow-[0_10px_25px_-5px_rgba(2,132,199,0.5)]" 
                    : "glass-panel border-white/5 text-zinc-400 hover:border-sky-400/30"
                }`}
                >
                {time}
                </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
