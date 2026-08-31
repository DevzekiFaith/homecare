"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Property,
  HEALTH_CHECK_SYSTEMS,
  calculateHealthScore,
  determineHealthStatus,
} from "@/lib/property-care";
import Logo from "@/app/components/Logo";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Zap,
  Wrench,
  Droplets,
  Activity,
  Snowflake,
  Building,
  ShieldAlert,
  Save,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface InspectionStateItem {
  category: string;
  item_name: string;
  condition: "good" | "attention" | "critical" | "not_assessed";
  finding: string;
  recommendation: string;
  photo_file?: File | null;
  photo_preview?: string | null;
}

export default function WorkerHealthCheckPage() {
  const params = useParams();
  const router = useRouter();
  const rawPropertyId = params.propertyId as string;

  const supabase = useMemo(() => createClient(), []);

  const [property, setProperty] = useState<Property | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Initialize inspection checklist structure
  const [inspectionItems, setInspectionItems] = useState<InspectionStateItem[]>(() => {
    const items: InspectionStateItem[] = [];
    HEALTH_CHECK_SYSTEMS.forEach((sys) => {
      sys.items.forEach((itemText) => {
        items.push({
          category: sys.id,
          item_name: itemText,
          condition: "good", // default to good for fast one-tap adjustment
          finding: "",
          recommendation: "",
          photo_file: null,
          photo_preview: null,
        });
      });
    });
    return items;
  });

  // Calculate live health score as technician fills
  const liveHealthScore = useMemo(() => {
    return calculateHealthScore(inspectionItems);
  }, [inspectionItems]);

  const liveStatus = useMemo(() => {
    return determineHealthStatus(liveHealthScore);
  }, [liveHealthScore]);

  // Load Property & Worker Profile
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, phone, role")
          .eq("id", user.id)
          .maybeSingle();
        setWorkerProfile(profile);
      }

      // Fetch Property
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(rawPropertyId);
      const query = supabase.from("properties").select("*");
      if (isUuid) {
        query.eq("id", rawPropertyId);
      } else {
        query.eq("property_id", rawPropertyId.toUpperCase());
      }

      const { data: propData, error: propErr } = await query.maybeSingle();
      if (propErr || !propData) {
        setProperty(null);
      } else {
        setProperty(propData as Property);
      }
    } catch (err) {
      console.error("Error loading health check context:", err);
    } finally {
      setLoading(false);
    }
  }, [rawPropertyId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update item condition
  const setItemCondition = (
    category: string,
    itemName: string,
    condition: "good" | "attention" | "critical" | "not_assessed"
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) =>
        item.category === category && item.item_name === itemName
          ? { ...item, condition }
          : item
      )
    );
  };

  // Update finding / recommendation
  const setItemField = (
    category: string,
    itemName: string,
    field: "finding" | "recommendation",
    val: string
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) =>
        item.category === category && item.item_name === itemName
          ? { ...item, [field]: val }
          : item
      )
    );
  };

  // Set item photo
  const setItemPhoto = (category: string, itemName: string, file: File | null) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.category === category && item.item_name === itemName) {
          return {
            ...item,
            photo_file: file,
            photo_preview: file ? URL.createObjectURL(file) : null,
          };
        }
        return item;
      })
    );
  };

  // Submit Final Health Check Report
  const handleSubmitReport = async () => {
    if (!property) return;
    if (liveHealthScore === null) {
      toast.error("Please assess at least one inspection item.");
      return;
    }

    try {
      setSubmitting(true);
      toast.loading("Generating Property Health Certificate & Updating Passport...", { id: "sub-hc" });

      const finalScore = liveHealthScore;
      const finalStatus = determineHealthStatus(finalScore);

      // System ratings summary
      const systemRatings: Record<string, string> = {};
      HEALTH_CHECK_SYSTEMS.forEach((sys) => {
        const sysItems = inspectionItems.filter((i) => i.category === sys.id);
        const hasCritical = sysItems.some((i) => i.condition === "critical");
        const hasAttention = sysItems.some((i) => i.condition === "attention");
        const allNotAssessed = sysItems.every((i) => i.condition === "not_assessed");
        systemRatings[sys.id] = allNotAssessed ? "not_assessed" : hasCritical ? "critical" : hasAttention ? "attention" : "good";
      });

      // Actions aggregation
      const immediateActions = inspectionItems
        .filter((i) => i.condition === "critical")
        .map((i) => `${i.item_name}: ${i.recommendation || i.finding || "Urgent repair required"}`);

      const recommendedActions = inspectionItems
        .filter((i) => i.condition === "attention")
        .map((i) => `${i.item_name}: ${i.recommendation || i.finding || "Maintenance recommended"}`);

      const preventiveActions = [
        "Quarterly electrical distribution board tightening and load balance sweep.",
        "Monthly water tank float valve and pump pressure calibration.",
        "Pre-season AC filter cleanout and gas top-up sweep.",
      ];

      // 1. Insert into property_health_checks
      const { data: hcData, error: hcError } = await supabase
        .from("property_health_checks")
        .insert({
          property_id: property.id,
          inspector_id: currentUser?.id || null,
          inspector_name: workerProfile?.full_name || currentUser?.user_metadata?.full_name || "Verified HomeCare Inspector",
          health_score: finalScore,
          status: "completed",
          summary: `Comprehensive 7-system inspection completed. Property health score: ${finalScore}/100 (${finalStatus.toUpperCase()}).`,
          system_ratings: systemRatings,
          immediate_actions: immediateActions,
          recommended_actions: recommendedActions,
          preventive_actions: preventiveActions,
        })
        .select()
        .single();

      if (hcError) throw hcError;

      // 2. Insert items into property_health_check_items
      const itemsToInsert = inspectionItems.map((item) => ({
        health_check_id: hcData.id,
        category: item.category,
        item_name: item.item_name,
        condition: item.condition,
        finding: item.finding || null,
        recommendation: item.recommendation || null,
      }));

      await supabase.from("property_health_check_items").insert(itemsToInsert);

      // 3. Update Property score & last inspection date
      await supabase.from("properties").update({
        health_score: finalScore,
        health_status: finalStatus,
        last_health_check_date: new Date().toISOString(),
      }).eq("id", property.id);

      // 4. Automatically write to Digital Maintenance Passport
      await supabase.from("property_maintenance_records").insert({
        property_id: property.id,
        health_check_id: hcData.id,
        performed_by_id: currentUser?.id || null,
        performed_by_name: workerProfile?.full_name || "Verified HomeCare Technician",
        category: "Property Health Check",
        title: `Comprehensive Property Health Check (Score: ${finalScore}/100)`,
        work_performed: `Inspected 7 core engineering systems across ${inspectionItems.length} inspection points. Certified overall condition: ${finalStatus.toUpperCase()}.`,
        findings: immediateActions.length > 0 ? `Critical: ${immediateActions.join("; ")}` : "All tested equipment operating within standard safety tolerances.",
        recommendations: recommendedActions.length > 0 ? recommendedActions.join("; ") : "Maintain standard quarterly preventive sweeps.",
        date_completed: new Date().toISOString(),
        cost: 0,
      });

      // 5. Automatically schedule upcoming maintenance for flagged items
      const upcomingToInsert = inspectionItems
        .filter((i) => i.condition === "attention" || i.condition === "critical")
        .map((i, idx) => ({
          property_id: property.id,
          title: `Service ${i.item_name}`,
          category: i.category === "cooling_appliances" ? "AC & Fridge Repair" : i.category === "power" || i.category === "electrical" ? "Electrician" : "Plumber",
          due_date: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "recommended",
          source: "health_check",
          notes: i.recommendation || i.finding || "Flagged during health audit",
        }));

      if (upcomingToInsert.length > 0) {
        await supabase.from("property_upcoming_maintenance").insert(upcomingToInsert);
      }

      toast.success("Health Check Completed & Certified!", {
        description: `Property ${property.property_id} score updated to ${finalScore}/100.`,
      });

      router.push(`/property/${property.property_id}`);
    } catch (err: any) {
      toast.error("Failed to save health check", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-sky-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-rose-400 font-bold">Property Not Found</p>
          <Link href="/worker/dashboard" className="px-6 py-2 rounded-full bg-sky-600 text-white text-xs font-black">
            Return to Worker Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentSystem = HEALTH_CHECK_SYSTEMS[activeCategoryIndex] || HEALTH_CHECK_SYSTEMS[0];
  const currentCategoryItems = inspectionItems.filter((i) => i.category === currentSystem.id);

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased pb-28">
      {/* Top Mobile Field Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/property/${property.property_id}`}
              className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                  Field Mode
                </span>
                <span className="text-xs font-black text-slate-300">{property.property_id}</span>
              </div>
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{property.name}</h1>
            </div>
          </div>

          {/* Live Score Counter */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Score</span>
            <span className={`text-sm font-black ${liveHealthScore && liveHealthScore >= 80 ? "text-emerald-400" : liveHealthScore && liveHealthScore >= 50 ? "text-amber-400" : "text-rose-400"}`}>
              {liveHealthScore !== null ? `${liveHealthScore}/100` : "—"}
            </span>
          </div>
        </div>
      </header>

      {/* Category Navigation Bar */}
      <div className="sticky top-[65px] z-20 bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto flex gap-2 w-max">
          {HEALTH_CHECK_SYSTEMS.map((sys, idx) => {
            const isCurrent = idx === activeCategoryIndex;
            const items = inspectionItems.filter((i) => i.category === sys.id);
            const hasCritical = items.some((i) => i.condition === "critical");
            const hasAttention = items.some((i) => i.condition === "attention");

            return (
              <button
                key={sys.id}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                <span>{sys.label.split(" ")[0]}</span>
                {hasCritical ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                ) : hasAttention ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspection Items Checklist Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 block">
              System {activeCategoryIndex + 1} of {HEALTH_CHECK_SYSTEMS.length}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white">{currentSystem.label}</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {currentCategoryItems.length} inspection points
          </span>
        </div>

        <div className="space-y-4">
          {currentCategoryItems.map((item, idx) => (
            <div
              key={item.item_name}
              className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.item_name}</h3>
                </div>
              </div>

              {/* Big Touch Rating Selector */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { id: "good", label: "Good", color: "bg-emerald-600 text-white", inactive: "bg-slate-800 text-emerald-400 hover:bg-slate-700" },
                  { id: "attention", label: "Attention", color: "bg-amber-600 text-white", inactive: "bg-slate-800 text-amber-400 hover:bg-slate-700" },
                  { id: "critical", label: "Critical", color: "bg-rose-600 text-white", inactive: "bg-slate-800 text-rose-400 hover:bg-slate-700" },
                  { id: "not_assessed", label: "N/A", color: "bg-slate-600 text-white", inactive: "bg-slate-800 text-slate-400 hover:bg-slate-700" },
                ].map((cond) => {
                  const isSelected = item.condition === cond.id;
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setItemCondition(item.category, item.item_name, cond.id as any)}
                      className={`h-10 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center ${
                        isSelected ? `${cond.color} shadow-md` : cond.inactive
                      }`}
                    >
                      {cond.label}
                    </button>
                  );
                })}
              </div>

              {/* Finding / Recommendation Input for Attention or Critical */}
              {(item.condition === "attention" || item.condition === "critical") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-2 border-t border-slate-800"
                >
                  <input
                    type="text"
                    value={item.finding}
                    onChange={(e) => setItemField(item.category, item.item_name, "finding", e.target.value)}
                    placeholder="Describe specific fault (e.g. Broken switch gear, loose neutral wire)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    value={item.recommendation}
                    onChange={(e) => setItemField(item.category, item.item_name, "recommendation", e.target.value)}
                    placeholder="Recommendation (e.g. Replace with 63A din-rail breaker)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Navigation Step Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <button
            type="button"
            disabled={activeCategoryIndex === 0}
            onClick={() => setActiveCategoryIndex((prev) => Math.max(0, prev - 1))}
            className="px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            ← Previous System
          </button>

          {activeCategoryIndex < HEALTH_CHECK_SYSTEMS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveCategoryIndex((prev) => Math.min(HEALTH_CHECK_SYSTEMS.length - 1, prev + 1))}
              className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/30"
            >
              <span>Next System</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitReport}
              className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              <span>Complete &amp; Certify Health Check</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
