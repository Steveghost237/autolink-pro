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

export default i18n;
