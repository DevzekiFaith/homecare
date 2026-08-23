"use client";

import dynamic from 'next/dynamic';
import HeroSection from "./landing/HeroSection";
import ProblemStorySection from "./landing/ProblemStorySection";
import ProblemFinderSection from "./landing/ProblemFinderSection";

// Critically above-the-fold
const HowItWorksSection = dynamic(() => import("./landing/HowItWorksSection"));
const WalletEscrowSection = dynamic(() => import("./landing/WalletEscrowSection"));
const ServiceCategorySection = dynamic(() => import("./landing/ServiceCategorySection"));
const SmartStorePreviewSection = dynamic(() => import("./landing/SmartStorePreviewSection"));
const PropertyFacilitySection = dynamic(() => import("./landing/PropertyFacilitySection"));
const DualAudienceSection = dynamic(() => import("./landing/DualAudienceSection"));
const InteractiveMapSection = dynamic(() => import("./landing/InteractiveMapSection"));

// Below-the-fold / Heavy sections
const EducationalResourcesSection = dynamic(() => import("./landing/EducationalResourcesSection"));
const TestimonialsSection = dynamic(() => import("./landing/TestimonialsSection"));
const FAQSection = dynamic(() => import("./landing/FAQSection"));
const FooterSection = dynamic(() => import("./landing/FooterSection"));

export default function Gateway() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300 antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      <HeroSection />
      <ProblemStorySection />
      <ProblemFinderSection />
      <HowItWorksSection />
      <WalletEscrowSection />
      <ServiceCategorySection />
      <SmartStorePreviewSection />
      <PropertyFacilitySection />
      <DualAudienceSection />
      <InteractiveMapSection />
      <EducationalResourcesSection />
      <TestimonialsSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
