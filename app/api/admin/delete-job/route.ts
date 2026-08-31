import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Unlink / delete foreign key references
    try {
      await supabase.from("property_issues").delete().eq("related_service_request_id", id);
      await supabase.from("property_maintenance_records").delete().eq("service_request_id", id);
      await supabase.from("service_ratings").delete().eq("request_id", id);
      await supabase.from("chat_messages").delete().eq("request_id", id);
    } catch (cleanErr) {
      console.warn("Foreign key cleanup warning:", cleanErr);
    }

    // 2. Delete the job request record
    const { error } = await supabase.from("service_requests").delete().eq("id", id);

    if (error) {
      console.warn("Direct delete restricted, falling back to cancelling status:", error.message);
      // Fallback: update status to cancelled so it is removed from active radar
      await supabase.from("service_requests").update({ status: "cancelled" }).eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete job error:", err);
    return NextResponse.json({ success: false, error: err.message || "Deletion failed" }, { status: 500 });
  }
}
