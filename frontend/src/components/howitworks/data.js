import {
  SearchCheck, CreditCard, KeyRound, Route, ShieldCheck,
  Wallet, Zap, Timer, FileCheck, Car, FileSignature,
  Headphones, RefreshCw, XCircle, CheckCircle2,
} from 'lucide-react';

/* ── 5 étapes de la location ─────────────────────────── */
export const STEPS_5 = [
  {
    num: '01', icon: SearchCheck,
    title: 'Choisissez et réservez en ligne',
    desc: 'Parcourez le catalogue, comparez les véhicules vérifiés et sélectionnez vos dates, votre lieu de départ et la formule adaptée — tout se fait en ligne en quelques minutes.',
    mock: { tag: 'Catalogue AutoLink', lines: ['Toyota Corolla — 25 000 FCFA/j', 'Mercedes Classe C — 45 000 FCFA/j'], btn: 'Réserver' },
  },
  {
    num: '02', icon: CreditCard,
    title: 'Payez en toute sécurité',
    desc: 'Réglez par MTN Mobile Money, Orange Money ou carte bancaire. Vos fonds sont conservés sur un compte séquestre AutoLink Pro jusqu’à la prise en charge du véhicule.',
    mock: { tag: 'Paiement sécurisé', lines: ['Location 5 jours — Classe C', 'Total : 125 000 FCFA'], btn: 'Confirmer le paiement' },
  },
  {
    num: '03', icon: KeyRound,
    title: 'Récupérez les clés ou faites-vous livrer',
    desc: 'Retirez le véhicule à l’agence ou recevez-le à l’adresse de votre choix. L’état des lieux est fait en photos horodatées, directement depuis l’application.',
    mock: { tag: 'Remise des clés', lines: ['État des lieux — 12 photos validées', 'Chauffeur assigné : Patrick M.'], btn: 'Démarrer la location' },
  },
  {
    num: '04', icon: Route,
    title: 'Roulez en toute liberté',
    desc: 'Assurance tous risques incluse, assistance 24/7 et kilométrage adapté à votre formule. Vous roulez l’esprit tranquille, nous gérons le reste.',
    mock: { tag: 'Pendant la location', lines: ['Assurance tous risques active', 'Assistance 24/7 — +237 656 789 000'], btn: 'Contacter l’assistance' },
  },
  {
    num: '05', icon: ShieldCheck,
    title: 'Restitution & caution débloquée',
    desc: 'À la fin de la location, l’état de sortie est comparé à l’état d’entrée. Si tout est conforme, votre caution est débloquée immédiatement — sans discussion.',
    mock: { tag: 'Fin de location', lines: ['État conforme — aucune retenue', 'Caution reversée : +150 000 FCFA'], btn: 'Voir le détail' },
  },
];

/* ── Portefeuille AutoLink Pro ───────────────────────── */
export const WALLET_FEATURES = [
  { icon: Wallet,       title: 'Dépôt instantané',             desc: 'Alimentez votre portefeuille par Mobile Money en quelques secondes.' },
  { icon: Zap,          title: 'Paiement en 1 clic',           desc: 'Réglez vos locations sans ressaisir vos informations à chaque fois.' },
  { icon: ShieldCheck,  title: 'Caution automatique',          desc: 'La caution est bloquée puis libérée automatiquement, sans intervention.' },
  { icon: Timer,        title: 'Remboursement ultra rapide',   desc: 'Annulation ou fin de location : vos fonds repartent sous 24 h.' },
];

/* ── Caution sécurisée : avant / après ───────────────── */
export const CAUTION_RISKS = [
  'Caution en espèces jamais restituée intégralement',
  'Retenues abusives justifiées après coup',
  'Aucune preuve de l’état du véhicule au départ',
  'Litiges interminables sans médiateur',
];
export const CAUTION_GAINS = [
  'État des lieux photo horodaté à l’entrée et à la sortie',
  'Caution sur compte séquestre — jamais chez le propriétaire',
  'Déblocage automatique si l’état de sortie est conforme',
  'Médiation AutoLink Pro et dédommagement en cas de litige',
];
export const CAUTION_ICONS = { risk: XCircle, gain: CheckCircle2 };

/* ── Documents requis ────────────────────────────────── */
export const DOCUMENTS = [
  { icon: FileCheck,     title: 'Pièce d’identité valide',          desc: 'CNI ou passeport en cours de validité. Une photo recto-verso suffit depuis l’application.' },
  { icon: Car,           title: 'Permis de conduire',               desc: 'Requis uniquement pour l’autoconduite, avec ancienneté minimale selon la gamme du véhicule.' },
  { icon: FileSignature, title: 'Engagement contractuel',           desc: 'Signature électronique du contrat de location et du justificatif de domicile — 100 % en ligne.' },
];

/* ── Réponses structurées ────────────────────────────── */
export const ANSWERS = [
  { icon: Headphones,  title: 'Un interlocuteur dédié',      desc: 'Un conseiller AutoLink Pro suit votre dossier du premier clic à la restitution du véhicule.' },
  { icon: ShieldCheck, title: 'Données vérifiées & sécurisées', desc: 'Identités, permis et véhicules sont contrôlés. Vos documents restent chiffrés et confidentiels.' },
  { icon: RefreshCw,   title: 'Modifications sans stress',   desc: 'Dates, lieu ou véhicule : ajustez votre réservation gratuitement jusqu’à 15 min avant le départ.' },
];
