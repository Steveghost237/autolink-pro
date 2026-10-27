import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { uiText } from '../i18n';
import { useAuth } from '../contexts/AuthContext';

export default function LanguageSwitcher({ className = '' }) {
  useTranslation();
  const { user, updateUser } = useAuth();
  const language = i18n.language === 'en' ? 'en' : 'fr';

  const selectLanguage = async (nextLanguage) => {
    if (nextLanguage === language) return;
    await i18n.changeLanguage(nextLanguage);
    try {
      if (user && user.language !== nextLanguage) {
        await updateUser({ language: nextLanguage });
      }
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 p-1 dark:border-slate-700 ${className}`} aria-label={uiText('common', 'Langue')}>
      {['fr', 'en'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => selectLanguage(code)}
          aria-pressed={language === code}
          className={`rounded-md px-2 py-1 text-xs font-bold transition-colors ${
            language === code
              ? 'bg-primary-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
