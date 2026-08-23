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
      return NextResponse.json({ success: false, error: "Worker ID required" }, { status: 400 });
    }

    // 1. Unassign worker from any active service_requests to satisfy FK constraints
    await supabase.from("service_requests").update({ assigned_worker_id: null }).eq("assigned_worker_id", id);

    // 2. Delete linked reviews / ratings
    await supabase.from("service_ratings").delete().eq("worker_id", id);

    // 3. Delete linked worker skills
    await supabase.from("worker_skills").delete().eq("worker_id", id);

    // 4. Delete the worker record from professionals table
    const { error } = await supabase.from("professionals").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Deletion failed" }, { status: 500 });
  }
}
