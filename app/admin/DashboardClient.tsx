"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, MapPin, TrendingUp, ShoppingBag, Users, ShieldCheck, ArrowRight, CheckCircle2, Bell } from "lucide-react";
import { CITIES } from "@/lib/cities";

interface DashboardClientProps {
  stats: {
    totalJobs: number;
    pendingJobs: number;
    totalWorkers: number;
    verifiedWorkers: number;
    totalStoreOrders: number;
    pendingStoreOrders: number;
    totalStoreRevenue: number;
    totalWaitlist?: number;
    pendingWaitlist?: number;
    totalWaitlistUnits?: number;
  };
  activeCitiesCount: number;
  upcomingCitiesCount: number;
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  delay,
  accentColor = "text-sky-600",
  bgAccent = "bg-sky-50 text-sky-600 border-sky-200",
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  delay: number;
  accentColor?: string;
  bgAccent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${bgAccent}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-heading font-black tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-slate-500 font-semibold">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardClient({ stats, activeCitiesCount, upcomingCitiesCount }: DashboardClientProps) {
  const quickActions = [
    {
      title: "Manage Jobs",
      desc: `${stats.pendingJobs} pending assignments`,
      href: "/admin/jobs",
      icon: ClipboardList,
      btnText: "Open Jobs",
    },
    {
      title: "Verify Workers",
      desc: `${stats.totalWorkers - stats.verifiedWorkers} unverified registrations`,
      href: "/admin/workers",
      icon: Users,
      btnText: "Review Workers",
    },
    {
      title: "Store Orders",
      desc: `${stats.pendingStoreOrders} pending fulfillment`,
      href: "/admin/store-orders",
      icon: ShoppingBag,
      btnText: "Manage Orders",
    },
    {
      title: "Restock Waitlist",
      desc: `${stats.pendingWaitlist ?? 0} buyers waiting (${stats.totalWaitlistUnits ?? 0} units)`,
      href: "/admin/restock-waitlist",
      icon: Bell,
      btnText: "View Waitlist",
    },
    {
      title: "Payment Verifications",
      desc: "Review customer bank transfers",
      href: "/admin/payments",
      icon: ShieldCheck,
      btnText: "Verify Payments",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          label="Total Jobs" 
          value={stats.totalJobs} 
          sub={`${stats.pendingJobs} awaiting match`} 
          icon={ClipboardList} 
          delay={0}
          accentColor="text-sky-600"
          bgAccent="bg-sky-50 text-sky-600 border-sky-200"
        />
        <StatCard 
          label="Active Workers" 
          value={stats.totalWorkers} 
          sub={`${stats.verifiedWorkers} verified pros`} 
          icon={Users} 
          delay={0.05}
          accentColor="text-emerald-600"
          bgAccent="bg-emerald-50 text-emerald-600 border-emerald-200"
        />
        <StatCard 
          label="Store Orders" 
          value={stats.totalStoreOrders} 
          sub={`${stats.pendingStoreOrders} pending payment`} 
          icon={ShoppingBag} 
          delay={0.1}
          accentColor="text-amber-600"
          bgAccent="bg-amber-50 text-amber-600 border-amber-200"
        />
        <StatCard 
          label="Restock Waitlist" 
          value={stats.totalWaitlist ?? 0} 
          sub={`${stats.totalWaitlistUnits ?? 0} units demanded`} 
          icon={Bell} 
          delay={0.12}
          accentColor="text-rose-600"
          bgAccent="bg-rose-50 text-rose-600 border-rose-200"
        />
        <StatCard 
          label="Store Revenue" 
          value={`₦${stats.totalStoreRevenue.toLocaleString()}`} 
          sub="Platform item sales" 
          icon={TrendingUp} 
          delay={0.15}
          accentColor="text-indigo-600"
          bgAccent="bg-indigo-50 text-indigo-600 border-indigo-200"
        />
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Quick Controls</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2 text-sky-600">
                  <action.icon size={18} />
                  <h3 className="text-sm font-black text-slate-900">{action.title}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">{action.desc}</p>
              </div>
              <Link
                href={action.href}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <span>{action.btnText}</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* City Status Overview */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-sky-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">City Expansion Status</h2>
          </div>
          <Link
            href="/admin/cities"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
          >
            Configure Cities →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {CITIES.map((city) => (
            <div key={city.id} className="flex items-center justify-between px-6 py-4 hover:bg-sky-50/50 transition-colors">
              <div>
                <p className="text-sm font-black text-slate-900">{city.name}</p>
                <p className="text-xs text-slate-500 font-medium">{city.state} · {city.areas.length} active service areas</p>
              </div>
              <div className="flex items-center gap-2">
                {city.active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
                {city.launchSoon && !city.active && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-800">
                    Coming Soon
                  </span>
                )}
                {!city.active && !city.launchSoon && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Planned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex gap-6 text-xs uppercase font-black tracking-wider text-slate-600">
          <span><strong className="text-sky-600 font-black">{activeCitiesCount}</strong> live markets</span>
          <span><strong className="text-sky-600 font-black">{upcomingCitiesCount}</strong> upcoming launches</span>
        </div>
      </div>
    </div>
  );
}


