"use client";

import { useState } from "react";
import { 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MessageCircle, 
  Building2, 
  CreditCard,
  Zap,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Logo from "./Logo";

export interface AccreditationReceiptData {
  receiptNumber: string;
  date: string;
  proName: string;
  proPhone: string;
  proEmail?: string;
  skill?: string;
  tier: "starter" | "elite";
  amount: number;
  paymentMethod: "flutterwave" | "bank_transfer";
  paymentRef: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  status: "verified" | "pending_audit";
}

interface AccreditationReceiptModalProps {
  data: AccreditationReceiptData;
  onClose: () => void;
}

export default function AccreditationReceiptModal({
  data,
  onClose,
}: AccreditationReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);
  const CUSTOMER_CARE_WHATSAPP = "2349119059859";

  const isElite = data.tier === "elite";
  const isPaid = data.status === "verified";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById("printable-accreditation-receipt");
    if (!element) {
      toast.error("Could not find receipt content.");
      return;
    }

    const loadId = toast.loading("Generating your official accreditation receipt PDF...");
    setDownloading(true);

    try {
      await document.fonts?.ready;

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`HomeCare-Accreditation-${data.receiptNumber}.pdf`);

      toast.success("Receipt PDF downloaded successfully!", { id: loadId });
    } catch (err: unknown) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. You can use the Print option.", { id: loadId });
    } finally {
      setDownloading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    const message = encodeURIComponent(
      `*HOMECARE ACCREDITATION VERIFICATION SLIP*\n\n` +
      `*Receipt Ref:* ${data.receiptNumber}\n` +
      `*Professional Name:* ${data.proName}\n` +
      `*Phone Number:* ${data.proPhone}\n` +
      `*Trade Skill:* ${data.skill || "General Artisan"}\n` +
      `*Package Tier:* ${isElite ? "Elite Pro Accelerator (₦3,500)" : "Starter Pro Accreditation (₦1,500)"}\n` +
      `*Amount Paid:* ₦${data.amount.toLocaleString()}\n` +
      `*Payment Method:* ${data.paymentMethod === "bank_transfer" ? "Alternative Globus Bank Transfer" : "Flutterwave Gateway"}\n` +
      `*Transfer/Tx Ref:* ${data.paymentRef}\n` +
      `*Date:* ${data.date}\n\n` +
      `Hello Customer Care Unit, I have submitted my accreditation payment and attached my receipt details above for verification.`
    );
    window.open(`https://wa.me/${CUSTOMER_CARE_WHATSAPP}?text=${message}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Top Actions Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">Official Accreditation Slip</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Print Slip"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div id="printable-accreditation-receipt" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900">
          
          {/* Header Brand */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <Logo />
              <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest mt-1.5">
                Accreditation &amp; Trust Compliance Division
              </p>
              <p className="text-xs text-slate-500 font-medium">HomeCare Technologies Nigeria · RC 782019</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isPaid
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}>
                {isPaid ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Clock size={13} className="text-amber-600" />}
                {isPaid ? "Payment Verified" : "Pending Bank Audit"}
              </span>
              <p className="text-[11px] font-mono text-slate-500 font-bold mt-1.5">{data.receiptNumber}</p>
              <p className="text-[10px] text-slate-400 font-medium">{data.date}</p>
            </div>
          </div>

          {/* Professional Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Professional Name:</span>
              <p className="font-black text-slate-900 text-sm mt-0.5">{data.proName || "Registered Professional"}</p>
              <p className="text-slate-600 font-mono mt-0.5">{data.proPhone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Trade Skill &amp; Role:</span>
              <p className="font-bold text-sky-700 text-xs mt-0.5">{data.skill || "Technical Service Pro"}</p>
              {data.proEmail && <p className="text-slate-500 truncate mt-0.5">{data.proEmail}</p>}
            </div>
          </div>

          {/* Package & Payment Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider p-3">
              <span className="col-span-8">Description / Accreditation Tier</span>
              <span className="col-span-4 text-right">Amount</span>
            </div>
            <div className="p-4 space-y-3 divide-y divide-slate-100">
              <div className="grid grid-cols-12 items-center text-xs">
                <div className="col-span-8">
                  <div className="flex items-center gap-1.5">
                    {isElite && <Sparkles size={13} className="text-amber-500 shrink-0" />}
                    <p className="font-black text-slate-900">
                      {isElite ? "Elite Pro Accelerator (Top inDrive Ranking Boost)" : "Starter Pro Accreditation + Master Handbook"}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isElite 
                      ? "NIMC Database validation, Gold badge, 60s priority radar alerts & 0% instant payout fees."
                      : "Official HomeCare Pro Master Handbook (PDF) & NIMC Identity Screening."}
                  </p>
                </div>
                <div className="col-span-4 text-right font-mono font-black text-slate-900 text-sm">
                  ₦{data.amount.toLocaleString()}
                </div>
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-12 items-center pt-3 text-xs">
                <div className="col-span-8 font-black uppercase tracking-wider text-slate-700">
                  Total Amount Paid / Deposited
                </div>
                <div className="col-span-4 text-right font-mono font-black text-base text-sky-700">
                  ₦{data.amount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Details Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold flex items-center gap-1.5">
                {data.paymentMethod === "bank_transfer" ? <Building2 size={14} className="text-sky-600" /> : <CreditCard size={14} className="text-sky-600" />}
                Payment Channel:
              </span>
              <span className="font-extrabold text-slate-900">
                {data.paymentMethod === "bank_transfer" ? "Alternative Globus Bank Transfer" : "Flutterwave Card / USSD"}
              </span>
            </div>

            {data.paymentMethod === "bank_transfer" && (
              <>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Beneficiary Account:</span>
                  <span className="font-mono font-bold text-slate-900">Globus Bank · 1000501179</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Account Name:</span>
                  <span className="font-bold text-slate-900">Mindvest Global Resources Ltd LLC</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center text-slate-600 border-t border-slate-200 pt-2">
              <span className="font-bold">Transaction / Transfer Reference:</span>
              <span className="font-mono font-black text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {data.paymentRef || "N/A"}
              </span>
            </div>
          </div>

          {/* Footer Security Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
              <span>Cryptographically generated receipt. Valid for platform accreditation &amp; tax accounting.</span>
            </div>
            <div className="text-[10px] font-mono font-bold text-slate-400">
              Support: +234 911 905 9859
            </div>
          </div>
        </div>

        {/* Bottom WhatsApp / Customer Care Dispatch Bar (Hidden when printing) */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-center sm:text-left">
            <p className="text-xs font-black text-slate-900">Need Instant Human Verification?</p>
            <p className="text-[11px] text-slate-500 font-medium">
              Send this receipt slip directly to Customer Care on WhatsApp for 2-minute manual confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
          >
            <MessageCircle size={16} />
            <span>Send to Customer Care</span>
          </button>
        </div>

      </div>
    </div>
  );
}
