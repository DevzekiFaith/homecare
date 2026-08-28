import type { Metadata } from "next";
import Nav from "./components/Nav";
import MobileBottomNav from "./components/MobileBottomNav";
import RootWrapper from "./components/RootWrapper";
import { CartProvider } from "@/lib/cart";
import "./globals.css";
import { Toaster } from "sonner";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import * as SiteConfig from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: SiteConfig.getSiteUrl(),
  title: {
    default: `${SiteConfig.SITE_NAME} — #1 Vetted Home Repairs, Handymen & Appliances in Nigeria`,
    template: `%s | ${SiteConfig.SITE_NAME}`,
  },
  description: `Book accredited plumbers, electricians, carpenters, AC repair & painting professionals in Lagos, Abuja, Port Harcourt, Enugu & Ogun. 100% verified professionals, fast escrow payment & 2-minute booking.`,
  keywords: [
    "home repairs Nigeria",
    "hire plumber Lagos",
    "hire electrician Abuja",
    "handyman Enugu",
    "AC repair Port Harcourt",
    "carpenter Abeokuta",
    "professional repair jobs Nigeria",
    "home maintenance services",
    "HomeCare Nigeria",
    "generator repair",
    "plumbing services",
    "electrical repair company",
    "appliance store Nigeria",
  ],
  authors: [{ name: "HomeCare Technologies", url: "https://homecare.com.ng" }],
  creator: "HomeCare Technologies",
  publisher: "HomeCare Technologies",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/hclogo.png",
    apple: "/hclogo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SiteConfig.SITE_NAME,
    title: `${SiteConfig.SITE_NAME} — #1 Vetted Home Repairs & Professionals in Nigeria`,
    description: `Book accredited plumbers, electricians, carpenters & AC professionals across Nigeria. Book in 2 mins with 100% money-back escrow guarantee.`,
    locale: "en_NG",
    url: "/",
    images: [
      {
        url: "/hclogo.png",
        width: 1200,
        height: 630,
        alt: "HomeCare Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SiteConfig.SITE_NAME} — #1 Vetted Home Repairs & Professionals in Nigeria`,
    description: `Book accredited plumbers, electricians & professionals across Nigeria in 2 minutes.`,
    images: ["/hclogo.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SiteConfig.SITE_NAME,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "HomeCare Technologies",
  url: "https://homecare.com.ng",
  logo: "https://homecare.com.ng/hclogo.png",
  image: "https://homecare.com.ng/hclogo.png",
  description: "Nigeria's #1 verified platform for home repairs, plumbing, electrical maintenance, carpentry, AC repair, and smart appliances.",
  telephone: "+2349119059859",
  email: "support@homecare.com.ng",
  priceRange: "₦₦",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressRegion: "Lagos State",
    addressCountry: "NG",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Lagos State" },
    { "@type": "AdministrativeArea", name: "FCT Abuja" },
    { "@type": "AdministrativeArea", name: "Enugu State" },
    { "@type": "AdministrativeArea", name: "Rivers State" },
    { "@type": "AdministrativeArea", name: "Ogun State" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1280",
    bestRating: "5",
    worstRating: "1",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Home Repair Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Plumbing Repairs & Installation" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Electrical Wiring & Generator Maintenance" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AC & Fridge Servicing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Carpentry & Furniture Repairs" } },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${plusJakartaSans.variable} min-w-0 overflow-x-hidden font-sans antialiased`}
      >
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-stone-900 focus:shadow-lg focus:ring-2 focus:ring-violet-200"
        >
          Skip to content
        </a>
        <CartProvider>
          <Nav />
          <RootWrapper>
            <div id="content">{children}</div>
          </RootWrapper>
          <MobileBottomNav />
        </CartProvider>
        <Toaster position="top-center" richColors />
        <Analytics />
        {/* PWA service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(err){console.warn('SW registration failed:',err)})})}`,
          }}
        />
      </body>
    </html>
  );
}
