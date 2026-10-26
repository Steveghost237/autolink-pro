import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import en from './en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    load: 'languageOnly',
    keySeparator: false,
    nsSeparator: false,
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (language) => {
  const normalized = language === 'en' ? 'en' : 'fr';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', normalized);
  }
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language === 'en' ? 'en' : 'fr';
}

export function uiText(scope, source, options = {}) {
  const raw = String(source ?? '');
  const phrase = raw.trim().replace(/\s+/g, ' ');
  const key = `ui.${scope}|${phrase}`;
  const commonKey = `ui.common|${phrase}`;
  const selected = i18n.exists(key) ? key : commonKey;
  return i18n.t(selected, { ...options, defaultValue: raw });
}

const VEHICLE_LABELS = {
  category: {
    berline: 'Berline',
    sedan: 'Berline',
    suv: 'SUV',
    van: 'Van',
    minibus: 'Minibus',
    pickup: 'Pick-up',
    'pick-up': 'Pick-up',
    citadine: 'Citadine',
    economique: 'Économique',
    basic: 'Économique',
    intermediaire: 'Intermédiaire',
    standard: 'Intermédiaire',
    premium: 'Premium',
    luxe: 'Luxe',
    gold: 'Luxe',
    'super luxe': 'Super Luxe',
    collection: 'Super Luxe',
  },
  fuel: {
    essence: 'Essence',
    petrol: 'Essence',
    gasoline: 'Essence',
    diesel: 'Diesel',
    super: 'Super',
    gasoil: 'Gasoil',
    hybrid: 'Hybride',
    hybride: 'Hybride',
    electric: 'Électrique',
    electrique: 'Électrique',
  },
  tier: {
    basic: 'Économique',
    economique: 'Économique',
    standard: 'Intermédiaire',
    intermediaire: 'Intermédiaire',
    premium: 'Premium',
    gold: 'Luxe',
    luxe: 'Luxe',
    collection: 'Super Luxe',
    'super luxe': 'Super Luxe',
  },
  status: {
    pending: 'En attente de validation',
    approved: 'Approuvé',
    rented: 'En location',
    maintenance: 'En maintenance',
    suspended: 'Suspendu',
  },
};

export function vehicleLabel(value, type) {
  const raw = String(value ?? '');
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const source = VEHICLE_LABELS[type]?.[normalized];
  return source ? uiText(`vehicle.${type}`, source) : raw;
}

export function formatNumber(value, options = {}) {
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  return new Intl.NumberFormat(locale, options).format(Number(value) || 0);
}

export function formatAmount(value) {
  return `${formatNumber(value)} FCFA`;
}

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value, options = { hour: '2-digit', minute: '2-digit' }) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatTimeRange(schedule) {
  if (!schedule?.open || !schedule?.close) return '—';
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR';
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const format = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return formatter.format(new Date(2000, 0, 1, hour, minute));
  };
  return `${format(schedule.open)}–${format(schedule.close)}`;
}

export default i18n;
