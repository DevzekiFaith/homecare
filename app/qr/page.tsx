import CustomerQrCodeSection from "../components/landing/CustomerQrCodeSection";

export const metadata = {
  title: "Outdoor Customer QR Code & Printable Badge | HomeCare",
  description: "Get the official HomeCare outdoor customer QR code badge for homes, apartments, shortlets, and property gates. Scan to request verified professionals at www.homecare.com.ng.",
};

export default function QrPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased py-12">
      <CustomerQrCodeSection />
    </div>
  );
}
