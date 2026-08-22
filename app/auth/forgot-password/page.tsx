"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/app/components/Logo";
import ErrorAlert from "@/app/components/ErrorAlert";
import { handleAuthError } from "@/lib/auth-errors";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
      toast.success("Reset link sent", {
        description: "Please check your email for the password reset link."
      });
    } catch (err: unknown) {
      const parsed = handleAuthError(err, "password reset");
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
            Security Center
          </p>
          <h1 className="mt-2 text-2xl font-heading font-extrabold tracking-tight text-gradient-primary">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
               <Mail size={24} />
            </div>
            <div className="space-y-2">
               <h2 className="text-lg font-bold">Check your email</h2>
               <p className="text-sm text-zinc-500">
                 We&apos;ve sent a password reset link to your email address.
               </p>
            </div>
            <Link
              href="/auth/customer/login"
              className="btn-minimal flex h-12 w-full items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest shadow-premium"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-background/50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand-primary focus:bg-background/80 focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-minimal mt-4 flex h-12 w-full items-center justify-center rounded-full text-xs font-bold uppercase tracking-widest shadow-premium disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Send Reset Link"}
            </button>

            <ErrorAlert 
              error={error} 
              onClear={() => setError(null)} 
              className="mt-6"
            />
            
            <div className="pt-4 text-center">
               <Link
                 href="/auth/customer/login"
                 className="text-xs font-bold text-zinc-500 hover:text-brand-primary transition-colors uppercase tracking-widest"
               >
                 ← Back to Login
               </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
