import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout, { useSiteConfig } from '../components/PublicLayout';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import FaqList from '../components/FaqList';
import { TIER_BADGES } from '../utils/vehicles';
import { formatNumber, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Pricing', text, options);

const TIER_INFO = {
  basic: { title: 'Citadines agiles', examples: 'Toyota Yaris, Suzuki Swift, Kia Picanto', icon: 'directions_car' },
  standard: { title: 'Berlines spacieuses', examples: 'Toyota Corolla, Hyundai Elantra, Kia Sportage', icon: 'airport_shuttle' },
  premium: { title: 'SUV & 4x4 confort', examples: 'Toyota RAV4, Prado, Hyundai Tucson', icon: 'local_shipping' },
  gold: { title: 'Prestige & cortège', examples: 'Mercedes Classe E, Range Rover, Land Cruiser', icon: 'diamond' },
  collection: { title: "Modèles d'exception", examples: 'Porsche, Bentley, Maserati', icon: 'workspace_premium' },
};

const OPTIONS = [
  { icon: 'badge', title: 'Chauffeur certifié', text: 'Chauffeur AutoLink assigné automatiquement ou chauffeur du propriétaire quand il est proposé.' },
  { icon: 'flight_land', title: "Prise en charge à l'aéroport", text: "Indiquez l'aéroport comme lieu de prise en charge lors de la réservation." },
  { icon: 'home_pin', title: 'Livraison à domicile / hôtel', text: 'Adresse de prise en charge et de restitution libres, à confirmer avec le propriétaire.' },
  { icon: 'route', title: 'Kilométrage supplémentaire', text: 'Chaque gamme inclut un forfait kilométrique journalier ; le surplus est facturé au km.' },
  { icon: 'savings', title: 'Dégressivité longue durée', text: '−5 % à partir de 4 jours et −10 % à partir de 30 jours, appliqués automatiquement.' },
  { icon: 'verified_user', title: 'Caution sous séquestre', text: 'Montant fixé par gamme, bloqué pendant la location et restitué automatiquement.' },
];

const PRICE_FAQ = [
  { q: 'Le prix affiché est-il le prix final ?', a: 'Oui pour la location : le prix journalier multiplié par la durée, moins la remise longue durée. La caution s’ajoute mais vous est restituée.' },
  { q: 'Pourquoi les prix varient-ils dans une même gamme ?', a: 'Le prix indicatif de la gamme peut être ajusté par le propriétaire dans une marge de ±20 % selon l’année, le kilométrage et l’état du véhicule.' },
  { q: 'Y a-t-il des frais de rechargement du portefeuille ?', a: 'Non, AutoLink ne prélève aucun frais sur les rechargements par MTN MoMo, Orange Money ou carte.' },
  { q: 'Que comprend le forfait kilométrique ?', a: 'Chaque gamme inclut un nombre de km par jour. Au-delà, le km supplémentaire est facturé au tarif indiqué dans la grille.' },
];

const discountFor = (days) => (days >= 30 ? 10 : days > 3 ? 5 : 0);

export default function Pricing() {
  const config = useSiteConfig();
  const tiers = useMemo(() => config?.tiers || [], [config]);
  const [exampleTier, setExampleTier] = useState('premium');
  const [days, setDays] = useState(4);

  const example = useMemo(() => {
    const tier = tiers.find((item) => item.tier === exampleTier) || tiers[0];
    if (!tier) return null;
    const gross = tier.base_rate * days;
    const discount = discountFor(days);
    const subtotal = Math.round(gross * (100 - discount) / 100);
    return { tier, gross, discount, subtotal, total: subtotal + tier.deposit };
  }, [tiers, exampleTier, days]);

  return (
    <PublicLayout>
      <PageHero badge={t('Tarifs & gammes')} title={t('Des tarifs clairs, adaptés à vos déplacements au Cameroun')}
        text={t('Prix journalier par gamme, caution restituée et kilométrage inclus : tout est affiché avant la réservation.')}
        image="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=80" />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center">{t('Comparez nos gammes de mobilité')}</h2>
        {!tiers.length && <p className="text-center text-on-surface-variant">{t('Chargement de la grille tarifaire…')}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
          {tiers.map((tier) => {
            const info = TIER_INFO[tier.tier] || {};
            return (
              <article key={tier.tier} className={`card flex flex-col gap-3 ${tier.tier === 'premium' ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[tier.tier]}`}>{t(tier.label)}</span>
                  {tier.tier === 'premium' && <span className="badge-primary">{t('Le plus demandé')}</span>}
                </div>
                <Icon name={info.icon || 'directions_car'} size={32} className="text-primary" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(info.title || tier.label)}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{info.examples}</p>
                <div className="py-3 border-y border-outline-variant/30">
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{t('De')}</div>
                  <div className="font-headline-lg text-headline-lg text-primary">{formatNumber(tier.min_rate)} – {formatNumber(tier.max_rate)}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{t('FCFA / jour')}</div>
                </div>
                <ul className="flex flex-col gap-1.5 font-body-sm text-body-sm text-on-surface dark:text-slate-300">
                  <li className="flex gap-2"><Icon name="lock" size={16} className="text-primary" />{t('Caution : {{n}} FCFA', { n: formatNumber(tier.deposit) })}</li>
                  <li className="flex gap-2"><Icon name="route" size={16} className="text-primary" />{t('{{n}} km inclus / jour', { n: tier.km_included })}</li>
                  <li className="flex gap-2"><Icon name="add_road" size={16} className="text-primary" />{t('{{n}} FCFA / km supplémentaire', { n: formatNumber(tier.extra_km_rate) })}</li>
                </ul>
                <Link to={`/catalog?tier=${tier.tier}`} className="btn-secondary py-2 mt-auto">{t('Voir les {{n}} véhicule(s)', { n: tier.vehicles })}</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('Options et conditions transparentes')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
            {OPTIONS.map((option) => (
              <div key={option.title} className="card flex gap-4">
                <span className="w-11 h-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center shrink-0"><Icon name={option.icon} /></span>
                <div><h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(option.title)}</h3><p className="font-body-md text-body-md text-on-surface-variant mt-1">{t(option.text)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {example && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="section-title text-center">{t('Exemple de facturation transparente')}</h2>
          <div className="card mt-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label><span className="label">{t('Gamme')}</span>
                <select value={example.tier.tier} onChange={(e) => setExampleTier(e.target.value)} className="input-field">{tiers.map((tier) => <option key={tier.tier} value={tier.tier}>{t(tier.label)}</option>)}</select>
              </label>
              <label><span className="label">{t('Durée (jours)')}</span><input type="number" min={1} max={60} value={days} onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value))))} className="input-field" /></label>
            </div>
            <dl className="flex flex-col gap-3 font-body-lg text-body-lg">
              <div className="flex justify-between"><dt>{t('Prix indicatif ({{rate}} FCFA × {{days}} j)', { rate: formatNumber(example.tier.base_rate), days })}</dt><dd className="font-label-lg text-label-lg">{formatNumber(example.gross)} FCFA</dd></div>
              <div className="flex justify-between text-primary"><dt>{t('Remise longue durée ({{p}} %)', { p: example.discount })}</dt><dd>−{formatNumber(example.gross - example.subtotal)} FCFA</dd></div>
              <div className="flex justify-between pt-3 border-t border-outline-variant/40"><dt className="font-label-lg text-label-lg">{t('Montant de la location')}</dt><dd className="font-headline-sm text-headline-sm">{formatNumber(example.subtotal)} FCFA</dd></div>
              <div className="flex justify-between p-3 rounded-xl bg-secondary-fixed/50 text-on-secondary-fixed-variant"><dt className="flex items-center gap-2"><Icon name="lock" size={18} />{t('Caution sous séquestre (restituée)')}</dt><dd className="font-label-lg text-label-lg">{formatNumber(example.tier.deposit)} FCFA</dd></div>
              <div className="flex justify-between"><dt className="font-headline-sm text-headline-sm">{t('Total débité à la réservation')}</dt><dd className="font-headline-lg text-headline-lg text-primary">{formatNumber(example.total)} FCFA</dd></div>
            </dl>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Le prix réel dépend du véhicule choisi (marge propriétaire ±20 %) ; il est toujours affiché avant paiement.')}</p>
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-8">
        <h2 className="section-title text-center">{t('Questions fréquentes sur nos tarifs')}</h2>
        <FaqList items={PRICE_FAQ} numbered={false} />
        <div className="rounded-xl bg-inverse-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h3 className="font-headline-md text-headline-md text-surface-container-lowest">{t("Besoin d'un devis pour une flotte ou une longue durée ?")}</h3><p className="font-body-md text-body-md text-surface-variant">{t('Entreprises, ONG, événements : notre équipe prépare une offre sur mesure.')}</p></div>
          <Link to="/help#contact" className="btn-primary shrink-0">{t('Demander un devis')}</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
