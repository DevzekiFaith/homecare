"use client";

import { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  X,
  Search,
  Check
} from "lucide-react";
import { NIGERIA_STATES_DELIVERY, getEstimatedDeliveryDates } from "@/lib/store-data";

interface DeliverySectionProps {
  initialState?: string;
  onStateChange?: (state: string) => void;
}

export default function DeliverySection({ 
  initialState = "Lagos",
  onStateChange 
}: DeliverySectionProps) {
  const [selectedState, setSelectedState] = useState(initialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const deliveryData = useMemo(() => {
    return getEstimatedDeliveryDates(selectedState);
  }, [selectedState]);

  const stateList = useMemo(() => {
    return Object.keys(NIGERIA_STATES_DELIVERY);
  }, []);

  const filteredStates = useMemo(() => {
    if (!searchFilter.trim()) return stateList;
    return stateList.filter(s => s.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [stateList, searchFilter]);

  const handleSelectState = (state: string) => {
    setSelectedState(state);
    setIsModalOpen(false);
    onStateChange?.(state);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5">
      {/* Header: Destination & State Selector */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
            <Truck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Doorstep Delivery in Nigeria
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <MapPin size={12} className="text-sky-600 shrink-0" />
              <span>Delivering to: <strong className="text-slate-900 font-extrabold">{selectedState}</strong></span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-extrabold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200/60 transition-all flex items-center gap-1 shrink-0"
        >
          <span>Change</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Delivery Dates Window */}
      <div className="bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Estimated Arrival:</span>
            <span className="text-xs font-black text-slate-900 font-heading">
              {deliveryData.rangeString}
            </span>
          </div>

          <span className="text-[11px] font-bold text-sky-800 bg-sky-100/70 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
            {deliveryData.businessDaysString}
          </span>
        </div>

        {/* Hub & Couriers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
          <div>
            <span className="text-slate-400 font-medium">Dispatched from:</span>
            <p className="font-bold text-slate-800 mt-0.5">{deliveryData.stateData.hub}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Courier Partners:</span>
            <p className="font-bold text-slate-800 mt-0.5">{deliveryData.stateData.couriers.join(", ")}</p>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">₦1,500 Late Delivery Credit</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              If your order arrives later than the promised date, you automatically get ₦1,500 store credit.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RotateCcw size={16} className="text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">30-Day Hassle-Free Returns</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Defective or malfunctioning units qualify for free courier pickup and instant replacement.
            </p>
          </div>
        </div>
      </div>

      {/* State Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Select Delivery Location</h3>
                <p className="text-xs text-slate-500">Choose your destination state in Nigeria</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search state (e.g. Lagos, Abuja, Rivers)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            {/* State List */}
            <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
              {filteredStates.map((state) => {
                const isSelected = selectedState === state;
                const info = NIGERIA_STATES_DELIVERY[state];
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleSelectState(state)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/70 text-sky-950 font-extrabold"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{state}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {info.minDays}-{info.maxDays} days · ₦{info.deliveryFee.toLocaleString()} shipping
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-sky-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
