const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://iqvizntilpgitzyxmgoa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw"
);

async function test() {
  try {
    const { data, error } = await supabase.from('reviews').select('*').limit(1);
    if (error) {
      console.log("REVIEWS_TABLE_ERROR:", error.message, error.code);
    } else {
      console.log("REVIEWS_TABLE_EXISTS:", data);
    }
  } catch (e) {
    console.error("Connection failed:", e);
  }
}

test();
