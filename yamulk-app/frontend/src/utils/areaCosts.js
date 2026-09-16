/**
 * Area Cost Estimator Utility for Sri Lankan Destinations
 * Provides regional price multipliers & average daily category estimates per person based on destination data.
 */

// Region Tiers & Custom Area Cost Maps
const AREA_TIERS = {
  // Tier 1: High Cost / Luxury / Tourist Hubs
  tier1: [
    'colombo', 'bentota', 'nuwara eliya', 'mirissa', 'tangalle', 
    'hikkaduwa', 'pasikudah', 'yala', 'negombo', 'unawatuna'
  ],
  // Tier 3: Budget-Friendly / Rural / Heritage Outer Hubs
  tier3: [
    'jaffna', 'anuradhapura', 'polonnaruwa', 'badulla', 'kurunegala',
    'ratnapura', 'mannar', 'vavuniya', 'kilinochchi', 'monaragala'
  ]
  // Tier 2 (Default): Kandy, Galle, Sigiriya, Dambulla, Ella, Trincomalee, Matara, etc.
};

// Base daily rates per person / unit (Tier 2 baseline in LKR)
const BASE_RATES = {
  foodPerDay: 2500,
  entrancePerPerson: 2000,
  activityPerPerson: 2500,
  shoppingPerPerson: 1000,
  emergencyPerDayPerson: 500,
  accommodation: {
    hotel: 8000,
    guesthouse: 3500,
    homestay: 2000,
    hostel: 1500,
    resort: 22000
  },
  transportDaily: {
    bus: 800,
    train: 600,
    car: 4500,
    motorcycle: 1800,
    bicycle: 400,
    walk: 0,
    other: 1500
  }
};

/**
 * Returns regional multiplier based on destination name, province, or location
 */
export function getAreaMultiplier(destinationData) {
  if (!destinationData) return 1.0;

  const destStr = [
    destinationData.name,
    destinationData.location,
    destinationData.province
  ].filter(Boolean).join(' ').toLowerCase();

  // Check Tier 1 matches
  if (AREA_TIERS.tier1.some(place => destStr.includes(place))) {
    return 1.35; // 35% higher average costs
  }

  // Check Tier 3 matches
  if (AREA_TIERS.tier3.some(place => destStr.includes(place))) {
    return 0.75; // 25% lower average costs
  }

  // Check province level fallback
  if (destStr.includes('western') || destStr.includes('southern')) {
    return 1.15;
  }
  if (destStr.includes('northern') || destStr.includes('north central')) {
    return 0.80;
  }

  return 1.0; // Tier 2 baseline
}

/**
 * Computes category per-person / daily rates customized for the destination
 */
export function getAreaCategoryRates(destinationData, accommodationType = 'hotel', transportType = 'bus') {
  const multiplier = getAreaMultiplier(destinationData);
  
  // Also check if destination has its own explicit estimatedCost metadata
  const customCostFactor = (destinationData?.estimatedCost && destinationData.estimatedCost > 0)
    ? Math.min(Math.max(destinationData.estimatedCost / 10000, 0.7), 1.8)
    : 1.0;

  const finalMultiplier = multiplier * customCostFactor;

  const accBase = BASE_RATES.accommodation[accommodationType] || BASE_RATES.accommodation.hotel;
  const transBase = BASE_RATES.transportDaily[transportType] || BASE_RATES.transportDaily.bus;

  return {
    multiplier: finalMultiplier,
    areaTierName: finalMultiplier > 1.2 ? 'High Cost Area' : finalMultiplier < 0.85 ? 'Budget Area' : 'Standard Area',
    foodPerDay: Math.round(BASE_RATES.foodPerDay * finalMultiplier),
    entrancePerPerson: Math.round(BASE_RATES.entrancePerPerson * finalMultiplier),
    activityPerPerson: Math.round(BASE_RATES.activityPerPerson * finalMultiplier),
    shoppingPerPerson: Math.round(BASE_RATES.shoppingPerPerson * finalMultiplier),
    emergencyPerDayPerson: Math.round(BASE_RATES.emergencyPerDayPerson * finalMultiplier),
    accRate: Math.round(accBase * finalMultiplier),
    transRate: Math.round(transBase * finalMultiplier)
  };
}
