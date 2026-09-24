import { getModelPhoto } from './modelPhotos';

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

// Tiers tarifaires AutoLink : basic / standard / premium / gold / collection
// (classification objective : marque, année, kilométrage, état, valeur marchande)
export const TIERS = [
  { id: 'basic',      label: 'Économique',    desc: 'Citadines & petites berlines',  maxPrice: 30000 },
  { id: 'standard',   label: 'Intermédiaire', desc: 'Familiales & SUV compacts',     maxPrice: 60000 },
  { id: 'premium',    label: 'Premium',       desc: 'SUV & berlines de marque',      maxPrice: 110000 },
  { id: 'gold',       label: 'Luxe',          desc: 'Haut de gamme & prestige',      maxPrice: 180000 },
  { id: 'collection', label: 'Super Luxe',    desc: 'Modèles d\'exception',          maxPrice: 999999 },
];

const OWNERS = ['Jean Kouassi', 'Alice Bah', 'Pierre Yao', 'Fatou Camara', 'Awa Diallo', 'Paul Bamba', "Robert N'Goran", 'Serge Etame', 'Claudine Mbappe', 'Innocent Fouda'];

// 60+ véhicules réels — les modèles les plus courants au Cameroun
// image = illustration de secours ; la photo réelle du modèle prime toujours
const V = (id, name, category, tier, image, price, opts = {}) => ({
  id, name, category, tier, price,
  image: getModelPhoto(name) || image,
  kmIncluded: tier === 'gold' || tier === 'premium' ? 500 : 300,
  kmRate: tier === 'gold' ? 150 : tier === 'premium' ? 120 : 100,
  rating: opts.rating ?? 4.6, reviews: opts.reviews ?? 15,
  available: opts.available ?? true,
  plate: opts.plate ?? `LT-${1000 + id}-A`,
  seats: opts.seats ?? 5, fuel: opts.fuel ?? 'Essence',
  year: opts.year ?? 2021,
  gestionnaire: opts.gestionnaire ?? OWNERS[id % OWNERS.length],
  score: opts.score ?? 90,
});

export const CATALOG_VEHICLES = [
  // ── BASIC — économique ──
  V(1,  'Toyota Yaris 2019',        'Citadine', 'basic', VEHICLE_IMAGES.berline,  18000, { rating: 4.5, reviews: 52 }),
  V(2,  'Toyota Corolla 2016',      'Berline',  'basic', SPECIFIC_CARS.corolla,   20000, { rating: 4.6, reviews: 88 }),
  V(3,  'Toyota Camry 2015',        'Berline',  'basic', VEHICLE_IMAGES.berline,  22000, { rating: 4.4, reviews: 61 }),
  V(4,  'Toyota Avensis 2014',      'Berline',  'basic', VEHICLE_IMAGES.berline,  20000, { rating: 4.3, reviews: 34 }),
  V(5,  'Toyota Starlet 2021',      'Citadine', 'basic', VEHICLE_IMAGES.berline,  19000, { rating: 4.7, reviews: 28 }),
  V(6,  'Honda Civic 2017',         'Berline',  'basic', VEHICLE_IMAGES.berline,  21000, { rating: 4.5, reviews: 41 }),
  V(7,  'Honda Accord 2015',        'Berline',  'basic', VEHICLE_IMAGES.berline,  23000, { rating: 4.4, reviews: 37 }),
  V(8,  'Hyundai Accent 2019',      'Citadine', 'basic', VEHICLE_IMAGES.berline,  17000, { rating: 4.3, reviews: 45 }),
  V(9,  'Hyundai Elantra 2018',     'Berline',  'basic', VEHICLE_IMAGES.berline,  20000, { rating: 4.5, reviews: 39 }),
  V(10, 'Kia Rio 2019',             'Citadine', 'basic', VEHICLE_IMAGES.berline,  17000, { rating: 4.4, reviews: 33 }),
  V(11, 'Kia Picanto 2021',         'Citadine', 'basic', VEHICLE_IMAGES.berline,  15000, { rating: 4.6, reviews: 57 }),
  V(12, 'Kia Cerato 2017',          'Berline',  'basic', VEHICLE_IMAGES.berline,  19000, { rating: 4.4, reviews: 29 }),
  V(13, 'Nissan Almera 2018',       'Berline',  'basic', VEHICLE_IMAGES.berline,  18000, { rating: 4.3, reviews: 26 }),
  V(14, 'Nissan Micra 2019',        'Citadine', 'basic', VEHICLE_IMAGES.berline,  15000, { rating: 4.2, reviews: 31 }),
  V(15, 'Suzuki Swift 2020',        'Citadine', 'basic', VEHICLE_IMAGES.berline,  17000, { rating: 4.6, reviews: 44 }),
  V(16, 'Peugeot 301 2018',         'Berline',  'basic', VEHICLE_IMAGES.berline,  19000, { rating: 4.4, reviews: 48 }),
  V(17, 'Peugeot 208 2020',         'Citadine', 'basic', VEHICLE_IMAGES.berline,  20000, { rating: 4.5, reviews: 36 }),
  V(18, 'Renault Logan 2017',       'Berline',  'basic', VEHICLE_IMAGES.berline,  16000, { rating: 4.2, reviews: 42 }),
  V(19, 'Renault Clio 2019',        'Citadine', 'basic', VEHICLE_IMAGES.berline,  17000, { rating: 4.4, reviews: 35 }),
  V(20, 'Volkswagen Golf 7 2017',   'Citadine', 'basic', VEHICLE_IMAGES.berline,  22000, { rating: 4.6, reviews: 51 }),
  V(21, 'Volkswagen Polo 2019',     'Citadine', 'basic', VEHICLE_IMAGES.berline,  19000, { rating: 4.5, reviews: 38 }),
  V(22, 'Mazda 3 2018',             'Berline',  'basic', VEHICLE_IMAGES.berline,  21000, { rating: 4.5, reviews: 27 }),
  V(23, 'Ford Fiesta 2018',         'Citadine', 'basic', VEHICLE_IMAGES.berline,  17000, { rating: 4.3, reviews: 24 }),
  V(24, 'Dacia Logan 2019',         'Berline',  'basic', VEHICLE_IMAGES.berline,  16000, { rating: 4.3, reviews: 40 }),

  // ── STANDARD — confort & polyvalence ──
  V(25, 'Toyota Corolla 2022',      'Berline',  'standard', SPECIFIC_CARS.corolla,  25000, { rating: 4.8, reviews: 47 }),
  V(26, 'Toyota RAV4 2021',         'SUV',      'standard', VEHICLE_IMAGES.suv,     42000, { rating: 4.7, reviews: 33, fuel: 'Hybride' }),
  V(27, 'Toyota Camry 2021',        'Berline',  'standard', VEHICLE_IMAGES.berline, 35000, { rating: 4.7, reviews: 29, fuel: 'Hybride' }),
  V(28, 'Toyota Hilux 2020',        'Pickup',   'standard', VEHICLE_IMAGES.pickup,  50000, { rating: 4.8, reviews: 55, fuel: 'Diesel' }),
  V(29, 'Toyota Fortuner 2019',     'SUV',      'standard', VEHICLE_IMAGES.suv,     52000, { rating: 4.6, reviews: 31, fuel: 'Diesel', seats: 7 }),
  V(30, 'Toyota HiAce 2020',        'Minibus',  'standard', SPECIFIC_CARS.hiace,    55000, { rating: 4.6, reviews: 19, fuel: 'Diesel', seats: 14 }),
  V(31, 'Hyundai Tucson 2023',      'SUV',      'standard', SPECIFIC_CARS.tucson,   45000, { rating: 4.7, reviews: 31, fuel: 'Diesel' }),
  V(32, 'Hyundai Santa Fe 2021',    'SUV',      'standard', VEHICLE_IMAGES.suv,     50000, { rating: 4.6, reviews: 23, fuel: 'Diesel', seats: 7 }),
  V(33, 'Hyundai H-1 2019',         'Van',      'standard', VEHICLE_IMAGES.van,     45000, { rating: 4.5, reviews: 21, fuel: 'Diesel', seats: 9 }),
  V(34, 'Kia Sportage 2023',        'SUV',      'standard', SPECIFIC_CARS.sportage, 38000, { rating: 4.6, reviews: 29, fuel: 'Hybride' }),
  V(35, 'Kia Sorento 2021',         'SUV',      'standard', VEHICLE_IMAGES.suv,     48000, { rating: 4.6, reviews: 18, fuel: 'Diesel', seats: 7 }),
  V(36, 'Nissan Qashqai 2021',      'SUV',      'standard', VEHICLE_IMAGES.suv,     35000, { rating: 4.5, reviews: 26 }),
  V(37, 'Nissan X-Trail 2020',      'SUV',      'standard', VEHICLE_IMAGES.suv,     42000, { rating: 4.5, reviews: 22, fuel: 'Diesel', seats: 7 }),
  V(38, 'Nissan Navara 2021',       'Pickup',   'standard', VEHICLE_IMAGES.pickup,  48000, { rating: 4.6, reviews: 30, fuel: 'Diesel' }),
  V(39, 'Honda CR-V 2021',          'SUV',      'standard', VEHICLE_IMAGES.suv,     40000, { rating: 4.7, reviews: 34 }),
  V(40, 'Mazda CX-5 2022',          'SUV',      'standard', VEHICLE_IMAGES.suv,     43000, { rating: 4.7, reviews: 28 }),
  V(41, 'Mitsubishi Outlander 2020','SUV',      'standard', VEHICLE_IMAGES.suv,     38000, { rating: 4.4, reviews: 20, seats: 7 }),
  V(42, 'Mitsubishi L200 2021',     'Pickup',   'standard', VEHICLE_IMAGES.pickup,  46000, { rating: 4.5, reviews: 33, fuel: 'Diesel' }),
  V(43, 'Mitsubishi Pajero 2018',   'SUV',      'standard', VEHICLE_IMAGES.suv,     50000, { rating: 4.5, reviews: 37, fuel: 'Diesel', seats: 7 }),
  V(44, 'Suzuki Vitara 2021',       'SUV',      'standard', VEHICLE_IMAGES.suv,     32000, { rating: 4.4, reviews: 19 }),
  V(45, 'Peugeot 3008 2021',        'SUV',      'standard', VEHICLE_IMAGES.suv,     45000, { rating: 4.6, reviews: 25, fuel: 'Diesel' }),
  V(46, 'Peugeot 508 2020',         'Berline',  'standard', VEHICLE_IMAGES.berline, 38000, { rating: 4.6, reviews: 21, fuel: 'Diesel' }),
  V(47, 'Volkswagen Tiguan 2021',   'SUV',      'standard', VEHICLE_IMAGES.suv,     44000, { rating: 4.6, reviews: 24, fuel: 'Diesel' }),
  V(48, 'Isuzu D-Max 2022',         'Pickup',   'standard', VEHICLE_IMAGES.pickup,  47000, { rating: 4.6, reviews: 32, fuel: 'Diesel' }),
  V(49, 'Ford Ranger 2021',         'Pickup',   'standard', VEHICLE_IMAGES.pickup,  49000, { rating: 4.7, reviews: 41, fuel: 'Diesel' }),
  V(50, 'Ford Everest 2020',        'SUV',      'standard', VEHICLE_IMAGES.suv,     53000, { rating: 4.5, reviews: 17, fuel: 'Diesel', seats: 7 }),
  V(51, 'Mercedes Sprinter 2021',   'Van',      'standard', SPECIFIC_CARS.sprinter, 55000, { rating: 4.9, reviews: 28, fuel: 'Diesel', seats: 9 }),
  V(52, 'Dacia Duster 2021',        'SUV',      'standard', VEHICLE_IMAGES.suv,     28000, { rating: 4.4, reviews: 46, fuel: 'Diesel' }),

  // ── PREMIUM — haut de gamme ──
  V(53, 'Toyota Land Cruiser Prado 2022', 'SUV', 'premium', VEHICLE_IMAGES.suv,  75000,  { rating: 4.9, reviews: 43, fuel: 'Diesel', seats: 7 }),
  V(54, 'Toyota Land Cruiser 2020',       'SUV', 'premium', VEHICLE_IMAGES.suv,  85000,  { rating: 4.9, reviews: 38, fuel: 'Diesel', seats: 7 }),
  V(55, 'Toyota Highlander 2022',         'SUV', 'premium', VEHICLE_IMAGES.suv,  68000,  { rating: 4.7, reviews: 19, fuel: 'Hybride', seats: 7 }),
  V(56, 'Toyota Sienna 2022',             'Van', 'premium', VEHICLE_IMAGES.van,  65000,  { rating: 4.8, reviews: 16, fuel: 'Hybride', seats: 8 }),
  V(57, 'Mercedes Classe C 300 2022',     'Berline', 'premium', VEHICLE_IMAGES.luxe, 70000, { rating: 4.8, reviews: 27 }),
  V(58, 'Mercedes Classe E 350 2021',     'Berline', 'premium', VEHICLE_IMAGES.luxe, 78000, { rating: 4.9, reviews: 24, fuel: 'Diesel' }),
  V(59, 'Mercedes GLC 300 2022',          'SUV', 'premium', VEHICLE_IMAGES.luxe, 80000,  { rating: 4.8, reviews: 22 }),
  V(60, 'BMW Série 5 2022',               'Berline', 'premium', SPECIFIC_CARS.bmw5, 80000, { rating: 5.0, reviews: 18, available: false }),
  V(61, 'BMW X3 2021',                    'SUV', 'premium', VEHICLE_IMAGES.luxe, 72000,  { rating: 4.7, reviews: 20, fuel: 'Diesel' }),
  V(62, 'BMW X5 2022',                    'SUV', 'premium', VEHICLE_IMAGES.luxe, 88000,  { rating: 4.9, reviews: 25, fuel: 'Diesel', seats: 7 }),
  V(63, 'Audi Q5 2022',                   'SUV', 'premium', VEHICLE_IMAGES.luxe, 75000,  { rating: 4.8, reviews: 21, fuel: 'Diesel' }),
  V(64, 'Audi A6 2021',                   'Berline', 'premium', VEHICLE_IMAGES.luxe, 70000, { rating: 4.7, reviews: 17, fuel: 'Diesel' }),
  V(65, 'Lexus RX 350 2021',              'SUV', 'premium', VEHICLE_IMAGES.luxe, 78000,  { rating: 4.8, reviews: 23, fuel: 'Hybride' }),
  V(66, 'Lexus GX 460 2020',              'SUV', 'premium', VEHICLE_IMAGES.luxe, 82000,  { rating: 4.7, reviews: 15, seats: 7 }),
  V(67, 'Nissan Patrol 2020',             'SUV', 'premium', VEHICLE_IMAGES.suv,  85000,  { rating: 4.8, reviews: 29, seats: 7 }),
  V(68, 'Volkswagen Touareg 2021',        'SUV', 'premium', VEHICLE_IMAGES.luxe, 76000,  { rating: 4.7, reviews: 14, fuel: 'Diesel' }),

  // ── GOLD — luxe & prestige ──
  V(69, 'Mercedes GLE 350 2023',          'SUV', 'gold', SPECIFIC_CARS.mercedesGLE, 95000,  { rating: 4.9, reviews: 22, fuel: 'Diesel', seats: 7 }),
  V(70, 'Mercedes GLS 450 2022',          'SUV', 'gold', VEHICLE_IMAGES.luxe,    120000, { rating: 4.9, reviews: 13, seats: 7 }),
  V(71, 'Mercedes Classe S 500 2023',     'Berline', 'gold', VEHICLE_IMAGES.luxe, 150000, { rating: 5.0, reviews: 11, fuel: 'Hybride' }),
  V(72, 'Mercedes Classe G 63 2022',      'SUV', 'gold', VEHICLE_IMAGES.luxe,    200000, { rating: 4.9, reviews: 9 }),
  V(73, 'BMW X7 2023',                    'SUV', 'gold', VEHICLE_IMAGES.luxe,    130000, { rating: 4.9, reviews: 12, seats: 7 }),
  V(74, 'BMW Série 7 2022',               'Berline', 'gold', VEHICLE_IMAGES.luxe, 125000, { rating: 4.8, reviews: 10, fuel: 'Hybride' }),
  V(75, 'Lexus LX 570 2021',              'SUV', 'gold', VEHICLE_IMAGES.luxe,    110000, { rating: 4.8, reviews: 16, seats: 7 }),
  V(76, 'Range Rover Evoque 2022',        'SUV', 'gold', SPECIFIC_CARS.rangeRover, 110000, { rating: 4.9, reviews: 11 }),
  V(77, 'Range Rover Sport 2023',         'SUV', 'gold', VEHICLE_IMAGES.luxe,    140000, { rating: 5.0, reviews: 8, fuel: 'Diesel' }),
  V(78, 'Range Rover Velar 2022',         'SUV', 'gold', VEHICLE_IMAGES.luxe,    105000, { rating: 4.8, reviews: 13 }),
  V(79, 'Toyota Land Cruiser V8 VXR 2023','SUV', 'gold', VEHICLE_IMAGES.suv,     100000, { rating: 4.9, reviews: 26, fuel: 'Diesel', seats: 7 }),
  V(80, 'Porsche Cayenne 2022',           'SUV', 'gold', VEHICLE_IMAGES.luxe,    160000, { rating: 4.9, reviews: 7 }),
  V(81, 'Audi Q7 2022',                   'SUV', 'gold', VEHICLE_IMAGES.luxe,    98000,  { rating: 4.8, reviews: 15, fuel: 'Diesel', seats: 7 }),
  V(82, 'Audi Q8 2023',                   'SUV', 'gold', VEHICLE_IMAGES.luxe,    135000, { rating: 4.9, reviews: 9 }),
];

export const RENTAL_TYPES = [
  { id: 'urban_3h',  label: '3 heures',     duration: '3h',   kmIncluded: 100, baseMultiplier: 0.15, minPrice: 15000,  description: 'Idéal pour vos courses et rendez-vous en ville' },
  { id: 'urban_8h',  label: '8 heures',     duration: '8h',   kmIncluded: 200, baseMultiplier: 0.30, minPrice: 25000,  description: 'Demi-journée ou journée de travail complète' },
  { id: 'urban_day', label: '24 heures',    duration: '24h',  kmIncluded: 300, baseMultiplier: 1.0,  minPrice: 25000,  description: 'Journée complète — la formule la plus flexible' },
  { id: 'intercity', label: 'Interurbain',  duration: 'Trajet',kmIncluded: 500, baseMultiplier: 1.5,  minPrice: 60000,  description: 'Douala ↔ Yaoundé, Douala ↔ Bafoussam et plus' },
  { id: 'long_haul', label: 'Longue durée', duration: 'Jours',kmIncluded: 500, baseMultiplier: null, minPrice: 0,      description: 'Plusieurs jours — tarif journalier × nombre de jours' },
];
