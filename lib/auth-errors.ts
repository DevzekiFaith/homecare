import { toast } from "sonner";

export interface TranslatedAuthError {
  title: string;
  description: string;
  isUnconfirmedEmail?: boolean;
}

/**
 * Translates raw auth/Supabase error messages into clear, friendly human descriptions
 * and displays an immediate Sonner Toast notification.
 */
export function handleAuthError(err: unknown, defaultContext = "authentication"): TranslatedAuthError {
  const errorObj = err as { name?: string; message?: string; error_description?: string; status?: number };
  const rawMsg = (errorObj?.message || errorObj?.error_description || "").toLowerCase();

  let title = "Authentication Error";
  let description = "An unexpected error occurred. Please try again.";
  let isUnconfirmedEmail = false;

  if (errorObj?.name === "AbortError" || rawMsg.includes("lock broken") || rawMsg.includes("abort")) {
    title = "Request Pending";
    description = "Another authentication request is currently in progress. Please wait a moment.";
  } else if (rawMsg.includes("invalid login credentials") || rawMsg.includes("invalid_grant")) {
    title = "Incorrect Email or Password";
    description = "The email or password you entered does not match our records. Please double-check and try again.";
  } else if (rawMsg.includes("email not confirmed")) {
    title = "Email Verification Required";
    description = "Your email address has not been verified yet. Please check your inbox or click 'Resend Confirmation'.";
    isUnconfirmedEmail = true;
  } else if (rawMsg.includes("user already registered") || rawMsg.includes("already in use") || rawMsg.includes("already exists")) {
    title = "Account Already Exists";
    description = "An account with this email address already exists. Please log in instead or use 'Forgot password'.";
  } else if (rawMsg.includes("password should be at least")) {
    title = "Password Too Short";
    description = "Your password must be at least 6 characters long for security.";
  } else if (rawMsg.includes("unable to validate email") || rawMsg.includes("invalid email")) {
    title = "Invalid Email Address";
    description = "Please enter a valid email address (e.g., yourname@example.com).";
  } else if (rawMsg.includes("rate limit") || rawMsg.includes("too many requests") || errorObj?.status === 429) {
    title = "Too Many Attempts";
    description = "For your security, login attempts have been temporarily limited. Please wait 60 seconds and try again.";
  } else if (rawMsg.includes("failed to fetch") || rawMsg.includes("networkerror") || rawMsg.includes("network")) {
    title = "Network Connection Issue";
    description = "Could not reach HomeCare security servers. Please check your internet connection and try again.";
  } else if (errorObj?.message) {
    title = `Failed ${defaultContext}`;
    description = errorObj.message;
  }

  // Fire prominent toast notification
  toast.error(title, {
    description,
    duration: 5000,
  });

  return { title, description, isUnconfirmedEmail };
}
