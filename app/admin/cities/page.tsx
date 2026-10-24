import { CITIES } from "@/lib/cities";
import CityList from "./CityList";
import { MapPin, Globe } from "lucide-react";

export default function AdminCitiesPage() {
  const liveCount = CITIES.filter((c) => c.active).length;
  const soonCount = CITIES.filter((c) => c.launchSoon).length;
  const totalAreas = CITIES.reduce((sum, c) => sum + c.areas.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-sky-600 mb-1">Admin Console</p>
        <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900">City & Coverage Management</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Configure active coverage areas, launch regions, and service zones.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Live Markets", value: liveCount, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Coming Soon", value: soonCount, color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
          { label: "Total Coverage Areas", value: totalAreas, color: "text-slate-900", bg: "bg-slate-100 border-slate-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-5 rounded-2xl bg-white border ${bg} shadow-xs text-center`}>
            <p className={`text-3xl font-heading font-black ${color}`}>{value}</p>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mt-1.5">{label}</p>
          </div>
        ))}
      </div>

      <CityList cities={CITIES} />
    </div>
  );
}

