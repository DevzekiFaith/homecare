"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Property,
  PropertyEquipment,
  PropertyHealthCheck,
  PropertyIssue,
  PropertyMaintenanceRecord,
  PropertyUpcomingMaintenance,
  getHealthStatusBadge,
  generateEquipmentCode,
  DEFAULT_PROPERTIES,
} from "@/lib/property-care";
import Logo from "@/app/components/Logo";
import {
  Building2,
  QrCode,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Printer,
  Download,
  X,
  FileText,
  Camera,
  Loader2,
  Calendar,
  Lock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Droplets,
  Snowflake,
  Activity,
  ArrowRight,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function PropertyCarePage() {
  const params = useParams();
  const router = useRouter();
  const rawPropertyId = params.propertyId as string;

  const supabase = useMemo(() => createClient(), []);

  const [property, setProperty] = useState<Property | null>(null);
  const [equipment, setEquipment] = useState<PropertyEquipment[]>([]);
  const [healthChecks, setHealthChecks] = useState<PropertyHealthCheck[]>([]);
  const [issues, setIssues] = useState<PropertyIssue[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<PropertyMaintenanceRecord[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<PropertyUpcomingMaintenance[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "passport" | "equipment" | "issues" | "schedule">("overview");

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // New Issue Form State
  const [issueTitle, setIssueTitle] = useState("");
  const [issueCategory, setIssueCategory] = useState("Electrical");
  const [issueDescription, setIssueDescription] = useState("");
  const [issueSeverity, setIssueSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [issueReporterName, setIssueReporterName] = useState("");
  const [issueReporterPhone, setIssueReporterPhone] = useState("");
  const [issueImageFile, setIssueImageFile] = useState<File | null>(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);

  // New Equipment Form State
  const [eqName, setEqName] = useState("");
  const [eqCategory, setEqCategory] = useState<"power" | "cooling" | "water" | "appliances" | "security" | "building" | "other">("cooling");
  const [eqManufacturer, setEqManufacturer] = useState("");
  const [eqModel, setEqModel] = useState("");
  const [eqSerial, setEqSerial] = useState("");
  const [eqCondition, setEqCondition] = useState<"good" | "attention" | "critical" | "unknown">("good");
  const [submittingEquipment, setSubmittingEquipment] = useState(false);

  const isOwnerOrAdmin = useMemo(() => {
    if (!currentUser || !property) return false;
    return property.owner_id === currentUser.id || userRole === "admin";
  }, [currentUser, property, userRole]);

  // Load Property Data
  const loadPropertyData = useCallback(async () => {
    try {
      setLoading(true);

      // Check current user session
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user || null;
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        setUserRole(profile?.role || "customer");
      }

      // Fetch Property by property_id (e.g. HC-PROP-004821) or UUID
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(rawPropertyId);
      let foundProperty: Property | null = null;

      try {
        const query = supabase.from("properties").select("*");
        if (isUuid) {
          query.eq("id", rawPropertyId);
        } else {
          query.eq("property_id", rawPropertyId.toUpperCase());
        }
        const { data: propData } = await query.maybeSingle();
        if (propData) {
          foundProperty = propData as Property;
        }
      } catch {
        // query fallback
      }

      // Check local cache & default properties if not in remote DB
      if (!foundProperty) {
        let localProps: Property[] = [];
        if (typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem("hc_properties_cache");
            if (cached) localProps = JSON.parse(cached);
          } catch {
            // ignore parse error
          }
        }
        const allFallbacks = [...localProps, ...DEFAULT_PROPERTIES];
        foundProperty = allFallbacks.find(
          (p) =>
            p.id.toLowerCase() === rawPropertyId.toLowerCase() ||
            p.property_id.toUpperCase() === rawPropertyId.toUpperCase()
        ) || null;
      }

      if (!foundProperty) {
        setProperty(null);
        setLoading(false);
        return;
      }

      setProperty(foundProperty);

      // Fetch child relations in parallel with try/catch resilience
      try {
        const [eqRes, hcRes, issuesRes, maintRes, upRes] = await Promise.all([
          supabase.from("property_equipment").select("*").eq("property_id", foundProperty.id).order("created_at", { ascending: true }),
          supabase.from("property_health_checks").select("*").eq("property_id", foundProperty.id).order("inspection_date", { ascending: false }),
          supabase.from("property_issues").select("*").eq("property_id", foundProperty.id).order("created_at", { ascending: false }),
          supabase.from("property_maintenance_records").select("*").eq("property_id", foundProperty.id).order("date_completed", { ascending: false }),
          supabase.from("property_upcoming_maintenance").select("*").eq("property_id", foundProperty.id).order("due_date", { ascending: true }),
        ]);

        setEquipment(eqRes.data || []);
        setHealthChecks(hcRes.data || []);
        setIssues(issuesRes.data || []);
        setMaintenanceRecords(maintRes.data || []);
        setUpcomingMaintenance(upRes.data || []);
      } catch {
        // Child tables pending remote migration — maintain clean empty states
      }
    } catch (err) {
      console.error("Error loading property care system data:", err);
    } finally {
      setLoading(false);
    }
  }, [rawPropertyId, supabase]);

  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  // Handle Report Issue Submission
  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    if (!issueTitle.trim() || !issueDescription.trim()) {
      toast.error("Please provide an issue title and description");
      return;
    }

    try {
      setSubmittingIssue(true);
      let photoUrl: string | null = null;

      if (issueImageFile && currentUser) {
        const fileExt = issueImageFile.name.split(".").pop() || "jpg";
        const fileName = `issue-${property.id}-${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from("job-photos").upload(fileName, issueImageFile);
        if (!upErr) {
          const { data: pubUrl } = supabase.storage.from("job-photos").getPublicUrl(fileName);
          photoUrl = pubUrl.publicUrl;
        }
      }

      const { error: insErr } = await supabase.from("property_issues").insert({
        property_id: property.id,
        reported_by_id: currentUser?.id || null,
        reporter_name: issueReporterName || currentUser?.user_metadata?.full_name || "Visitor / Resident",
        reporter_phone: issueReporterPhone || currentUser?.user_metadata?.phone || "",
        title: issueTitle.trim(),
        category: issueCategory,
        description: issueDescription.trim(),
        severity: issueSeverity,
        status: "open",
        photo_url: photoUrl,
      });

      if (insErr) throw insErr;

      toast.success("Issue Reported Successfully", {
        description: `Logged under Property ${property.property_id}. HomeCare team notified.`,
      });

      setShowIssueModal(false);
      setIssueTitle("");
      setIssueDescription("");
      setIssueImageFile(null);
      loadPropertyData();
    } catch (err: any) {
      toast.error("Failed to report issue", { description: err.message });
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Handle Add Equipment
  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    if (!eqName.trim()) {
      toast.error("Please enter equipment name");
      return;
    }

    try {
      setSubmittingEquipment(true);
      const equipmentCode = generateEquipmentCode(eqCategory, equipment.length + 1);

      const { error: eqErr } = await supabase.from("property_equipment").insert({
        property_id: property.id,
        equipment_code: equipmentCode,
        category: eqCategory,
        name: eqName.trim(),
        manufacturer: eqManufacturer.trim() || null,
        model_number: eqModel.trim() || null,
        serial_number: eqSerial.trim() || null,
        current_condition: eqCondition,
      });

      if (eqErr) throw eqErr;

      toast.success("Equipment Asset Registered", {
        description: `Assigned ID ${equipmentCode} to ${eqName.trim()}.`,
      });

      setShowEquipmentModal(false);
      setEqName("");
      setEqManufacturer("");
      setEqModel("");
      setEqSerial("");
      loadPropertyData();
    } catch (err: any) {
      toast.error("Failed to add equipment", { description: err.message });
    } finally {
      setSubmittingEquipment(false);
    }
  };

  // Handle Printable QR Badge
  const handlePrintBadge = () => {
    if (!property) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrTargetUrl = `${window.location.origin}/property/${property.property_id}`;
    const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrTargetUrl)}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HomeCare Property QR Badge — ${property.property_id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; text-align: center; }
            .badge-card { background: #ffffff; border: 4px solid #0284c7; border-radius: 36px; padding: 40px 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); max-width: 420px; width: 90%; margin: 20px auto; }
            .brand { font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 2px; }
            .tagline { font-size: 11px; font-weight: 800; color: #0284c7; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1.5px; }
            .prop-badge { background: #e0f2fe; color: #0369a1; font-weight: 900; font-size: 15px; padding: 8px 18px; border-radius: 50px; display: inline-block; margin-bottom: 20px; letter-spacing: 1px; }
            .qr-wrapper { background: #f0f9ff; border: 2.5px dashed #0284c7; border-radius: 24px; padding: 18px; display: inline-block; margin-bottom: 20px; }
            .qr-image { width: 220px; height: 220px; border-radius: 12px; }
            .instruction { font-size: 17px; font-weight: 900; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; }
            .sub-instruction { font-size: 12px; color: #64748b; margin-bottom: 16px; line-height: 1.4; }
            .prop-name { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px; }
            .prop-address { font-size: 11px; color: #64748b; margin-bottom: 16px; }
            .footer-pill { background: #f1f5f9; color: #475569; font-weight: 800; font-size: 10px; padding: 6px 14px; border-radius: 50px; display: inline-block; text-transform: uppercase; }
            @media print { body { background: #fff; } .badge-card { border-color: #0284c7; box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="badge-card">
            <div class="brand">HOMECARE</div>
            <div class="tagline">PROPERTY CARE SYSTEM</div>
            <div class="prop-badge">${property.property_id}</div>
            <div class="qr-wrapper">
              <img src="${qrImg}" class="qr-image" alt="Property QR Code" />
            </div>
            <div class="instruction">SCAN TO MANAGE &amp; REPAIR</div>
            <div class="sub-instruction">Point camera to report issues, book certified technicians, or view property health.</div>
            <div class="prop-name">${property.name}</div>
            <div class="prop-address">${property.address}</div>
            <div class="footer-pill">100% Escrow Protected • NIN Verified Technicians</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Handle Download Badge PNG Image
  const handleDownloadBadgePng = async () => {
    if (!property) return;
    try {
      toast.loading("Generating High-Resolution Badge Image...", { id: "dl-badge" });

      const qrTargetUrl = `${window.location.origin}/property/${property.property_id}`;
      const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrTargetUrl)}`;

      // Create high-res canvas (800x1050)
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1050;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create canvas context");

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(20, 20, 760, 1010, 48);
      ctx.fill();

      // Border
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#0284c7";
      ctx.stroke();

      // Brand Header
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 42px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("HOMECARE", 400, 100);

      ctx.fillStyle = "#0284c7";
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText("PROPERTY CARE SYSTEM", 400, 135);

      // Property ID Pill
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.roundRect(250, 160, 300, 50, 25);
      ctx.fill();

      ctx.fillStyle = "#0369a1";
      ctx.font = "900 24px monospace";
      ctx.fillText(property.property_id, 400, 194);

      // Load and Draw QR Code
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      qrImg.src = qrImgUrl;
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
      });

      // QR Wrapper Box
      ctx.fillStyle = "#f0f9ff";
      ctx.beginPath();
      ctx.roundRect(175, 235, 450, 450, 32);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#0284c7";
      ctx.stroke();

      // Draw QR Image
      ctx.drawImage(qrImg, 200, 260, 400, 400);

      // Instructions
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText("SCAN TO MANAGE & REPAIR", 400, 740);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("Point smartphone camera to report issues or book verified pros", 400, 775);

      // Property Details
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(property.name, 400, 840);

      ctx.fillStyle = "#64748b";
      ctx.font = "500 17px system-ui, -apple-system, sans-serif";
      ctx.fillText(property.address, 400, 875);

      // Footer Guarantee Pill
      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.roundRect(130, 930, 540, 45, 22);
      ctx.fill();

      ctx.fillStyle = "#475569";
      ctx.font = "800 15px system-ui, -apple-system, sans-serif";
      ctx.fillText("100% ESCROW PROTECTED • NIN VERIFIED TECHNICIANS", 400, 958);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas to Blob failed");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `HomeCare_Property_QR_${property.property_id}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Badge Image Downloaded!", { id: "dl-badge" });
      }, "image/png");
    } catch (err: any) {
      toast.error("Download failed: " + (err.message || "Error generating image"), { id: "dl-badge" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 size={36} className="animate-spin text-sky-600" />
          <p className="text-xs font-black uppercase tracking-widest">Loading Property Identity...</p>
        </div>
      </div>
    );
  }

  // Error State: Property Not Found
  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Property Not Found</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              We couldn&apos;t locate a registered HomeCare property with ID <strong className="text-slate-800">{rawPropertyId}</strong>.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              href="/property/register"
              className="w-full h-12 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-md shadow-sky-600/30"
            >
              Register This Property
            </Link>
            <Link
              href="/"
              className="w-full h-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center transition-all"
            >
              Return to HomeCare
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getHealthStatusBadge(property.health_status);
  const qrTargetUrl = typeof window !== "undefined" ? `${window.location.origin}/property/${property.property_id}` : `https://www.homecare.com.ng/property/${property.property_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrTargetUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-24">
      {/* Top Identity Header Bar */}
      <header className="relative z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-slate-300 font-bold hidden sm:inline">|</span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-black text-sky-700 uppercase tracking-wider">
              <Building2 size={13} className="text-sky-600" />
              <span>{property.property_id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowQrModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <QrCode size={14} className="text-sky-600" />
              <span className="hidden sm:inline">Property QR</span>
            </button>

            {!currentUser && (
              <Link
                href={`/auth/customer/login?redirect=/property/${property.property_id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-sky-600/25"
              >
                <Lock size={13} />
                <span>Owner Sign In</span>
              </Link>
            )}

            {currentUser && isOwnerOrAdmin && (
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Property Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white pt-10 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Property Identity & Headline */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-sky-200">
                {property.property_type.replace("_", " ")}
              </span>
              <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${statusBadge.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor} animate-pulse`} />
                {statusBadge.label}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                📍 {property.city}, {property.state || "Nigeria"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading uppercase tracking-tight text-white leading-tight">
              {property.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              {property.address}
            </p>

            {/* Quick Action Buttons for Public & Authenticated */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={`/request?property_id=${property.property_id}&address=${encodeURIComponent(property.address)}`}
                className="h-12 px-6 rounded-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-sky-600/30 cursor-pointer"
              >
                <Wrench size={15} />
                <span>Request Maintenance</span>
              </Link>

              <button
                onClick={() => setShowIssueModal(true)}
                className="h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer"
              >
                <AlertTriangle size={15} className="text-amber-400" />
                <span>Report an Issue</span>
              </button>

              <Link
                href={`/inspection?property_id=${property.property_id}&address=${encodeURIComponent(property.address)}`}
                className="h-12 px-6 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={15} className="text-cyan-300" />
                <span>Book Health Check</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Health Score Circular Indicator Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 text-center w-full max-w-xs shadow-xl space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-sky-200">
                <span>Property Health</span>
                <span>{property.health_score !== null && property.health_score !== undefined ? `${property.health_score}/100` : "Unassessed"}</span>
              </div>

              <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {property.health_score !== null && property.health_score !== undefined && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={property.health_score >= 80 ? "#10b981" : property.health_score >= 50 ? "#f59e0b" : "#f43f5e"}
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * property.health_score) / 100}
                      strokeLinecap="round"
                      fill="none"
                      className="transition-all duration-1000 ease-out"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-heading">
                    {property.health_score !== null && property.health_score !== undefined ? property.health_score : "—"}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-300">
                    Score
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                {statusBadge.description}
              </p>

              {property.last_health_check_date ? (
                <p className="text-[10px] text-sky-300 font-bold">
                  Last Inspection: {new Date(property.last_health_check_date).toLocaleDateString()}
                </p>
              ) : (
                <Link
                  href={`/inspection?property_id=${property.property_id}&address=${encodeURIComponent(property.address)}`}
                  className="text-[10px] text-cyan-300 hover:underline font-bold block"
                >
                  Schedule Initial Inspection →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Navigation Tabs (Available for Authenticated Owners/Managers/Staff) */}
        {isOwnerOrAdmin ? (
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-full sm:w-fit flex-wrap gap-1 shadow-2xs">
            {[
              { id: "overview", label: "Overview" },
              { id: "passport", label: `Maintenance Passport (${maintenanceRecords.length})` },
              { id: "equipment", label: `Equipment Assets (${equipment.length})` },
              { id: "issues", label: `Open Issues (${issues.filter((i) => i.status === "open" || i.status === "assigned").length})` },
              { id: "schedule", label: `Upcoming Schedule (${upcomingMaintenance.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          /* Public Visitor Information Card */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Official HomeCare Property Care Identity</h3>
                <p className="text-xs text-slate-500 font-medium">
                  This building is registered under the HomeCare Digital Property Care System.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Property Code</span>
                <p className="text-base font-black text-slate-900">{property.property_id}</p>
                <p className="text-[11px] text-slate-500">Persistent digital passport</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Building Type</span>
                <p className="text-base font-black text-slate-900 capitalize">{property.property_type.replace("_", " ")}</p>
                <p className="text-[11px] text-slate-500">{property.occupancy_type.replace("_", " ")}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Condition Status</span>
                <p className="text-base font-black text-slate-900">{statusBadge.label}</p>
                <p className="text-[11px] text-slate-500">{property.last_health_check_date ? `Checked ${new Date(property.last_health_check_date).toLocaleDateString()}` : "Not Yet Assessed"}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-black text-sky-900">Are you the landlord or authorized property manager?</p>
                <p className="text-[11px] text-sky-700">Sign in to view equipment assets, full maintenance passport records, and invoices.</p>
              </div>
              <Link
                href={`/auth/customer/login?redirect=/property/${property.property_id}`}
                className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs shrink-0"
              >
                Sign In to Unlock
              </Link>
            </div>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === "overview" && isOwnerOrAdmin && (
          <div className="space-y-8">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Equipment Assets</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{equipment.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Registered units</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Passport Records</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{maintenanceRecords.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Completed jobs</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Open Issues</span>
                <p className="text-2xl sm:text-3xl font-black text-rose-600">
                  {issues.filter((i) => i.status === "open" || i.status === "assigned").length}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Pending fixes</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Upcoming Services</span>
                <p className="text-2xl sm:text-3xl font-black text-sky-600">{upcomingMaintenance.length}</p>
                <p className="text-[11px] text-slate-500 font-medium">Scheduled sweeps</p>
              </div>
            </div>

            {/* Open Issues Snapshot */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase font-heading">Open Issues &amp; Faults</h3>
                  <p className="text-xs text-slate-500 font-medium">Reported concerns requiring technician attention</p>
                </div>
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Report Issue</span>
                </button>
              </div>

              {issues.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No Open Issues</p>
                  <p className="text-xs text-slate-500 mt-0.5">This property currently has no recorded unresolved faults.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {issues.map((iss) => (
                    <div key={iss.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            iss.severity === "critical"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : iss.severity === "high"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-slate-100 border-slate-200 text-slate-700"
                          }`}>
                            {iss.severity}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">{iss.title}</span>
                          <span className="text-[10px] text-slate-400">({iss.category})</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">{iss.description}</p>
                        <p className="text-[10px] text-slate-400">
                          Reported by {iss.reporter_name} • {new Date(iss.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          iss.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                        }`}>
                          {iss.status}
                        </span>
                        <Link
                          href={`/request?service=${encodeURIComponent(iss.category)}&property_id=${property.property_id}&details=${encodeURIComponent(iss.description)}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                          Book Pro
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Maintenance Records Snapshot */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase font-heading">Digital Maintenance Passport</h3>
                  <p className="text-xs text-slate-500 font-medium">Permanent chronological record of all service history</p>
                </div>
                <button
                  onClick={() => setActiveTab("passport")}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  View Full Passport →
                </button>
              </div>

              {maintenanceRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText size={32} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No Maintenance Records Yet</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your Maintenance Passport is active. Completed HomeCare repairs and inspections will automatically appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRecords.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">{rec.category}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rec.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{rec.work_performed}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(rec.date_completed).toLocaleDateString()} {rec.performed_by_name ? `• Verified Pro: ${rec.performed_by_name}` : ""}
                        </p>
                      </div>
                      {rec.cost && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900">₦{Number(rec.cost).toLocaleString()}</span>
                          <span className="text-[10px] block text-emerald-600 font-bold">Escrow Verified</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Full Maintenance Passport */}
        {activeTab === "passport" && isOwnerOrAdmin && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase font-heading">Digital Maintenance Passport</h2>
                <p className="text-xs text-slate-500 font-medium">Permanent audit-proof service history for {property.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBadgePng}
                  className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Badge (.PNG)</span>
                </button>
                <button
                  onClick={handlePrintBadge}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Badge</span>
                </button>
              </div>
            </div>

            {maintenanceRecords.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <FileText size={40} className="text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Your Maintenance Passport is Initialized</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Every time a HomeCare verified professional completes a job or property health check at this address, the findings, photos, and warranty certificates are recorded permanently here.
                </p>
                <Link
                  href={`/request?property_id=${property.property_id}&address=${encodeURIComponent(property.address)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-sky-600/30"
                >
                  Book First Maintenance Service
                </Link>
              </div>
            ) : (
              <div className="relative border-l-2 border-sky-200 pl-6 ml-4 space-y-8">
                {maintenanceRecords.map((rec) => (
                  <div key={rec.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-sky-600 border-4 border-white shadow-xs" />
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100 px-3 py-0.5 rounded-full">
                          {rec.category}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(rec.date_completed).toLocaleDateString("en-NG", { dateStyle: "long" })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{rec.work_performed}</p>

                      {rec.findings && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                          <span className="font-extrabold text-slate-900 block mb-0.5">Technician Findings:</span>
                          <span className="text-slate-600">{rec.findings}</span>
                        </div>
                      )}

                      {rec.recommendations && (
                        <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900">
                          <span className="font-extrabold block mb-0.5">Recommended Next Action:</span>
                          <span>{rec.recommendations}</span>
                        </div>
                      )}

                      <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                        <span>Inspector / Pro: <strong className="text-slate-800">{rec.performed_by_name || "HomeCare Trade Team"}</strong></span>
                        {rec.cost && <span className="font-bold text-slate-900">Total: ₦{Number(rec.cost).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Equipment Assets */}
        {activeTab === "equipment" && isOwnerOrAdmin && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase font-heading">Equipment &amp; Asset Register</h2>
                <p className="text-xs text-slate-500 font-medium">Track HVAC, generators, inverters, pumps, and major building appliances</p>
              </div>
              <button
                onClick={() => setShowEquipmentModal(true)}
                className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/25 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Equipment Asset</span>
              </button>
            </div>

            {equipment.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <Wrench size={40} className="text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Equipment Assets Registered</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Register your generators, water pumps, inverters, and AC units to track service intervals and warranty documentation.
                </p>
                <button
                  onClick={() => setShowEquipmentModal(true)}
                  className="px-6 py-2.5 rounded-full bg-sky-600 text-white text-xs font-black uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Add First Equipment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((eq) => (
                  <div key={eq.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                          {eq.equipment_code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          eq.current_condition === "good" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {eq.current_condition}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{eq.name}</h4>
                      <p className="text-xs text-slate-500">
                        {eq.manufacturer || "Generic"} {eq.model_number ? `• Mod: ${eq.model_number}` : ""}
                      </p>
                      {eq.serial_number && (
                        <p className="text-[10px] text-slate-400 font-mono">SN: {eq.serial_number}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Interval: {eq.service_interval_days || 90} days</span>
                      <Link
                        href={`/request?service=${encodeURIComponent(eq.category === "cooling" ? "AC & Fridge Repair" : eq.category === "power" ? "Electrician" : "Plumber")}&property_id=${property.property_id}&details=${encodeURIComponent(`Service request for ${eq.name} (${eq.equipment_code})`)}`}
                        className="text-[10px] font-black text-sky-600 hover:underline"
                      >
                        Request Service →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Open Issues */}
        {activeTab === "issues" && isOwnerOrAdmin && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase font-heading">Open Issues &amp; Tenant Reports</h2>
                <p className="text-xs text-slate-500 font-medium">Faults submitted via the Property QR or resident reporting</p>
              </div>
              <button
                onClick={() => setShowIssueModal(true)}
                className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-sky-600/25 cursor-pointer"
              >
                <Plus size={14} />
                <span>Log New Issue</span>
              </button>
            </div>

            {issues.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">All Clear! No Open Issues</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no recorded problems or open tickets on this property.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issues.map((iss) => (
                  <div key={iss.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          iss.severity === "critical"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : iss.severity === "high"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}>
                          {iss.severity} severity
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(iss.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{iss.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{iss.description}</p>
                      
                      {iss.photo_url && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200">
                          <Image src={iss.photo_url} alt={iss.title} fill className="object-cover" unoptimized />
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400">Reported by {iss.reporter_name} ({iss.reporter_phone || "Resident"})</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">Status: {iss.status}</span>
                      <Link
                        href={`/request?service=${encodeURIComponent(iss.category)}&property_id=${property.property_id}&details=${encodeURIComponent(iss.description)}`}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider transition-all"
                      >
                        Dispatch Pro →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Upcoming Schedule */}
        {activeTab === "schedule" && isOwnerOrAdmin && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase font-heading">Upcoming Preventive Maintenance</h2>
              <p className="text-xs text-slate-500 font-medium">Recommended service schedules derived from inspections and equipment intervals</p>
            </div>

            {upcomingMaintenance.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <Calendar size={40} className="text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Scheduled Maintenance Due</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Book a HomeCare Property Health Check to generate customized preventive maintenance recommendations.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingMaintenance.map((up) => (
                  <div key={up.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-sky-600">{up.category}</span>
                      <h4 className="text-sm font-bold text-slate-900">{up.title}</h4>
                      <p className="text-xs text-slate-500">{up.notes || "Routine service interval"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-slate-800 block">Due: {new Date(up.due_date).toLocaleDateString()}</span>
                      <Link
                        href={`/request?service=${encodeURIComponent(up.category)}&property_id=${property.property_id}&details=${encodeURIComponent(up.title)}`}
                        className="text-[10px] font-black text-sky-600 hover:underline"
                      >
                        Schedule Now →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: REPORT ISSUE MODAL */}
      <AnimatePresence>
        {showIssueModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative my-8"
            >
              <button
                onClick={() => setShowIssueModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>

              <div className="space-y-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                  <AlertTriangle size={12} />
                  <span>Report Maintenance Concern</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase font-heading">
                  Report Fault at {property.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Logs an issue directly against Property <strong className="text-slate-800">{property.property_id}</strong>.
                </p>
              </div>

              <form onSubmit={handleReportIssue} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Issue Title / Summary *</label>
                  <input
                    type="text"
                    required
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="e.g. Water pump leaking from base valve"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={issueCategory}
                      onChange={(e) => setIssueCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="Plumber">Plumbing</option>
                      <option value="Electrician">Electrical</option>
                      <option value="AC & Fridge Repair">AC &amp; Cooling</option>
                      <option value="Carpenter">Carpentry &amp; Doors</option>
                      <option value="Painter">Painting &amp; Walls</option>
                      <option value="General Handyman">General Building</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Severity</label>
                    <select
                      value={issueSeverity}
                      onChange={(e) => setIssueSeverity(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="low">Low (Routine)</option>
                      <option value="medium">Medium (Needs attention)</option>
                      <option value="high">High (Impacting usage)</option>
                      <option value="critical">Critical (Emergency)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Describe exactly where the problem is located and how long it has been occurring..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                    <input
                      type="text"
                      value={issueReporterName}
                      onChange={(e) => setIssueReporterName(e.target.value)}
                      placeholder="e.g. John Okonkwo"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={issueReporterPhone}
                      onChange={(e) => setIssueReporterPhone(e.target.value)}
                      placeholder="080XXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Attach Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIssueImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingIssue}
                    className="flex-1 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingIssue ? <Loader2 size={16} className="animate-spin" /> : "Submit Issue"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD EQUIPMENT MODAL */}
      <AnimatePresence>
        {showEquipmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative my-8"
            >
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>

              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase font-heading">Register Equipment Asset</h3>
                <p className="text-xs text-slate-500">Track appliance warranties and service intervals</p>
              </div>

              <form onSubmit={handleAddEquipment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={eqName}
                    onChange={(e) => setEqName(e.target.value)}
                    placeholder="e.g. Master Bedroom 1.5HP Inverter AC"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={eqCategory}
                      onChange={(e) => setEqCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="cooling">Cooling / AC</option>
                      <option value="power">Power / Generator / Solar</option>
                      <option value="water">Water / Borehole Pump</option>
                      <option value="appliances">Major Appliance</option>
                      <option value="security">Security / CCTV</option>
                      <option value="building">Building Component</option>
                      <option value="other">Other Asset</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Current Condition</label>
                    <select
                      value={eqCondition}
                      onChange={(e) => setEqCondition(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="good">Good (Working fine)</option>
                      <option value="attention">Needs Attention</option>
                      <option value="critical">Faulty / Critical</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={eqManufacturer}
                      onChange={(e) => setEqManufacturer(e.target.value)}
                      placeholder="e.g. Panasonic / Mikano"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Model / Serial</label>
                    <input
                      type="text"
                      value={eqModel}
                      onChange={(e) => setEqModel(e.target.value)}
                      placeholder="e.g. CS-XU18XKZ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEquipmentModal(false)}
                    className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEquipment}
                    className="flex-1 py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingEquipment ? <Loader2 size={16} className="animate-spin" /> : "Save Asset"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PROPERTY QR BADGE MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative text-center space-y-4 my-8"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>

              <div className="space-y-1">
                <span className="text-xl font-black text-slate-900 uppercase font-heading block">
                  HOMECARE
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 block">
                  PROPERTY CARE BADGE
                </span>
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-black text-sky-700">
                {property.property_id}
              </div>

              {/* QR Image Container */}
              <div className="p-4 bg-sky-50/50 rounded-2xl border-2 border-dashed border-sky-300 inline-block">
                <div className="relative w-48 h-48 mx-auto bg-white rounded-xl overflow-hidden p-2">
                  <Image
                    src={qrCodeUrl}
                    alt={`Property QR ${property.property_id}`}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 uppercase">Scan Outside Your Door</p>
                <p className="text-[11px] text-slate-500">
                  Place this badge at estate entrances, front doors, or facility electrical panels.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleDownloadBadgePng}
                  className="w-full py-3 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-600/30 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Download Badge Image (.PNG)</span>
                </button>

                <button
                  onClick={handlePrintBadge}
                  className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={15} />
                  <span>Print Outdoor Badge</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrTargetUrl);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="w-full py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Copy Property Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
