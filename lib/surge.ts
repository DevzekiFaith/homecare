/**
 * HomeCare Surge Pricing Engine
 * Computes a price multiplier based on time of day, day of week, and service type.
 * Admin can override via real-time global settings.
 */

export interface SurgeResult {
  multiplier: number;
  /** 'standard' | 'busy' | 'high' */
  level: 'standard' | 'busy' | 'high';
  label: string;
  reason: string;
  isOverride?: boolean;
}

/** Base starting prices per service (in Naira) */
export const BASE_PRICES: Record<string, number> = {
  Plumber: 15000,
  Electrician: 18000,
  Carpenter: 20000,
  'Furniture Maker': 25000,
  'AC & Fridge Repair': 20000,
  Painter: 22000,
  'General Handyman': 15000,
};

// Global in-memory overrides store
declare global {
  // eslint-disable-next-line no-var
  var __homecare_surge_overrides: Record<string, number> | undefined;
}

if (!globalThis.__homecare_surge_overrides) {
  globalThis.__homecare_surge_overrides = {};
}

export function getGlobalOverrides(): Record<string, number> {
  return globalThis.__homecare_surge_overrides || {};
}

export function setGlobalOverrides(overrides: Record<string, number>): void {
  globalThis.__homecare_surge_overrides = { ...overrides };
}

export function clearGlobalOverrides(): void {
  globalThis.__homecare_surge_overrides = {};
}

/**
 * Returns a surge result for the given service, city, and current hour (0–23).
 * If no specific hour is passed it uses the current local hour.
 */
export function getSurgeResult(
  service: string,
  _city: string,
  hour: number = new Date().getHours()
): SurgeResult {
  const overrides = getGlobalOverrides();
  
  // Check for active real-time override
  if (overrides[service] && typeof overrides[service] === 'number') {
    const mult = Math.round(overrides[service] * 100) / 100;
    let level: SurgeResult['level'] = 'standard';
    let label = 'Standard';
    if (mult >= 1.25) {
      level = 'high';
      label = 'High Demand';
    } else if (mult >= 1.1) {
      level = 'busy';
      label = 'Busy';
    }
    return {
      multiplier: mult,
      level,
      label,
      reason: 'Admin manual override active',
      isOverride: true,
    };
  }

  const day = new Date().getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  const isMorningPeak = hour >= 7 && hour <= 9;
  const isEveningPeak = hour >= 17 && hour <= 20;
  const isOffHours = hour >= 21 || hour <= 5;

  let multiplier = 1.0;
  let reason = 'Regular availability';

  if (isOffHours) {
    multiplier = 1.4;
    reason = 'After-hours emergency rate';
  } else if (isMorningPeak && isWeekend) {
    multiplier = 1.35;
    reason = 'Weekend morning demand';
  } else if (isEveningPeak) {
    multiplier = 1.25;
    reason = 'Evening peak hours';
  } else if (isMorningPeak) {
    multiplier = 1.15;
    reason = 'Morning rush hours';
  } else if (isWeekend) {
    multiplier = 1.1;
    reason = 'Weekend availability';
  }

  // High-demand services get a slight additional factor
  const highDemandServices = ['Electrician', 'AC & Fridge Repair', 'Plumber'];
  if (highDemandServices.includes(service) && multiplier > 1.0) {
    multiplier = Math.min(multiplier + 0.05, 1.5);
  }

  let level: SurgeResult['level'] = 'standard';
  let label = 'Standard';

  if (multiplier >= 1.25) {
    level = 'high';
    label = 'High Demand';
  } else if (multiplier >= 1.1) {
    level = 'busy';
    label = 'Busy';
  }

  return { multiplier: Math.round(multiplier * 100) / 100, level, label, reason, isOverride: false };
}

/** Format a Naira price with the surge multiplier applied */
export function getSurgePrice(service: string, multiplier: number): string {
  const base = BASE_PRICES[service] ?? 15000;
  const surged = Math.ceil((base * multiplier) / 500) * 500; // round to nearest ₦500
  return `₦${surged.toLocaleString()}`;
}

