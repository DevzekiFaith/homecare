const url = "https://iqvizntilpgitzyxmgoa.supabase.co/rest/v1/reviews?select=*&limit=1";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw";

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });
    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
