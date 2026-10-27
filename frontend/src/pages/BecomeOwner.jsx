import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout, { useSiteConfig } from '../components/PublicLayout';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import FaqList from '../components/FaqList';
import { useAuth } from '../contexts/AuthContext';
import { OWNER_FAQ } from '../utils/faq';
import { formatNumber, uiText } from '../i18n';

const t = (text, options) => uiText('pages.BecomeOwner', text, options);

const BENEFITS = [
  { icon: 'payments', title: 'Revenus réguliers', text: 'Votre part est versée sur votre solde à la fin de chaque location, retirable vers MTN MoMo ou Orange Money.' },
  { icon: 'shield', title: 'Caution & arbitrage', text: 'Chaque locataire verse une caution bloquée sous séquestre ; AutoLink arbitre en cas de litige.' },
  { icon: 'fact_check', title: 'Locataires vérifiés', text: "Pièces d'identité et permis contrôlés par l'équipe AutoLink avant la prise en charge." },
  { icon: 'support_agent', title: 'Gestion clé en main', text: 'Demandes, calendrier, messagerie, revenus et retraits réunis sur votre espace propriétaire.' },
];

const STEPS = [
  { title: 'Inscription en ligne', text: 'Créez votre compte propriétaire et déposez vos pièces justificatives.' },
  { title: 'Soumission du véhicule', text: 'Photos, documents, disponibilités et prix dans la marge de votre gamme.' },
  { title: 'Inspection AutoLink', text: 'Un contrôleur valide l’état du véhicule avant sa mise en ligne.' },
  { title: 'Acceptez & encaissez', text: 'Acceptez les demandes, puis retirez vos revenus vers Mobile Money.' },
];

const ELIGIBILITY = [
  'Véhicule de 2000 ou plus récent, en bon état mécanique',
  'Carte grise et assurance en cours de validité',
  'Contrôle technique à jour',
  'Photos extérieures et intérieures récentes',
];

export default function BecomeOwner() {
  const { user, isAuthenticated } = useAuth();
  const config = useSiteConfig();
  const tiers = config?.tiers || [];
  const commission = Number(config?.commission_rate ?? 0.5);
  const [tierId, setTierId] = useState('standard');
  const [days, setDays] = useState(15);
  const tier = tiers.find((item) => item.tier === tierId) || tiers[0];
  const gross = tier ? tier.base_rate * days : 0;
  const net = Math.round(gross * (1 - commission));

  const cta = isAuthenticated
    ? (user?.role === 'OWNER' ? '/owner/add-vehicle' : '/help#contact')
    : '/register?role=OWNER';

  return (
    <PublicLayout>
      <PageHero badge={t('Programme partenaire propriétaire')} title={t('Votre voiture dort au garage ? Faites-la travailler en toute sécurité.')}
        text={t('Confiez votre véhicule à AutoLink Pro : nous trouvons des locataires vérifiés, sécurisons la caution et vous versons vos revenus.')}
        image="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1920&q=80">
        <div className="flex flex-wrap gap-3">
          <Link to={cta} className="btn-primary">{t('Proposer mon véhicule')}<Icon name="arrow_forward" size={18} /></Link>
          <a href="#simulateur" className="btn-outline-white">{t('Estimer mes revenus')}</a>
        </div>
      </PageHero>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center">{t('Pourquoi confier votre véhicule à AutoLink Pro ?')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          {BENEFITS.map((item) => (
            <div key={item.title} className="card flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name={item.icon} /></span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(item.title)}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-400">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="simulateur" className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('Estimez le revenu mensuel net de votre véhicule')}</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card flex flex-col gap-5">
              <label><span className="label">{t('Gamme de votre véhicule')}</span>
                <select value={tier?.tier || ''} onChange={(e) => setTierId(e.target.value)} className="input-field">
                  {tiers.map((item) => <option key={item.tier} value={item.tier}>{t(item.label)} — {formatNumber(item.base_rate)} FCFA/j</option>)}
                </select>
              </label>
              <label>
                <span className="label">{t('Jours loués par mois : {{n}}', { n: days })}</span>
                <input type="range" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-primary" />
                <span className="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span>1</span><span>30</span></span>
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Calcul basé sur le prix indicatif de la gamme ; vous pouvez l’ajuster de ±20 %.')}</p>
            </div>
            <div className="card-dark flex flex-col justify-center gap-3">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant">{t('Revenu net estimé / mois')}</span>
              <div className="font-display-lg text-display-lg text-primary-fixed-dim">{formatNumber(net)} <span className="font-headline-sm text-headline-sm text-surface-variant">FCFA</span></div>
              <dl className="flex flex-col gap-1 font-body-md text-body-md text-surface-variant">
                <div className="flex justify-between"><dt>{t('Chiffre d’affaires brut')}</dt><dd>{formatNumber(gross)} FCFA</dd></div>
                <div className="flex justify-between"><dt>{t('Commission AutoLink ({{p}} %)', { p: Math.round(commission * 100) })}</dt><dd>−{formatNumber(gross - net)} FCFA</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center">{t('Devenez propriétaire partenaire en 4 étapes')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
          {STEPS.map((step, index) => (
            <div key={step.title} className="card flex flex-col gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">{index + 1}</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(step.title)}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{t(step.text)}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="checklist" className="text-primary" />{t('Votre véhicule est-il éligible ?')}</h3>
            <ul className="mt-3 flex flex-col gap-2">{ELIGIBILITY.map((item) => <li key={item} className="flex gap-2 font-body-md text-body-md text-on-surface-variant"><Icon name="check_circle" size={20} className="text-primary" />{t(item)}</li>)}</ul>
          </div>
          <div className="card">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="percent" className="text-primary" />{t('Commission claire et équitable')}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">{t('AutoLink prélève {{p}} % du montant de chaque location. Ce pourcentage couvre la recherche de clients, la vérification des locataires, la gestion de la caution, le paiement sécurisé et le support. Votre gain net est affiché sur chaque demande avant que vous l’acceptiez.', { p: Math.round(commission * 100) })}</p>
          </div>
        </div>
      </section>

      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-16">
        <h2 className="section-title text-center">{t('Tout ce que vous devez savoir avant de confier votre voiture')}</h2>
        <div className="mt-8"><FaqList items={OWNER_FAQ} /></div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl bg-primary p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-primary">{t('Commencez à monétiser votre voiture dès cette semaine.')}</h2>
          <Link to={cta} className="btn-outline-white shrink-0">{t('Proposer votre véhicule')}</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
