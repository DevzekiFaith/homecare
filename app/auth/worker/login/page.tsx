"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";
import ErrorAlert from "@/app/components/ErrorAlert";
import { handleAuthError } from "@/lib/auth-errors";

export default function WorkerLoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    try {
      setResending(true);
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      if (resendError) throw resendError;
      toast.success("Confirmation email sent!", {
        description: `We've sent a new confirmation link to ${unconfirmedEmail}.`
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

    setMessage(null);
    setUnconfirmedEmail(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
    const pin = (formData.get("pin") as string)?.trim() ?? "";

    const supabase = createClient();

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (signInErr) throw signInErr;

      setSubmitting(false);
      toast.success("Pro Login Successful!", {
        description: "Welcome back! Redirecting to Artisan Dashboard..."
      });
      setMessage("Logged in securely. Redirecting to Pro Center...");
      setTimeout(() => {
        window.location.href = "/worker/dashboard";
      }, 600);
    } catch (err: unknown) {
      console.error("Worker login error:", err);
      const parsed = handleAuthError(err, "artisan login");
      if (parsed.isUnconfirmedEmail) {
        setUnconfirmedEmail(email);
      }
      setMessage(`${parsed.title}: ${parsed.description}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[90vh] items-center justify-center bg-background px-6 py-12 text-foreground antialiased w-full">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 -top-[30%] -z-10 h-[80%] w-full rounded-full bg-brand-primary/10 opacity-30 blur-[120px] mix-blend-screen" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 lg:p-10"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size="md" className="mb-6" />
          <div className="h-px w-12 bg-brand-primary/20 mb-6" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary mb-2">
            Professional Portal
          </p>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight text-gradient-primary">
            Access your jobs
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Email Address
            </label>
            <input
              required
              type="email"
              name="email"
              placeholder="pro@example.com"
              className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Security PIN
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                name="pin"
                placeholder="6-digit PIN"
                className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary pr-12"
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
            className="btn-minimal mt-4 flex h-12 w-full items-center justify-center rounded-full px-8 text-xs font-bold uppercase tracking-widest shadow-premium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Authenticating..." : "Sign In"}
          </button>

          <ErrorAlert 
            error={message && (message.includes("failed") || message.includes("not confirmed")) ? message : null} 
            onClear={() => {
              setMessage(null);
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
              {resending ? "Sending..." : "Resend Confirmation Email"}
            </button>
          )}
          
          {message && !message.includes("failed") && !message.includes("not confirmed") && (
             <p className="pt-4 text-center text-xs font-bold text-brand-primary">
               {message}
             </p>
          )}
        </form>

        <div className="mt-8 flex flex-col items-center justify-center space-y-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <Link
            href="/auth/worker/register"
            className="font-bold text-foreground hover:text-brand-primary transition-colors hover:underline py-2 block"
          >
            New professional? Register here
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
