"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { generatePropertyId } from "@/lib/property-care";
import { CITIES } from "@/lib/cities";
import Logo from "@/app/components/Logo";
import {
  Building2,
  Home,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function RegisterPropertyPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState<
    "duplex" | "bungalow" | "apartment" | "estate_unit" | "office" | "commercial" | "shortlet" | "clinic" | "other"
  >("duplex");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(CITIES[0]?.name || "Lagos");
  const [state, setState] = useState(CITIES[0]?.state || "Lagos State");
  const [occupancyType, setOccupancyType] = useState<
    "owner_occupied" | "tenant_occupied" | "shortlet" | "vacant" | "commercial"
  >("owner_occupied");
  const [floorsCount, setFloorsCount] = useState(1);
  const [unitsCount, setUnitsCount] = useState(1);
  const [bedroomsCount, setBedroomsCount] = useState<number | "">("");
  const [yearBuilt, setYearBuilt] = useState<number | "">("");

  // Unauthenticated Seamless Auth Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData.session?.user || null);
      setLoading(false);
    }
    checkAuth();
  }, [supabase]);

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const matchedCity = CITIES.find((c) => c.name === cityName);
    if (matchedCity) {
      setState(matchedCity.state);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast.error("Please provide a property name and address");
      return;
    }

    try {
      setSubmitting(true);
      let currentUserId = user?.id;

      // Seamless Auth if not logged in
      if (!currentUserId) {
        if (!email.trim() || !pin.trim()) {
          toast.error("Email and 6-digit PIN are required to register your property.");
          setSubmitting(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: pin.trim(),
          options: {
            data: {
              full_name: fullName.trim() || "Property Owner",
              phone: phone.trim() || "",
            },
          },
        });

        if (signUpError && signUpError.message.toLowerCase().includes("already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: pin.trim(),
          });
          if (signInError) {
            toast.error("Account exists. Incorrect PIN entered.");
            setSubmitting(false);
            return;
          }
          currentUserId = signInData.user?.id;
        } else if (signUpError) {
          toast.error(`Auth Error: ${signUpError.message}`);
          setSubmitting(false);
          return;
        } else {
          currentUserId = signUpData.user?.id;
        }
      }

      if (!currentUserId) {
        toast.error("Authentication required to register property.");
        setSubmitting(false);
        return;
      }

      // Ensure profile entry exists
      await supabase.from("profiles").upsert(
        {
          id: currentUserId,
          full_name: fullName.trim() || user?.user_metadata?.full_name || "Property Owner",
          phone: phone.trim() || user?.user_metadata?.phone || "",
          address: address.trim(),
        },
        { onConflict: "id" }
      );

      // Generate Unique Property ID
      const propertyId = generatePropertyId();
      const newPropertyObj = {
        id: crypto.randomUUID(),
        property_id: propertyId,
        owner_id: currentUserId,
        name: name.trim(),
        property_type: propertyType,
        address: address.trim(),
        city: city,
        state: state,
        occupancy_type: occupancyType,
        floors_count: Number(floorsCount) || 1,
        units_count: Number(unitsCount) || 1,
        bedrooms_count: bedroomsCount ? Number(bedroomsCount) : null,
        year_built: yearBuilt ? Number(yearBuilt) : null,
        health_status: "not_assessed" as const,
        qr_active: true,
        created_at: new Date().toISOString(),
      };

      // Always save to local cache for instant local resilience
      if (typeof window !== "undefined") {
        try {
          const cached = localStorage.getItem("hc_properties_cache");
          const list = cached ? JSON.parse(cached) : [];
          list.unshift(newPropertyObj);
          localStorage.setItem("hc_properties_cache", JSON.stringify(list));
        } catch {
          // ignore storage error
        }
      }

      try {
        await supabase.from("properties").insert({
          property_id: propertyId,
          owner_id: currentUserId,
          name: name.trim(),
          property_type: propertyType,
          address: address.trim(),
          city: city,
          state: state,
          occupancy_type: occupancyType,
          floors_count: Number(floorsCount) || 1,
          units_count: Number(unitsCount) || 1,
          bedrooms_count: bedroomsCount ? Number(bedroomsCount) : null,
          year_built: yearBuilt ? Number(yearBuilt) : null,
          health_status: "not_assessed",
          qr_active: true,
        });
      } catch (insertErr) {
        console.warn("Remote Supabase property insert warning:", insertErr);
      }

      toast.success("Property Registered Successfully!", {
        description: `Your unique Property ID is ${propertyId}.`,
      });

      router.push(`/property/${propertyId}`);
    } catch (err: any) {
      toast.error("Registration failed", { description: err.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased py-12 px-4 sm:px-6 pt-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} className="text-sky-600" />
            <span>Back to Home</span>
          </Link>
          <Logo size="sm" />
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-sky-200">
            <Building2 size={13} className="text-cyan-300" />
            <span>HomeCare Property Care System</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight text-white leading-tight">
            Register Your Property
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Create a persistent digital identity, generate your outdoor Property QR Badge, and build an audit-proof maintenance passport.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
              1. Property Identification
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Property Name / Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lekki Phase 1 Duplex, Victoria Court Flat 4B, Ikeja Clinic"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Building Type *</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="duplex">Duplex / Detached House</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="apartment">Apartment / Flat</option>
                  <option value="estate_unit">Estate Unit</option>
                  <option value="shortlet">Shortlet / Airbnb Property</option>
                  <option value="office">Office / Commercial Space</option>
                  <option value="clinic">Clinic / Healthcare Facility</option>
                  <option value="commercial">Commercial Building</option>
                  <option value="other">Other Facility</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Occupancy</label>
                <select
                  value={occupancyType}
                  onChange={(e) => setOccupancyType(e.target.value as any)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                >
                  <option value="owner_occupied">Owner Occupied</option>
                  <option value="tenant_occupied">Tenant Occupied</option>
                  <option value="shortlet">Shortlet / Vacation Rental</option>
                  <option value="vacant">Vacant</option>
                  <option value="commercial">Commercial Operations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Street Address *</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Region *</label>
                <select
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-sky-500"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  disabled
                  value={state}
                  className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Floors</label>
                <input
                  type="number"
                  min={1}
                  value={floorsCount}
                  onChange={(e) => setFloorsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Units</label>
                <input
                  type="number"
                  min={1}
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Year Built</label>
                <input
                  type="number"
                  placeholder="e.g. 2020"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Seamless Account Creation for Guests */}
          {!user && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-heading">
                2. Property Manager / Owner Account
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chief Emeka Adeleke"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="080XXXXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@example.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">6-Digit Security PIN *</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500 tracking-widest font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-13 rounded-full bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Property ID...</span>
                </>
              ) : (
                <>
                  <span>Create Property ID &amp; Generate QR</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
