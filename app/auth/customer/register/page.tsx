"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";
import ErrorAlert from "@/app/components/ErrorAlert";
import { handleAuthError } from "@/lib/auth-errors";

export default function CustomerRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = formData.get('password') as string;
    const fullName = (formData.get('fullName') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setSubmitting(false);
          const parsed = handleAuthError(new Error("User already registered"), "registration");
          setError(`${parsed.title}: ${parsed.description}`);
          return;
        }

        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            role: 'customer'
          });

          await supabase.from('wallets').upsert({
            user_id: data.user.id,
            balance: 0
          });
        } catch (dbErr) {
          console.warn("Profile auto-provision note:", dbErr);
        }

        if (data.session) {
          setSubmitting(false);
          toast.success("Account created successfully!", {
            description: "Welcome to HomeCare! Redirecting..."
          });
          window.location.href = "/customer/dashboard";
          return;
        } else {
          setSubmitting(false);
          toast.success("Registration successful!", {
            description: "Please check your email inbox to confirm your account, then log in."
          });
          setError("Account created! A confirmation link was sent to your email. Please click the link to activate your account.");
        }
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const parsed = handleAuthError(err, "registration");
      setError(`${parsed.title}: ${parsed.description}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground antialiased w-full">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 -top-[30%] -z-10 h-[80%] w-full rounded-full bg-brand-primary/10 opacity-30 blur-[120px] mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-6 sm:p-8"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" className="mb-4" />
          <div className="h-px w-12 bg-brand-primary/20 mb-4" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
            Customer Portal
          </p>
          <h1 className="mt-2 text-2xl font-heading font-extrabold tracking-tight text-gradient-primary">
            Create an Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Full name
            </label>
            <input
              required
              name="fullName"
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Phone number
            </label>
            <input
              required
              type="tel"
              name="phone"
              placeholder="+234 812 345 6789"
              className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-brand-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="py-2" />

          <button
            type="submit"
            disabled={submitting}
            className="btn-minimal mt-4 flex h-12 w-full items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest shadow-premium disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Create account"}
          </button>

          <ErrorAlert 
            error={error} 
            onClear={() => setError(null)} 
            className="mt-6"
          />
        </form>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <Link
            href="/auth/customer/login"
            className="font-bold text-foreground hover:text-brand-primary transition-colors hover:underline py-2 block"
          >
            Already have an account? Log in
          </Link>
          <Link
            href="/"
            className="font-bold uppercase tracking-widest hover:text-foreground transition-colors"
          >
            ← Back home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

