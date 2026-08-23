import { createClient } from "@/lib/supabase/server";
import WorkerTable from "./WorkerTable";
import Link from "next/link";
import { UserPlus, ShieldCheck } from "lucide-react";

export default async function AdminWorkersPage() {
  const supabase = await createClient();
  
  const { data: workers, error } = await supabase
    .from("professionals")
    .select("id, full_name, phone, primary_skill, nin, is_verified, ai_verified, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-sky-600 mb-1">Talent & Network</p>
          <h1 className="text-2xl font-heading font-black tracking-tight text-slate-900">Service Professionals</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Live database records from the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono font-bold">professionals</code> table. Review, verify, and approve technician profiles.
          </p>
        </div>
        <Link
          href="/auth/worker/register"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <UserPlus size={14} /> Technician Onboarding Portal
        </Link>
      </div>

      <WorkerTable initialWorkers={workers ?? []} />
    </div>
  );
}

