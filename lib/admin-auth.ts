"use client";

// Default Master Passcode for initial setup
export const DEFAULT_ADMIN_PIN = "202688";
const PIN_STORAGE_KEY = "homecare_admin_master_pin";
const AUTH_SESSION_KEY = "homecare_admin_authenticated";
const LOCK_TIMEOUT_KEY = "homecare_admin_lock_timeout";

export interface AdminSecuritySettings {
  pin: string;
  autoLockMinutes: number;
}

export function getAdminPin(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PIN;
  return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_ADMIN_PIN;
}

export function setAdminPin(newPin: string): boolean {
  if (typeof window === "undefined") return false;
  if (!newPin || newPin.length !== 6) return false;
  localStorage.setItem(PIN_STORAGE_KEY, newPin);
  return true;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const current = getAdminPin();
  return enteredPin === current;
}

export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  const authTime = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!authTime) return false;
  
  const timeoutMin = parseInt(localStorage.getItem(LOCK_TIMEOUT_KEY) || "15", 10);
  const diffMs = Date.now() - parseInt(authTime, 10);
  const maxMs = timeoutMin * 60 * 1000;
  
  if (diffMs > maxMs) {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return false;
  }
  return true;
}

export function setAdminUnlocked(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_SESSION_KEY, Date.now().toString());
}

export function lockAdmin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

// WebAuthn Hardware Biometrics (Windows Hello, Touch ID, Face ID, Android Biometrics)
export async function authenticateWithWebAuthn(): Promise<{ success: boolean; message: string }> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return { success: false, message: "Biometric sensor is not supported on this browser. Please use your PIN." };
  }

  try {
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!isAvailable) {
      return { success: false, message: "No hardware biometric sensor detected. Please use your 6-digit PIN." };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Prompt platform authenticator (TouchID / Windows Hello / FaceID)
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 30000,
        userVerification: "required",
        rpId: window.location.hostname || "localhost",
      },
    });

    if (credential) {
      setAdminUnlocked();
      return { success: true, message: "Identity verified successfully!" };
    }
    return { success: false, message: "Biometric scan was cancelled. Please try again or use your PIN." };
  } catch (err: any) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return { 
        success: false, 
        message: "Biometric prompt timed out or cancelled. You can enter your 6-digit PIN passcode." 
      };
    }
    const errorMsg = err instanceof Error ? err.message : "Biometric scan failed";
    return { success: false, message: errorMsg };
  }
}
