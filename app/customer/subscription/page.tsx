"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Shield, Star, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ErrorAlert from "@/app/components/ErrorAlert";

import { toast } from "sonner";

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<'plus' | 'pro' | 'elite'>('plus');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<'lagos' | 'abuja' | 'ph' | 'enugu' | 'ogun'>('lagos');
  const [paymentPeriod, setPaymentPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Instant session resolution (< 1ms from client cache)
      const { data: sessionData } = await supabase.auth.getSession();
      let user = sessionData.session?.user;

      if (!user) {
        const { data: userData } = await supabase.auth.getUser();
        user = userData.user;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setCurrentTier(profile?.subscription_tier || 'basic');
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpgrade = async (tier: 'plus' | 'pro' | 'elite') => {
    try {
      setUpgrading(tier);
      setError(null);
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setError("Please log in to upgrade.");
        return;
      }

      // 1. Update Profile Tier
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. Log Subscription (Expires in 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: tier,
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (subError) throw subError;

      setCurrentTier(tier);
      toast.success(`Welcome to HomeCare ${tier.toUpperCase()}! Your benefits are now active.`, {
        description: "Your subscription has been activated successfully."
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upgrade failed";
      setError(`Upgrade failed: ${msg}`);
      toast.error(`Upgrade failed: ${msg}`);
    } finally {
      setUpgrading(null);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300 } } };

  // State-specific pricing configuration
  const statePricing = {
    lagos: { plus: 25000, pro: 45000, elite: 200000 },
    abuja: { plus: 22000, pro: 40000, elite: 180000 },
    ph: { plus: 20000, pro: 38000, elite: 175000 },
    enugu: { plus: 18000, pro: 35000, elite: 150000 },
    ogun: { plus: 18000, pro: 35000, elite: 150000 },
  };

  const stateNames = {
    lagos: 'Lagos State',
    abuja: 'FCT Abuja',
    ph: 'Rivers State (PH)',
    enugu: 'Enugu State',
    ogun: 'Ogun State',
  };

  const currentPricing = statePricing[selectedState];

  // Calculate pricing based on payment period
  const getDiscountedPrice = (basePrice: number) => {
    switch (paymentPeriod) {
      case 'quarterly':
        return Math.round(basePrice * 3 * 0.9); // 10% discount for quarterly
      case 'annual':
        return Math.round(basePrice * 12 * 0.8); // 20% discount for annual
      default:
        return basePrice;
    }
  };

  const getPeriodLabel = () => {
    switch (paymentPeriod) {
      case 'quarterly':
        return 'quarterly';
      case 'annual':
        return 'annually';
      default:
        return 'monthly';
    }
  };

  const adjustedPricing = {
    plus: getDiscountedPrice(currentPricing.plus),
    pro: getDiscountedPrice(currentPricing.pro),
    elite: getDiscountedPrice(currentPricing.elite),
  };

  if (loading && !upgrading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden">
      {/* Royal Blue Hero Banner */}
      <section className="relative bg-gradient-to-br from-sky-600 via-blue-600 to-blue-800 text-white pt-12 pb-16 md:pb-20 px-6 rounded-b-[40px] md:rounded-b-[50px] shadow-2xl shadow-blue-900/15 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-cyan-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10 text-center">
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-sky-200 hover:text-white transition-colors mb-6 w-fit mx-auto sm:mx-0"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 inline-block mb-3">
              Membership & Protection
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
              HomeCare <span className="text-cyan-200">Tiers</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-sky-100/90 font-medium max-w-md mx-auto leading-relaxed">
              Choose your state for customized coverage and unlock unlimited maintenance discounts.
            </p>
          </div>

          {/* State Selector Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {Object.entries(stateNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setSelectedState(key as keyof typeof statePricing)}
                className={`px-5 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                  selectedState === key
                    ? 'bg-sky-400 text-blue-950 shadow-lg shadow-sky-400/25 scale-105'
                    : 'bg-white/10 border border-white/20 text-sky-100 hover:bg-white/20 hover:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Subscription Content */}
      <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-8 sm:py-10 pb-36 relative z-10">

          {/* Payment Period Selector */}
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            {[
              { value: 'monthly' as const, label: 'Monthly', discount: '' },
              { value: 'quarterly' as const, label: 'Quarterly', discount: 'Save 10%' },
              { value: 'annual' as const, label: 'Annual', discount: 'Save 20%' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setPaymentPeriod(period.value)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  paymentPeriod === period.value
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {period.label}
                {period.discount && (
                  <span className="ml-1.5 text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">
                    {period.discount}
                  </span>
                )}
              </button>
            ))}
          </div>

        <ErrorAlert 
          error={error} 
          onClear={() => setError(null)} 
          className="my-6 max-w-xl mx-auto"
        />

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-5xl mx-auto mt-6 sm:mt-10 items-stretch">
          
          {/* Plus Tier */}
          <motion.div variants={itemVariants} className={`bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-xs hover:border-slate-300 flex flex-col relative ${currentTier === 'plus' ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20' : ''}`}>
            <h3 className="text-lg font-black text-slate-900">HomeCare Plus</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Essential coverage</p>
            <div className="my-5 pb-5 border-b border-slate-100">
              <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">₦{(adjustedPricing.plus / 1000).toFixed(0)}k</span>
              <span className="text-slate-500 text-xs font-semibold"> / {getPeriodLabel()}</span>
            </div>
            <ul className="space-y-3.5 flex-1 mb-8">
              {[
                "Reduced 7.5% convenience fee",
                "1 Free Routine Call-Out /mo",
                "Standard matching speed",
                "Surge pricing capped at 2x",
                "Priority support",
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-slate-800 font-semibold items-start">
                  <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade('plus')}
              disabled={currentTier === 'plus' || currentTier === 'pro' || currentTier === 'elite' || !!upgrading}
              className={`w-full rounded-full border-2 border-slate-300 bg-white hover:bg-slate-100 px-6 h-12 text-xs font-extrabold uppercase tracking-widest text-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center shadow-xs cursor-pointer`}
            >
              {upgrading === 'plus' ? <Loader2 className="animate-spin" size={16} /> : currentTier === 'plus' ? "Current Plan" : currentTier === 'pro' || currentTier === 'elite' ? "Included in Plan" : "Select Plus"}
            </button>
          </motion.div>

          {/* Pro Tier (Popular) */}
          <motion.div variants={itemVariants} className={`bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 rounded-3xl p-6 sm:p-8 border-2 border-sky-500 shadow-xl shadow-sky-600/15 relative flex flex-col transform md:-translate-y-3 ${currentTier === 'pro' ? 'ring-4 ring-sky-500/25' : ''}`}>
            <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center z-20">
              <span className="bg-sky-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full shadow-md shadow-sky-600/30">
                Most Popular
              </span>
            </div>
            
            <h3 className="text-lg font-black text-sky-800 mt-1">HomeCare Pro</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">For busy professionals</p>
            <div className="my-5 pb-5 border-b border-sky-100">
              <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">₦{(adjustedPricing.pro / 1000).toFixed(0)}k</span>
              <span className="text-slate-500 text-xs font-semibold"> / {getPeriodLabel()}</span>
            </div>
            <ul className="space-y-3.5 flex-1 mb-8">
              {[
                { text: "Zero platform convenience fees", icon: Shield },
                { text: "2 Free Routine Call-Outs /mo", icon: Star },
                { text: "Priority matching (3x faster)", icon: Zap },
                { text: "Surge pricing capped at 1.5x", icon: Zap },
                { text: "Same-day guarantee for urgent requests", icon: Zap },
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-slate-900 font-bold items-start">
                  <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                    <feature.icon size={13} strokeWidth={2.5} />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade('pro')}
              disabled={currentTier === 'pro' || currentTier === 'elite' || !!upgrading}
              className={`w-full rounded-full bg-sky-600 hover:bg-sky-500 text-white px-6 h-12 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center disabled:opacity-50 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] cursor-pointer`}
            >
              {upgrading === 'pro' ? <Loader2 className="animate-spin" size={16} /> : currentTier === 'pro' ? "Current Plan" : currentTier === 'elite' ? "Included in Plan" : "Upgrade to Pro"}
            </button>
          </motion.div>

          {/* Elite Tier */}
          <motion.div variants={itemVariants} className={`bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-xs hover:border-slate-300 flex flex-col relative ${currentTier === 'elite' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20' : ''}`}>
            <h3 className="text-lg font-black text-slate-900">HomeCare Elite</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Facility management level</p>
            <div className="my-5 pb-5 border-b border-slate-100">
              <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">₦{(adjustedPricing.elite / 1000).toFixed(0)}k</span>
              <span className="text-slate-500 text-xs font-semibold"> / {getPeriodLabel()}</span>
            </div>
            <ul className="space-y-3.5 flex-1 mb-8">
              {[
                { text: "Zero surge pricing ever", icon: Shield },
                { text: "Dedicated 24/7 Account Manager", icon: Shield },
                { text: "Matched with top 5% Artisans only", icon: Star },
                { text: "4 Free routine sweeps /mo", icon: Shield },
                { text: "Unlimited emergency calls", icon: Zap },
                { text: "Preferred vendor pricing", icon: Star },
              ].map((feature, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-slate-800 font-semibold items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <feature.icon size={13} strokeWidth={2.5} />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleUpgrade('elite')}
              disabled={currentTier === 'elite' || !!upgrading}
              className={`w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 h-12 text-xs font-extrabold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center shadow-md cursor-pointer`}
            >
              {upgrading === 'elite' ? <Loader2 className="animate-spin" size={16} /> : currentTier === 'elite' ? "Current Plan" : "Upgrade to Elite"}
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
