/**
 * HomeCare Property Care System — Core Business Logic & Models
 * Provides Property ID generation, Health Score computation, Equipment codes,
 * and standard Health Check inspection taxonomies.
 */

export interface Property {
  id: string;
  property_id: string; // e.g. "HC-PROP-004821"
  owner_id?: string | null;
  name: string;
  property_type: 'duplex' | 'bungalow' | 'apartment' | 'estate_unit' | 'office' | 'commercial' | 'shortlet' | 'clinic' | 'other';
  address: string;
  city: string;
  state?: string;
  floors_count?: number;
  units_count?: number;
  bedrooms_count?: number;
  year_built?: number;
  occupancy_type: 'owner_occupied' | 'tenant_occupied' | 'shortlet' | 'vacant' | 'commercial';
  health_score?: number | null; // 0-100, or null if unassessed
  health_status: 'healthy' | 'attention' | 'critical' | 'not_assessed';
  last_health_check_date?: string | null;
  qr_active: boolean;
  qr_secret_token?: string;
  created_at: string;
  updated_at?: string;
}

export interface PropertyEquipment {
  id: string;
  property_id: string;
  equipment_code: string; // e.g. "AC-001", "GEN-001", "PUMP-001"
  category: 'power' | 'cooling' | 'water' | 'appliances' | 'security' | 'building' | 'other';
  name: string;
  manufacturer?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  installation_date?: string | null;
  warranty_expiry?: string | null;
  service_interval_days?: number;
  current_condition: 'good' | 'attention' | 'critical' | 'unknown';
  notes?: string | null;
  created_at: string;
}

export interface PropertyHealthCheck {
  id: string;
  property_id: string;
  inspector_id?: string | null;
  inspector_name?: string | null;
  inspection_date: string;
  health_score: number; // 0-100
  status: 'completed' | 'in_progress' | 'approved' | 'draft';
  summary?: string | null;
  system_ratings?: Record<string, 'good' | 'attention' | 'critical' | 'not_assessed'>;
  immediate_actions?: string[];
  recommended_actions?: string[];
  preventive_actions?: string[];
  created_at: string;
  items?: PropertyHealthCheckItem[];
}

export interface PropertyHealthCheckItem {
  id?: string;
  health_check_id?: string;
  category: 'electrical' | 'plumbing' | 'water_system' | 'power' | 'cooling_appliances' | 'building_condition' | 'general_safety';
  item_name: string;
  condition: 'good' | 'attention' | 'critical' | 'not_assessed';
  finding?: string | null;
  recommendation?: string | null;
  photo_url?: string | null;
}

export interface PropertyIssue {
  id: string;
  property_id: string;
  reported_by_id?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  title: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assigned_worker_id?: string | null;
  related_service_request_id?: string | null;
  photo_url?: string | null;
  created_at: string;
}

export interface PropertyMaintenanceRecord {
  id: string;
  property_id: string;
  service_request_id?: string | null;
  health_check_id?: string | null;
  equipment_id?: string | null;
  performed_by_id?: string | null;
  performed_by_name?: string | null;
  category: string;
  title: string;
  work_performed: string;
  findings?: string | null;
  recommendations?: string | null;
  date_completed: string;
  cost?: number;
  documents_urls?: string[];
  photos_urls?: string[];
  next_recommended_date?: string | null;
  created_at: string;
}

export interface PropertyUpcomingMaintenance {
  id: string;
  property_id: string;
  equipment_id?: string | null;
  title: string;
  category: string;
  due_date: string;
  status: 'recommended' | 'scheduled' | 'due_soon' | 'overdue';
  source: 'health_check' | 'standard_interval' | 'staff_scheduled' | 'customer_scheduled';
  notes?: string | null;
  created_at: string;
}

/**
 * Generates a unique, standard HomeCare Property ID.
 * Format: HC-PROP-XXXXXX (e.g., HC-PROP-004821)
 */
export function generatePropertyId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `HC-PROP-${randomNum}`;
}

/**
 * Generates structured equipment internal identity code
 * Examples: AC-001, GEN-001, PUMP-001, SOLAR-001
 */
export function generateEquipmentCode(category: string, count: number = 1): string {
  const prefixMap: Record<string, string> = {
    power: 'GEN',
    cooling: 'AC',
    water: 'PUMP',
    appliances: 'APP',
    security: 'SEC',
    building: 'BLD',
    other: 'EQP',
  };
  const prefix = prefixMap[category] || 'EQP';
  const padded = String(count).padStart(3, '0');
  return `${prefix}-${padded}`;
}

/**
 * Standard HomeCare Property Health Check Taxonomy
 * Covers 7 comprehensive building & utility systems.
 */
export const HEALTH_CHECK_SYSTEMS = [
  {
    id: 'electrical',
    label: 'Electrical Infrastructure',
    iconName: 'Zap',
    items: [
      'Main Distribution Board & Circuit Breakers',
      'Wall Sockets, Switches & Faceplates',
      'Concealed & Surface Wiring Integrity',
      'Surge Protection & Earthing System',
      'Internal & Perimeter Security Lighting',
    ],
  },
  {
    id: 'plumbing',
    label: 'Plumbing & Drainage',
    iconName: 'Wrench',
    items: [
      'Water Supply Pipes & Pressure Regulators',
      'Bathroom & Kitchen Taps, Valves & Mixers',
      'Toilet Cisterns, Seals & Flush Mechanisms',
      'Wastewater Drainage, Traps & Soakaway Lines',
      'Water Heater Tanks & Pressure Relief Valves',
    ],
  },
  {
    id: 'water_system',
    label: 'Water Sourcing & Storage',
    iconName: 'Droplets',
    items: [
      'Overhead & Underground Water Storage Tanks',
      'Automatic Borehole / Surface Pressure Pump',
      'Water Float Switch & Auto-Fill Controller',
      'Filtration / Treatment System Condition',
    ],
  },
  {
    id: 'power',
    label: 'Power & Alternative Energy',
    iconName: 'Activity',
    items: [
      'Diesel/Petrol Generator Maintenance Status',
      'Automatic Transfer Switch (ATS) Changeover',
      'Solar Inverter, Charge Controller & Panels',
      'Battery Bank Health & Terminal Voltage',
    ],
  },
  {
    id: 'cooling_appliances',
    label: 'Cooling & HVAC Systems',
    iconName: 'Snowflake',
    items: [
      'Air Conditioner Compressor & Gas Pressure',
      'AC Filters, Drain Lines & Condenser Cleanliness',
      'Refrigerator / Deep Freezer Cooling Efficiency',
      'Kitchen Extraction & Ventilation Ducts',
    ],
  },
  {
    id: 'building_condition',
    label: 'Structural & Building Envelope',
    iconName: 'Building',
    items: [
      'Roofing Sheets, Gutters & Ceiling Stains',
      'Wall Plastering, Paint Cracks & Dampness',
      'Floor Tiles, Grouting & Skirting Integrity',
      'Doors, Locks, Hinges & Window Sealings',
    ],
  },
  {
    id: 'general_safety',
    label: 'Life Safety & Security',
    iconName: 'ShieldAlert',
    items: [
      'Fire Extinguishers & Smoke Detectors',
      'Emergency Exit Pathways & Gate Access',
      'Exposed Live Wires or Water Leak Hazards',
    ],
  },
] as const;

/**
 * Calculates dynamic Property Health Score from inspection items.
 * Returns score (0-100) or null if no items were assessed.
 */
export function calculateHealthScore(
  items: Array<{ condition: 'good' | 'attention' | 'critical' | 'not_assessed' }>
): number | null {
  const assessedItems = items.filter((i) => i.condition !== 'not_assessed');
  if (assessedItems.length === 0) return null;

  let totalPoints = 0;
  const maxPoints = assessedItems.length * 100;

  for (const item of assessedItems) {
    if (item.condition === 'good') {
      totalPoints += 100;
    } else if (item.condition === 'attention') {
      totalPoints += 50;
    } else if (item.condition === 'critical') {
      totalPoints += 0;
    }
  }

  return Math.round((totalPoints / maxPoints) * 100);
}

/**
 * Determines data-driven health status tier from score
 */
export function determineHealthStatus(score: number | null): 'healthy' | 'attention' | 'critical' | 'not_assessed' {
  if (score === null || score === undefined) return 'not_assessed';
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'attention';
  return 'critical';
}

/**
 * Returns formatted display badge label and colors for Health Status
 */
export function getHealthStatusBadge(status: 'healthy' | 'attention' | 'critical' | 'not_assessed') {
  switch (status) {
    case 'healthy':
      return {
        label: 'Healthy',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        dotColor: 'bg-emerald-500',
        description: 'No significant outstanding maintenance concerns.',
      };
    case 'attention':
      return {
        label: 'Attention Needed',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        dotColor: 'bg-amber-500',
        description: 'Preventive maintenance recommended to avoid equipment breakdown.',
      };
    case 'critical':
      return {
        label: 'Critical Fault',
        color: 'text-rose-700 bg-rose-50 border-rose-200',
        dotColor: 'bg-rose-500',
        description: 'Urgent corrective repairs required immediately.',
      };
    case 'not_assessed':
    default:
      return {
        label: 'Not Yet Assessed',
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        dotColor: 'bg-slate-400',
        description: 'Book a HomeCare Property Health Check to inspect this property.',
      };
  }
}

/**
 * Baseline Seed / Demo Properties for immediate operation & resilience
 */
export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    property_id: 'HC-PROP-004821',
    name: 'Lekki Phase 1 Luxury Duplex',
    property_type: 'duplex',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    city: 'Lagos',
    state: 'Lagos State',
    floors_count: 2,
    units_count: 1,
    bedrooms_count: 5,
    year_built: 2021,
    occupancy_type: 'owner_occupied',
    health_score: 88,
    health_status: 'healthy',
    last_health_check_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    qr_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c9a646d3-9c61-4cd7-bf15-47048096b01e',
    property_id: 'HC-PROP-008912',
    name: 'Maitama Executive Residence',
    property_type: 'apartment',
    address: '22 Mississippi Street, Maitama, Abuja',
    city: 'Abuja',
    state: 'FCT',
    floors_count: 4,
    units_count: 8,
    bedrooms_count: 3,
    year_built: 2019,
    occupancy_type: 'tenant_occupied',
    health_score: 64,
    health_status: 'attention',
    last_health_check_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    qr_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'e16b9b6e-6c84-48f8-b3bc-5e36928e46bc',
    property_id: 'HC-PROP-001245',
    name: 'Independence Layout Medical Plaza',
    property_type: 'clinic',
    address: '7 Ogui Road, Independence Layout, Enugu',
    city: 'Enugu',
    state: 'Enugu State',
    floors_count: 3,
    units_count: 6,
    occupancy_type: 'commercial',
    health_score: null,
    health_status: 'not_assessed',
    last_health_check_date: null,
    qr_active: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
