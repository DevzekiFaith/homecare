/**
 * HomeCare Platform Monetization & Financial Engine
 * 
 * Defines standard rates, fees, and financial settlement algorithms:
 * - 15% Marketplace Escrow Take-Rate (Platform Commission)
 * - 85% Net Disbursal to Verified Professionals
 * - 1.5% Express Instant Bank Settlement Fee
 * - ₦3,500 One-time NIN Identity & Background Verification Accreditation
 * - Subscription Tier Tiers (Plus: ₦15k, Pro: ₦35k, Elite: ₦75k)
 */

export const MONETIZATION_CONFIG = {
  PLATFORM_TAKE_RATE: 0.15, // 15%
  PRO_NET_RATE: 0.85, // 85%
  INSTANT_PAYOUT_FEE_RATE: 0.015, // 1.5%
  INSTANT_PAYOUT_MIN_FEE: 100, // ₦100 min fee
  NIN_VERIFICATION_FEE: 3500, // ₦3,500
  EMERGENCY_SURGE_FEE: 5000, // ₦5,000 flat emergency callout surcharge
  EXTENDED_WARRANTY_FEE: 2500, // ₦2,500 for 60-day guarantee add-on
  
  SUBSCRIPTION_TIERS: {
    plus: {
      id: "plus",
      name: "HomeCare Plus",
      priceMonthly: 15000,
      priceQuarterly: 40000,
      priceAnnual: 150000,
      surgeCap: 2.0,
      laborDiscountPercent: 0,
      freeChecksPerQuarter: 1,
      priorityDispatch: "standard",
    },
    pro: {
      id: "pro",
      name: "HomeCare Pro Care",
      priceMonthly: 35000,
      priceQuarterly: 95000,
      priceAnnual: 350000,
      surgeCap: 1.5,
      laborDiscountPercent: 10,
      freeChecksPerQuarter: 2,
      priorityDispatch: "priority",
    },
    elite: {
      id: "elite",
      name: "HomeCare Elite Estate",
      priceMonthly: 75000,
      priceQuarterly: 210000,
      priceAnnual: 750000,
      surgeCap: 1.0, // Zero surge ever
      laborDiscountPercent: 15,
      freeChecksPerQuarter: 4,
      priorityDispatch: "instant-vip",
    },
  },
} as const;

export interface JobFinancialBreakdown {
  grossAmount: number;
  platformFee: number;
  proEarnings: number;
  platformTakeRatePercent: number;
  proRatePercent: number;
  escrowStatus: "locked" | "released" | "disputed";
  formattedGross: string;
  formattedPlatformFee: string;
  formattedProEarnings: string;
}

/**
 * Calculates complete gross, platform commission, and pro net earnings for any job amount.
 */
export function calculateJobFinancials(
  grossAmount: number,
  customTakeRate?: number
): JobFinancialBreakdown {
  const takeRate = customTakeRate ?? MONETIZATION_CONFIG.PLATFORM_TAKE_RATE;
  const platformFee = Math.round(grossAmount * takeRate);
  const proEarnings = grossAmount - platformFee;

  return {
    grossAmount,
    platformFee,
    proEarnings,
    platformTakeRatePercent: Math.round(takeRate * 100),
    proRatePercent: Math.round((1 - takeRate) * 100),
    escrowStatus: "locked",
    formattedGross: `₦${grossAmount.toLocaleString()}`,
    formattedPlatformFee: `₦${platformFee.toLocaleString()}`,
    formattedProEarnings: `₦${proEarnings.toLocaleString()}`,
  };
}

export interface InstantPayoutCalculation {
  requestedAmount: number;
  convenienceFee: number;
  netPayoutToBank: number;
  isInstant: boolean;
  estimatedArrival: string;
  formattedRequested: string;
  formattedFee: string;
  formattedNet: string;
}

/**
 * Calculates net bank disbursal based on withdrawal mode (Instant vs Standard 24h).
 */
export function calculatePayoutBreakdown(
  amount: number,
  isInstant: boolean = false
): InstantPayoutCalculation {
  let convenienceFee = 0;
  if (isInstant) {
    convenienceFee = Math.max(
      MONETIZATION_CONFIG.INSTANT_PAYOUT_MIN_FEE,
      Math.round(amount * MONETIZATION_CONFIG.INSTANT_PAYOUT_FEE_RATE)
    );
  }

  const netPayoutToBank = Math.max(0, amount - convenienceFee);

  return {
    requestedAmount: amount,
    convenienceFee,
    netPayoutToBank,
    isInstant,
    estimatedArrival: isInstant ? "Under 3 minutes (Instant NIBSS)" : "Within 24 business hours",
    formattedRequested: `₦${amount.toLocaleString()}`,
    formattedFee: convenienceFee > 0 ? `₦${convenienceFee.toLocaleString()}` : "Free",
    formattedNet: `₦${netPayoutToBank.toLocaleString()}`,
  };
}
