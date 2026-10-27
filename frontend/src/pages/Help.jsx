import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout, { useSiteConfig } from '../components/PublicLayout';
import Icon from '../components/Icon';
import FaqList from '../components/FaqList';
import ContactForm from '../components/ContactForm';
import { useAuth } from '../contexts/AuthContext';
import { CLIENT_FAQ, OWNER_FAQ } from '../utils/faq';
import { formatTimeRange, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Help', text, options);

const THEMES = [
  { id: 'booking', icon: 'calendar_month', label: 'Réservation & trajets', items: [
    { q: 'Quel est le délai minimum pour réserver un véhicule ?', a: "Vous pouvez réserver pour le jour même si le véhicule est disponible ; la confirmation est immédiate après paiement." },
    { q: 'Est-il possible de voyager entre Douala et Yaoundé ?', a: 'Oui, choisissez la formule « Interurbain » et indiquez votre destination lors de la réservation.' },
    { q: 'Comment fonctionne l’option avec chauffeur certifié ?', a: 'Sélectionnez « Chauffeur AutoLink » : un chauffeur disponible est assigné automatiquement et vous recevez ses coordonnées.' },
    CLIENT_FAQ[5],
  ] },
  { id: 'payment', icon: 'account_balance_wallet', label: 'Paiements & caution', items: [CLIENT_FAQ[0], CLIENT_FAQ[1], {
    q: 'Y a-t-il des frais de transaction lors du dépôt ou du retrait ?', a: 'Aucun frais AutoLink sur les rechargements du portefeuille ni sur les retraits propriétaires vers Mobile Money.',
  }] },
  { id: 'documents', icon: 'badge', label: 'Documents & conditions', items: [CLIENT_FAQ[3], {
    q: 'Les permis de conduire étrangers sont-ils acceptés ?', a: 'Oui, un permis international ou étranger valide peut être déposé dans « Documents & Profil » ; notre équipe le vérifie.',
  }] },
  { id: 'incident', icon: 'car_crash', label: 'Incidents & litiges', items: [CLIENT_FAQ[4], {
    q: 'Que faire en cas de panne sur l’axe Douala - Yaoundé ?', a: 'Contactez immédiatement le support par téléphone ou via la messagerie, puis signalez le problème depuis votre réservation pour geler la caution.',
  }] },
  { id: 'owner', icon: 'key', label: 'Propriétaires', items: OWNER_FAQ },
];

export default function Help() {
  const { isAuthenticated } = useAuth();
  const config = useSiteConfig();
  const [theme, setTheme] = useState('booking');
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THEMES.find((item) => item.id === theme).items;
    return THEMES.flatMap((item) => item.items).filter((item) => `${t(item.q)} ${t(item.a)}`.toLowerCase().includes(q));
  }, [theme, query]);

  const hours = config?.hours || {};
  const show = (schedule) => (schedule === null ? t('Sur réservation') : schedule ? formatTimeRange(schedule) : '—');

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-secondary-fixed/60 to-surface dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col gap-4">
          <span className="overline text-primary">{t("Centre d'aide AutoLink Pro")}</span>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface dark:text-white">{t('Comment pouvons-nous vous aider ?')}</h1>
          <label className="flex items-center gap-3 px-5 rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-elevation-2">
            <Icon name="search" className="text-outline" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Caution, annulation, chauffeur, Mobile Money…')} className="w-full bg-transparent py-4 font-body-lg text-body-lg focus:outline-none dark:text-white" />
          </label>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <aside className="card p-3 flex lg:flex-col gap-1 overflow-x-auto">
          {THEMES.map((item) => (
            <button key={item.id} onClick={() => { setTheme(item.id); setQuery(''); }}
              className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl font-label-lg text-label-lg text-left ${theme === item.id && !query ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-low dark:text-slate-300'}`}>
              <Icon name={item.icon} />{t(item.label)}
            </button>
          ))}
        </aside>
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{query ? t('Résultats pour « {{q}} »', { q: query }) : t('Questions fréquentes par thématique')}</h2>
          {items.length ? <FaqList key={theme + query} items={items} numbered={false} /> : <p className="card text-center text-on-surface-variant">{t('Aucune réponse trouvée. Écrivez-nous ci-dessous.')}</p>}
        </div>
      </section>

      <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('Besoin d’une assistance immédiate ? Notre équipe locale est à votre écoute')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="card flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center"><Icon name="forum" /></span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Échangez avec un conseiller AutoLink')}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('Messagerie intégrée à votre espace, avec historique de vos échanges.')}</p>
              <Link to={isAuthenticated ? '/messages?support=1' : '/login?next=%2Fmessages%3Fsupport%3D1'} className="btn-primary mt-auto">{t('Ouvrir la messagerie')}</Link>
            </div>
            <div className="card flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-error-container text-error flex items-center justify-center"><Icon name="support_agent" /></span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Assistance téléphonique')}</h3>
              {(config?.phones || []).map((phone) => <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="font-headline-sm text-headline-sm text-primary">{phone}</a>)}
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                <div>{t('Lundi au vendredi')} : {show(hours.weekdays)}</div><div>{t('Samedi')} : {show(hours.saturday)}</div><div>{t('Dimanche')} : {show(hours.sunday)}</div>
              </div>
            </div>
            <div className="card flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center"><Icon name="storefront" /></span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Agences & points d’inspection')}</h3>
              {(config?.addresses || []).map((address) => <p key={address} className="flex gap-2 font-body-md text-body-md text-on-surface-variant"><Icon name="location_on" size={18} className="text-primary" />{address}</p>)}
              {config?.contact_email && <a href={`mailto:${config.contact_email}`} className="flex gap-2 font-body-md text-body-md text-primary"><Icon name="mail" size={18} />{config.contact_email}</a>}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-16">
        <h2 className="section-title text-center">{t('Envoyez-nous un message')}</h2>
        <p className="section-subtitle text-center mb-8">{t('Réponse de notre équipe sous 24 h ouvrées.')}</p>
        <div className="card"><ContactForm /></div>
      </section>
    </PublicLayout>
  );
}
