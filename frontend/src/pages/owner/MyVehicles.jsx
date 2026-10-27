import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import Icon from '../../components/Icon';
import { vehiclesAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { vehicleImage, vehicleName, TIER_BADGES } from '../../utils/vehicles';
import { formatNumber, formatDate, uiText, vehicleLabel } from '../../i18n';

const t = (text, options) => uiText('pages.owner.MyVehicles', text, options);

const TABS = [
  { id: '', label: 'Tous les véhicules', icon: null },
  { id: 'approved', label: 'En ligne / Actifs', icon: 'radio_button_checked', color: 'text-primary' },
  { id: 'rented', label: 'En location en ce moment', icon: 'key', color: 'text-secondary' },
  { id: 'pending', label: 'En attente de validation', icon: 'hourglass_top', color: 'text-tertiary' },
  { id: 'maintenance', label: 'En maintenance', icon: 'build', color: 'text-on-surface-variant' },
  { id: 'suspended', label: 'Suspendus', icon: 'block', color: 'text-error' },
];
const STATUS = {
  pending: { label: 'En attente de validation', cls: 'badge-warning' },
  approved: { label: 'En ligne (Disponible)', cls: 'badge-success' },
  rented: { label: 'En location', cls: 'badge-info' },
  maintenance: { label: 'En maintenance', cls: 'badge-neutral' },
  suspended: { label: 'Suspendu', cls: 'badge-error' },
};

const qualityHint = (v) => {
  const score = Number(v.condition_score || 0);
  if (!v.photos?.length && !v.image_url) return { score: Math.min(score, 60), text: 'Ajoutez au moins 4 photos nettes (extérieur, intérieur, compteur) pour débloquer le badge « Véhicule Vérifié ».' };
  if (score >= 85) return { score, text: 'Annonce certifiée — excellente qualité de dossier.' };
  if (score >= 70) return { score, text: 'Améliorez la visibilité : précisez l’équipement exact et mettez à jour le kilométrage.' };
  return { score, text: 'Dossier à perfectionner : complétez les documents et les photos pour passer le contrôle.' };
};

export default function MyVehicles() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const load = useCallback(async () => {
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortField}`;
      const { data } = await vehiclesAPI.list({ mine: 1, page_size: 100, search: search.trim(), ordering });
      setVehicles(data.results || data || []);
      setOnline(true);
    } catch (_) { setOnline(false); }
    setLoaded(true);
  }, [search, sortField, sortOrder]);
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);

  const remove = async (vehicle) => {
    if (!(await confirm({ title: t('Supprimer le véhicule'), message: t('Supprimer {{name}} ?', { name: vehicleName(vehicle) }), confirmLabel: t('Supprimer'), danger: true }))) return;
    try {
      await vehiclesAPI.delete(vehicle.id);
      load();
    } catch (error) {
      if (error.response?.status !== 400) return;
      if (await confirm({
        title: t('Véhicule avec réservations'),
        message: t('Ce véhicule possède des réservations et ne peut pas être supprimé. Le retirer du catalogue ?'),
        confirmLabel: t('Retirer du catalogue'), danger: true,
      })) {
        await vehiclesAPI.update(vehicle.id, { status: 'suspended' });
        load();
      }
    }
  };

  const counts = useMemo(() => vehicles.reduce((acc, v) => ({ ...acc, [v.status]: (acc[v.status] || 0) + 1 }), {}), [vehicles]);
  const visible = vehicles.filter((v) => !tab || v.status === tab);
  const totalEarned = vehicles.reduce((s, v) => s + Number(v.total_earned || 0), 0);
  const avgScore = vehicles.length ? Math.round(vehicles.reduce((s, v) => s + Number(v.condition_score || 0), 0) / vehicles.length) : 0;

  return (
    <DashboardLayout title={t('Mes Véhicules & Flotte')} subtitle={t('Gérez la visibilité, les tarifs et l’état opérationnel de vos véhicules à Douala et Yaoundé.')}
      actions={<button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary"><Icon name="add" size={20} />{t('Ajouter un véhicule')}</button>}>
      <div className="flex flex-col gap-6">
        {!online && <p className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{t('API injoignable — actualisez la page.')}</p>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Flotte référencée', value: `${vehicles.length} ${vehicles.length > 1 ? 'véhicules' : 'véhicule'}`, sub: `${counts.approved || 0} en exploitation active`, icon: 'directions_car' },
            { label: 'Locations en cours', value: `${counts.rented || 0} mission(s)`, sub: t('véhicules actuellement loués'), icon: 'key' },
            { label: 'Revenus flotte cumulés', value: `${formatNumber(totalEarned)} FCFA`, sub: t('part propriétaire nette'), icon: 'account_balance_wallet' },
            { label: 'Score qualité moyen', value: `${avgScore} / 100`, sub: t('état déclaré des véhicules'), icon: 'verified' },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card">
              <div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t(kpi.label)}</span><Icon name={kpi.icon} size={20} className="text-primary" /></div>
              <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{kpi.value}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md ${tab === item.id ? 'bg-inverse-surface text-surface-bright dark:bg-white dark:text-slate-900' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 dark:bg-slate-800'}`}>
              {item.icon && <Icon name={item.icon} size={14} className={tab === item.id ? '' : item.color} />}{t(item.label)}{counts[item.id] ? ` ${counts[item.id]}` : ''}
            </button>
          ))}
        </div>

        <div className="card p-3">
          <ListToolbar search={search} onSearchChange={setSearch} sortField={sortField} onSortFieldChange={setSortField} sortOrder={sortOrder} onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: 'created_at', label: t('Date d’ajout') }, { value: 'year', label: t('Année') },
              { value: 'computed_rate', label: t('Tarif indicatif') }, { value: 'rating', label: t('Note') },
            ]}
            placeholder={t('Rechercher par modèle, marque, immatriculation…')} />
        </div>

        <div className="rounded-xl p-4 bg-primary-fixed/30 text-on-primary-fixed-variant font-body-sm text-body-sm">
          <strong>{t('Rémunération :')}</strong> {t('vous percevez 50 % de chaque location. Votre part est bloquée en séquestre pendant la location puis versée automatiquement sur votre solde au retour du véhicule. Les véhicules doivent être validés par AutoLink avant d’apparaître au catalogue.')}
        </div>

        {loaded && !vehicles.length && (
          <div className="card text-center py-16">
            <Icon name="directions_car" size={44} className="text-outline" />
            <p className="font-headline-md text-headline-md text-on-surface dark:text-white mt-2">{t('Aucun véhicule enregistré')}</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t('Ajoutez votre premier véhicule pour commencer à gagner.')}</p>
            <button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary mt-4">{t('Ajouter un véhicule')}</button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {visible.map((v) => {
            const st = STATUS[v.status] || STATUS.pending;
            const q = qualityHint(v);
            return (
              <article key={v.id} className="card p-0 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-5 p-5">
                  <Link to={`/owner/vehicles/${v.id}`} className="relative rounded-xl overflow-hidden h-44 md:h-full min-h-[10rem] bg-surface-container">
                    <img src={vehicleImage(v)} alt={vehicleName(v)} className="w-full h-full object-cover" />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded font-label-sm text-label-sm ${TIER_BADGES[v.tier]}`}>{vehicleLabel(v.tier_label || v.tier, 'tier')}</span>
                    {(v.photos?.length || v.image_url) && <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-inverse-surface/80 text-surface-bright text-[11px] flex items-center gap-1"><Icon name="photo_library" size={12} />{v.photos?.length || 1} photos</span>}
                  </Link>
                  <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link to={`/owner/vehicles/${v.id}`} className="font-headline-lg text-headline-lg text-on-surface dark:text-white hover:text-primary">{vehicleName(v)}</Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-[11px]">{v.plate}</span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{v.city} · {vehicleLabel(v.category, 'category')} · {vehicleLabel(v.fuel, 'fuel')} · {v.seats} {t('places')}</span>
                        </div>
                        <span className={`${st.cls} mt-2 inline-flex`}>{t(st.label)}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-headline-lg text-headline-lg text-primary">{formatNumber(Number(v.daily_rate))} <span className="text-[11px]">{t('FCFA/j')}</span></div>
                        {v.computed_rate && Number(v.computed_rate) !== Number(v.daily_rate) && <div className="font-body-sm text-body-sm text-on-surface-variant">{t('indicatif')} {formatNumber(Number(v.computed_rate))} F</div>}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center gap-3">
                      <div className="relative w-11 h-11 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" className="stroke-surface-container-high" strokeWidth="4" /><circle cx="18" cy="18" r="15.5" fill="none" className={q.score >= 85 ? 'stroke-primary' : q.score >= 70 ? 'stroke-tertiary-container' : 'stroke-error'} strokeWidth="4" strokeDasharray={`${q.score} 100`} strokeLinecap="round" /></svg>
                        <span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm">{q.score}%</span>
                      </div>
                      <div className="min-w-0"><div className="font-label-md text-label-md uppercase tracking-wider">{t("Qualité d'annonce : {{s}}", { s: q.score >= 85 ? t('très bonne') : q.score >= 70 ? t('à perfectionner') : t('à compléter') })}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{t(q.text)}</div></div>
                      <Link to={`/owner/vehicles/${v.id}/edit`} className="ml-auto shrink-0 btn-secondary py-1.5 px-3">{t('Optimiser')}</Link>
                    </div>

                    {v.status === 'pending' && (
                      <p className="flex items-start gap-2 rounded-xl p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant font-body-sm text-body-sm"><Icon name="hourglass_top" size={18} className="shrink-0" />{t('En attente de validation — un contrôleur AutoLink inspectera votre véhicule avant sa mise en ligne.')}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-body-sm text-body-sm">
                      {[
                        { label: 'Caution client', value: `${formatNumber(Number(v.deposit_amount || 0))} F` },
                        { label: 'Km inclus/j', value: `${v.km_included_per_day || '—'} km` },
                        { label: 'Km supp.', value: `${v.extra_km_rate ? formatNumber(v.extra_km_rate) : '—'} F` },
                        { label: 'Votre part/jour', value: `${formatNumber(Math.round(v.daily_rate * 0.5))} F` },
                      ].map((cell) => (
                        <div key={cell.label} className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-2"><div className="font-label-md text-label-md text-on-surface dark:text-white">{t(cell.value)}</div><div className="text-on-surface-variant">{t(cell.label)}</div></div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-primary-fixed/20 p-3"><div className="font-headline-sm text-headline-sm text-primary">{formatNumber(Math.round(v.total_earned || 0))} F</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t('Gains cumulés (50 %)')}</div></div>
                      <div className="rounded-xl bg-secondary-fixed/40 p-3"><div className="font-headline-sm text-headline-sm text-secondary">{v.total_bookings || 0}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{t('Locations')}</div></div>
                      <div className={`rounded-xl p-3 ${(v.condition_score || 0) >= 85 ? 'bg-primary-fixed/20' : (v.condition_score || 0) >= 70 ? 'bg-tertiary-fixed' : 'bg-error-container/60'}`}><div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{v.condition_score || '—'}<span className="text-[11px]">/100</span></div><div className="font-body-sm text-body-sm text-on-surface-variant">{t('Score d’état')}</div></div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-outline-variant/20 bg-surface-container-low/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-x-5 gap-y-1 font-body-sm text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><Icon name="fact_check" size={16} className="text-primary" />{t('Dernière inspection :')} <strong>{v.last_inspection || '—'}</strong></span>
                  <span className="flex items-center gap-1"><Icon name="event" size={16} />{t('Contrôle technique :')} <strong>{v.technical_control_date || '—'}</strong></span>
                  <span className={`flex items-center gap-1 ${v.insurance_expiry && new Date(v.insurance_expiry) < new Date(Date.now() + 90 * 86400000) ? 'text-tertiary' : ''}`}><Icon name="shield" size={16} />{t('Assurance expire :')} <strong>{v.insurance_expiry ? formatDate(v.insurance_expiry) : '—'}</strong></span>
                  <span className="flex gap-2 ml-auto">
                    <Link to={`/owner/vehicles/${v.id}`} className="btn-secondary py-1.5 px-3"><Icon name="visibility" size={16} />{t('Détail')}</Link>
                    <Link to={`/owner/vehicles/${v.id}/edit`} className="btn-secondary py-1.5 px-3"><Icon name="edit" size={16} />{t('Modifier')}</Link>
                    <button onClick={() => remove(v)} className="btn-secondary py-1.5 px-3 text-error"><Icon name="delete" size={16} />{t('Supprimer')}</button>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
