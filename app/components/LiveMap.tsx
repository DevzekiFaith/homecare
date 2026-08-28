"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import "leaflet/dist/leaflet.css";
import { ESRI_TILE_PROVIDERS, calculateDistanceKm, formatEta } from "@/lib/mapConfig";
import InMapChat from "@/app/components/InMapChat";
import { Radio, ShieldCheck, Sparkles } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const createRadarMarker = (
  color: string,
  label: string,
  badgeText?: string,
  isClient: boolean = false
) =>
  new L.DivIcon({
    className: "bg-transparent",
    html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
            <div style="background-color: ${color}; width: ${isClient ? "16px" : "14px"}; height: ${isClient ? "16px" : "14px"}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 16px ${color}; position: relative; z-index: 2;"></div>
            <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; position: absolute; top: -11px; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="margin-top: 5px; background: rgba(15, 23, 42, 0.95); color: white; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 7px; border-radius: 8px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px;">
              ${isClient ? "📍 " : "🚗 "}${label}
              ${badgeText ? `<span style="background: rgba(16, 185, 129, 0.25); color: #34d399; padding: 1px 4px; border-radius: 4px; font-size: 7.5px;">${badgeText}</span>` : ""}
            </div>
         </div>`,
    iconSize: [38, 50],
    iconAnchor: [19, 25],
  });

const clientRadarIcon = createRadarMarker("#0284c7", "Client Location", "Target", true);
const proRadarIcon = createRadarMarker("#10b981", "HomePro Professional", "En Route", false);

interface LiveMapProps {
  interactive?: boolean;
  showRoute?: boolean;
  onLocationSelect?: (location: string) => void;
  onAddressResolved?: (address: string) => void;
  onSuggestionsFound?: (suggestions: Array<{ lat: string; lon: string; display_name: string; importance: number }>) => void;
  address?: string;
  height?: string;
  className?: string;
  initialCenter?: [number, number];
  onSearchStateChange?: (searching: boolean) => void;
  trackingJobId?: string;
  workerName?: string;
  workerRole?: string;
  clientName?: string;
}

function LocationMarker({
  onSelect,
  onPositionChange,
  onAddressResolved,
}: {
  onSelect?: (location: string) => void;
  onPositionChange?: (pos: L.LatLng) => void;
  onAddressResolved?: (address: string) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onSelect) {
        onSelect(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      }
      if (onPositionChange) {
        onPositionChange(e.latlng);
      }

      // Reverse Geocoding
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`
        );
        const data = await res.json();
        if (data.display_name && onAddressResolved) {
          onAddressResolved(data.display_name);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={clientRadarIcon}>
      <Popup>
        <div className="p-1 font-bold text-xs">Service Location Confirmed</div>
      </Popup>
    </Marker>
  );
}

// Map Controller for Forward Geocoding
function MapController({
  address,
  onPositionChange,
  onSuggestionsFound,
  onSearchStateChange,
}: {
  address?: string;
  onPositionChange: (pos: L.LatLng) => void;
  onSuggestionsFound?: (suggestions: Array<{ lat: string; lon: string; display_name: string; importance: number }>) => void;
  onSearchStateChange?: (searching: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!address || address.length < 5) {
      if (onSuggestionsFound) onSuggestionsFound([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (onSearchStateChange) onSearchStateChange(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=ng`
        );
        const data = await res.json();

        if (onSuggestionsFound) {
          onSuggestionsFound(data);
        }

        if (data && data.length > 0) {
          const { lat, lon, importance } = data[0];
          const pos = new L.LatLng(parseFloat(lat), parseFloat(lon));

          if (importance > 0.4 || address.split(" ").length > 2) {
            map.flyTo(pos, 15);
            onPositionChange(pos);
          }
        }
      } catch (err) {
        console.error("Forward geocoding error:", err);
      } finally {
        if (onSearchStateChange) onSearchStateChange(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [address, map, onPositionChange, onSuggestionsFound, onSearchStateChange]);

  return null;
}

export default function LiveMap({
  interactive = true,
  showRoute = true,
  onLocationSelect,
  onAddressResolved,
  onSuggestionsFound,
  address,
  height = "450px",
  className = "",
  initialCenter = [6.4584, 7.5464], // Default center
  onSearchStateChange,
  trackingJobId,
  workerName = "HomePro Specialist",
  workerRole = "Verified Professional",
  clientName = "Client",
}: LiveMapProps) {
  const [mounted, setMounted] = useState(false);
  const [targetPos, setTargetPos] = useState<L.LatLng | null>(null);
  const [proPos, setProPos] = useState<[number, number] | null>(null);
  const [tileLayerKey, setTileLayerKey] = useState<"streets" | "satellite" | "topo">("streets");
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Handle simultaneous real-time worker tracking & route simulation
  useEffect(() => {
    if (!trackingJobId) {
      // Simulate pro starting offset when targetPos is set or on initial load
      const baseLat = targetPos ? targetPos.lat : initialCenter[0];
      const baseLng = targetPos ? targetPos.lng : initialCenter[1];

      const startOriginLat = baseLat + 0.009;
      const startOriginLng = baseLng + 0.008;

      let startTimestamp: number | null = null;
      const cycleDuration = 16000;

      const animate = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const p = (elapsed % cycleDuration) / cycleDuration;
        const progress = 0.2 + Math.sin(p * Math.PI) * 0.65;

        const currentLat = startOriginLat + (baseLat - startOriginLat) * progress;
        const currentLng = startOriginLng + (baseLng - startOriginLng) * progress;
        setProPos([currentLat, currentLng]);

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }

    // Real-time tracking from Supabase channel
    const supabase = createClient();
    const channel = supabase
      .channel(`tracking:${trackingJobId}`)
      .on(
        "broadcast",
        { event: "location" },
        (payload: { payload: { lat: number; lng: number } }) => {
          const { lat, lng } = payload.payload;
          setProPos([lat, lng]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingJobId, targetPos, initialCenter]);

  // Compute live distance and dynamic ETA
  const telemetry = useMemo(() => {
    const clientCoords: [number, number] = targetPos
      ? [targetPos.lat, targetPos.lng]
      : initialCenter;
    if (!proPos) {
      return { distanceKm: 1.2, eta: "4 mins", clientCoords };
    }
    const dist = calculateDistanceKm(proPos[0], proPos[1], clientCoords[0], clientCoords[1]);
    const eta = formatEta(dist, 26);
    return { distanceKm: dist, eta, clientCoords };
  }, [targetPos, initialCenter, proPos]);

  if (!mounted) {
    return <div style={{ height }} className={`bg-slate-900 animate-pulse rounded-3xl ${className}`} />;
  }

  const currentTile = ESRI_TILE_PROVIDERS[tileLayerKey] || ESRI_TILE_PROVIDERS.streets;
  const targetLocation: [number, number] = targetPos
    ? [targetPos.lat, targetPos.lng]
    : initialCenter;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 border-sky-500/20 shadow-2xl bg-slate-950 ${className}`}
      style={{ height }}
    >
      {/* Top Map Layer Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg text-[10px]">
        <span className="text-sky-400 font-extrabold uppercase px-1 hidden sm:inline flex items-center gap-1">
          <Radio size={11} className="text-emerald-400 animate-pulse" />
          Esri GPS:
        </span>
        {(["streets", "satellite", "topo"] as const).map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => setTileLayerKey(layer)}
            className={`px-2 py-1 rounded-lg font-bold uppercase transition-all cursor-pointer ${
              tileLayerKey === layer
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      <MapContainer
        center={initialCenter}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          key={currentTile.id}
          url={currentTile.url}
          attribution={currentTile.attribution}
          maxZoom={currentTile.maxZoom}
        />

        <MapController
          address={address}
          onPositionChange={setTargetPos}
          onSuggestionsFound={onSuggestionsFound}
          onSearchStateChange={onSearchStateChange}
        />

        {/* Client / Target Location Marker */}
        {interactive ? (
          <LocationMarker
            onSelect={onLocationSelect}
            onPositionChange={setTargetPos}
            onAddressResolved={onAddressResolved}
          />
        ) : (
          <Marker position={targetLocation} icon={clientRadarIcon}>
            <Popup>
              <div className="p-2 text-center">
                <p className="text-xs font-black text-slate-900">Your Dispatch Address</p>
                <p className="text-[10px] text-sky-600">{address || "Confirmed Destination"}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Radar Range Rings */}
        <Circle
          center={targetLocation}
          radius={900}
          pathOptions={{ color: "#0284c7", fillColor: "#0284c7", fillOpacity: 0.05, weight: 1.5, dashArray: "4, 6" }}
        />

        {/* Simultaneous Worker Location & Animated Route Polyline */}
        {(showRoute || proPos) && proPos && (
          <>
            <Marker position={proPos} icon={proRadarIcon}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-black uppercase">
                    <ShieldCheck size={14} /> {workerName}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{workerRole}</p>
                  <p className="text-xs font-extrabold text-emerald-600 mt-1">
                    ETA: {telemetry.eta} · {telemetry.distanceKm} km away
                  </p>
                </div>
              </Popup>
            </Marker>

            <Polyline
              positions={[proPos, targetLocation]}
              pathOptions={{
                color: "#10b981",
                weight: 4,
                dashArray: "8, 12",
                opacity: 0.9,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Floating Status & Telemetry HUD */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
        <div className="rounded-2xl bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md border border-sky-500/30 flex items-center gap-3 text-white">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/40 animate-pulse">
            🚗
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                Live Dual Tracking
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-xs font-black text-white">
              {telemetry.eta} arrival ({telemetry.distanceKm} km)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Dispatch Indicator Bar */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <span className="rounded-full bg-slate-900/90 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-sky-300 border border-white/10 backdrop-blur-md shadow-xl flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          {interactive
            ? targetPos
              ? "Location Pinned · Esri ArcGIS HD"
              : "Tap Map or Type Address"
            : "Live GPS & In-Map Telemetry Active"}
        </span>
      </div>

      {/* Integrated In-Map Live Chat */}
      <InMapChat
        requestId={trackingJobId}
        workerName={workerName}
        workerRole={workerRole}
        clientName={clientName}
        isDemo={!trackingJobId}
        position="bottom-right"
        className="!bottom-3 !right-3"
      />
    </div>
  );
}
