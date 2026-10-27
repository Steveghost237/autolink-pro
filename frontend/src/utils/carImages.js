const BASE = 'https://images.unsplash.com';

export const VEHICLE_IMAGES = {
  berline: `${BASE}/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=85`,
  suv: `${BASE}/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=85`,
  luxe: `${BASE}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=85`,
  van: `${BASE}/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=800&q=85`,
  minibus: `${BASE}/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=85`,
  pickup: `${BASE}/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=85`,
  default: `${BASE}/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=800&q=85`,
};

export const SPECIFIC_CARS = {
  corolla: `${BASE}/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=85`,
  tucson: `${BASE}/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=85`,
  bmw5: `${BASE}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=85`,
  mercedesGLE: `${BASE}/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=85`,
  sportage: `${BASE}/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=85`,
  rangeRover: `${BASE}/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=85`,
  sprinter: `${BASE}/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=800&q=85`,
  hiace: `${BASE}/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=85`,
};

export function getVehicleImage(category) {
  return VEHICLE_IMAGES[category?.toLowerCase()] || VEHICLE_IMAGES.default;
}

export const TIERS = [
  { id: 'basic', label: 'Économique', desc: 'Citadines & petites berlines', maxPrice: 30000 },
  { id: 'standard', label: 'Intermédiaire', desc: 'Familiales & SUV compacts', maxPrice: 60000 },
  { id: 'premium', label: 'Premium', desc: 'SUV & berlines de marque', maxPrice: 110000 },
  { id: 'gold', label: 'Luxe', desc: 'Haut de gamme & prestige', maxPrice: 180000 },
  { id: 'collection', label: 'Super Luxe', desc: "Modèles d'exception", maxPrice: 999999 },
];

export const RENTAL_TYPES = [
  { id: 'urban_3h', label: '3 heures', duration: '3h', kmIncluded: 100, baseMultiplier: 0.15, minPrice: 15000, description: 'Idéal pour vos courses et rendez-vous en ville' },
  { id: 'urban_8h', label: '8 heures', duration: '8h', kmIncluded: 200, baseMultiplier: 0.30, minPrice: 25000, description: 'Demi-journée ou journée de travail complète' },
  { id: 'urban_day', label: '24 heures', duration: '24h', kmIncluded: 300, baseMultiplier: 1.0, minPrice: 25000, description: 'Journée complète — la formule la plus flexible' },
  { id: 'intercity', label: 'Interurbain', duration: 'Trajet', kmIncluded: 500, baseMultiplier: 1.5, minPrice: 60000, description: 'Douala ↔ Yaoundé, Douala ↔ Bafoussam et plus' },
  { id: 'long_haul', label: 'Longue durée', duration: 'Jours', kmIncluded: 500, baseMultiplier: null, minPrice: 0, description: 'Plusieurs jours — tarif journalier × nombre de jours' },
];
