export interface NigeriaStateDelivery {
  name: string;
  minDays: number;
  maxDays: number;
  deliveryFee: number;
  hub: string;
  couriers: string[];
  popularAreas: string[];
}

export const FREE_DELIVERY_THRESHOLD = 100000;

export const NIGERIA_STATES_DELIVERY: Record<string, NigeriaStateDelivery> = {
  "Lagos": {
    name: "Lagos",
    minDays: 1,
    maxDays: 2,
    deliveryFee: 2000,
    hub: "Lagos Central Hub (Ikeja)",
    couriers: ["HomeCare Express Fleet", "Speedaf Express", "GIG Logistics"],
    popularAreas: ["Ikeja", "Lekki Phase 1", "Victoria Island", "Yaba", "Surulere", "Ikoyi", "Magodo", "Ajah", "Maryland", "Festac"],
  },
  "Abuja (FCT)": {
    name: "Abuja (FCT)",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3500,
    hub: "Abuja Central Station (Wuse 2)",
    couriers: ["Speedaf Express", "GIG Logistics", "DHL Express"],
    popularAreas: ["Wuse 2", "Maitama", "Garki", "Gwarinpa", "Asokoro", "Jabi", "Utako", "Kubwa", "Apo"],
  },
  "Rivers (Port Harcourt)": {
    name: "Rivers (Port Harcourt)",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3500,
    hub: "Port Harcourt Distribution Center (Trans-Amadi)",
    couriers: ["GIG Logistics", "Speedaf Express", "Fez Delivery"],
    popularAreas: ["GRA Phases 1-3", "Trans-Amadi", "Peter Odili Road", "Rumuokoro", "Ada George", "Woji"],
  },
  "Oyo (Ibadan)": {
    name: "Oyo (Ibadan)",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3000,
    hub: "Ibadan Express Station (Ring Road)",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Bodija", "Ring Road", "Oluyole", "Jericho", "Agodi GRA", "Dugbe"],
  },
  "Ogun": {
    name: "Ogun",
    minDays: 1,
    maxDays: 2,
    deliveryFee: 2500,
    hub: "Ogun Gateway Hub (Abeokuta / Sagamu)",
    couriers: ["HomeCare Express", "Speedaf Express"],
    popularAreas: ["Abeokuta", "Sagamu", "Ota", "Arepo", "Magboro", "Mowe"],
  },
  "Kano": {
    name: "Kano",
    minDays: 3,
    maxDays: 4,
    deliveryFee: 4000,
    hub: "Kano Northern Hub (Bompai)",
    couriers: ["Speedaf Express", "DHL Express", "GIG Logistics"],
    popularAreas: ["Kano Municipal", "Nassarawa", "Fagge", "Tarauni", "Bompai"],
  },
  "Kaduna": {
    name: "Kaduna",
    minDays: 3,
    maxDays: 4,
    deliveryFee: 4000,
    hub: "Kaduna Regional Hub",
    couriers: ["Speedaf Express", "GIG Logistics"],
    popularAreas: ["Kaduna North", "Barnawa", "Malali", "Kaduna South"],
  },
  "Enugu": {
    name: "Enugu",
    minDays: 2,
    maxDays: 4,
    deliveryFee: 3500,
    hub: "Enugu South-East Hub (Independence Layout)",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Independence Layout", "New Haven", "GRA", "Achara Layout"],
  },
  "Anambra": {
    name: "Anambra",
    minDays: 2,
    maxDays: 4,
    deliveryFee: 3500,
    hub: "Onitsha / Awka Gateway Center",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Awka", "Onitsha", "Nnewi"],
  },
  "Edo": {
    name: "Edo",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3500,
    hub: "Benin City Central Depot",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["GRA", "Airport Road", "Uselu", "Ikpoba Hill"],
  },
  "Delta": {
    name: "Delta",
    minDays: 2,
    maxDays: 4,
    deliveryFee: 3500,
    hub: "Asaba / Warri Station",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Asaba", "Warri", "Effurun", "Sapele"],
  },
  "Kwara": {
    name: "Kwara",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3500,
    hub: "Ilorin Distribution Point",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["GRA", "Tanke", "Fate", "Taiwo"],
  },
  "Osun": {
    name: "Osun",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3000,
    hub: "Osogbo Station",
    couriers: ["Speedaf Express", "GIG Logistics"],
    popularAreas: ["Osogbo", "Ile-Ife", "Ede"],
  },
  "Ondo": {
    name: "Ondo",
    minDays: 2,
    maxDays: 3,
    deliveryFee: 3500,
    hub: "Akure Hub",
    couriers: ["Speedaf Express", "GIG Logistics"],
    popularAreas: ["Akure", "Ondo Town", "Owo"],
  },
  "Akwa Ibom": {
    name: "Akwa Ibom",
    minDays: 3,
    maxDays: 4,
    deliveryFee: 4000,
    hub: "Uyo Express Hub",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Uyo", "Eket", "Ikot Ekpene"],
  },
  "Cross River": {
    name: "Cross River",
    minDays: 3,
    maxDays: 4,
    deliveryFee: 4000,
    hub: "Calabar Depot",
    couriers: ["GIG Logistics", "Speedaf Express"],
    popularAreas: ["Calabar", "Akpabuyo", "Ikom"],
  },
  "Plateau": {
    name: "Plateau",
    minDays: 3,
    maxDays: 4,
    deliveryFee: 4000,
    hub: "Jos Station",
    couriers: ["Speedaf Express", "GIG Logistics"],
    popularAreas: ["Jos North", "Jos South", "Bukuru"],
  },
  "Other States": {
    name: "Other Nigerian States",
    minDays: 3,
    maxDays: 5,
    deliveryFee: 4500,
    hub: "HomeCare National Express Logistics Network",
    couriers: ["Speedaf Express", "DHL Express", "GIG Logistics"],
    popularAreas: ["Nationwide Doorstep Delivery across all 36 States + FCT"],
  },
};

export function getEstimatedDeliveryDates(stateName: string = "Lagos") {
  const stateData = NIGERIA_STATES_DELIVERY[stateName] || NIGERIA_STATES_DELIVERY["Lagos"];
  const now = new Date();

  // Calculate delivery date window
  const minDate = new Date(now.getTime() + stateData.minDays * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + stateData.maxDays * 24 * 60 * 60 * 1000);

  const formatOptions: Intl.DateTimeFormatOptions = { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  };

  const formattedMin = minDate.toLocaleDateString("en-NG", formatOptions);
  const formattedMax = maxDate.toLocaleDateString("en-NG", formatOptions);

  return {
    stateData,
    minDate,
    maxDate,
    rangeString: `${formattedMin} – ${formattedMax}`,
    minFormatted: formattedMin,
    maxFormatted: formattedMax,
    businessDaysString: `${stateData.minDays} - ${stateData.maxDays} business days`,
    deliveryFee: stateData.deliveryFee,
  };
}

export interface StoreMetadata {
  name: string;
  tagline: string;
  rating: number;
  ratingCount: number;
  positiveRate: string;
  itemsSold: string;
  followers: string;
  responseRate: string;
  dispatchRate: string;
  yearsInNigeria: number;
  originCountry: string;
  verifiedBadge: string;
}

export function getStoreMetadataForProduct(category: string, sourceOrigin?: string): StoreMetadata {
  switch (category) {
    case "Power & Protection":
      return {
        name: "Tuya Power & Inverter Direct Flagship",
        tagline: sourceOrigin || "Dongguan Precision Power Labs",
        rating: 4.9,
        ratingCount: 38420,
        positiveRate: "99.2%",
        itemsSold: "148,000+",
        followers: "42.5K",
        responseRate: "< 30 mins",
        dispatchRate: "99.4% within 24h",
        yearsInNigeria: 4,
        originCountry: "Direct Manufacturer (Certified for Nigeria 110-240V)",
        verifiedBadge: "Brand Direct",
      };
    case "Security & Access":
      return {
        name: "Tuya Biometric & Security Direct",
        tagline: sourceOrigin || "Shenzhen High-Tech Security Hub",
        rating: 4.9,
        ratingCount: 41200,
        positiveRate: "99.4%",
        itemsSold: "116,000+",
        followers: "48.1K",
        responseRate: "< 20 mins",
        dispatchRate: "99.6% within 24h",
        yearsInNigeria: 5,
        originCountry: "Direct Manufacturer (Heavy-duty Zinc Alloy)",
        verifiedBadge: "Top Brand",
      };
    case "Kitchen Essentials":
      return {
        name: "HomeCare Culinary & Small Kitchen Appliances",
        tagline: sourceOrigin || "Zhongshan Commercial Kitchen Motors",
        rating: 4.9,
        ratingCount: 29800,
        positiveRate: "98.9%",
        itemsSold: "94,000+",
        followers: "31.4K",
        responseRate: "< 35 mins",
        dispatchRate: "99.1% within 24h",
        yearsInNigeria: 3,
        originCountry: "Direct Manufacturer (Pure Copper Motor)",
        verifiedBadge: "Official Store",
      };
    case "Smart Lighting":
      return {
        name: "Lumina Global Smart Lighting Labs",
        tagline: sourceOrigin || "Lumina Smart Lighting Base",
        rating: 4.8,
        ratingCount: 52100,
        positiveRate: "98.8%",
        itemsSold: "185,000+",
        followers: "54.2K",
        responseRate: "< 15 mins",
        dispatchRate: "99.7% within 24h",
        yearsInNigeria: 4,
        originCountry: "Direct Manufacturer (Surge Protected LED)",
        verifiedBadge: "Factory Direct",
      };
    case "Water Automation":
      return {
        name: "HydroTech Smart Water & Tank Automation",
        tagline: sourceOrigin || "Ningbo Flow Automation Park",
        rating: 4.9,
        ratingCount: 21500,
        positiveRate: "99.1%",
        itemsSold: "68,000+",
        followers: "24.6K",
        responseRate: "< 25 mins",
        dispatchRate: "99.3% within 24h",
        yearsInNigeria: 3,
        originCountry: "Direct Manufacturer (Ultrasonic & IP68 Waterproof)",
        verifiedBadge: "Top Rated",
      };
    default:
      return {
        name: "HomeCare Official Direct Store",
        tagline: sourceOrigin || "Global Smart Appliance Hub",
        rating: 4.9,
        ratingCount: 34500,
        positiveRate: "99.0%",
        itemsSold: "120,000+",
        followers: "36.8K",
        responseRate: "< 30 mins",
        dispatchRate: "99.3% within 24h",
        yearsInNigeria: 4,
        originCountry: "Direct Manufacturer",
        verifiedBadge: "Brand Direct",
      };
  }
}

export interface NigerianReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  helpfulCount: number;
  avatarColor: string;
  tag?: string;
}

export const SAMPLE_NIGERIAN_REVIEWS: NigerianReview[] = [
  {
    id: "rev-1",
    name: "Engr. Chidi O.",
    location: "Lekki Phase 1, Lagos",
    rating: 5,
    date: "2 days ago",
    verified: true,
    comment: "Ordered on Monday morning and GIG delivery brought it straight to my gate in Lekki by Tuesday afternoon. The build quality is exceptional — setup with the Tuya app took less than 3 minutes. Handles Nigerian NEPA voltage spikes without breaking a sweat.",
    helpfulCount: 42,
    avatarColor: "bg-blue-600",
    tag: "Fast Delivery Lagos",
  },
  {
    id: "rev-2",
    name: "Dr. Fatima B.",
    location: "Maitama, Abuja",
    rating: 5,
    date: "4 days ago",
    verified: true,
    comment: "Incredibly fast dispatch and delivery right to my gate in Abuja, with authentic Nigerian local warranty. Arrived neatly packaged in protective wrap. Very impressed by the on-time delivery guarantee, and it arrived a day ahead of schedule!",
    helpfulCount: 28,
    avatarColor: "bg-emerald-600",
    tag: "Verified Purchase",
  },
  {
    id: "rev-3",
    name: "Tunde Alabi",
    location: "Ikeja GRA, Lagos",
    rating: 5,
    date: "1 week ago",
    verified: true,
    comment: "Tested with my 3.5kVA inverter system and it's working flawlessly. Low standby power draw is real. The UK 3-pin fused plug fits firmly into our standard wall sockets without loose adapters.",
    helpfulCount: 35,
    avatarColor: "bg-amber-600",
    tag: "Inverter Compatible",
  },
  {
    id: "rev-4",
    name: "Blessing Eze",
    location: "Trans-Amadi, Port Harcourt",
    rating: 5,
    date: "1 week ago",
    verified: true,
    comment: "Shipped from Lagos to Port Harcourt in just 2 days via Speedaf Express. Customer service sent SMS and WhatsApp tracking milestones at every step. 10/10 store experience.",
    helpfulCount: 19,
    avatarColor: "bg-purple-600",
    tag: "Port Harcourt Delivery",
  },
  {
    id: "rev-5",
    name: "Adeolu K.",
    location: "Bodija, Ibadan",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    comment: "Solid product, factory sealed box with complete English visual manual and warranty card. Seamless integration with Alexa and Google Home in my parlor.",
    helpfulCount: 14,
    avatarColor: "bg-teal-600",
    tag: "Easy Setup",
  },
];
