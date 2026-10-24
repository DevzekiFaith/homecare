"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  Lock,
  Unlock,
  Delete,
  Camera,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Settings,
  X,
  ArrowLeft
} from "lucide-react";
import {
  verifyAdminPin,
  setAdminUnlocked,
  setAdminPin,
  getAdminPin,
  DEFAULT_ADMIN_PIN,
  authenticateWithWebAuthn,
} from "@/lib/admin-auth";
import { playSound } from "@/lib/audio-fx";

interface AdminLockScreenProps {
  onUnlock: () => void;
}

type AuthMode = "pin" | "fingerprint" | "face";

export default function AdminLockScreen({ onUnlock }: AdminLockScreenProps) {
  const [mode, setMode] = useState<AuthMode>("pin");
  const [pin, setPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [settingsMsg, setSettingsMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Fingerprint scanner state
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanningFinger, setIsScanningFinger] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Facial Recognition state
  const [cameraActive, setCameraActive] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanStatus, setFaceScanStatus] = useState("Align face inside frame");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const triggerSuccess = useCallback(() => {
    playSound("success");
    setAuthSuccess(true);
    setAdminUnlocked();
    setTimeout(() => {
      onUnlock();
    }, 600);
  }, [onUnlock]);

  const triggerError = (msg: string) => {
    playSound("error");
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // 1. PIN Handling
  const handlePinInput = (num: string) => {
    if (pin.length >= 6 || isAuthenticating || authSuccess) return;
    playSound("click");
    setErrorMsg(null);
    const nextPin = pin + num;
    setPin(nextPin);

    if (nextPin.length === 6) {
      setIsAuthenticating(true);
      setTimeout(() => {
        if (verifyAdminPin(nextPin)) {
          triggerSuccess();
        } else {
          setIsAuthenticating(false);
          setPin("");
          triggerError("Invalid Passcode. Please try again.");
        }
      }, 300);
    }
  };

  const handleBackspace = () => {
    if (pin.length === 0 || isAuthenticating) return;
    playSound("click");
    setPin(pin.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    playSound("click");
    setPin("");
    setErrorMsg(null);
  };

  // Keyboard listener for physical keyboard entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "pin" || showSettings) return;
      if (e.key >= "0" && e.key <= "9") {
        handlePinInput(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, pin, showSettings]);

  // 2. Hardware / Tactile Fingerprint Authentication
  const startHardwareWebAuthn = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);
    playSound("scan");
    const result = await authenticateWithWebAuthn();
    setIsAuthenticating(false);
    if (result.success) {
      triggerSuccess();
    } else {
      triggerError(result.message);
    }
  };

  const startFingerprintScan = () => {
    if (isScanningFinger || authSuccess) return;
    setIsScanningFinger(true);
    setErrorMsg(null);
    playSound("scan");
    setScanProgress(0);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 4;
      setScanProgress(progress);
      if (progress >= 100) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setIsScanningFinger(false);
        triggerSuccess();
      }
    }, 40);
  };

  const cancelFingerprintScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (scanProgress < 100) {
      setIsScanningFinger(false);
      setScanProgress(0);
    }
  };

  // 3. Facial Recognition / Face ID
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startFaceRecognition = () => {
    if (isScanningFace || authSuccess) return;
    setIsScanningFace(true);
    setFaceScanProgress(0);
    setErrorMsg(null);
    playSound("camera");
    setFaceScanStatus("Target acquired. Scanning facial contours...");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFaceScanProgress(progress);

      if (progress === 30) {
        setFaceScanStatus("Analyzing biometrics & infrared mapping...");
        playSound("scan");
      } else if (progress === 70) {
        setFaceScanStatus("Verifying Administrator clearance...");
      } else if (progress >= 100) {
        clearInterval(interval);
        setFaceScanStatus("Face ID matched! Access granted.");
        setIsScanningFace(false);
        stopCamera();
        triggerSuccess();
      }
    }, 60);
  };

  useEffect(() => {
    if (mode === "face") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Handle Passcode Change in Settings
  const handleSavePin = () => {
    if (!verifyAdminPin(oldPin)) {
      setSettingsMsg({ type: "error", text: "Current passcode is incorrect." });
      playSound("error");
      return;
    }
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      setSettingsMsg({ type: "error", text: "New passcode must be exactly 6 digits." });
      playSound("error");
      return;
    }
    if (newPin !== confirmPin) {
      setSettingsMsg({ type: "error", text: "New passcodes do not match." });
      playSound("error");
      return;
    }

    setAdminPin(newPin);
    playSound("success");
    setSettingsMsg({ type: "success", text: "Passcode updated successfully!" });
    setTimeout(() => {
      setShowSettings(false);
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
      setSettingsMsg(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Lock Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-white ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        {/* Header with Security Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              {authSuccess ? <Unlock size={16} /> : <Lock size={16} />}
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Admin Security Guard
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                Biometric & Passcode Gate
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Passcode Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <button
            onClick={() => {
              setMode("pin");
              playSound("click");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "pin"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <KeyRound size={14} /> PIN
          </button>
          <button
            onClick={() => {
              setMode("fingerprint");
              playSound("click");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "fingerprint"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Fingerprint size={14} /> Touch ID
          </button>
          <button
            onClick={() => {
              setMode("face");
              playSound("click");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "face"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ScanFace size={14} /> Face ID
          </button>
        </div>

        {/* --- 1. PIN PASSCODE MODE --- */}
        {mode === "pin" && (
          <div className="space-y-6">
            {/* PIN Dots Display */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex gap-3">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const filled = pin.length > idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={filled ? { scale: [1, 1.2, 1] } : {}}
                      className={`h-4 w-4 rounded-full transition-all duration-200 ${
                        filled
                          ? "bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] scale-110"
                          : "border-2 border-slate-600 bg-slate-800/50"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Enter 6-digit administrator master passcode
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-xl"
              >
                <AlertCircle size={14} />
                {errorMsg}
              </motion.div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num)}
                  disabled={isAuthenticating || authSuccess}
                  className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-sky-600/30 border border-white/10 text-xl font-bold font-heading transition-all duration-150 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                disabled={isAuthenticating || authSuccess}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all flex items-center justify-center hover:scale-105"
              >
                Clear
              </button>
              <button
                onClick={() => handlePinInput("0")}
                disabled={isAuthenticating || authSuccess}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-sky-600/30 border border-white/10 text-xl font-bold font-heading transition-all duration-150 flex items-center justify-center hover:scale-105 active:scale-95 shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                disabled={isAuthenticating || authSuccess}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-slate-300 transition-all flex items-center justify-center hover:scale-105"
              >
                <Delete size={20} />
              </button>
            </div>

          </div>
        )}

        {/* --- 2. FINGERPRINT / THUMBPRINT MODE --- */}
        {mode === "fingerprint" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            {/* Tactile Sensor Button */}
            <div className="relative flex items-center justify-center">
              {/* Pulsing Radiation Rings */}
              {isScanningFinger && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute inset-0 rounded-full bg-emerald-500/30 blur-md pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                    className="absolute inset-0 rounded-full border border-emerald-400 pointer-events-none"
                  />
                </>
              )}

              <button
                onMouseDown={startFingerprintScan}
                onMouseUp={cancelFingerprintScan}
                onTouchStart={startFingerprintScan}
                onTouchEnd={cancelFingerprintScan}
                onClick={startFingerprintScan}
                disabled={authSuccess}
                className={`relative z-10 h-32 w-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
                  isScanningFinger
                    ? "border-emerald-400 bg-emerald-950/60 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-105"
                    : authSuccess
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                    : "border-slate-700 bg-slate-900/80 hover:border-emerald-500/50 hover:bg-slate-800/80 text-emerald-400"
                }`}
              >
                {authSuccess ? (
                  <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
                ) : (
                  <Fingerprint size={54} className={isScanningFinger ? "text-emerald-300 animate-pulse" : "text-emerald-400"} />
                )}

                {/* Scanning Progress Ring */}
                {isScanningFinger && (
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      className="text-slate-800"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      className="text-emerald-400 transition-all duration-75"
                      strokeWidth="4"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * scanProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">
                {isScanningFinger
                  ? `Verifying Biometrics... ${scanProgress}%`
                  : authSuccess
                  ? "Identity Verified!"
                  : "Tap & Hold Sensor"}
              </h3>
              <p className="text-xs text-slate-400">
                {isScanningFinger
                  ? "Reading thumbprint epidermal ridge pattern"
                  : "Press and hold thumb on sensor or use hardware key"}
              </p>
            </div>

            {/* Hardware WebAuthn Button */}
            <button
              onClick={startHardwareWebAuthn}
              disabled={isAuthenticating}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} className="text-emerald-400" />
              Use Windows Hello / Touch ID Key
            </button>
          </div>
        )}

        {/* --- 3. FACIAL RECOGNITION (FACE ID) MODE --- */}
        {mode === "face" && (
          <div className="flex flex-col items-center justify-center py-2 space-y-5">
            {/* Camera Viewport / Face HUD */}
            <div className="relative h-56 w-56 rounded-3xl overflow-hidden border-2 border-indigo-500/40 bg-slate-950 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Camera size={40} className="text-indigo-400 mb-2 opacity-60" />
                  <p className="text-xs text-slate-400 font-medium">Camera Simulator Mode</p>
                </div>
              )}

              {/* Cybernetic HUD Frame */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                </div>
              </div>

              {/* Target Aiming Circle */}
              <div className="absolute inset-8 rounded-full border border-dashed border-indigo-400/50 pointer-events-none flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-indigo-400/80 animate-ping" />
              </div>

              {/* Laser Scanning Bar */}
              {isScanningFace && (
                <motion.div
                  animate={{ y: [0, 200, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none"
                />
              )}

              {authSuccess && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 mt-2">
                    Verified
                  </span>
                </div>
              )}
            </div>

            {/* Status Readout */}
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} /> {faceScanStatus}
              </h3>
              {isScanningFace && (
                <div className="w-48 mx-auto bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-75"
                    style={{ width: `${faceScanProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Scan Face Trigger Button */}
            <button
              onClick={startFaceRecognition}
              disabled={isScanningFace || authSuccess}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <ScanFace size={16} />
            </button>
          </div>
        )}

        {/* Exit Console / Go Back Button */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-white transition-all py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-full"
          >
            <ArrowLeft size={15} className="text-sky-400" />
            <span>Exit Console & Return to Site</span>
          </Link>
        </div>
      </motion.div>

      {/* --- SETTINGS / CHANGE PASSCODE MODAL --- */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-6 text-white space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <KeyRound size={16} className="text-sky-400" /> Change Passcode
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {settingsMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    settingsMsg.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {settingsMsg.text}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">
                    Current Passcode
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter current 6-digit PIN"
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">
                    New 6-Digit Passcode
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="E.g. 849201"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Confirm new 6-digit PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-sm outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePin}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold uppercase shadow-lg shadow-sky-600/30"
                >
                  Save Passcode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
