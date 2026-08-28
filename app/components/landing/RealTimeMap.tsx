"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldCheck, Radio, MapPin } from "lucide-react";
import { ESRI_TILE_PROVIDERS, calculateDistanceKm, formatEta } from "@/lib/mapConfig";
import InMapChat from "@/app/components/InMapChat";

// Remove default leaflet icon broken URL lookup
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const createRadarIcon = (
  color: string,
  label: string,
  badgeText?: string,
  isClient: boolean = false
) =>
  new L.DivIcon({
    className: "bg-transparent",
    html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            <div style="background-color: ${color}; width: ${isClient ? "16px" : "14px"}; height: ${isClient ? "16px" : "14px"}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 18px ${color}; position: relative; z-index: 2;"></div>
            <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; position: absolute; top: -11px; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="margin-top: 5px; background: rgba(15, 23, 42, 0.95); color: white; font-size: 9.5px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 8px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px;">
              ${isClient ? "📍 " : "🚗 "}${label}
              ${badgeText ? `<span style="background: rgba(16, 185, 129, 0.25); color: #34d399; padding: 1px 4px; border-radius: 4px; font-size: 8px;">${badgeText}</span>` : ""}
            </div>
         </div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 26],
  });

interface CityLocation {
  name: string;
  center: [number, number];
  zoom: number;
  proOffsets: Array<{
    dLat: number;
    dLng: number;
    name: string;
    role: string;
    rating: number;
    color: string;
  }>;
}

const CITIES: CityLocation[] = [
  {
    name: "Lagos (Lekki)",
    center: [6.4474, 3.4735],
    zoom: 14,
    proOffsets: [
      { dLat: 0.008, dLng: 0.009, name: "Emeka N.", role: "Master Plumber", rating: 4.9, color: "#10b981" },
      { dLat: -0.007, dLng: -0.008, name: "Tunde A.", role: "Certified Electrician", rating: 5.0, color: "#f59e0b" },
      { dLat: 0.005, dLng: -0.007, name: "Chidi O.", role: "HVAC & AC Tech", rating: 4.8, color: "#06b6d4" },
      { dLat: -0.004, dLng: 0.006, name: "Ibrahim K.", role: "Precision Carpenter", rating: 4.9, color: "#8b5cf6" },
    ],
  },
  {
    name: "Abuja (Wuse)",
    center: [9.0667, 7.4833],
    zoom: 14,
    proOffsets: [
      { dLat: 0.007, dLng: 0.008, name: "Musa B.", role: "Senior Electrician", rating: 5.0, color: "#f59e0b" },
      { dLat: -0.006, dLng: -0.007, name: "Segun O.", role: "Solar & Inverter Tech", rating: 4.9, color: "#10b981" },
      { dLat: 0.004, dLng: -0.006, name: "David E.", role: "Emergency Plumber", rating: 4.8, color: "#06b6d4" },
    ],
  },
  {
    name: "Port Harcourt",
    center: [4.8156, 7.0498],
    zoom: 14,
    proOffsets: [
      { dLat: 0.007, dLng: 0.008, name: "Tamuno G.", role: "Plumber & Drainage", rating: 4.9, color: "#10b981" },
      { dLat: -0.006, dLng: -0.006, name: "Victor B.", role: "HVAC Specialist", rating: 4.9, color: "#06b6d4" },
    ],
  },
  {
    name: "Enugu",
    center: [6.4584, 7.5464],
    zoom: 14,
    proOffsets: [
      { dLat: 0.006, dLng: 0.007, name: "Chukwudi M.", role: "Certified Electrician", rating: 5.0, color: "#f59e0b" },
      { dLat: -0.005, dLng: -0.006, name: "Obinna K.", role: "Master Plumber", rating: 4.9, color: "#10b981" },
    ],
  },
  {
    name: "Ibadan",
    center: [7.3775, 3.947],
    zoom: 14,
    proOffsets: [
      { dLat: 0.006, dLng: 0.007, name: "Adeyemi S.", role: "Plumber & Piping", rating: 4.9, color: "#10b981" },
      { dLat: -0.005, dLng: -0.006, name: "Oluwaseun T.", role: "Generator Tech", rating: 5.0, color: "#f59e0b" },
    ],
  },
];

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function RealTimeMap() {
  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityLocation>(CITIES[0]);
  const [tileLayerKey, setTileLayerKey] = useState<"streets" | "satellite" | "topo">("streets");
  const [activeProIndex, setActiveProIndex] = useState(0);
  const [transitProgress, setTransitProgress] = useState(0); // 0 to 1 along path
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Smooth real-time movement simulation for active worker towards client
  useEffect(() => {
    if (!mounted) return;
    let startTimestamp: number | null = null;
    const cycleDuration = 14000; // 14s loop

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const normalized = 0.15 + Math.sin(progress * Math.PI) * 0.7;
      setTransitProgress(normalized);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mounted]);

  const activeCityPros = useMemo(() => {
    const [cLat, cLng] = selectedCity.center;
    return selectedCity.proOffsets.map((pro, idx) => {
      const originLat = cLat + pro.dLat;
      const originLng = cLng + pro.dLng;

      let currentLat = originLat;
      let currentLng = originLng;

      if (idx === activeProIndex) {
        currentLat = originLat + (cLat - originLat) * transitProgress;
        currentLng = originLng + (cLng - originLng) * transitProgress;
      }

      const dist = calculateDistanceKm(currentLat, currentLng, cLat, cLng);
      const eta = formatEta(dist, 28);

      return {
        ...pro,
        currentPos: [currentLat, currentLng] as [number, number],
        originPos: [originLat, originLng] as [number, number],
        distanceKm: dist,
        eta,
      };
    });
  }, [selectedCity, activeProIndex, transitProgress]);

  const activePro = activeCityPros[activeProIndex] || activeCityPros[0];
  const clientLocation = selectedCity.center;

  if (!mounted) {
    return (
      <div className="w-full aspect-square md:aspect-video lg:aspect-square bg-slate-950 rounded-3xl animate-pulse flex items-center justify-center border border-sky-500/20 shadow-2xl">
        <div className="flex items-center gap-3 text-sky-400 font-bold uppercase tracking-widest text-xs">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>Initializing Esri ArcGIS GPS Engine...</span>
        </div>
      </div>
    );
  }

  const currentTileProvider = ESRI_TILE_PROVIDERS[tileLayerKey] || ESRI_TILE_PROVIDERS.streets;

  return (
    <div className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden border-2 border-sky-500/30 shadow-2xl bg-slate-950">
      {/* Top Header & City Switcher Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 pl-2 pr-1 hidden sm:inline flex items-center gap-1">
            <Radio size={12} className="text-emerald-400 animate-pulse" />
            Radar:
          </span>
          {CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => {
                setSelectedCity(city);
                setActiveProIndex(0);
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedCity.name === city.name
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/40"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {city.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Map Layer Switcher (Esri Streets / Satellite / Topo) */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
          {(["streets", "satellite", "topo"] as const).map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => setTileLayerKey(layer)}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                tileLayerKey === layer
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leaflet Map with Esri TileLayer */}
      <MapContainer
        center={clientLocation}
        zoom={selectedCity.zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
        zoomControl={false}
      >
        <ChangeView center={clientLocation} zoom={selectedCity.zoom} />

        {/* High-Resolution Esri ArcGIS TileLayer */}
        <TileLayer
          key={currentTileProvider.id}
          url={currentTileProvider.url}
          attribution={currentTileProvider.attribution}
          maxZoom={currentTileProvider.maxZoom}
        />

        {/* Client (You) Location Pin */}
        <Marker
          position={clientLocation}
          icon={createRadarIcon("#0284c7", "Your Location", "Live Hub", true)}
        >
          <Popup className="custom-popup">
            <div className="p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-600 text-[11px] font-black uppercase">
                <MapPin size={13} /> Your Dispatch Address
              </div>
              <p className="text-xs font-black text-slate-900 mt-1">Live Home Location</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {activeCityPros.length} Verified Professionals in 2km Radius
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Radar Range Rings */}
        <Circle
          center={clientLocation}
          radius={1200}
          pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.06, weight: 1.5, dashArray: "4, 8" }}
        />
        <Circle
          center={clientLocation}
          radius={600}
          pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.08, weight: 1.5 }}
        />

        {/* Live Active Route Polyline from Active Pro to Client */}
        {activePro && (
          <Polyline
            positions={[activePro.currentPos, clientLocation]}
            pathOptions={{
              color: activePro.color || "#10b981",
              weight: 4,
              dashArray: "8, 12",
              opacity: 0.9,
            }}
          />
        )}

        {/* Professional Markers */}
        {activeCityPros.map((pro, idx) => {
          const isActive = idx === activeProIndex;
          const icon = createRadarIcon(
            pro.color,
            `${pro.name} · ${pro.eta}`,
            isActive ? "En Route" : "Active"
          );

          return (
            <Marker
              key={pro.name}
              position={pro.currentPos}
              icon={icon}
              eventHandlers={{
                click: () => setActiveProIndex(idx),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[160px]">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase">
                    <ShieldCheck size={14} /> Verified Professional
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-1">{pro.name}</p>
                  <p className="text-[11px] text-sky-700 font-bold">{pro.role}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-semibold">{pro.distanceKm} km away</span>
                    <span className="text-emerald-600 font-black">ETA: {pro.eta}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Live Telemetry HUD Bar */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-[1000] bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-sky-500/30 flex flex-wrap items-center justify-between gap-3 text-white shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-white">
                {activePro ? `${activePro.name} (${activePro.role})` : "Live Dual Tracking"}
              </p>
              <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                In Transit
              </span>
            </div>
            <p className="text-[10px] text-sky-300 font-semibold flex items-center gap-2 mt-0.5">
              <span>Leaflet + Esri ArcGIS GPS Engine</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{activePro?.distanceKm} km to door</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Estimated Arrival</p>
            <p className="text-xs font-black text-emerald-400">{activePro?.eta}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveProIndex((prev) => (prev + 1) % activeCityPros.length)}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-sky-600 text-[10px] font-black uppercase text-white transition-all cursor-pointer border border-white/10"
          >
            Track Next Pro
          </button>
        </div>
      </div>

      {/* Integrated In-Map Live Chat Simulator on Homepage */}
      <InMapChat
        isDemo={true}
        workerName={activePro?.name || "Emeka N. (Verified Pro)"}
        workerRole={activePro?.role || "Master Plumber & Pipe Tech"}
        clientName="You"
        position="bottom-right"
        className="!bottom-16 !right-3.5"
      />
    </div>
  );
}
