import {
  Car, Briefcase, Crown, Gem,
  UserCheck, Plane, Home, Baby, Gauge, MapPinned,
} from 'lucide-react';

/* ── 4 gammes de mobilité ────────────────────────────── */
export const GAMMES = [
  {
    id: 'basic', icon: Car, name: 'Citadines Agiles', tier: 'Basic',
    desc: 'Économiques et maniables, parfaites pour la ville et les petits budgets.',
    price: '25 000', features: [
      'Toyota Yaris, Kia Picanto…', '5 places — boîte manuelle ou auto',
      'Climatisation & Bluetooth', 'Idéal trajets urbains quotidiens',
    ],
  },
  {
    id: 'standard', icon: Briefcase, name: 'Berlines Spacieuses', tier: 'Standard', popular: true,
    desc: 'Le bon équilibre confort/prix pour vos déplacements pro et familiaux.',
    price: '35 000', features: [
      'Toyota Corolla, Honda Civic…', '5 places — boîte automatique',
      'Confort longue distance', 'Le meilleur rapport qualité/prix',
    ],
  },
  {
    id: 'premium', icon: Crown, name: 'SUV & 4x4 Confort', tier: 'Premium',
    desc: 'Espace, puissance et tenue de route pour l\'interurbain et les pistes.',
    price: '55 000', features: [
      'Toyota RAV4, Hyundai Tucson…', '5 à 7 places — transmission intégrale',
      'Kilométrage généreux inclus', 'Idéal Douala ↔ Yaoundé & chantiers',
    ],
  },
  {
    id: 'gold', icon: Gem, name: 'Prestige & Cortège', tier: 'Gold',
    desc: 'Véhicules d\'exception avec chauffeur protocolaire pour vos événements.',
    price: '95 000', features: [
      'Mercedes, Range Rover, Prado VX…', 'Chauffeur en tenue inclus',
      'Décoration mariage sur demande', 'Service protocole VIP 24/7',
    ],
  },
];

/* ── Options et suppléments ──────────────────────────── */
export const OPTIONS = [
  { icon: UserCheck, name: 'Chauffeur certifié',        price: '+10 000 FCFA/j',  desc: 'Un chauffeur professionnel AutoLink Pro conduit pour vous — détente totale.' },
  { icon: Plane,     name: 'Prise en charge aéroport',  price: '+5 000 FCFA',     desc: 'Accueil à l\'aéroport de Douala ou Nsimalen avec pancarte à votre nom.' },
  { icon: Home,      name: 'Livraison à domicile',      price: '+2 000 FCFA',     desc: 'Le véhicule arrive chez vous ou à votre bureau dans Douala et Yaoundé.' },
  { icon: Baby,      name: 'Siège bébé / enfant',       price: '+2 000 FCFA',     desc: 'Siège homologué installé avant la remise des clés, sur simple demande.' },
  { icon: Gauge,     name: 'Kilométrage supplémentaire', price: '150 FCFA/km',    desc: 'Au-delà du forfait de votre gamme, chaque km est facturé au compteur.' },
  { icon: MapPinned, name: 'Seconde zone / franchise',  price: '+10 000 FCFA',    desc: 'Circulez dans une 2ᵉ région ou vers Kribi, Bafoussam, Limbé en toute licence.' },
];

/* ── Exemple de facturation ──────────────────────────── */
export const INVOICE = {
  vehicle: 'Toyota RAV4 — Premium', period: '3 jours — Douala → Yaoundé',
  lines: [
    { label: 'Prix location SUV (3 × 55 000)',           amount: '165 000 FCFA', included: true },
    { label: 'Remise multi-jours (−20 %)',               amount: '−33 000 FCFA', included: true },
    { label: 'Chauffeur certifié (3 jours)',             amount: '+30 000 FCFA' },
    { label: 'Prise en charge aéroport (aller)',         amount: '+5 000 FCFA' },
    { label: 'Assurance tous risques — incluse',         amount: '0 FCFA' },
  ],
  total: '73 500 FCFA', totalNote: 'Tout inclus pour 3 jours — soit 24 500 FCFA/jour',
  caution: '160 000 FCFA', cautionNote: 'Caution pré-autorisée, libérée à la restitution',
};

/* ── FAQ tarifs ──────────────────────────────────────── */
export const FAQS_TARIFS = [
  {
    q: 'Le carburant est-il inclus dans le prix de location ?',
    a: 'Le carburant urbain est inclus dans les formules 3H et 8H. Pour les locations de 24 h et plus, le véhicule est remis avec le plein et doit être restitué de la même façon.',
  },
  {
    q: 'Comment se passe le dépôt et le déblocage de la caution ?',
    a: 'La caution est simplement pré-autorisée sur votre portefeuille AutoLink Pro — jamais débitée. Elle est libérée automatiquement dès que l\'état de sortie est validé conforme.',
  },
  {
    q: 'Y a-t-il des frais cachés ou des frais de dossier ?',
    a: 'Non. Le prix affiché inclut l\'assurance, l\'assistance 24/7 et les frais de service. Seuls les suppléments que vous choisissez (chauffeur, livraison…) s\'ajoutent — toujours affichés avant paiement.',
  },
  {
    q: 'Proposez-vous des tarifs dégressifs pour les longues durées ?',
    a: 'Oui : −10 % dès 7 jours, −20 % dès 15 jours et tarifs sur devis au-delà d\'un mois. Les entreprises bénéficient de conditions flotte dédiées.',
  },
  {
    q: 'Que se passe-t-il si je dépasse le kilométrage inclus ?',
    a: 'Chaque gamme inclut un forfait kilométrique journalier. Le dépassement est facturé 150 FCFA/km, visible en temps réel dans votre espace client — aucune surprise à la restitution.',
  },
];
