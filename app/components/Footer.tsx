import Link from "next/link";
import Logo from "./Logo";
import { ArrowRight, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 px-6 py-16 text-slate-100 sm:px-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid gap-12 sm:grid-cols-[1.5fr_1fr_1fr] items-start mb-16">
          <div>
            <div className="mb-6">
              <Logo size="md" variant="white" />
            </div>

            <h3 className="text-2xl font-heading font-extrabold tracking-tight mb-4 text-white">
              Book it. Fix it. Done.
            </h3>
            <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed mb-6">
              Verified artisans. Rapid matching. Escrow protected payments.
            </p>

            <div className="flex flex-col gap-3 text-xs font-semibold text-sky-400">
              <span className="flex items-center gap-2"><ArrowRight size={12} className="text-sky-400" /> Verified network</span>
              <span className="flex items-center gap-2"><ArrowRight size={12} className="text-sky-400" /> Same-day priority</span>
              <span className="flex items-center gap-2"><ArrowRight size={12} className="text-sky-400" /> Local experts</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Customers</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-300">
              <li>
                <Link href="/request" className="hover:text-white transition-colors">
                  Book a Pro
                </Link>
              </li>
              <li>
                <Link href="/inspection" className="hover:text-white transition-colors">
                  Property Inspection
                </Link>
              </li>
              <li>
                <Link href="/auth/customer/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-white transition-colors">
                  Parts Store
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Professionals & Support</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-300">
              <li>
                <Link href="/auth/worker/register" className="hover:text-white transition-colors">
                  Join the Network
                </Link>
              </li>
              <li>
                <Link href="/auth/worker/login" className="hover:text-white transition-colors">
                  Pro Login
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/2349119059859" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Phone size={14} className="text-cyan-400" />
                  <span>+234 911 905 9859</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@homecare.com.ng" 
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail size={14} className="text-cyan-400" />
                  <span>support@homecare.com.ng</span>
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
                  🔒 Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-8 text-xs font-bold text-slate-400">
          <p>&copy; {new Date().getFullYear()} <span className="text-white font-extrabold">HomeCare</span> Technologies. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 uppercase tracking-widest text-[10px] text-cyan-400">
            Fast & Reliable Home Repairs
          </p>
        </div>
      </div>
    </footer>
  );
}
