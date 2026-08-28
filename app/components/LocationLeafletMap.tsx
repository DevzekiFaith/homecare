"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { ESRI_TILE_PROVIDERS } from "@/lib/mapConfig";

// Fix default marker icons for Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icon definitions
const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customAddressIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -42],
  shadowSize: [48, 48],
});

const otherIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

interface AreaPoint {
  name: string;
  lat: number;
  lng: number;
}

interface CustomPin {
  lat: number;
  lng: number;
  label: string;
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { animate: true, duration: 0.9 });
  }, [lat, lng, zoom, map]);
  return null;
}

interface Props {
  lat: number;
  lng: number;
  zoom: number;
  areaName: string;
  allAreas: AreaPoint[];
  customPin?: CustomPin;
}

export default function LocationLeafletMap({ lat, lng, zoom, areaName, allAreas, customPin }: Props) {
  const [tileKey, setTileKey] = useState<"streets" | "satellite" | "topo">("streets");
  const tileProvider = ESRI_TILE_PROVIDERS[tileKey] || ESRI_TILE_PROVIDERS.streets;

  return (
    <div className="relative w-full h-full">
      {/* Esri Layer Switcher */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg text-[9px]">
        {(["streets", "satellite", "topo"] as const).map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => setTileKey(layer)}
            className={`px-2 py-0.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
              tileKey === layer
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Esri ArcGIS TileLayer */}
        <TileLayer
          key={tileProvider.id}
          url={tileProvider.url}
          attribution={tileProvider.attribution}
          maxZoom={tileProvider.maxZoom}
        />

        <FlyTo lat={lat} lng={lng} zoom={zoom} />

        {/* Custom address pin (red — exact geocoded location) */}
        {customPin && (
          <Marker position={[customPin.lat, customPin.lng]} icon={customAddressIcon}>
            <Popup>
              <div style={{ fontFamily: "system-ui", fontSize: 12 }}>
                <strong style={{ fontSize: 13 }}>📍 {customPin.label}</strong><br />
                <span style={{ color: "#dc2626" }}>✓ Your Exact Address</span><br />
                <span style={{ color: "#6b7280", fontSize: 11 }}>
                  {customPin.lat.toFixed(5)}, {customPin.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Selected area green marker */}
        {!customPin && (
          <Marker position={[lat, lng]} icon={selectedIcon}>
            <Popup>
              <div style={{ fontFamily: "system-ui", fontSize: 12 }}>
                <strong style={{ fontSize: 13 }}>📍 {areaName}</strong><br />
                <span style={{ color: "#16a34a" }}>✓ HomeCare Service Zone</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Other service area markers in the city (blue) */}
        {allAreas
          .filter((a) => a.name !== areaName)
          .map((area) => (
            <Marker key={area.name} position={[area.lat, area.lng]} icon={otherIcon}>
              <Popup>
                <div style={{ fontFamily: "system-ui", fontSize: 12 }}>
                  <strong>{area.name}</strong><br />
                  <span style={{ color: "#2563eb" }}>Service Area</span>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
