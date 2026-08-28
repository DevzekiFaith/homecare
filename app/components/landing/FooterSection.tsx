"use client";

import Link from "next/link";
import Logo from "../Logo";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-b from-sky-900 via-blue-950 to-blue-950 text-white pt-20 pb-12 px-6 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">
        <div className="md:col-span-2">
          <Logo size="md" className="mb-6" variant="white" />
          <p className="text-sky-200/80 text-sm max-w-sm leading-relaxed mb-6">
            Connecting you to verified home repair professionals, plumbers, electricians, and carpenters in minutes. Fast &amp; Reliable.
          </p>

          <div className="space-y-2.5 text-sm text-sky-100/90 font-medium">
            <a href="https://wa.me/2349119059859" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={15} className="text-cyan-400" />
              <span>+234 911 905 9859</span>
            </a>
            <a href="mailto:support@homecare.com.ng" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={15} className="text-cyan-400" />
              <span>support@homecare.com.ng</span>
            </a>
            <p className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <MapPin size={15} className="text-cyan-400 shrink-0" /> 
              <span>Serving Magboro · Mowe · Ikeja · Lagos · Lekki · Enugu · Abeokuta</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Services &amp; Solutions</h4>
          <ul className="space-y-3 text-sm text-sky-200/80">
            <li><Link href="/request?category=plumbing" className="hover:text-white transition-colors">Plumbing &amp; Leak Repairs</Link></li>
            <li><Link href="/request?category=electrical" className="hover:text-white transition-colors">Electrical &amp; Wiring</Link></li>
            <li><Link href="/request?category=ac" className="hover:text-white transition-colors">AC &amp; Refrigeration</Link></li>
            <li><Link href="/request?category=carpentry" className="hover:text-white transition-colors">Carpentry &amp; Furniture</Link></li>
            <li><Link href="/verification" className="hover:text-white transition-colors">Verification Standard</Link></li>
            <li><Link href="/property-management" className="hover:text-white transition-colors">Property Management</Link></li>
            <li><Link href="/store" className="hover:text-white transition-colors">Parts &amp; Fittings Store</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-xs">Platform</h4>
          <ul className="space-y-3 text-sm text-sky-200/80">
            <li><Link href="/auth/customer/register" className="hover:text-white transition-colors">Create Account</Link></li>
            <li><Link href="/auth/worker/register" className="hover:text-white transition-colors">Join as a Pro</Link></li>
            <li><Link href="/auth/customer/login" className="hover:text-white transition-colors">Customer Login</Link></li>
            <li><Link href="/auth/worker/login" className="hover:text-white transition-colors">Professional Portal</Link></li>
            <li><Link href="/admin" className="text-cyan-300 hover:text-white font-bold transition-colors">🔒 Admin Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-sky-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-sky-300 uppercase tracking-widest relative z-10">
        <p>© {new Date().getFullYear()} HomeCare Technologies. All rights reserved.</p>
        <div className="flex items-center gap-2 text-cyan-300">
          <ShieldCheck size={16} />
          <span>100% Escrow Protection Guaranteed</span>
        </div>
      </div>
    </footer>
  );
}
