/**
 * Standard Central Bank of Nigeria (CBN) Bank Codes for Flutterwave NIBSS Transfers
 */

export interface NigerianBank {
  name: string;
  code: string;
  slug: string;
  isMfb?: boolean;
}

export const NIGERIAN_BANKS: NigerianBank[] = [
  { name: "Access Bank", code: "044", slug: "access-bank" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058", slug: "gtbank" },
  { name: "Zenith Bank", code: "057", slug: "zenith-bank" },
  { name: "First Bank of Nigeria", code: "011", slug: "first-bank" },
  { name: "United Bank for Africa (UBA)", code: "033", slug: "uba" },
  { name: "Kuda Microfinance Bank", code: "090267", slug: "kuda-bank", isMfb: true },
  { name: "OPay Digital Services", code: "999992", slug: "opay", isMfb: true },
  { name: "PalmPay", code: "999991", slug: "palmpay", isMfb: true },
  { name: "Moniepoint MFB", code: "090405", slug: "moniepoint", isMfb: true },
  { name: "Fidelity Bank", code: "070", slug: "fidelity-bank" },
  { name: "First City Monument Bank (FCMB)", code: "214", slug: "fcmb" },
  { name: "Stanbic IBTC Bank", code: "221", slug: "stanbic-ibtc" },
  { name: "Sterling Bank", code: "232", slug: "sterling-bank" },
  { name: "Union Bank of Nigeria", code: "032", slug: "union-bank" },
  { name: "Wema Bank", code: "035", slug: "wema-bank" },
  { name: "Polaris Bank", code: "076", slug: "polaris-bank" },
  { name: "Ecobank Nigeria", code: "050", slug: "ecobank" },
  { name: "Keystone Bank", code: "082", slug: "keystone-bank" },
  { name: "Taj Bank", code: "302", slug: "taj-bank" },
  { name: "Jaiz Bank", code: "301", slug: "jaiz-bank" },
];

/**
 * Resolves bank code by bank name string matching
 */
export function getBankCodeByName(name: string): string {
  const normalized = name.toLowerCase().trim();
  const matched = NIGERIAN_BANKS.find(
    (b) =>
      b.name.toLowerCase().includes(normalized) ||
      b.slug.toLowerCase().includes(normalized) ||
      normalized.includes(b.name.toLowerCase()) ||
      normalized.includes(b.slug.toLowerCase())
  );
  return matched?.code || "044"; // default to Access Bank if unmatched
}
