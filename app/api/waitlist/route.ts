import { NextResponse } from "next/server";
import {
  getWaitlistEntries,
  addWaitlistEntry,
  updateWaitlistStatus,
  deleteWaitlistEntry,
} from "@/lib/waitlist";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const localEntries = getWaitlistEntries();

    // Optionally check if remote Supabase has table & rows
    let remoteEntries: any[] = [];
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("stock_waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && Array.isArray(data)) {
        remoteEntries = data;
      }
    } catch {
      // Ignore if table does not exist on Supabase
    }

    // Merge entries avoiding duplicates
    const map = new Map<string, any>();
    localEntries.forEach((item) => {
      const key = `${item.customer_phone}-${item.product_id}`;
      map.set(key, item);
    });

    remoteEntries.forEach((item) => {
      const key = `${item.customer_phone}-${item.product_id}`;
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ success: true, entries: merged });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch waitlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productId,
      productName,
      name,
      phone,
      email,
      quantity,
      ref,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const saved = addWaitlistEntry({
      product_id: productId || "sp-water-5",
      product_name: productName || "Smart Device",
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_email: (email || "").trim(),
      quantity: Number(quantity) || 1,
      status: "pending",
      ref: ref,
    });

    // Try syncing to Supabase in the background if table exists
    try {
      const supabase = await createClient();
      await supabase.from("stock_waitlist").insert({
        product_id: saved.product_id,
        product_name: saved.product_name,
        customer_name: saved.customer_name,
        customer_email: saved.customer_email || "unspecified@waitlist.homecare.ng",
        customer_phone: saved.customer_phone,
        quantity: saved.quantity,
        status: "pending",
      });
    } catch {
      // Table may not exist yet in Supabase schema cache
    }

    return NextResponse.json({ success: true, entry: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add waitlist entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "ID and status are required" },
        { status: 400 }
      );
    }

    const updated = updateWaitlistStatus(id, status);

    // Try Supabase sync
    try {
      const supabase = await createClient();
      await supabase
        .from("stock_waitlist")
        .update({ status })
        .or(`id.eq.${id}`);
    } catch {
      // Ignore Supabase errors
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update waitlist entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const removed = deleteWaitlistEntry(id);

    // Try Supabase sync
    try {
      const supabase = await createClient();
      await supabase.from("stock_waitlist").delete().or(`id.eq.${id}`);
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, removed });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete waitlist entry" },
      { status: 500 }
    );
  }
}

