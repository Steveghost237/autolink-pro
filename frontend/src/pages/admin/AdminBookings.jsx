import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Icon from '../../components/Icon';
import { bookingsAPI } from '../../services/api';
import { formatDate, formatNumber, formatTime, uiText } from '../../i18n';

const t = (text, options) => uiText('pages.admin.AdminBookings', text, options);

const TABS = [
  { value: '', label: 'Toutes' },
  { value: 'owner_pending', label: 'En attente propriétaire', params: { owner_response: 'pending', status: 'confirmed' } },
  { value: 'pending', label: 'Paiement en attente', params: { status: 'pending' } },
  { value: 'confirmed', label: 'Confirmées & en attente départ', params: { status: 'confirmed' } },
  { value: 'active', label: 'En cours', params: { status: 'active' } },
  { value: 'completed', label: 'Terminées', params: { status: 'completed' } },
  { value: 'disputed', label: 'Litiges', params: { status: 'disputed' } },
  { value: 'cancelled', label: 'Annulées', params: { status: 'cancelled' } },
];

const STATUS = {
  pending: { label: 'Paiement en attente', cls: 'badge-warning', icon: 'hourglass_top' },
  confirmed: { label: 'Confirmée', cls: 'badge-info', icon: 'event_available' },
  active: { label: 'En cours', cls: 'badge-success', icon: 'directions_car' },
  completed: { label: 'Terminée', cls: 'badge-neutral', icon: 'task_alt' },
  cancelled: { label: 'Annulée', cls: 'badge-neutral', icon: 'block' },
  disputed: { label: 'Litige', cls: 'badge-error', icon: 'gavel' },
};

const ESCROW = { held: 'Caution bloquée', released: 'Caution restituée', refunded: 'Remboursée', disputed: 'Caution gelée' };
const DRIVER = { none: 'Sans chauffeur', internal: 'Chauffeur AutoLink', owner: 'Chauffeur propriétaire' };
const ORDERINGS = [
  { value: 'start_date', label: 'Trier : départ le plus proche' },
  { value: '-created_at', label: 'Trier : création récente' },
  { value: '-subtotal', label: 'Trier : montant décroissant' },
];

const initialsOf = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [driverType, setDriverType] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page, page_size: pageSize, ordering, search: search.trim() || undefined, driver_type: driverType || undefined, ...(TABS.find((x) => x.value === tab)?.params || {}) };
    try {
      const { data } = await bookingsAPI.list(params);
      setRows(data.results || data || []);
      setCount(data.count ?? (data.results || data || []).length);
      setError('');
    } catch (_) { setError(t('API injoignable — réservations indisponibles.')); }
    setLoading(false);
  }, [page, pageSize, ordering, search, driverType, tab]);

  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { bookingsAPI.stats().then(({ data }) => setStats(data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [tab, search, driverType, ordering, pageSize]);

  const pages = Math.max(1, Math.ceil(count / pageSize));

  const exportCsv = () => {
    const header = ['Dossier', 'Créée le', 'Client', 'Téléphone', 'Véhicule', 'Immatriculation', 'Propriétaire', 'Début', 'Fin', 'Jours', 'Montant', 'Net propriétaire', 'Caution', 'Statut'];
    const data = rows.map((b) => [`BK-${b.id}`, b.created_at, b.client_name, b.client_phone, b.vehicle_name, b.vehicle_plate, b.owner_name, b.start_date, b.end_date, b.days, b.subtotal, b.owner_amount, b.deposit_amount, b.status]);
    const csv = [header, ...data].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'reservations-autolink.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  const kpis = [
    { label: 'Réservations totales', value: formatNumber(stats?.bookings_total || 0), icon: 'calendar_month', tone: 'bg-surface-container-low' },
    { label: 'Action requise (litiges)', value: formatNumber(stats?.bookings_disputed || 0), icon: 'notifications_active', tone: 'bg-error-container/60', accent: 'text-error' },
    { label: 'Volume brut (XAF)', value: `${formatNumber(stats?.revenue_total || 0)} FCFA`, icon: 'payments', tone: 'bg-surface-container-low' },
    { label: 'Confirmées & en cours', value: formatNumber(stats?.bookings_active || 0), icon: 'shield', tone: 'bg-surface-container-low' },
  ];

  return (
    <DashboardLayout
      title={t('Gestion des Réservations')}
      subtitle={t('Supervision centrale des réservations, réponses propriétaires et statuts de mission.')}
      actions={<button onClick={exportCsv} className="btn-secondary"><Icon name="download" size={20} />{t('Export Excel / CSV')}</button>}
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className={`rounded-xl p-4 flex items-center gap-3 ${kpi.tone} dark:bg-slate-900`}>
              <span className="w-11 h-11 rounded-xl bg-surface-container-lowest dark:bg-slate-800 flex items-center justify-center text-primary"><Icon name={kpi.icon} /></span>
              <div>
                <div className={`overline ${kpi.accent || ''}`}>{t(kpi.label)}</div>
                <div className="font-headline-md text-headline-md text-on-surface dark:text-white">{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-2 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((item) => (
            <button key={item.value} onClick={() => setTab(item.value)}
              className={`shrink-0 px-4 py-2 rounded-lg font-label-lg text-label-lg ${tab === item.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low dark:text-slate-300'}`}>
              {t(item.label)}{tab === item.value && <span className="ml-2 px-1.5 rounded-full bg-on-primary/20 text-[11px]">{count}</span>}
            </button>
          ))}
        </div>

        <div className="card p-4 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-3">
          <label className="flex items-center gap-2 px-4 rounded-xl bg-surface-container-low dark:bg-slate-900">
            <Icon name="search" size={20} className="text-outline" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Rechercher client, véhicule, immatriculation…')} className="w-full bg-transparent py-3 font-body-md text-body-md focus:outline-none dark:text-white" />
          </label>
          <select value={driverType} onChange={(e) => setDriverType(e.target.value)} className="input-field">
            <option value="">{t('Mode : tous')}</option>
            {Object.entries(DRIVER).map(([value, label]) => <option key={value} value={value}>{t(label)}</option>)}
          </select>
          <select value={ordering} onChange={(e) => setOrdering(e.target.value)} className="input-field">
            {ORDERINGS.map((o) => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
          </select>
        </div>

        {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="table-head">
                <tr>{['N° dossier & date', 'Client locataire', 'Véhicule & immat.', 'Propriétaire', 'Dates & durée', 'Montant & caution', 'Statut', ''].map((h) => <th key={h} className="px-4 py-3">{t(h)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-700">
                {rows.map((b) => {
                  const status = STATUS[b.status] || STATUS.pending;
                  const critical = b.status === 'disputed' || (b.owner_response === 'pending' && b.status === 'confirmed');
                  return (
                    <tr key={b.id} className={`${critical ? 'bg-error-container/20' : ''} hover:bg-surface-container-low/60 dark:hover:bg-slate-800/60 align-top`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">#BK-{String(b.id).padStart(4, '0')}</span>
                          {b.status === 'disputed' && <span className="px-1.5 py-0.5 rounded bg-error text-on-error text-[10px] font-bold uppercase">{t('Litige')}</span>}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Créée le {{date}} · {{time}}', { date: formatDate(b.created_at), time: formatTime(b.created_at) })}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-label-sm text-label-sm shrink-0">{initialsOf(b.client_name)}</span>
                          <div className="min-w-0">
                            <div className="font-label-lg text-label-lg text-on-surface dark:text-white truncate max-w-[160px]">{b.client_name}</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant">{b.client_phone || b.client_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {b.vehicle_image ? <img src={b.vehicle_image} alt="" className="w-14 h-10 rounded-lg object-cover" /> : <span className="w-14 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-outline"><Icon name="directions_car" size={18} /></span>}
                          <div>
                            <div className="font-label-md text-label-md text-on-surface dark:text-white">{b.vehicle_name}</div>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-[11px]">{b.vehicle_plate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-label-md text-label-md text-on-surface dark:text-white">{b.owner_name}</div>
                        <div className={`font-body-sm text-body-sm ${b.owner_response === 'pending' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                          {b.owner_response === 'pending' ? t('Réponse en attente') : b.owner_response === 'accepted' ? t('Accepté') : t('Refusé')}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-body-sm text-body-sm">
                        <div className="font-label-md text-label-md text-on-surface dark:text-white">{formatDate(b.start_date, { day: 'numeric', month: 'short' })} → {formatDate(b.end_date, { day: 'numeric', month: 'short' })}</div>
                        <div className="text-on-surface-variant">{t('{{count}} jour(s)', { count: b.days })} · {t(DRIVER[b.driver_type] || '')}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{formatNumber(b.subtotal)} <span className="font-label-sm text-label-sm">FCFA</span></div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{t('Net bailleur : {{n}} FCFA', { n: formatNumber(b.owner_amount) })}</div>
                        {b.escrow_status && <div className="flex items-center gap-1 font-body-sm text-body-sm text-primary"><Icon name="lock" size={14} />{t(ESCROW[b.escrow_status] || b.escrow_status)}</div>}
                      </td>
                      <td className="px-4 py-4"><span className={status.cls}><Icon name={status.icon} size={14} />{t(status.label)}</span></td>
                      <td className="px-4 py-4">
                        <Link to={`/admin/bookings/${b.id}`} className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant" title={t('Ouvrir le dossier')}><Icon name="open_in_new" size={18} /></Link>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-on-surface-variant">{loading ? t('Chargement…') : t('Aucune réservation pour ces filtres.')}</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-surface-container-low/60 dark:bg-slate-900">
            <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
              {t('Affichage de {{from}} à {{to}} sur {{total}} réservations', { from: count ? (page - 1) * pageSize + 1 : 0, to: Math.min(page * pageSize, count), total: count })}
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-2 py-1 dark:bg-slate-800">
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="w-8 h-8 rounded-lg hover:bg-surface-container disabled:opacity-40 flex items-center justify-center"><Icon name="chevron_left" /></button>
              <span className="px-3 py-1 rounded-lg bg-primary text-on-primary font-label-md text-label-md">{page} / {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="w-8 h-8 rounded-lg hover:bg-surface-container disabled:opacity-40 flex items-center justify-center"><Icon name="chevron_right" /></button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
