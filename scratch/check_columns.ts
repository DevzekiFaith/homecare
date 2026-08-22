import { createClient } from "@supabase/supabase-js";

const url = "https://iqvizntilpgitzyxmgoa.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw";

const supabase = createClient(url, key);

async function main() {
  const { data: profiles, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles Column Sample:", { profiles, error });

  const { data: pros, error: proErr } = await supabase.from('professionals').select('*').limit(1);
  console.log("Professionals Column Sample:", { pros, proErr });
}

main();
