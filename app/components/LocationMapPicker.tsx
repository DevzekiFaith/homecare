"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2, CheckCircle2, X, Sparkles } from "lucide-react";

// ── Data Models ────────────────────────────────────────────────
export interface AreaPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface CityData {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  areas: AreaPoint[];
}

export interface StateData {
  label: string;
  cities: Record<string, CityData>;
}

// ── Nigeria States / Cities / Areas with coords ────────────────
export const NIGERIA_STATES: Record<string, StateData> = {
  enugu: {
    label: "Enugu State",
    cities: {
      enugu: {
        name: "Enugu Urban",
        lat: 6.4527,
        lng: 7.5108,
        zoom: 13,
        areas: [
          { name: "Independence Layout", lat: 6.4574, lng: 7.5200 },
          { name: "GRA", lat: 6.4480, lng: 7.5050 },
          { name: "New Haven", lat: 6.4620, lng: 7.5280 },
          { name: "Abakpa", lat: 6.4750, lng: 7.5400 },
          { name: "Thinkers Corner", lat: 6.4900, lng: 7.5500 },
          { name: "Emene", lat: 6.4200, lng: 7.5750 },
          { name: "Trans Ekulu", lat: 6.4650, lng: 7.5350 },
          { name: "Coal Camp", lat: 6.4400, lng: 7.5180 },
        ],
      },
    },
  },
  lagos: {
    label: "Lagos State",
    cities: {
      lagos_island: {
        name: "Lagos Island / VI",
        lat: 6.4281,
        lng: 3.4219,
        zoom: 13,
        areas: [
          { name: "Victoria Island", lat: 6.4317, lng: 3.4118 },
          { name: "Lekki Phase 1", lat: 6.4354, lng: 3.4759 },
          { name: "Ikoyi", lat: 6.4530, lng: 3.4451 },
          { name: "Oniru", lat: 6.4302, lng: 3.4592 },
        ],
      },
      lagos_mainland: {
        name: "Lagos Mainland",
        lat: 6.5244,
        lng: 3.3792,
        zoom: 13,
        areas: [
          { name: "Ikeja", lat: 6.6018, lng: 3.3515 },
          { name: "Surulere", lat: 6.4972, lng: 3.3490 },
          { name: "Yaba", lat: 6.5091, lng: 3.3761 },
          { name: "Ajah", lat: 6.4651, lng: 3.5637 },
        ],
      },
    },
  },
  abuja: {
    label: "FCT — Abuja",
    cities: {
      abuja: {
        name: "Abuja Central",
        lat: 9.0579,
        lng: 7.4951,
        zoom: 13,
        areas: [
          { name: "Wuse", lat: 9.0625, lng: 7.4735 },
          { name: "Maitama", lat: 9.0855, lng: 7.4916 },
          { name: "Garki", lat: 9.0454, lng: 7.4836 },
          { name: "Asokoro", lat: 9.0376, lng: 7.5269 },
          { name: "Gwarinpa", lat: 9.1209, lng: 7.4021 },
          { name: "Kubwa", lat: 9.1369, lng: 7.3490 },
        ],
      },
    },
  },
  rivers: {
    label: "Rivers State",
    cities: {
      portharcourt: {
        name: "Port Harcourt",
        lat: 4.8156,
        lng: 7.0498,
        zoom: 13,
        areas: [
          { name: "GRA Phase 1", lat: 4.7981, lng: 7.0108 },
          { name: "GRA Phase 2", lat: 4.8052, lng: 7.0184 },
          { name: "Old GRA", lat: 4.8009, lng: 7.0037 },
          { name: "Rumuola", lat: 4.8315, lng: 7.0612 },
          { name: "Diobu", lat: 4.8231, lng: 7.0389 },
        ],
      },
    },
  },
  ogun: {
    label: "Ogun State",
    cities: {
      abeokuta: {
        name: "Abeokuta",
        lat: 7.1557,
        lng: 3.3451,
        zoom: 13,
        areas: [
          { name: "Ibara", lat: 7.1470, lng: 3.3360 },
          { name: "Oke-Mosan", lat: 7.1651, lng: 3.3542 },
          { name: "Kuto", lat: 7.1540, lng: 3.3460 },
          { name: "Adigbe", lat: 7.1430, lng: 3.3280 },
          { name: "Obantoko", lat: 7.1350, lng: 3.3190 },
        ],
      },
    },
  },
};

// ── Nominatim result shape ─────────────────────────────────────
interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    suburb?: string;
    quarter?: string;
    neighbourhood?: string;
    city?: string;
    state?: string;
    county?: string;
  };
}

// ── Helpers ─────────────────────────────────────────────────────
/** Find the nearest area in our data to a lat/lng */
function nearestArea(lat: number, lng: number): { stateKey: string; cityKey: string; area: AreaPoint } | null {
  let best: { stateKey: string; cityKey: string; area: AreaPoint; dist: number } | null = null;
  for (const [sk, sd] of Object.entries(NIGERIA_STATES)) {
    for (const [ck, cd] of Object.entries(sd.cities)) {
      for (const area of cd.areas) {
        const d = Math.hypot(area.lat - lat, area.lng - lng);
        if (!best || d < best.dist) best = { stateKey: sk, cityKey: ck, area, dist: d };
      }
    }
  }
  return best;
}

// ── Props ────────────────────────────────────────────────────────
interface LocationMapPickerProps {
  selectedState: string;
  selectedCity: string;
  selectedArea: string;
  onStateChange: (s: string) => void;
  onCityChange: (c: string) => void;
  onAreaChange: (a: string) => void;
}

// ── Custom map pin coords (overrides area preset) ──────────────
interface CustomPin {
  lat: number;
  lng: number;
  label: string;
}

const LeafletMap = dynamic(() => import("./LocationLeafletMap"), { ssr: false });

// ── Component ────────────────────────────────────────────────────
export default function LocationMapPicker({
  selectedState,
  selectedCity,
  selectedArea,
  onStateChange,
  onCityChange,
  onAreaChange,
}: LocationMapPickerProps) {
  // Address search state
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolved, setResolved] = useState<string | null>(null);
  const [customPin, setCustomPin] = useState<CustomPin | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cascading dropdown derived data
  const stateData = selectedState ? NIGERIA_STATES[selectedState] : null;
  const cityKeys = stateData ? Object.keys(stateData.cities) : [];
  const cityData = stateData && selectedCity ? stateData.cities[selectedCity] : null;
  const areas = cityData?.areas ?? [];

  // Auto-select first city when state changes
  useEffect(() => {
    if (cityKeys.length > 0 && !cityKeys.includes(selectedCity)) {
      onCityChange(cityKeys[0]);
    }
  }, [selectedState]);

  // Auto-select first area when city changes
  useEffect(() => {
    if (areas.length > 0 && !areas.find((a) => a.name === selectedArea)) {
      onAreaChange(areas[0].name);
    }
  }, [selectedCity]);

  // Debounce Nominatim search
  const handleAddressInput = useCallback((val: string) => {
    setAddressQuery(val);
    setResolved(null);
    setSuggestions([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 3) return;

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ", Nigeria")}&format=json&addressdetails=1&limit=6&countrycodes=ng`;
        const res = await fetch(url, {
          headers: { "Accept-Language": "en", "User-Agent": "HomeCare-NG-App" },
        });
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 450);
  }, []);

  // When user picks a suggestion → geocode → auto-fill dropdowns + fly map
  const handleSelectSuggestion = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setAddressQuery(result.display_name.split(",").slice(0, 3).join(",").trim());
    setSuggestions([]);
    setCustomPin({ lat, lng, label: result.display_name.split(",")[0] });

    // Match nearest area in our data
    const match = nearestArea(lat, lng);
    if (match) {
      onStateChange(match.stateKey);
      setTimeout(() => {
        onCityChange(match.cityKey);
        setTimeout(() => {
          onAreaChange(match.area.name);
        }, 50);
      }, 50);
      setResolved(match.area.name);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Map center: custom pin overrides area preset
  const selectedAreaPoint =
    customPin ??
    areas.find((a) => a.name === selectedArea) ??
    (cityData ? { lat: cityData.lat, lng: cityData.lng, name: selectedArea } : null);

  const mapLat = selectedAreaPoint?.lat ?? cityData?.lat ?? 9.082;
  const mapLng = selectedAreaPoint?.lng ?? cityData?.lng ?? 8.6753;
  const mapZoom = customPin ? 15 : cityData?.zoom ?? 6;
  const mapLabel = customPin?.label ?? selectedArea ?? cityData?.name ?? "Nigeria";

  return (
    <div className="space-y-4">

      {/* ── Address Search Bar ──────────────────────────────────── */}
      <div className="space-y-1" ref={dropdownRef}>
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
          Search Your Address or Street
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
            {searching
              ? <Loader2 size={15} className="animate-spin text-sky-500" />
              : <Search size={15} className="text-slate-400" />}
          </div>
          <input
            type="text"
            value={addressQuery}
            onChange={e => handleAddressInput(e.target.value)}
            placeholder="e.g. 12 Agbani Road, Enugu or Lekki Phase 1, Lagos…"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-9 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
            autoComplete="off"
          />
          {addressQuery && (
            <button
              type="button"
              onClick={() => { setAddressQuery(""); setSuggestions([]); setResolved(null); setCustomPin(null); }}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-50 mt-2 w-full rounded-2xl border-2 border-sky-500/20 bg-white/95 backdrop-blur-md shadow-2xl p-2.5 space-y-2 max-h-80 overflow-y-auto">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-50 rounded-lg border border-sky-100">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-sky-600" /> Suggested Locations
                </span>
                <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full">
                  {suggestions.length} found
                </span>
              </div>
              <div className="space-y-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-150 flex items-start gap-3 group cursor-pointer border border-sky-400/40"
                  >
                    <span className="p-1.5 rounded-lg bg-white/20 text-white shrink-0 mt-0.5 group-hover:bg-white group-hover:text-sky-600 transition-colors">
                      <MapPin size={14} className="shrink-0" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs leading-snug line-clamp-2 drop-shadow-sm">
                        {s.display_name}
                      </p>
                      <p className="text-[10px] text-sky-100 font-semibold mt-0.5 flex items-center gap-1">
                        <span>Click to choose this location</span> &rarr;
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Auto-fill confirmation badge */}
        {resolved && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 mt-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Location auto-filled → <span className="underline">{resolved}</span>
          </div>
        )}
      </div>

      {/* ── Cascading Selectors ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* State */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">State</label>
          <select
            value={selectedState}
            onChange={e => onStateChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer"
          >
            <option value="">— Select State —</option>
            {Object.entries(NIGERIA_STATES).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">City / Zone</label>
          <select
            value={selectedCity}
            onChange={e => onCityChange(e.target.value)}
            disabled={!selectedState}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40"
          >
            <option value="">— Select City —</option>
            {cityKeys.map(k => (
              <option key={k} value={k}>{stateData!.cities[k].name}</option>
            ))}
          </select>
        </div>

        {/* Area / LGA */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Area / LGA</label>
          <select
            value={selectedArea}
            onChange={e => { onAreaChange(e.target.value); setCustomPin(null); }}
            disabled={!selectedCity}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40"
          >
            <option value="">— Select Area —</option>
            {areas.map(a => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Coverage Badge ──────────────────────────────────────── */}
      {selectedArea && cityData && (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
          <MapPin size={13} className="shrink-0 text-emerald-600" />
          <span>
            Coverage zone: <strong>{selectedArea}</strong>, {cityData.name} — {stateData?.label}
          </span>
        </div>
      )}

      {/* ── Leaflet / Esri ArcGIS Map ─────────────────────────── */}
      {(cityData || customPin) && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 300 }}>
          <LeafletMap
            lat={mapLat}
            lng={mapLng}
            zoom={mapZoom}
            areaName={mapLabel}
            allAreas={customPin ? [] : areas}
            customPin={customPin ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
