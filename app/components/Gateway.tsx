"use client";

import dynamic from 'next/dynamic';
import HeroSection from "./landing/HeroSection";
import ServiceCategorySection from "./landing/ServiceCategorySection";
import ProblemFinderSection from "./landing/ProblemFinderSection";

// Critically above-the-fold
const ProblemStorySection = dynamic(() => import("./landing/ProblemStorySection"));
const HowItWorksSection = dynamic(() => import("./landing/HowItWorksSection"));
const InteractiveMapSection = dynamic(() => import("./landing/InteractiveMapSection"));
const WalletEscrowSection = dynamic(() => import("./landing/WalletEscrowSection"));
const VerificationSection = dynamic(() => import("./landing/VerificationSection"));

// Below-the-fold / Heavy sections
const PropertyFacilitySection = dynamic(() => import("./landing/PropertyFacilitySection"));
const SmartStorePreviewSection = dynamic(() => import("./landing/SmartStorePreviewSection"));
const EducationalResourcesSection = dynamic(() => import("./landing/EducationalResourcesSection"));
const TestimonialsSection = dynamic(() => import("./landing/TestimonialsSection"));
const DualAudienceSection = dynamic(() => import("./landing/DualAudienceSection"));
const CustomerQrCodeSection = dynamic(() => import("./landing/CustomerQrCodeSection"));
const FAQSection = dynamic(() => import("./landing/FAQSection"));
const FooterSection = dynamic(() => import("./landing/FooterSection"));

export default function Gateway() {
  return (
    <div className="min-h-screen bg-white text-slate-900 transition-all duration-300 antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      {/* 1. HERO (# HOME REPAIRS, WITHOUT THE GUESSWORK + 5 Trust Pillars) */}
      <HeroSection />

      {/* 2. SERVICE CATEGORIES ("What do you need help with?") */}
      <ServiceCategorySection />

      {/* 3. SYMPTOM MATCHING FINDER */}
      <ProblemFinderSection />

      {/* 4. WHY HOMECARE (The Technology & Trust Infrastructure) */}
      <ProblemStorySection />

      {/* 5. HOW IT WORKS (7-Step HomeCare Flow) */}
      <HowItWorksSection />

      {/* 6. LIVE MATCHING / TRACKING (Product Visualizer) */}
      <InteractiveMapSection />

      {/* 7. ESCROW / PAYMENT PROTECTION (# YOUR MONEY IS RELEASED WHEN THE JOB IS DONE) */}
      <WalletEscrowSection />

      {/* 8. VERIFICATION SYSTEM (# HOW WE VERIFY PROFESSIONALS) */}
      <VerificationSection />

      {/* 9. PROPERTY MAINTENANCE (# KEEP YOUR PROPERTY RUNNING / MANAGE MY PROPERTY) */}
      <PropertyFacilitySection />

      {/* 10. SMART HOME STORE (Hardware + Professional Installation + Maintenance) */}
      <SmartStorePreviewSection />

      {/* 11. DIY STRATEGY (# NOT EVERY PROBLEM NEEDS A PROFESSIONAL) */}
      <EducationalResourcesSection />

      {/* 12. REAL CUSTOMER PROOF (Audited Real Reviews & Outcomes) */}
      <TestimonialsSection />

      {/* 13. PROFESSIONAL MARKETPLACE (# GOOD PROFESSIONALS DESERVE BETTER ACCESS TO CUSTOMERS) */}
      <DualAudienceSection />

      {/* 14. OUTDOOR CUSTOMER QR CODE (www.homecare.com.ng) */}
      <CustomerQrCodeSection />

      {/* 15. FAQ & FOOTER */}
      <FAQSection />
      <FooterSection />
    </div>
  );
}

