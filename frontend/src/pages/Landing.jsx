import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  siBentley, siBmw, siChevrolet, siCitroen, siDacia, siFerrari, siFiat,
  siFord, siHonda, siHyundai, siJeep, siKia, siLamborghini, siMaserati,
  siMazda, siMini, siMitsubishi, siNissan, siOpel, siPeugeot, siPorsche,
  siRenault, siRollsroyce, siSkoda, siSubaru, siSuzuki, siTesla, siToyota,
  siVolkswagen, siVolvo,
} from 'simple-icons';
import PublicLayout, { useSiteConfig } from '../components/PublicLayout';
import PromoPopup from '../components/PromoPopup';
import Icon from '../components/Icon';
import VehicleCard from '../components/VehicleCard';
import ContactForm from '../components/ContactForm';
import FaqList from '../components/FaqList';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';
import { RENTAL_TYPES } from '../utils/carImages';
import { CLIENT_FAQ } from '../utils/faq';
import { reservePath, TIER_BADGES } from '../utils/vehicles';
import useFavorites from '../utils/useFavorites';
import { formatNumber, formatTimeRange, uiText, vehicleLabel } from '../i18n';
import './Landing.css';

const t = (text, options) => uiText('pages.Landing', text, options);

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=85',
];
const OWNER_IMAGE = 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80';

const TIER_COPY = {
  basic: { title: 'Citadines agiles', text: 'Idéal pour vos courses quotidiennes et parkings étroits en ville.', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80' },
  standard: { title: 'Berlines équilibrées', text: 'Confort optimal, climatisation garantie et faible consommation.', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80' },
  premium: { title: 'SUV & cross-overs', text: 'Espace généreux, puissance et haute garde au sol pour tous axes.', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80' },
  gold: { title: 'Luxe & prestige 4x4', text: 'Luxe absolu, stature de prestige et prestations protocolaires VIP.', image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=700&q=80' },
};

const FORMULA_ICONS = { urban_3h: 'speed', urban_8h: 'work', urban_day: 'calendar_month', intercity: 'alt_route', long_haul: 'date_range' };

const STEPS = [
  { title: 'Choix du véhicule', text: "Consultez le catalogue avec photos réelles, note de l'état mécanique et équipements vérifiés." },
  { title: 'Paiement mobile', text: 'Rechargez votre portefeuille avec MTN MoMo, Orange Money ou carte Visa/Mastercard.' },
  { title: 'Séquestre de la caution', text: "Votre caution n'est pas encaissée par le propriétaire : elle reste bloquée par AutoLink Pro." },
  { title: 'État des lieux & départ', text: 'Inspection du véhicule, remise des clés et route libre. Caution restituée au retour.' },
];

const WHY = [
  { icon: 'fact_check', title: 'Véhicules inspectés', text: 'Freinage, climatisation, pneumatiques et batterie : chaque voiture est contrôlée par un inspecteur AutoLink.' },
  { icon: 'account_balance', title: 'Caution 100 % protégée', text: "Bloquée sur un compte neutre, jamais versée au propriétaire sans arbitrage d'un litige." },
  { icon: 'contactless', title: 'Paiement mobile local', text: 'Intégration directe MTN Mobile Money et Orange Money. Pas besoin de carte bancaire étrangère.' },
  { icon: 'support_agent', title: 'Support humain', text: 'Une équipe joignable par téléphone et via la messagerie intégrée, à Douala et Yaoundé.' },
];

const CAR_BRANDS = [
  siToyota, siHonda, siNissan, siVolkswagen, siFord, siHyundai, siKia, siMazda, siMitsubishi, siSubaru,
  siPeugeot, siRenault, siVolvo, siBmw, siChevrolet, siCitroen, siDacia, siFiat, siJeep, siOpel, siPorsche,
  siFerrari, siLamborghini, siBentley, siMaserati, siMini, siRollsroyce, siSkoda, siSuzuki, siTesla,
].filter(Boolean);

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (value, days) => { const d = new Date(value); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };

function SectionTitle({ overline, title, text, center = true, light = false }) {
  return (
    <div className={`flex flex-col gap-2 mb-10 ${center ? 'items-center text-center' : ''}`}>
      <span className={`overline ${light ? 'text-primary-fixed-dim' : 'text-primary'}`}>{t(overline)}</span>
      <h2 className={`font-headline-xl text-headline-xl-mobile md:text-headline-xl ${light ? 'text-surface-container-lowest' : 'text-on-surface dark:text-white'}`}>{t(title)}</h2>
      {text && <p className={`max-w-2xl font-body-lg text-body-lg ${light ? 'text-surface-variant' : 'text-on-surface-variant dark:text-slate-400'}`}>{t(text)}</p>}
    </div>
  );
}

function HeroSearch({ cities }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ city: '', type: 'urban_day', start: today(), end: plusDays(today(), 1), driver: false });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ type: form.type, start: form.start, end: form.end });
    if (form.city) params.set('city', form.city);
    if (form.driver) params.set('driver', '1');
    navigate(`/catalog?${params}`);
  };
  const field = 'flex flex-col gap-1 px-4 py-3 rounded-xl bg-surface-container-low dark:bg-slate-900';
  return (
    <form onSubmit={search} className="rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-elevation-3 p-4 sm:p-5 flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label className={field}>
          <span className="overline">{t('Ville & secteur')}</span>
          <span className="flex items-center gap-2"><Icon name="location_on" size={20} className="text-primary" />
            <select value={form.city} onChange={set('city')} className="w-full bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">
              <option value="">{t('Toutes les villes')}</option>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </span>
        </label>
        <label className={field}>
          <span className="overline">{t('Formule / durée')}</span>
          <span className="flex items-center gap-2"><Icon name="schedule" size={20} className="text-primary" />
            <select value={form.type} onChange={set('type')} className="w-full bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">
              {RENTAL_TYPES.map((type) => <option key={type.id} value={type.id}>{t(type.label)}</option>)}
            </select>
          </span>
        </label>
        <label className={field}>
          <span className="overline">{t('Prise en charge')}</span>
          <span className="flex items-center gap-2"><Icon name="calendar_today" size={20} className="text-primary" />
            <input type="date" min={today()} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value, end: form.end <= e.target.value ? plusDays(e.target.value, 1) : form.end })}
              className="w-full bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white" />
          </span>
        </label>
        <label className={field}>
          <span className="overline">{t('Restitution prévue')}</span>
          <span className="flex items-center gap-2"><Icon name="event_available" size={20} className="text-primary" />
            <input type="date" min={plusDays(form.start, 1)} value={form.end} onChange={set('end')} className="w-full bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white" />
          </span>
        </label>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.driver} onChange={set('driver')} className="w-4 h-4 accent-primary" />
          {t('Avec chauffeur professionnel agréé')}
        </label>
        <button type="submit" className="btn-primary"><Icon name="search" size={20} />{t('Rechercher les véhicules')}</button>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-outline-variant/30 dark:border-slate-700 font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
        <span className="flex items-center gap-1.5"><Icon name="verified_user" size={18} className="text-primary" />{t('Véhicules inspectés par nos experts')}</span>
        <span className="flex items-center gap-1.5"><Icon name="smartphone" size={18} className="text-primary" />{t('Paiement direct MTN MoMo & Orange Money')}</span>
        <span className="flex items-center gap-1.5"><Icon name="lock_clock" size={18} className="text-primary" />{t('Caution sécurisée et bloquée en séquestre')}</span>
      </div>
    </form>
  );
}

function BrandMarquee() {
  const rows = [CAR_BRANDS.slice(0, 15), CAR_BRANDS.slice(15)];
  return (
    <section className="py-10 bg-surface-container-low dark:bg-slate-900 overflow-hidden" aria-label={t('Marques de véhicules disponibles')}>
      <p className="overline text-center mb-5">{t('Des marques reconnues pour chaque trajet')}</p>
      <div className="flex flex-col gap-4">
        {rows.map((brands, rowIndex) => (
          <div key={rowIndex} className={`brand-marquee-row ${rowIndex === 1 ? 'brand-marquee-reverse' : ''}`}>
            <div className="brand-marquee-track">
              {[...brands, ...brands].map((brand, index) => (
                <div key={`${brand.slug}-${index}`} className="brand-marquee-item rounded-xl dark:bg-slate-800 dark:border-slate-700" aria-hidden={index >= brands.length}>
                  <svg viewBox="0 0 24 24" role="img" aria-label={brand.title}><path d={brand.path} /></svg>
                  <span>{brand.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = useSiteConfig();
  const favorites = useFavorites();
  const [vehicles, setVehicles] = useState([]);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [facets, setFacets] = useState({ categories: [], cities: [] });
  const [hero, setHero] = useState(0);

  useEffect(() => { vehiclesAPI.facets().then(({ data }) => setFacets(data)).catch(() => {}); }, []);
  useEffect(() => { const timer = setInterval(() => setHero((h) => (h + 1) % HERO_IMAGES.length), 5000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    setLoading(true);
    vehiclesAPI.list({ status: 'approved', ordering: '-rating', page_size: 8, ...(category ? { category } : {}) })
      .then(({ data }) => { setVehicles(data.results || data || []); if (!category) setCount(data.count ?? (data.results || []).length); })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [category]);

  const reserve = (vehicle) => {
    const path = reservePath(vehicle.id, user);
    navigate(path || `/vehicles/${vehicle.id}`);
  };

  const tiers = (config?.tiers || []).filter((tier) => TIER_COPY[tier.tier]);
  const stats = config?.stats;
  const reviews = config?.reviews || [];
  const hours = config?.hours || {};
  const showHours = (schedule) => (schedule === null ? t('Sur réservation') : schedule ? formatTimeRange(schedule) : '—');

  return (
    <PublicLayout>
      <section className="relative">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, index) => (
            <img key={src} src={src} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === hero ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface/95 via-inverse-surface/75 to-inverse-surface/30" />
          <div className="absolute bottom-4 right-6 flex gap-1.5">
            {HERO_IMAGES.map((_, index) => <span key={index} className={`w-2 h-2 rounded-full ${index === hero ? 'bg-surface-container-lowest' : 'bg-surface-container-lowest/40'}`} />)}
          </div>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 flex flex-col gap-8">
          <div className="max-w-3xl flex flex-col gap-4">
            <span className="w-fit flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/80 text-on-primary font-label-sm text-label-sm uppercase tracking-wider"><Icon name="verified" size={16} />{t('Premier réseau sécurisé au Cameroun')}</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-surface-container-lowest">{t('Louez un véhicule vérifié à Douala & Yaoundé en toute sérénité')}</h1>
            <p className="font-body-lg text-body-lg text-surface-variant max-w-2xl">{t('Paiement 100 % sécurisé via portefeuille Mobile Money (MTN MoMo, Orange Money) et carte bancaire. Caution protégée en séquestre.')}</p>
          </div>
          <HeroSearch cities={facets.cities || []} />
        </div>
      </section>

      {tiers.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <SectionTitle center={false} overline="Flotte certifiée AutoLink Pro" title="Choisissez selon votre standing" />
            <p className="max-w-md font-body-md text-body-md text-on-surface-variant mb-10">{t("Plusieurs niveaux d'exigence mécanique et de confort, des trajets urbains serrés aux missions de représentation.")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <article key={tier.tier} className="rounded-xl overflow-hidden bg-surface-container-lowest dark:bg-slate-800 shadow-sm border border-outline-variant/30 dark:border-slate-700 flex flex-col">
                <div className="relative h-40"><img src={TIER_COPY[tier.tier].image} alt="" className="w-full h-full object-cover" />
                  <span className={`absolute top-3 left-3 px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[tier.tier]}`}>{t(tier.label)}</span>
                </div>
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(TIER_COPY[tier.tier].title)}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-400 flex-1">{t(TIER_COPY[tier.tier].text)}</p>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{t('À partir de')}</div>
                  <div className="font-headline-md text-headline-md text-primary">{formatNumber(tier.min_rate)} <span className="font-label-sm text-label-sm">{t('FCFA / jour')}</span></div>
                  <Link to={`/catalog?tier=${tier.tier}`} className="btn-secondary py-2 mt-2">{t('Voir les véhicules')}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div><span className="overline text-primary">{t('Disponibilité immédiate')}</span><h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white mt-1">{t('Véhicules prêts au départ')}</h2></div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['', ...(facets.categories || [])].map((value) => (
                <button key={value || 'all'} onClick={() => setCategory(value)}
                  className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md ${category === value ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container dark:bg-slate-800 dark:text-slate-300'}`}>
                  {value ? vehicleLabel(value, 'category') : t('Tous')}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-96 rounded-xl bg-surface-container animate-pulse" />)}</div>
          ) : vehicles.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onReserve={reserve} favorite={favorites.ids.includes(vehicle.id)} onToggleFavorite={favorites.enabled ? favorites.toggle : undefined} />)}
            </div>
          ) : <p className="text-center py-10 font-body-lg text-body-lg text-on-surface-variant">{t('Aucun véhicule approuvé n’est disponible pour le moment.')}</p>}
          <div className="text-center mt-10">
            <Link to="/catalog" className="btn-secondary"><Icon name="directions_car" size={20} />{count !== null ? t('Voir tout le catalogue ({{n}} véhicules disponibles)', { n: formatNumber(count) }) : t('Voir tout le catalogue')}</Link>
          </div>
        </div>
      </section>

      <BrandMarquee />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle overline="Flexibilité absolue" title="Des formules calibrées à votre rythme" text="Ne payez que le temps réel dont vous avez besoin. Aucun engagement caché, tout est cadré dès la réservation." />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {RENTAL_TYPES.map((type) => (
            <Link key={type.id} to={`/catalog?type=${type.id}`} className="card-hover flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name={FORMULA_ICONS[type.id] || 'schedule'} /></span>
              <div><div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(type.label)}</div><p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t(type.description)}</p></div>
              <div className="mt-auto pt-3 border-t border-outline-variant/30"><span className="font-body-sm text-body-sm text-on-surface-variant">{t('Dès')}</span> <span className="font-headline-sm text-headline-sm text-primary">{formatNumber(type.minPrice)} FCFA</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-inverse-surface py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle light center={false} overline="Simplicité & rigueur" title="4 étapes pour prendre le volant" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-xl bg-surface-variant/10 p-5 flex flex-col gap-3">
                <span className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">{index + 1}</span>
                <h3 className="font-headline-sm text-headline-sm text-surface-container-lowest">{t(step.title)}</h3>
                <p className="font-body-md text-body-md text-surface-variant">{t(step.text)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-primary/25 border border-primary-fixed-dim/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Icon name="shield_with_heart" size={32} className="text-primary-fixed-dim shrink-0" />
              <div>
                <h3 className="font-headline-sm text-headline-sm text-surface-container-lowest">{t('Comment fonctionne la caution en séquestre ?')}</h3>
                <p className="font-body-md text-body-md text-surface-variant">{t('Votre caution ne va pas sur le compte du propriétaire. Elle reste sécurisée par AutoLink Pro et se débloque sur votre portefeuille dès la fin de la location sans litige.')}</p>
              </div>
            </div>
            <Link to="/how-it-works" className="btn-outline-white shrink-0">{t('En savoir plus')}</Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle overline="Confiance & sérénité" title="Pourquoi choisir AutoLink Pro ?" text="Le standard de qualité qui élimine les mauvaises surprises de la location automobile en Afrique centrale." />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {WHY.map((item) => (
            <div key={item.title} className="card flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center"><Icon name={item.icon} /></span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(item.title)}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-400">{t(item.text)}</p>
            </div>
          ))}
        </div>
        {stats && (
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl bg-secondary-fixed/40 dark:bg-slate-900 p-6 text-center">
            {[
              { value: formatNumber(stats.vehicles), label: 'Véhicules vérifiés en circulation' },
              { value: formatNumber(stats.completed_bookings), label: 'Locations terminées' },
              { value: stats.reviews ? `${formatNumber(stats.average_rating, { maximumFractionDigits: 1 })} / 5` : '—', label: stats.reviews ? 'Note moyenne de satisfaction' : 'Note moyenne (aucun avis)' },
              { value: formatNumber(stats.cities), label: 'Villes desservies' },
            ].map((item) => (
              <div key={item.label}><div className="font-display-lg text-headline-xl text-on-surface dark:text-white">{item.value}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t(item.label)}</div></div>
            ))}
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle overline="Retours d'expérience" title="Ce que disent nos conducteurs" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <blockquote key={`${review.author}-${review.vehicle}`} className="card flex flex-col gap-3">
                  <div className="flex text-tertiary-container">{Array.from({ length: review.rating }).map((_, i) => <Icon key={i} name="star" fill size={18} />)}</div>
                  <p className="font-body-lg text-body-lg italic text-on-surface dark:text-slate-200">« {review.text} »</p>
                  <footer className="mt-auto"><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{review.author}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{review.city} · {t('{{vehicle}} loué {{days}} jour(s)', { vehicle: review.vehicle, days: review.days })}</div></footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-xl overflow-hidden bg-inverse-surface grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-12 flex flex-col gap-5">
            <span className="w-fit px-3 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider">{t('Programme partenaire propriétaire')}</span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-surface-container-lowest">{t('Votre voiture dort au garage ? Faites-la travailler en toute sécurité.')}</h2>
            <ul className="flex flex-col gap-2 font-body-md text-body-md text-surface-variant">
              <li className="flex items-center gap-2"><Icon name="payments" className="text-primary-fixed-dim" />{t('Revenus versés sur votre solde dès la fin de chaque location.')}</li>
              <li className="flex items-center gap-2"><Icon name="verified_user" className="text-primary-fixed-dim" />{t('Inspection et vérification des locataires prises en charge.')}</li>
              <li className="flex items-center gap-2"><Icon name="monitoring" className="text-primary-fixed-dim" />{t('Suivi des demandes, revenus et retraits sur votre espace dédié.')}</li>
            </ul>
            <Link to="/become-owner" className="btn-primary w-fit">{t('Proposer mon véhicule')}<Icon name="arrow_forward" size={18} /></Link>
          </div>
          <img src={OWNER_IMAGE} alt="" className="w-full h-72 lg:h-full object-cover" />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <SectionTitle overline="Questions & réponses" title="Foire aux questions" text="Tout ce que vous devez savoir sur le fonctionnement, les paiements et les garanties d'AutoLink Pro." />
        <FaqList items={CLIENT_FAQ.slice(0, 5)} />
      </section>

      <section id="contact" className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16 scroll-mt-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle overline="Nous contacter" title="Contact & réservation" text="Un projet de déplacement à Douala ou Yaoundé ? Indiquez votre type de trajet, les villes concernées et vos contraintes horaires." />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card"><ContactForm /></div>
            <div className="flex flex-col gap-4">
              {[
                { icon: 'call', title: 'Téléphone', lines: config?.phones || [] },
                { icon: 'location_on', title: 'Adresse', lines: config?.addresses || [] },
                { icon: 'mail', title: 'Email', lines: config?.contact_email ? [config.contact_email] : [] },
              ].map((info) => (
                <div key={info.title} className="card flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0"><Icon name={info.icon} /></span>
                  <div><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(info.title)}</div>{info.lines.map((line) => <p key={line} className="font-body-md text-body-md text-on-surface-variant">{line}</p>)}</div>
                </div>
              ))}
              <div className="card">
                <div className="font-label-lg text-label-lg text-on-surface dark:text-white mb-2">{t('Horaires')}</div>
                {[['Lundi au vendredi', hours.weekdays], ['Samedi', hours.saturday], ['Dimanche', hours.sunday]].map(([label, schedule]) => (
                  <div key={label} className="flex justify-between font-body-md text-body-md text-on-surface-variant"><span>{t(label)}</span><span className="font-label-lg text-label-lg text-on-surface dark:text-slate-200">{showHours(schedule)}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PromoPopup />
    </PublicLayout>
  );
}
