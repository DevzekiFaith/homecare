"use client";

import { Printer, Download, X, Loader2, Zap, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderReceiptProps {
  orderRef: string;
  date: string;
  customerName: string;
  customerEmail: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status?: string;
  onClose?: () => void;
}

export default function OrderReceipt({
  orderRef,
  date,
  customerName,
  customerEmail,
  address,
  items,
  subtotal,
  deliveryFee,
  total,
  status,
  onClose
}: OrderReceiptProps) {
  const [downloading, setDownloading] = useState(false);
  const isPaid = status && status !== 'pending_payment' && status !== 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById("printable-receipt");
    if (!element) {
      toast.error("Could not find receipt content.");
      return;
    }
    
    const loadId = toast.loading("Generating your receipt PDF...");
    setDownloading(true);
    
    try {
      // Ensure element is ready
      await new Promise(r => setTimeout(r, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: true,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      toast.loading("Converting to PDF...", { id: loadId });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`HomeCare-Receipt-${orderRef}.pdf`);
      
      toast.success("Receipt downloaded!", { id: loadId });
    } catch (error: unknown) {
      console.error("PDF generation failed:", error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate PDF: ${msg}`, { id: loadId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto pt-10 sm:pt-20 print:p-0 print:bg-white print:relative print:z-0">
      <div className="bg-white text-black w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Header (Hidden in Print) */}
        <div className="p-4 border-b flex justify-between items-center bg-zinc-50 print:hidden">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Order Receipt</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
              {downloading ? "Generating..." : "Download PDF"}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-glow transition-all"
            >
              <Printer size={14} /> Print
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-full bg-zinc-200 text-zinc-600 hover:bg-zinc-300 transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Receipt Content */}
        <div id="printable-receipt" className="p-8 sm:p-12 overflow-y-auto print:overflow-visible">
          {/* Logo & Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6 scale-125 origin-left">
                <div className="h-8 w-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#f97316' }}>
                  <Zap size={20} style={{ color: '#ffffff', fill: '#ffffff' }} />
                </div>
                <span className="text-xl font-black tracking-tighter" style={{ color: '#000000' }}>
                  Home<span style={{ color: '#f97316' }}>Care</span>
                </span>
              </div>
              <div className="space-y-1 text-xs font-medium" style={{ color: '#71717a' }}>
                <p>HomeCare Nigeria</p>
                <p><a href="mailto:support@homecare.com.ng" style={{ color: '#0284c7', textDecoration: 'underline' }}>support@homecare.com.ng</a></p>
                <p>+234 911 905 9859</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-2xl font-heading font-extrabold tracking-tight mb-2" style={{ color: '#000000' }}>RECEIPT</h2>
              <p className="text-sm font-mono font-bold tracking-widest" style={{ color: '#f97316' }}>{orderRef}</p>
              <p className="text-xs mt-1" style={{ color: '#71717a' }}>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
            </div>
          </div>

          <div className="h-px mb-10" style={{ backgroundColor: '#f4f4f5' }} />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#a1a1aa' }}>Customer</h4>
              <p className="text-sm font-bold" style={{ color: '#000000' }}>{customerName}</p>
              <p className="text-xs mt-1" style={{ color: '#71717a' }}>{customerEmail}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#a1a1aa' }}>Delivery Address</h4>
              <p className="text-xs font-medium leading-relaxed max-w-[200px]" style={{ color: '#3f3f46' }}>
                <Truck size={12} className="inline mr-1" style={{ color: '#71717a' }} />
                {address}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: '#f4f4f5' }}>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400" style={{ color: '#a1a1aa' }}>Description</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center" style={{ color: '#a1a1aa' }}>Qty</th>
                  <th className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right" style={{ color: '#a1a1aa' }}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderTopColor: '#fafafa' }}>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottomColor: '#fafafa' }}>
                    <td className="py-4 text-sm font-bold" style={{ color: '#000000' }}>{item.name}</td>
                    <td className="py-4 text-sm text-center font-medium" style={{ color: '#000000' }}>{item.quantity}</td>
                    <td className="py-4 text-sm text-right font-bold" style={{ color: '#000000' }}>₦{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex flex-col items-end">
            <div className="w-full sm:w-64 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span style={{ color: '#71717a' }}>Subtotal</span>
                <span className="font-bold" style={{ color: '#000000' }}>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span style={{ color: '#71717a' }}>Delivery Fee</span>
                <span className="font-bold" style={{ color: '#000000' }}>₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="h-px my-2" style={{ backgroundColor: '#f4f4f5' }} />
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#000000' }}>Total Amount</span>
                <span className="text-2xl font-heading font-extrabold" style={{ color: '#f97316' }}>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-dashed text-center" style={{ borderColor: '#e4e7eb' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#a1a1aa' }}>Payment Status</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border" style={{ 
              backgroundColor: isPaid ? '#ecfdf5' : '#fff7ed', 
              color: isPaid ? '#059669' : '#c2410c', 
              borderColor: isPaid ? '#d1fae5' : '#ffedd5' 
            }}>
              {isPaid ? 'Payment Confirmed' : 'Pending Payment'}
            </div>
            <p className="mt-8 text-[10px]" style={{ color: '#a1a1aa' }}>
              Thank you for choosing HomeCare. This is an official receipt for your records.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
