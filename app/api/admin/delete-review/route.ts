import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.warn("Delete review warning:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete review endpoint error:", err);
    return NextResponse.json({ success: false, error: err.message || "Deletion failed" }, { status: 500 });
  }
}

