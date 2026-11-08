import { createClient } from "@/lib/supabase/server";
import { CITIES } from "@/lib/cities";
import DashboardClient from "./DashboardClient";
import { DEMO_STORE_ORDER_FILTER } from "@/lib/store-data";
import { DEMO_JOB_FILTER } from "@/lib/jobs";
import { getWaitlistEntries } from "@/lib/waitlist";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [jobsRes, workersRes, ordersRes, waitlistRes] = await Promise.all([
    supabase
      .from("service_requests")
      .select("id, status")
      .not("id", "in", DEMO_JOB_FILTER)
      .not("address", "ilike", "%Test Street%"),
    supabase.from("professionals").select("id, is_verified"),
    supabase.from("store_orders").select("id, status, total").not("order_ref", "in", DEMO_STORE_ORDER_FILTER),
    supabase.from("stock_waitlist").select("id, quantity, status"),
  ]);

  const jobs = jobsRes.data ?? [];
  const workers = workersRes.data ?? [];
  const orders = ordersRes.data ?? [];
  
  // Combine server-side persisted waitlist entries with Supabase table entries
  const localWaitlist = getWaitlistEntries();
  const remoteWaitlist = waitlistRes.data ?? [];
  const waitlistMap = new Map<string, any>();
  localWaitlist.forEach((w) => waitlistMap.set(w.id, w));
  remoteWaitlist.forEach((w) => waitlistMap.set(w.id, w));
  const waitlist = Array.from(waitlistMap.values());

  const stats = {
    totalJobs: jobs.length,
    pendingJobs: jobs.filter((j) => !j.status || j.status === "pending").length,
    totalWorkers: workers.length,
    verifiedWorkers: workers.filter((w) => w.is_verified).length,
    totalStoreOrders: orders.length,
    pendingStoreOrders: orders.filter((o) => o.status === "pending_payment").length,
    totalStoreRevenue: orders.reduce((sum: number, o) => sum + (Number(o.total) || 0), 0),
    totalWaitlist: waitlist.length,
    pendingWaitlist: waitlist.filter((w) => w.status === "pending").length,
    totalWaitlistUnits: waitlist.reduce((sum: number, w) => sum + (Number(w.quantity) || 1), 0),
  };

  const activeCitiesCount = CITIES.filter((c) => c.active).length;
  const upcomingCitiesCount = CITIES.filter((c) => c.launchSoon).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Overview</p>
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Platform health across all active cities.</p>
      </div>

      <DashboardClient
        stats={stats}
        activeCitiesCount={activeCitiesCount}
        upcomingCitiesCount={upcomingCitiesCount}
      />
    </div>
  );
}
