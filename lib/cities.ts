/**
 * HomeCare — Single source of truth for cities and service areas.
 * Set `active: true` for cities currently accepting bookings.
 * Admin panel can toggle these in the future via Supabase table.
 */

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  active: boolean;
  launchSoon: boolean;
  areas: string[];
}

export const CITIES: CityConfig[] = [
  {
    id: 'enugu',
    name: 'Enugu',
    state: 'Enugu State',
    active: true,
    launchSoon: false,
    areas: [
      'Independence Layout',
      'GRA',
      'New Haven',
      'Abakpa',
      'Thinkers Corner',
      'Emene',
      'Trans Ekulu',
      'Coal Camp',
    ],
  },
  {
    id: 'abuja',
    name: 'Abuja',
    state: 'FCT',
    active: true,
    launchSoon: false,
    areas: ['Wuse', 'Maitama', 'Garki', 'Asokoro', 'Gwarinpa', 'Kubwa'],
  },
  {
    id: 'lagos',
    name: 'Lagos',
    state: 'Lagos State',
    active: true,
    launchSoon: false,
    areas: ['Victoria Island', 'Lekki Phase 1', 'Ikoyi', 'Oniru', 'Ikeja', 'Surulere', 'Yaba', 'Ajah'],
  },
  {
    id: 'ogun',
    name: 'Abeokuta',
    state: 'Ogun State',
    active: true,
    launchSoon: false,
    areas: ['Ibara', 'Oke-Mosan', 'Kuto', 'Adigbe', 'Obantoko', 'Abiola Way'],
  },
  {
    id: 'portharcourt',
    name: 'Port Harcourt',
    state: 'Rivers State',
    active: true,
    launchSoon: false,
    areas: ['GRA Phase 1', 'GRA Phase 2', 'Old GRA', 'Rumuola', 'Diobu'],
  },
];

/** Get all currently active cities */
export function getActiveCities(): CityConfig[] {
  return CITIES.filter((c) => c.active);
}

/** Get areas for the default (currently active) city */
export function getDefaultAreas(): string[] {
  const defaultCity = CITIES.find((c) => c.active);
  return defaultCity?.areas ?? [];
}

/** Get a city by its ID */
export function getCityById(id: string): CityConfig | undefined {
  return CITIES.find((c) => c.id === id);
}
