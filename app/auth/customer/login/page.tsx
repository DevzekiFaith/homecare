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

export default function CustomerLoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const supabase = createClient();

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    try {
      setResending(true);
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      if (resendError) throw resendError;
      toast.success("Confirmation email resent!", {
        description: `We've sent a new confirmation link to ${unconfirmedEmail}. Please check your inbox or spam.`
      });
    } catch (err: unknown) {
      handleAuthError(err, "resend confirmation");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setError(null);
    setUnconfirmedEmail(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setSubmitting(false);
        toast.success("Login successful!", {
          description: "Welcome back! Redirecting to customer dashboard..."
        });
        window.location.href = "/customer/dashboard";
        return;
      } else {
        throw new Error("No user profile session returned");
      }
    } catch (err: unknown) {
      console.error("Login error details:", err);
      const parsed = handleAuthError(err, "login");
      if (parsed.isUnconfirmedEmail) {
        setUnconfirmedEmail(email);
      }
      setError(`${parsed.title}: ${parsed.description}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground antialiased w-full">
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
            Welcome Back
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
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
              Password
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
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

          <div className="flex items-center justify-end py-2">
            <Link href="/auth/forgot-password" title="Reset your account password" className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-minimal mt-4 flex h-12 w-full items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest shadow-premium disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Continue"}
          </button>

          <ErrorAlert 
            error={error} 
            onClear={() => {
              setError(null);
              setUnconfirmedEmail(null);
            }} 
            className="mt-6"
          />

          {unconfirmedEmail && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="mt-3 w-full rounded-xl border border-brand-primary/30 bg-brand-primary/10 py-2.5 px-4 text-xs font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {resending ? <Loader2 size={14} className="animate-spin" /> : "Resend Confirmation Email"}
            </button>
          )}
        </form>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <Link
            href="/auth/customer/register"
            className="font-bold text-foreground hover:text-brand-primary transition-colors hover:underline py-2 block"
          >
            New here? Create an account
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

