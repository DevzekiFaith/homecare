import { createClient } from "@/lib/supabase/server";
import JobTable from "./JobTable";
import { DEMO_JOB_FILTER } from "@/lib/jobs";

export default async function AdminJobsPage() {
  const supabase = await createClient();
  
  const { data: jobs } = await supabase
    .from("service_requests")
    .select("id, service_type, description, address, status, preferred_time, created_at")
    .not("id", "in", DEMO_JOB_FILTER)
    .not("address", "ilike", "%Test Street%")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Admin</p>
        <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">All Jobs</h1>
        <p className="mt-1 text-sm text-zinc-500">Every service request across the platform.</p>
      </div>

      <JobTable initialJobs={jobs ?? []} />
    </div>
  );
}
