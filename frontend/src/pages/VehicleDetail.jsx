import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import Icon from '../components/Icon';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';
import { RENTAL_TYPES } from '../utils/carImages';
import { reservePath, TIER_BADGES, vehicleImage, vehicleName, vehicleRate } from '../utils/vehicles';
import useFavorites from '../utils/useFavorites';
import { formatDate, formatNumber, uiText, vehicleLabel } from '../i18n';

const t = (text, options) => uiText('pages.VehicleDetail', text, options);

const POSITIONS = [['', 'Tout'], ['exterior', 'Extérieur'], ['interior', 'Intérieur'], ['other', 'Autre']];

// Estimation identique au tunnel de réservation (SearchVehicles).
const estimate = (rate, type, days) => {
  if (type.id === 'urban_3h') return Math.max(rate * 0.15, type.minPrice);
  if (type.id === 'urban_8h') return Math.max(rate * 0.30, type.minPrice);
  if (type.id === 'intercity') return Math.max(rate * 1.5, type.minPrice);
  if (type.id === 'long_haul') return rate * days;
  return rate;
};

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const favorites = useFavorites();
  const [vehicle, setVehicle] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [position, setPosition] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [type, setType] = useState(RENTAL_TYPES[2]);
  const [days, setDays] = useState(4);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setVehicle(null); setNotFound(false); setMediaIndex(0);
    vehiclesAPI.detail(id).then(({ data }) => {
      setVehicle(data);
      vehiclesAPI.list({ status: 'approved', tier: data.tier, page_size: 4 }).then(({ data: list }) => {
        setSimilar((list.results || list || []).filter((item) => item.id !== data.id).slice(0, 3));
      }).catch(() => {});
    }).catch(() => setNotFound(true));
  }, [id]);

  const media = useMemo(() => (vehicle?.photos || []).filter((item) => !position || item.position === position), [vehicle, position]);

  if (notFound) {
    return (
      <PublicLayout>
        <div className="max-w-xl mx-auto text-center py-24 px-4">
          <Icon name="directions_car" size={56} className="text-outline" />
          <h1 className="page-title mt-4">{t('Véhicule introuvable')}</h1>
          <p className="page-subtitle mt-2">{t('Ce véhicule n’est plus disponible dans le catalogue.')}</p>
          <Link to="/catalog" className="btn-primary mt-6">{t('Retour au catalogue')}</Link>
        </div>
      </PublicLayout>
    );
  }
  if (!vehicle) {
    return <PublicLayout><div className="max-w-[1440px] mx-auto px-4 py-10"><div className="h-[420px] rounded-xl bg-surface-container animate-pulse" /></div></PublicLayout>;
  }

  const name = vehicleName(vehicle);
  const rate = vehicleRate(vehicle);
  const price = Math.round(estimate(rate, type, days));
  const deposit = Number(vehicle.deposit_amount || 0);
  const selected = media[mediaIndex];
  const gallery = media.length ? media : [{ id: 'main', image: vehicleImage(vehicle), kind: 'image' }];
  const score = Number(vehicle.condition_score || 0);
  const isFavorite = favorites.ids.includes(vehicle.id);

  const reserve = () => {
    const path = reservePath(vehicle.id, user, `&type=${type.id}${type.id === 'long_haul' ? `&days=${days}` : ''}`);
    if (path) navigate(path);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setShared(true); setTimeout(() => setShared(false), 2500); }
    } catch (_) {}
  };

  const specs = [
    { icon: 'airline_seat_recline_normal', label: 'Passagers', value: t('{{n}} places', { n: vehicle.seats }) },
    { icon: 'category', label: 'Catégorie', value: vehicleLabel(vehicle.category, 'category') },
    { icon: 'local_gas_station', label: 'Carburant', value: vehicleLabel(vehicle.fuel, 'fuel') },
    { icon: 'calendar_today', label: 'Année', value: vehicle.year },
    { icon: 'speed', label: 'Kilométrage', value: `${formatNumber(vehicle.mileage || 0)} km` },
    { icon: 'route', label: 'Km inclus / jour', value: `${formatNumber(vehicle.km_included_per_day || type.kmIncluded)} km` },
    { icon: 'add_road', label: 'Km supplémentaire', value: `${formatNumber(vehicle.extra_km_rate || 0)} F/km` },
    { icon: 'palette', label: 'Couleur', value: vehicle.color || '—' },
  ];

  return (
    <PublicLayout>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <nav className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary">{t('Accueil')}</Link><Icon name="chevron_right" size={16} />
          <Link to="/catalog" className="hover:text-primary">{t('Catalogue')}</Link><Icon name="chevron_right" size={16} />
          <Link to={`/catalog?tier=${vehicle.tier}`} className="hover:text-primary">{vehicleLabel(vehicle.tier_label || vehicle.tier, 'tier')}</Link><Icon name="chevron_right" size={16} />
          <span className="text-on-surface dark:text-white">{name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[vehicle.tier]}`}>{t('Gamme')} {vehicleLabel(vehicle.tier_label || vehicle.tier, 'tier')}</span>
              {score > 0 && <span className="badge-success"><Icon name="verified" size={14} />{t('Inspecté par AutoLink {{score}}/10', { score: (score / 10).toFixed(1) })}</span>}
              {vehicle.driver_available && <span className="badge-warning"><Icon name="person" size={14} />{t('Chauffeur disponible')}</span>}
            </div>
            <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white">{name}</h1>
            <div className="flex flex-wrap items-center gap-4 font-body-md text-body-md text-on-surface-variant">
              <span className="flex items-center gap-1"><Icon name="star" fill size={18} className="text-tertiary-container" />{Number(vehicle.rating) ? `${formatNumber(vehicle.rating, { maximumFractionDigits: 1 })} (${t('{{n}} avis', { n: vehicle.rating_count || 0 })})` : t('Nouveau véhicule')}</span>
              <span className="flex items-center gap-1"><Icon name="location_on" size={18} />{vehicle.city}</span>
              <span className={vehicle.status === 'approved' ? 'badge-success' : 'badge-warning'}>{vehicle.status === 'approved' ? t('Disponible à la réservation') : t('Actuellement en location')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {favorites.enabled && <button onClick={() => favorites.toggle(vehicle.id)} className="btn-secondary py-2 px-4"><Icon name="favorite" fill={isFavorite} size={18} className={isFavorite ? 'text-error' : ''} />{isFavorite ? t('Sauvegardé') : t('Sauvegarder')}</button>}
            <button onClick={share} className="btn-secondary py-2 px-4"><Icon name="share" size={18} />{shared ? t('Lien copié') : t('Partager')}</button>
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3">
            <div className="relative rounded-xl overflow-hidden bg-surface-container aspect-video">
              {(selected || gallery[0]).kind === 'video'
                ? <video className="w-full h-full object-cover" controls src={(selected || gallery[0]).image} />
                : <img className="w-full h-full object-cover" src={(selected || gallery[0]).image} alt={name} />}
              <span className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-lowest/95 font-label-md text-label-md"><Icon name="photo_camera" size={16} />{t('{{n}} média(s)', { n: (vehicle.photos || []).length || 1 })}</span>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {gallery.slice(1, 5).map((item, index) => (
                <button key={item.id} onClick={() => setMediaIndex(index + 1)} className="rounded-xl overflow-hidden bg-surface-container">
                  {item.kind === 'video' ? <video src={item.image} className="w-full h-full object-cover" /> : <img src={item.image} alt={item.caption || ''} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {POSITIONS.map(([value, label]) => (
              <button key={value} onClick={() => { setPosition(value); setMediaIndex(0); }}
                className={`px-3 py-1 rounded-full font-label-md text-label-md ${position === value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant dark:bg-slate-800'}`}>{t(label)}</button>
            ))}
            <div className="flex gap-2 overflow-x-auto">
              {media.map((item, index) => (
                <button key={item.id} onClick={() => setMediaIndex(index)} className={`w-20 h-14 shrink-0 rounded-lg overflow-hidden border-2 ${index === mediaIndex ? 'border-primary' : 'border-transparent'}`}>
                  {item.kind === 'video' ? <video src={item.image} className="w-full h-full object-cover" /> : <img src={item.image} alt={item.caption || ''} className="w-full h-full object-cover" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <section className="card">
              <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2 mb-4"><Icon name="tune" className="text-primary" />{t('Caractéristiques techniques')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900">
                    <Icon name={spec.icon} className="text-primary" />
                    <div className="overline mt-1">{t(spec.label)}</div>
                    <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{spec.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {vehicle.description && (
              <section className="card">
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2 mb-3"><Icon name="description" className="text-primary" />{t('Description vérifiée AutoLink Pro')}</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-slate-300 whitespace-pre-line">{vehicle.description}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-3">{t('Proposé par {{owner}}', { owner: vehicle.owner_name || 'AutoLink' })}</p>
              </section>
            )}

            <section className="card">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="fact_check" className="text-primary" />{t("Fiche d'état certifiée")}</h2>
                <div className="flex items-center gap-2"><span className="w-14 h-14 rounded-full border-4 border-primary flex items-center justify-center font-headline-sm text-headline-sm text-primary">{score ? (score / 10).toFixed(1) : '—'}</span><span className="overline">{t('Score global / 10')}</span></div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {vehicle.last_inspection_at ? t('Dernière inspection par un contrôleur AutoLink le {{date}}.', { date: formatDate(vehicle.last_inspection_at) }) : t('Inspection réalisée par un contrôleur AutoLink avant mise en ligne.')}
              </p>
              <div className="mt-3 h-2 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-primary" style={{ width: `${score}%` }} /></div>
            </section>

            <section className="card">
              <h2 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2 mb-4"><Icon name="gavel" className="text-primary" />{t('Conditions de location transparentes')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { icon: 'lock', title: 'Caution de garantie', text: t('{{n}} FCFA bloqués sous séquestre et restitués automatiquement à la fin de la location sans dommage.', { n: formatNumber(deposit) }) },
                  { icon: 'route', title: 'Kilométrage autorisé', text: t('{{km}} km inclus par jour, puis {{rate}} FCFA par km supplémentaire.', { km: formatNumber(vehicle.km_included_per_day || 0), rate: formatNumber(vehicle.extra_km_rate || 0) }) },
                  { icon: 'event_busy', title: 'Annulation', text: t('Annulation gratuite avant le début de la location : location et caution intégralement recréditées.') },
                  { icon: 'badge', title: 'Documents requis', text: t("Pièce d'identité valide et permis de conduire si vous conduisez vous-même.") },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-900 flex gap-3">
                    <Icon name={item.icon} className="text-primary shrink-0" />
                    <div><div className="font-label-lg text-label-lg text-on-surface dark:text-white">{t(item.title)}</div><p className="font-body-sm text-body-sm text-on-surface-variant">{item.text}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="card xl:sticky xl:top-20 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div><h2 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Réserver ce véhicule')}</h2><p className="font-body-sm text-body-sm text-on-surface-variant">{t('Paiement sécurisé, caution sous séquestre')}</p></div>
              <div className="text-right"><div className="font-headline-lg text-headline-lg text-primary">{formatNumber(rate)}</div><div className="font-label-sm text-label-sm text-on-surface-variant">{t('FCFA / jour')}</div></div>
            </div>
            <div>
              <span className="overline">{t('Formule de location')}</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {RENTAL_TYPES.map((item) => (
                  <button key={item.id} onClick={() => setType(item)} className={`py-2 px-2 rounded-lg font-label-md text-label-md ${type.id === item.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant dark:bg-slate-900 dark:text-slate-300'}`}>{t(item.label)}</button>
                ))}
              </div>
            </div>
            {type.id === 'long_haul' && (
              <label><span className="label">{t('Nombre de jours')}</span><input type="number" min={2} max={30} value={days} onChange={(e) => setDays(Math.max(2, Number(e.target.value)))} className="input-field" /></label>
            )}
            <dl className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-4 flex flex-col gap-2 font-body-md text-body-md">
              <div className="flex justify-between"><dt>{t('Location ({{formula}})', { formula: t(type.label) })}</dt><dd className="font-label-lg text-label-lg">{formatNumber(price)} FCFA</dd></div>
              <div className="flex justify-between text-on-surface-variant"><dt>{t('Km inclus')}</dt><dd>{formatNumber(type.kmIncluded)} km</dd></div>
              <div className="flex justify-between pt-2 border-t border-outline-variant/40"><dt className="font-label-lg text-label-lg">{t('Sous-total location')}</dt><dd className="font-headline-sm text-headline-sm">{formatNumber(price)} FCFA</dd></div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-secondary-fixed/50 text-on-secondary-fixed-variant"><dt className="flex items-center gap-1"><Icon name="lock" size={16} />{t('Caution remboursable')}</dt><dd className="font-label-lg text-label-lg">{formatNumber(deposit)} FCFA</dd></div>
              <div className="flex justify-between pt-2"><dt className="font-label-lg text-label-lg">{t('Total débité du portefeuille')}</dt><dd className="font-headline-md text-headline-md text-primary">{formatNumber(price + deposit)} FCFA</dd></div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Estimation : le montant final est calculé selon vos dates exactes à l’étape suivante.')}</p>
            </dl>
            {user && user.role !== 'CLIENT'
              ? <p className="rounded-xl p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant font-body-sm text-body-sm">{t('La réservation est réservée aux comptes clients.')}</p>
              : <button onClick={reserve} disabled={vehicle.status !== 'approved'} className="btn-primary w-full">{t('Réserver maintenant')}<Icon name="arrow_forward" size={18} /></button>}
            <p className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant"><Icon name="verified_user" size={18} className="text-primary" />{t('Aucun débit avant confirmation : vous validez le récapitulatif et le moyen de paiement à l’étape suivante.')}</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="flex flex-col gap-4 pt-4">
            <div className="flex items-end justify-between">
              <div><h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{t('Véhicules similaires recommandés')}</h2><p className="font-body-sm text-body-sm text-on-surface-variant">{t('Même gamme, disponibles à la réservation')}</p></div>
              <Link to={`/catalog?tier=${vehicle.tier}`} className="font-label-lg text-label-lg text-primary flex items-center gap-1">{t('Voir tout le catalogue')}<Icon name="arrow_forward" size={18} /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((item) => <VehicleCard key={item.id} vehicle={item} compact onReserve={(v) => navigate(`/vehicles/${v.id}`)} />)}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
