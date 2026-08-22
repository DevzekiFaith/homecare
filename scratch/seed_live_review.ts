import { createClient } from "@supabase/supabase-js";

const url = "https://iqvizntilpgitzyxmgoa.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxdml6bnRpbHBnaXR6eXhtZ29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTM3NzYsImV4cCI6MjEwMjcyOTc3Nn0.Gy0aT7RoLZs3QN4lelKdHxbZjHGPp00ebmIb5uUZPhw";

const supabase = createClient(url, key);

const WORKER_EMAIL = "worker.test.ezekiel@homecare.com.ng";
const WORKER_PASSWORD = "Password123!";
const CUSTOMER_ID = "2d1a77ba-d2fa-47c1-bd0f-2a5ecadbc745"; // Nkem Ubor

async function seed() {
  console.log("Starting Supabase database seeding using Auth signup...");
  let workerUserId = "";

  // 1. Try to sign in to check if user already exists
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: WORKER_EMAIL,
    password: WORKER_PASSWORD
  });

  if (signInErr) {
    console.log("Worker user not found or login failed. Attempting signup...");
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: WORKER_EMAIL,
      password: WORKER_PASSWORD,
      options: {
        data: {
          full_name: "Ezekiel Oghojafor",
        }
      }
    });

    if (signUpErr) {
      console.error("Signup failed:", signUpErr.message);
      return;
    }

    if (signUpData.user) {
      workerUserId = signUpData.user.id;
      console.log(`Worker user signed up successfully. User ID: ${workerUserId}`);
    } else {
      console.error("Signup succeeded but no user returned. Check email verification settings.");
      return;
    }
  } else if (signInData.user) {
    workerUserId = signInData.user.id;
    console.log(`Worker user logged in successfully. User ID: ${workerUserId}`);
  }

  // 2. Set profile role to 'worker'
  console.log("Updating profile role to 'worker'...");
  const { error: pUpdateErr } = await supabase
    .from("profiles")
    .update({
      full_name: "Ezekiel Oghojafor",
      role: "worker"
    })
    .eq("id", workerUserId);

  if (pUpdateErr) {
    console.error("Failed to update profile role:", pUpdateErr.message);
    return;
  }
  console.log("Worker profile updated.");

  // 3. Seed Professional record
  const { data: proCheck, error: proCheckErr } = await supabase
    .from("professionals")
    .select("id")
    .eq("id", workerUserId)
    .maybeSingle();

  if (!proCheck) {
    console.log("Creating professional record...");
    const { error: proInsertErr } = await supabase.from("professionals").insert({
      id: workerUserId,
      full_name: "Ezekiel Oghojafor",
      phone: "+2349119059859",
      nin: "12345678901",
      primary_skill: "Electrical",
      experience_years: 8,
      areas: ["Victoria Island"],
      bio: "Certified professional electrician with over 8 years of experience.",
      is_verified: true,
      ai_verified: true,
      ai_verification_reason: "Verified via system seed script"
    });
    if (proInsertErr) {
      console.error("Error creating professional:", proInsertErr.message);
      return;
    }
    console.log("Professional record created.");
  } else {
    console.log("Professional record already exists.");
  }

  // 4. Create completed service request in DB
  console.log("Inserting completed service request in DB...");
  const { data: request, error: reqInsertErr } = await supabase
    .from("service_requests")
    .insert({
      customer_id: CUSTOMER_ID,
      service_type: "Electrical",
      description: "Repair sparks and wire terminal short circuit in central distribution board.",
      address: "12 Victoria Island, Lagos",
      preferred_time: new Date().toISOString(),
      assigned_worker_id: workerUserId,
      status: "completed"
    })
    .select("id")
    .single();

  if (reqInsertErr) {
    console.error("Error creating service request:", reqInsertErr.message);
    return;
  }

  console.log("\nDatabase seeding completed successfully!");
  console.log("Real Completed Request ID: ", request.id);
}

seed();
