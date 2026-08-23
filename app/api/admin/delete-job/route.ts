import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://iqvizntilpgitzyxmgoa.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Job ID required" }, { status: 400 });
    }

    // 1. Delete linked reviews / ratings
    await supabase.from("service_ratings").delete().eq("request_id", id);

    // 2. Delete linked chat messages if table exists
    await supabase.from("chat_messages").delete().eq("request_id", id);

    // 3. Delete the job request record
    const { error } = await supabase.from("service_requests").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Deletion failed" }, { status: 500 });
  }
}
