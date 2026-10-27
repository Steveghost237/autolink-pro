import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { siteAPI } from '../services/api';
import { uiText } from '../i18n';
import Icon from './Icon';
import LanguageSwitcher from './LanguageSwitcher';

const t = (text, options) => uiText('components.PublicLayout', text, options);

export const PUBLIC_LINKS = [
  { to: '/catalog', label: 'Catalogue' },
  { to: '/how-it-works', label: 'Comment ça marche' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/become-owner', label: 'Devenir propriétaire' },
  { to: '/help', label: 'Aide' },
];

let siteConfigPromise = null;
/** Configuration publique partagée (contact, stats, gammes) — un seul appel par session. */
export function useSiteConfig() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    siteConfigPromise = siteConfigPromise || siteAPI.config().then(({ data }) => data).catch(() => { siteConfigPromise = null; return null; });
    let mounted = true;
    siteConfigPromise.then((data) => mounted && setConfig(data));
    return () => { mounted = false; };
  }, []);
  return config;
}

export function PublicHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) => `px-3 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${isActive
    ? 'bg-primary text-on-primary'
    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low dark:text-slate-300 dark:hover:bg-slate-800'}`;

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-headline-lg text-headline-lg tracking-tight"><span className="text-on-surface dark:text-white">AutoLink</span><span className="text-primary">Pro</span></Link>
          <span className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low dark:bg-slate-800 font-label-md text-label-md text-on-surface dark:text-slate-200">
            <Icon name="location_on" size={18} className="text-primary" />{t('Douala / Yaoundé')}
          </span>
        </div>
        <nav className="hidden xl:flex items-center gap-1">
          {PUBLIC_LINKS.map((link) => <NavLink key={link.to} to={link.to} className={linkClass}>{t(link.label)}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:text-slate-300" title={isDark ? t('Mode clair') : t('Mode sombre')}>
            <Icon name={isDark ? 'light_mode' : 'dark_mode'} />
          </button>
          {isAuthenticated ? (
            <button onClick={() => navigate(getDashboardPath(user?.role))} className="btn-primary py-2 px-4"><Icon name="dashboard" size={18} /><span className="hidden sm:inline">{t('Mon espace')}</span></button>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex px-3 py-2 rounded-lg font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low dark:text-white">{t('Se connecter')}</Link>
              <Link to="/register" className="btn-primary py-2 px-4">{t("S'inscrire")}</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="xl:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container-high dark:text-white" aria-label={t('Menu')}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="xl:hidden border-t border-outline-variant/30 dark:border-slate-800 px-4 py-3 flex flex-col gap-1 bg-surface-container-lowest dark:bg-slate-900">
          {PUBLIC_LINKS.map((link) => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className={linkClass}>{t(link.label)}</NavLink>)}
          {!isAuthenticated && <NavLink to="/login" className={linkClass}>{t('Se connecter')}</NavLink>}
          <LanguageSwitcher className="sm:hidden mt-2 w-fit" />
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  const config = useSiteConfig();
  const columns = [
    { title: 'Louer', links: [['/catalog', 'Catalogue complet'], ['/pricing', 'Gammes & catégories'], ['/how-it-works', 'Comment ça marche'], ['/register', 'Créer un compte']] },
    { title: 'Propriétaires', links: [['/become-owner', 'Devenir partenaire'], ['/become-owner#simulateur', 'Simulateur de revenus'], ['/become-owner#faq', 'FAQ propriétaire']] },
    { title: 'Aide', links: [['/help', "Centre d'aide & FAQ"], ['/help#contact', 'Nous contacter'], ['/driver/application', 'Devenir chauffeur']] },
    { title: 'Légal', links: [['/terms', "Conditions générales d'utilisation"], ['/privacy', 'Confidentialité'], ['/cookies', 'Cookies']] },
  ];
  return (
    <footer className="bg-inverse-surface text-surface-variant">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
          <span className="font-headline-lg text-headline-lg text-surface-container-lowest">AutoLink<span className="text-primary-fixed-dim">Pro</span></span>
          <p className="font-body-sm text-body-sm">{t('La mobilité de confiance au Cameroun. Flotte vérifiée et chauffeurs professionnels à Douala et Yaoundé.')}</p>
          {config?.phones?.[0] && <a href={`tel:${config.phones[0].replace(/\s/g, '')}`} className="flex items-center gap-2 font-body-sm text-body-sm hover:text-white"><Icon name="call" size={16} />{config.phones[0]}</a>}
          {config?.contact_email && <a href={`mailto:${config.contact_email}`} className="flex items-center gap-2 font-body-sm text-body-sm hover:text-white"><Icon name="mail" size={16} />{config.contact_email}</a>}
          <span className="w-fit flex items-center gap-1 px-2 py-1 rounded bg-primary/30 text-primary-fixed font-label-sm text-label-sm"><Icon name="verified_user" size={14} />{t('Tiers de confiance certifié')}</span>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h4 className="font-headline-sm text-headline-sm text-surface-container-lowest mb-3">{t(column.title)}</h4>
            <ul className="flex flex-col gap-2">
              {column.links.map(([to, label]) => <li key={to}><Link to={to} className="font-body-sm text-body-sm hover:text-white">{t(label)}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-surface-variant/15 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm">
          <span className="uppercase tracking-wider">{t('Paiements sécurisés :')}</span>
          <span className="px-2 py-1 rounded bg-yellow-400 text-yellow-950 font-bold">MTN MoMo</span>
          <span className="px-2 py-1 rounded bg-orange-500 text-white font-bold">Orange Money</span>
          <span className="px-2 py-1 rounded bg-white text-on-surface font-bold">{t('Carte Visa / Mastercard')}</span>
        </div>
        <span className="flex items-center gap-1 font-body-sm text-body-sm"><Icon name="lock" size={16} />{t('Transactions chiffrées en FCFA')}</span>
      </div>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-6 font-body-sm text-body-sm">
        {t('© {{year}} AutoLink Pro. Fait pour Douala & Yaoundé, Cameroun. Tous droits réservés.', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { setVisible(!localStorage.getItem('autolink_cookie_consent')); } catch (_) { setVisible(false); }
  }, []);
  const save = (choice) => {
    try { localStorage.setItem('autolink_cookie_consent', choice); } catch (_) {}
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-elevation-3 border border-outline-variant/30">
      <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-300">
        {t('Ce site utilise le stockage local nécessaire à votre session et à la mémorisation de vos choix.')}{' '}
        <Link to="/cookies" className="font-label-lg text-label-lg text-primary underline">{t('En savoir plus')}</Link>
      </p>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => save('rejected')} className="btn-secondary py-2 px-4">{t('Refuser')}</button>
        <button onClick={() => save('accepted')} className="btn-primary py-2 px-4">{t('Accepter')}</button>
      </div>
    </aside>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-slate-950 text-on-surface dark:text-slate-100">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <CookieConsent />
    </div>
  );
}
