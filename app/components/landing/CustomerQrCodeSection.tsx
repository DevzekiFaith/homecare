"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Smartphone, 
  Printer, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  X
} from "lucide-react";
import Link from "next/link";

export default function CustomerQrCodeSection() {
  const [showModal, setShowModal] = useState(false);
  const targetDomain = "www.homecare.com.ng";
  const targetUrl = "https://www.homecare.com.ng";
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HomeCare Outdoor Customer QR Code</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; text-align: center; }
            .badge-container { background: #ffffff; border: 4px solid #0284c7; border-radius: 32px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-w: 400px; width: 85%; }
            .brand-name { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 2px; }
            .domain { font-size: 14px; font-weight: 800; color: #0284c7; margin-bottom: 24px; letter-spacing: 1px; }
            .qr-wrapper { background: #f0f9ff; border: 2px border-dashed #0284c7; border-radius: 24px; padding: 20px; display: inline-block; margin-bottom: 24px; }
            .qr-image { width: 220px; height: 220px; border-radius: 12px; }
            .instruction { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; }
            .sub-instruction { font-size: 12px; color: #64748b; margin-bottom: 0; }
            .footer-pill { margin-top: 20px; background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 11px; padding: 8px 16px; border-radius: 50px; display: inline-block; text-transform: uppercase; }
            @media print { body { background: #fff; } .badge-container { border-color: #000; } }
          </style>
        </head>
        <body>
          <div class="badge-container">
            <div class="brand-name">HOMECARE</div>
            <div class="domain">${targetDomain}</div>
            <div class="qr-wrapper">
              <img src="${qrImageUrl}" class="qr-image" alt="HomeCare Customer QR Code" />
            </div>
            <div class="instruction">SCAN TO BOOK REPAIR</div>
            <div class="sub-instruction">Point smartphone camera to request verified plumbers, electricians & professionals</div>
            <div class="footer-pill">100% Escrow Protected • NIN Verified</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-white text-slate-900 relative z-10 overflow-hidden border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Information & Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-black uppercase tracking-widest text-sky-700 shadow-2xs">
              <QrCode size={14} className="text-sky-600" />
              <span>Outdoor Physical QR Code</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 uppercase font-heading leading-tight">
              SCAN TO BOOK <br />
              <span className="text-sky-600">OUTSIDE YOUR DOOR</span>
            </h2>

            <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
              Place the official HomeCare QR Code outside your house, apartment block, shortlet, clinic, or estate gate. Anyone can scan it with a smartphone camera to request a verified professional instantly at <strong className="text-slate-900 underline">{targetDomain}</strong>.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
                  <Smartphone size={18} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block uppercase">Zero App Download Required</span>
                  <span className="text-[11px] text-slate-500 font-medium">Opens www.homecare.com.ng directly in mobile browser</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block uppercase">Instant Location Recognition</span>
                  <span className="text-[11px] text-slate-500 font-medium">Auto-pairs request with nearest NIN-verified professional</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                onClick={handlePrint}
                className="h-13 px-6 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-102 shadow-lg shadow-sky-600/25 cursor-pointer"
              >
                <Printer size={16} />
                <span>Print Sticker / Poster</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="h-13 px-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <QrCode size={16} />
                <span>View Full-Screen QR</span>
              </button>
            </div>
          </div>

          {/* Right Column: High Quality Physical Badge Mockup Card */}
          <div className="lg:col-span-6 relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white text-slate-900 rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 shadow-2xl border-4 border-sky-500/30 max-w-sm w-full text-center relative"
            >
              {/* Top Badge Brand Header */}
              <div className="space-y-1 mb-6">
                <span className="text-2xl font-black tracking-widest text-slate-900 uppercase font-heading block">
                  HOMECARE
                </span>
                <span className="text-xs font-extrabold text-sky-600 tracking-wider block">
                  {targetDomain}
                </span>
              </div>

              {/* QR Image Box */}
              <div className="p-4 rounded-3xl bg-sky-50 border-2 border-dashed border-sky-300 inline-block mb-6 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="HomeCare Customer QR Code"
                  className="w-56 h-56 rounded-2xl mx-auto object-contain shadow-xs"
                />
              </div>

              {/* Instruction Footer */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-1.5">
                  <Smartphone size={14} className="text-sky-600" />
                  <span>SCAN TO BOOK A REPAIR</span>
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  Point smartphone camera to request plumbers, electricians &amp; professionals
                </p>
              </div>

              {/* Bottom Security Tag */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} />
                <span>NIN Verified • Escrow Protected</span>
              </div>
            </motion.div>
          </div>

        </div>

      </div>

      {/* Full-Screen QR Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-white text-slate-900 rounded-3xl p-8 max-w-md w-full text-center relative border border-slate-200 shadow-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1 mb-4">
                <h3 className="text-2xl font-black uppercase font-heading text-slate-900">HOMECARE QR</h3>
                <p className="text-xs font-bold text-sky-600">{targetDomain}</p>
              </div>

              <div className="p-4 bg-sky-50 border-2 border-sky-300 rounded-2xl inline-block mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImageUrl} alt="Full QR Code" className="w-64 h-64 rounded-xl mx-auto" />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full py-3.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={16} />
                  <span>Print Outdoor Badge</span>
                </button>
                <Link
                  href="/request"
                  target="_blank"
                  className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer block"
                >
                  <span>Test URL ({targetDomain})</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
