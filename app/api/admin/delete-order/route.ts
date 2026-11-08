import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { id, order_ref } = await req.json();
    if (!id && !order_ref) {
      return NextResponse.json({ success: false, error: "Order ID or Reference required" }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase.from("store_orders").delete();
    if (id) {
      query = query.eq("id", id);
    } else if (order_ref) {
      query = query.eq("order_ref", order_ref);
    }

    const { error } = await query;
    if (error) {
      console.warn("Delete order error from Supabase:", error.message);
      // Fallback: update status to cancelled if direct delete is blocked
      if (id) {
        await supabase.from("store_orders").update({ status: "cancelled" }).eq("id", id);
      } else if (order_ref) {
        await supabase.from("store_orders").update({ status: "cancelled" }).eq("order_ref", order_ref);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete order endpoint error:", err);
    return NextResponse.json({ success: false, error: err.message || "Deletion failed" }, { status: 500 });
  }
}

