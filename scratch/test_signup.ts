import { createClient } from "@supabase/supabase-js";

const url = "https://iqvizntilpgitzyxmgoa.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw";

const supabase = createClient(url, key);

async function main() {
  console.log("Testing auth.signUp...");
  const start = Date.now();
  const testEmail = `worker.test.${Date.now()}@homecare.com.ng`;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: "Password123!",
      options: {
        data: {
          full_name: "Test Worker",
          role: "worker"
        }
      }
    });

    console.log(`signUp completed in ${Date.now() - start}ms:`, { data, error });
  } catch (err) {
    console.error("signUp Exception:", err);
  }
}

main();
