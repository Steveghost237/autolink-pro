const BASE = 'https://images.unsplash.com';

export const HERO_SLIDES = [
  {
    id: 1,
    image: `${BASE}/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=90`,
    tag: 'Location avec chauffeur — Douala & Yaoundé',
    title: 'Votre mobilité,\nnotre mission',
    subtitle: 'Réservez un véhicule avec chauffeur certifié en quelques clics. Paiement Orange Money ou MTN. Disponible 24h/24.',
    cta: 'Réserver maintenant',
  },
  {
    id: 2,
    image: `${BASE}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=90`,
    tag: 'Flotte premium certifiée',
    title: 'Des véhicules\nd\'exception',
    subtitle: 'Berlines, SUV, véhicules de luxe — une flotte rigoureusement inspectée pour chaque occasion. Urbain, interurbain ou longue distance.',
    cta: 'Voir le catalogue',
  },
  {
    id: 3,
    image: `${BASE}/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=90`,
    tag: 'Premier au Cameroun',
    title: 'Location urbaine,\ninterurbaine, nationale',
    subtitle: '3h, 8h, journée complète ou voyage Douala-Yaoundé — AutoLink Pro s\'adapte à chaque besoin de déplacement.',
    cta: 'Commencer maintenant',
  },
];

export const VEHICLE_IMAGES = {
  berline:  `${BASE}/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=85`,
  suv:      `${BASE}/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=85`,
  luxe:     `${BASE}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=85`,
  van:      `${BASE}/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=800&q=85`,
  minibus:  `${BASE}/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=85`,
  pickup:   `${BASE}/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=85`,
  default:  `${BASE}/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=800&q=85`,
};

export const SPECIFIC_CARS = {
  corolla:  `${BASE}/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=85`,
  tucson:   `${BASE}/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=85`,
  bmw5:     `${BASE}/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=85`,
  mercedesGLE: `${BASE}/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=85`,
  sportage: `${BASE}/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=800&q=85`,
  rangeRover:`${BASE}/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=85`,
  sprinter: `${BASE}/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=800&q=85`,
  hiace:    `${BASE}/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=85`,
};

export const DRIVER_PHOTOS = [
  `${BASE}/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80`,
  `${BASE}/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80`,
  `${BASE}/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80`,
  `${BASE}/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80`,
];

export function getVehicleImage(category) {
  return VEHICLE_IMAGES[category?.toLowerCase()] || VEHICLE_IMAGES.default;
}

export const CATALOG_VEHICLES = [
  { id: 1, name: 'Toyota Corolla 2022',    category: 'Berline',  image: SPECIFIC_CARS.corolla,     price: 25000,  kmIncluded: 300, kmRate: 120, rating: 4.8, reviews: 47, available: true,  plate: 'LT-1234-A', seats: 5, fuel: 'Essence', year: 2022, gestionnaire: 'Jean Kouassi', score: 94 },
  { id: 2, name: 'Hyundai Tucson 2023',    category: 'SUV',      image: SPECIFIC_CARS.tucson,      price: 45000,  kmIncluded: 300, kmRate: 120, rating: 4.7, reviews: 31, available: true,  plate: 'LT-5678-B', seats: 5, fuel: 'Diesel',  year: 2023, gestionnaire: 'Jean Kouassi', score: 97 },
  { id: 3, name: 'BMW Série 5 2022',       category: 'Luxe',     image: SPECIFIC_CARS.bmw5,        price: 80000,  kmIncluded: 300, kmRate: 150, rating: 5.0, reviews: 18, available: false, plate: 'CE-9012-C', seats: 5, fuel: 'Essence', year: 2022, gestionnaire: 'Alice Bah',    score: 99 },
  { id: 4, name: 'Mercedes GLE 350',       category: 'SUV',      image: SPECIFIC_CARS.mercedesGLE, price: 95000,  kmIncluded: 500, kmRate: 100, rating: 4.9, reviews: 22, available: true,  plate: 'CE-3456-D', seats: 7, fuel: 'Diesel',  year: 2021, gestionnaire: 'Pierre Yao',   score: 91 },
  { id: 5, name: 'Kia Sportage 2023',      category: 'SUV',      image: SPECIFIC_CARS.sportage,    price: 38000,  kmIncluded: 300, kmRate: 120, rating: 4.6, reviews: 29, available: true,  plate: 'LT-7890-E', seats: 5, fuel: 'Hybride', year: 2023, gestionnaire: 'Fatou Camara', score: 88 },
  { id: 6, name: 'Mercedes Sprinter 2021', category: 'Van',      image: SPECIFIC_CARS.sprinter,    price: 55000,  kmIncluded: 400, kmRate: 120, rating: 4.9, reviews: 28, available: true,  plate: 'LT-2345-F', seats: 8, fuel: 'Diesel',  year: 2021, gestionnaire: 'Awa Diallo',   score: 95 },
  { id: 7, name: 'Toyota HiAce 2020',      category: 'Minibus',  image: SPECIFIC_CARS.hiace,       price: 60000,  kmIncluded: 400, kmRate: 100, rating: 4.6, reviews: 19, available: true,  plate: 'CE-6789-G', seats: 12, fuel: 'Diesel', year: 2020, gestionnaire: 'Paul Bamba',   score: 85 },
  { id: 8, name: 'Range Rover Evoque 2022',category: 'Luxe',     image: SPECIFIC_CARS.rangeRover,  price: 110000, kmIncluded: 500, kmRate: 150, rating: 4.9, reviews: 11, available: true,  plate: 'LT-9012-H', seats: 5, fuel: 'Essence', year: 2022, gestionnaire: "Robert N'Goran", score: 98 },
];

export const RENTAL_TYPES = [
  { id: 'urban_3h',  label: '3 heures',     duration: '3h',   kmIncluded: 100, baseMultiplier: 0.15, minPrice: 15000,  description: 'Idéal pour vos courses et rendez-vous en ville' },
  { id: 'urban_8h',  label: '8 heures',     duration: '8h',   kmIncluded: 200, baseMultiplier: 0.30, minPrice: 25000,  description: 'Demi-journée ou journée de travail complète' },
  { id: 'urban_day', label: '24 heures',    duration: '24h',  kmIncluded: 300, baseMultiplier: 1.0,  minPrice: 25000,  description: 'Journée complète — la formule la plus flexible' },
  { id: 'intercity', label: 'Interurbain',  duration: 'Trajet',kmIncluded: 500, baseMultiplier: 1.5,  minPrice: 60000,  description: 'Douala ↔ Yaoundé, Douala ↔ Bafoussam et plus' },
  { id: 'long_haul', label: 'Longue durée', duration: 'Jours',kmIncluded: 500, baseMultiplier: null, minPrice: 0,      description: 'Plusieurs jours — tarif journalier × nombre de jours' },
];
