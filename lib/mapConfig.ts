// Esri ArcGIS & Leaflet Map Tile Providers & Utilities

export interface MapTileProvider {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const ESRI_TILE_PROVIDERS: Record<string, MapTileProvider> = {
  streets: {
    id: "streets",
    name: "Esri Streets",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS, Intermap, iPC, METI, GIS User Community',
    maxZoom: 19,
  },
  topo: {
    id: "topo",
    name: "Esri Topographic",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey',
    maxZoom: 19,
  },
  satellite: {
    id: "satellite",
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  dark: {
    id: "dark",
    name: "Esri Dark Canvas",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS, GIS User Community',
    maxZoom: 16,
  },
};

export const DEFAULT_ESRI_TILE = ESRI_TILE_PROVIDERS.streets;

/**
 * Calculate Great-circle distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Format ETA string based on distance and average urban travel speed (default 25 km/h)
 */
export function formatEta(distanceKm: number, averageSpeedKmh: number = 25): string {
  if (distanceKm <= 0.05) return "Arrived on site";
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.max(1, Math.round(hours * 60));
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"}`;
  }
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return `${hrs} hr ${remMins} min`;
}

/**
 * Interpolate intermediate points along a straight/stepped trajectory
 */
export function interpolatePoints(
  start: [number, number],
  end: [number, number],
  steps: number = 10
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    points.push([lat, lng]);
  }
  return points;
}
