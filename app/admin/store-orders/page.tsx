import { createClient } from "@/lib/supabase/server";
import StoreOrdersTable from "./StoreOrdersTable";
import Link from "next/link";
import { ShoppingBag, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStoreOrdersPage() {
  const supabase = await createClient();
  
  const [ordersRes, waitlistRes] = await Promise.all([
    supabase
      .from("store_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("stock_waitlist")
      .select("id")
      .limit(100)
  ]);

  const orders = ordersRes.data ?? [];
  const waitlistCount = waitlistRes.data?.length ?? 0;

  if (ordersRes.error) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error loading orders: {ordersRes.error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Store Management</p>
          <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">Store Orders</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage all customer orders, live waybills, delivery dispatch, and restock waitlist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/store-orders"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>Orders ({orders.length})</span>
          </Link>
          <Link
            href="/admin/restock-waitlist"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Bell size={14} className="text-sky-600" />
            <span>Waitlist ({waitlistCount})</span>
          </Link>
        </div>
      </div>

      <StoreOrdersTable initialOrders={orders} />
    </div>
  );
}

