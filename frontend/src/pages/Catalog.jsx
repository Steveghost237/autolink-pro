import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import Icon from '../components/Icon';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';
import { RENTAL_TYPES, TIERS } from '../utils/carImages';
import { reservePath } from '../utils/vehicles';
import useFavorites from '../utils/useFavorites';
import { formatDate, formatNumber, uiText, vehicleLabel } from '../i18n';

const t = (text, options) => uiText('pages.Catalog', text, options);

const ORDERINGS = [
  { value: '-rating', label: 'Recommandés' },
  { value: 'daily_rate', label: 'Prix croissant' },
  { value: '-daily_rate', label: 'Prix décroissant' },
  { value: '-year', label: 'Plus récents' },
];

const PAGE_SIZE = 9;
const today = () => new Date().toISOString().slice(0, 10);

function FilterGroup({ title, children }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-t border-outline-variant/30 dark:border-slate-700 first:border-t-0">
      <span className="overline">{t(title)}</span>
      {children}
    </div>
  );
}

function Radio({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface dark:text-slate-200 cursor-pointer">
      <input type="radio" checked={checked} onChange={onChange} className="w-4 h-4 accent-primary" />{label}
    </label>
  );
}

export default function Catalog() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const favorites = useFavorites();
  const [params, setParams] = useSearchParams();
  const [facets, setFacets] = useState({ brands: [], categories: [], fuels: [], cities: [], max_rate: 200000 });
  const [vehicles, setVehicles] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(params.get('q') || '');

  const filters = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === undefined || value === null || value === false) next.delete(key); else next.set(key, value);
    if (next.toString() === params.toString()) return;
    setPage(1);
    setParams(next, { replace: true });
  };
  const resetFilters = () => { setSearch(''); setPage(1); setParams({}, { replace: true }); };
  const maxRate = Math.max(20000, Number(facets.max_rate) || 200000);

  useEffect(() => { vehiclesAPI.facets().then(({ data }) => setFacets(data)).catch(() => {}); }, []);
  useEffect(() => { const timer = setTimeout(() => setFilter('q', search.trim()), 350); return () => clearTimeout(timer); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const query = {
      status: 'approved', page, page_size: PAGE_SIZE, ordering: filters.ordering || '-rating',
      search: filters.q || undefined, city: filters.city, tier: filters.tier, category: filters.category,
      fuel: filters.fuel, brand: filters.brand, max_rate: filters.max_rate,
      driver_available: filters.driver ? 'true' : undefined,
      ...(filters.only !== '0' && filters.start ? { available: 1, start: filters.start, end: filters.end || filters.start } : {}),
    };
    vehiclesAPI.list(query)
      .then(({ data }) => {
        if (!mounted) return;
        const results = data.results || data || [];
        setVehicles((list) => (page === 1 ? results : [...list, ...results]));
        setCount(data.count ?? results.length);
        setError('');
      })
      .catch(() => mounted && setError(t('API injoignable — catalogue indisponible.')))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [filters, page]);

  const reserve = (vehicle) => {
    const extra = `${filters.type ? `&type=${filters.type}` : ''}${filters.start ? `&start=${filters.start}` : ''}`;
    const path = reservePath(vehicle.id, user, extra);
    navigate(path || `/vehicles/${vehicle.id}`);
  };

  const chips = [
    filters.city && { key: 'city', label: filters.city },
    filters.tier && { key: 'tier', label: vehicleLabel(filters.tier, 'tier') },
    filters.category && { key: 'category', label: vehicleLabel(filters.category, 'category') },
    filters.fuel && { key: 'fuel', label: vehicleLabel(filters.fuel, 'fuel') },
    filters.brand && { key: 'brand', label: filters.brand },
    filters.max_rate && { key: 'max_rate', label: t('≤ {{n}} FCFA', { n: formatNumber(filters.max_rate) }) },
    filters.driver && { key: 'driver', label: t('Avec chauffeur') },
  ].filter(Boolean);

  const formula = RENTAL_TYPES.find((type) => type.id === filters.type);

  return (
    <PublicLayout>
      <section className="bg-surface-container-low dark:bg-slate-900 border-b border-outline-variant/30 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_1fr_minmax(0,150px)] gap-3">
          <label className="min-w-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
            <Icon name="location_on" className="text-primary" />
            <span className="flex flex-col flex-1 min-w-0"><span className="overline">{t('Ville')}</span>
              <select value={filters.city || ''} onChange={(e) => setFilter('city', e.target.value)} className="w-full min-w-0 bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">
                <option value="">{t('Toutes les villes')}</option>{(facets.cities || []).map((city) => <option key={city}>{city}</option>)}
              </select></span>
          </label>
          <label className="min-w-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
            <Icon name="schedule" className="text-primary" />
            <span className="flex flex-col flex-1 min-w-0"><span className="overline">{t('Formule')}</span>
              <select value={filters.type || ''} onChange={(e) => setFilter('type', e.target.value)} className="w-full min-w-0 bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">
                <option value="">{t('Toutes les formules')}</option>{RENTAL_TYPES.map((type) => <option key={type.id} value={type.id}>{t(type.label)}</option>)}
              </select></span>
          </label>
          <div className="min-w-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
            <Icon name="date_range" className="text-primary" />
            <span className="flex flex-col flex-1 min-w-0"><span className="overline">{t('Période de réservation')}</span>
              <span className="flex items-center gap-2">
                <input type="date" min={today()} value={filters.start || ''} onChange={(e) => setFilter('start', e.target.value)} className="min-w-0 w-full bg-transparent font-label-md text-label-md focus:outline-none dark:text-white" />
                <Icon name="arrow_forward" size={16} className="text-on-surface-variant" />
                <input type="date" min={filters.start || today()} value={filters.end || ''} onChange={(e) => setFilter('end', e.target.value)} className="min-w-0 w-full bg-transparent font-label-md text-label-md focus:outline-none dark:text-white" />
              </span></span>
          </div>
          <label className="min-w-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
            <Icon name="badge" className="text-primary" />
            <span className="flex flex-col flex-1 min-w-0"><span className="overline">{t('Service')}</span>
              <select value={filters.driver ? '1' : ''} onChange={(e) => setFilter('driver', e.target.value)} className="w-full min-w-0 bg-transparent font-label-lg text-label-lg focus:outline-none dark:text-white">
                <option value="">{t('Avec ou sans chauffeur')}</option><option value="1">{t('Chauffeur du propriétaire disponible')}</option>
              </select></span>
          </label>
          <label className="min-w-0 flex items-center gap-2 px-4 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
            <Icon name="search" className="text-outline" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Marque, modèle…')} className="min-w-0 w-full bg-transparent py-3 font-body-md text-body-md focus:outline-none dark:text-white" />
          </label>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-20">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface dark:text-white"><Icon name="tune" />{t('Filtres')}</span>
              {chips.length > 0 && <span className="badge-primary">{t('{{n}} actif(s)', { n: chips.length })}</span>}
            </div>
            <label className="flex items-start gap-2 p-3 my-2 rounded-xl bg-secondary-fixed/40 dark:bg-slate-900 font-body-sm text-body-sm cursor-pointer">
              <input type="checkbox" checked={filters.only !== '0'} onChange={(e) => setFilter('only', e.target.checked ? '' : '0')} className="mt-0.5 w-4 h-4 accent-primary" />
              {t('Seulement disponibles sur mes dates sélectionnées')}
            </label>
            <FilterGroup title="Gamme AutoLink">
              <Radio checked={!filters.tier} onChange={() => setFilter('tier', '')} label={t('Toutes les gammes')} />
              {TIERS.map((tier) => <Radio key={tier.id} checked={filters.tier === tier.id} onChange={() => setFilter('tier', tier.id)} label={vehicleLabel(tier.id, 'tier')} />)}
            </FilterGroup>
            <FilterGroup title="Formule">
              <div className="grid grid-cols-2 gap-2">
                {RENTAL_TYPES.slice(0, 4).map((type) => (
                  <button key={type.id} onClick={() => setFilter('type', filters.type === type.id ? '' : type.id)}
                    className={`py-2 rounded-lg font-label-md text-label-md ${filters.type === type.id ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant dark:bg-slate-900'}`}>{t(type.label)}</button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Prix journalier">
              <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant"><span>20 000 FCFA</span><strong className="text-primary">{formatNumber(filters.max_rate || maxRate)} FCFA</strong></div>
              <input type="range" min={20000} max={maxRate} step={5000} value={Number(filters.max_rate || maxRate)} onChange={(e) => setFilter('max_rate', Number(e.target.value) >= maxRate ? '' : e.target.value)} className="w-full accent-primary" />
            </FilterGroup>
            <FilterGroup title="Catégorie">
              <Radio checked={!filters.category} onChange={() => setFilter('category', '')} label={t('Toutes')} />
              {(facets.categories || []).map((value) => <Radio key={value} checked={filters.category === value} onChange={() => setFilter('category', value)} label={vehicleLabel(value, 'category')} />)}
            </FilterGroup>
            <FilterGroup title="Marque">
              <select value={filters.brand || ''} onChange={(e) => setFilter('brand', e.target.value)} className="input-field py-2">
                <option value="">{t('Toutes les marques')}</option>{(facets.brands || []).map((value) => <option key={value}>{value}</option>)}
              </select>
            </FilterGroup>
            <FilterGroup title="Énergie">
              <Radio checked={!filters.fuel} onChange={() => setFilter('fuel', '')} label={t('Toutes')} />
              {(facets.fuels || []).map((value) => <Radio key={value} checked={filters.fuel === value} onChange={() => setFilter('fuel', value)} label={vehicleLabel(value, 'fuel')} />)}
            </FilterGroup>
            <button onClick={resetFilters} className="btn-secondary w-full py-2 mt-2"><Icon name="restart_alt" size={18} />{t('Réinitialiser tous les filtres')}</button>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 font-label-lg text-label-lg text-primary"><Icon name="verified_user" />{t('Garantie AutoLink')}</div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t('Véhicules inspectés et caution bloquée sous séquestre jusqu’à la fin de la location.')}</p>
          </div>
        </aside>

        <section className="flex flex-col gap-5">
          <div className="card p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">
                {t('{{n}} véhicule(s) disponible(s)', { n: formatNumber(count) })}
                {filters.city && <span className="font-body-lg text-body-lg text-primary"> {t('à {{city}}', { city: filters.city })}</span>}
              </h1>
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low dark:bg-slate-900">
                <span className="overline">{t('Trier par')}</span>
                <select value={filters.ordering || '-rating'} onChange={(e) => setFilter('ordering', e.target.value === '-rating' ? '' : e.target.value)} className="bg-transparent font-label-md text-label-md focus:outline-none dark:text-white">
                  {ORDERINGS.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
                </select>
              </label>
            </div>
            {(chips.length > 0 || formula || filters.start) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="overline">{t('Filtres :')}</span>
                {formula && <span className="badge-info">{t(formula.label)}</span>}
                {filters.start && <span className="badge-info">{formatDate(filters.start)} → {formatDate(filters.end || filters.start)}</span>}
                {chips.map((chip) => (
                  <button key={chip.key} onClick={() => setFilter(chip.key, '')} className="badge-primary">{chip.label}<Icon name="close" size={14} /></button>
                ))}
                <button onClick={resetFilters} className="font-label-md text-label-md text-primary underline">{t('Effacer tout')}</button>
              </div>
            )}
          </div>

          {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onReserve={reserve}
                favorite={favorites.ids.includes(vehicle.id)} onToggleFavorite={favorites.enabled ? favorites.toggle : undefined} />
            ))}
            {loading && Array.from({ length: 3 }).map((_, i) => <div key={`s${i}`} className="h-96 rounded-xl bg-surface-container animate-pulse" />)}
          </div>
          {!loading && !vehicles.length && !error && (
            <div className="card text-center py-14">
              <Icon name="search_off" size={44} className="text-outline" />
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">{t('Aucun véhicule ne correspond à ces critères.')}</p>
            </div>
          )}

          {vehicles.length > 0 && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-72 h-1.5 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (vehicles.length / Math.max(1, count)) * 100)}%` }} /></div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{t('Affichage de {{n}} sur {{total}} véhicules certifiés', { n: vehicles.length, total: count })}</span>
              {vehicles.length < count && <button disabled={loading} onClick={() => setPage(page + 1)} className="btn-secondary"><Icon name="expand_circle_down" size={20} />{t('Charger plus de véhicules')}</button>}
            </div>
          )}

          <div className="rounded-xl bg-secondary-fixed/40 dark:bg-slate-900 p-5 flex items-start gap-3">
            <span className="w-11 h-11 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shrink-0"><Icon name="shield" /></span>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Paiement & caution sécurisés')}</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Paiement par Mobile Money (Orange Money & MTN MoMo), carte ou portefeuille AutoLink ; caution restituée en fin de location.')}</p>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
