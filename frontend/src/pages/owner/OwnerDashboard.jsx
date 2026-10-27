import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import Icon from '../../components/Icon';
import { bookingsAPI, vehiclesAPI, notificationsAPI, walletAPI, siteAPI } from '../../services/api';
import { vehicleImage, vehicleName } from '../../utils/vehicles';
import { formatNumber, formatDate, formatDateTime, uiText, vehicleLabel } from '../../i18n';

const t = (text, options) => uiText('pages.owner.OwnerDashboard', text, options);
const POLL = 30000;

const B_STATUS = {
  pending: { label: 'Attente paiement', cls: 'badge-warning' },
  confirmed: { label: 'Confirmée', cls: 'badge-info' },
  active: { label: 'En cours', cls: 'badge-success' },
  completed: { label: 'Terminée', cls: 'badge-neutral' },
  cancelled: { label: 'Annulée', cls: 'badge-neutral' },
  disputed: { label: 'Litige', cls: 'badge-error' },
};

const countdown = (deadlineTs) => {
  const ms = deadlineTs - Date.now();
  if (!deadlineTs || ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m`;
};

export default function OwnerDashboard() {
  const confirm = useConfirm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [notificationSearch, setNotificationSearch] = useState('');
  const [notificationSortField, setNotificationSortField] = useState('created_at');
  const [notificationSortOrder, setNotificationSortOrder] = useState('desc');
  const [wallet, setWallet] = useState(null);
  const [responseHours, setResponseHours] = useState(48);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [v, b, r, n, w] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 100 }),
        bookingsAPI.ownerRequests({ status: 'pending' }).catch(() => ({ data: { results: [] } })),
        notificationsAPI.list({ search: notificationSearch.trim(), ordering: `${notificationSortOrder === 'desc' ? '-' : ''}${notificationSortField}` }),
        walletAPI.get(),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setRequests(r.data.results || r.data || []);
      setNotifs(n.data.results || []);
      setWallet(w.data);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, [notificationSearch, notificationSortField, notificationSortOrder]);

  useEffect(() => { siteAPI.config().then(({ data }) => setResponseHours(data.owner_response_hours || 48)).catch(() => {}); }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL);
    return () => clearInterval(timer);
  }, [load]);

  const answer = async (booking, accept) => {
    const ok = await confirm({
      title: accept ? t('Accepter cette demande ?') : t('Refuser cette demande ?'),
      message: accept
        ? t('Le client sera informé que son {{v}} est réservé.', { v: booking.vehicle_name })
        : t('La réservation sera annulée et le client intégralement remboursé.'),
      confirmLabel: accept ? t('Accepter') : t('Refuser'), danger: !accept,
    });
    if (!ok) return;
    setBusy(booking.id);
    try {
      if (accept) await bookingsAPI.ownerAccept(booking.id);
      else await bookingsAPI.ownerRefuse(booking.id, '');
      await load();
    } catch (_) {}
    setBusy(null);
  };

  const markVehicleBack = async (bookingId) => {
    if (!(await confirm({
      title: t('Clôturer cette location ?'),
      message: t('La fin de location clôturera la réservation et déclenchera votre versement.'),
      confirmLabel: t('Confirmer la fin'),
    }))) return;
    setBusy(bookingId);
    try { await bookingsAPI.updateStatus(bookingId, 'completed'); await load(); } catch (_) {}
    setBusy(null);
  };

  const done = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const totalEarned = done.reduce((s, b) => s + Number(b.owner_amount || 0), 0);
  const approvedVehicles = vehicles.filter((v) => v.status === 'approved').length;
  const upcoming = bookings.filter((b) => ['confirmed', 'active'].includes(b.status)).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const avgRating = vehicles.length ? vehicles.reduce((s, v) => s + Number(v.rating || 0), 0) / vehicles.filter((v) => v.rating).length || 0 : 0;

  // Évolution des revenus mensuels (part propriétaire)
  const monthly = useMemo(() => {
    const months = [];
    const cursor = new Date(); cursor.setDate(1);
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const total = done.filter((b) => {
        const end = new Date(b.end_date);
        return `${end.getFullYear()}-${end.getMonth()}` === key;
      }).reduce((s, b) => s + Number(b.owner_amount || 0), 0);
      months.push({ label: formatDate(d, { month: 'short' }), total });
    }
    return months;
  }, [done]);
  const maxMonth = Math.max(1, ...monthly.map((m) => m.total));

  // Taux d'occupation : jours réservés / jours disponibles ce mois
  const occupancy = useMemo(() => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const fleetDays = approvedVehicles * daysInMonth;
    if (!fleetDays) return 0;
    const rented = bookings.filter((b) => ['confirmed', 'active', 'completed'].includes(b.status)).reduce((s, b) => s + Number(b.days || 0), 0);
    return Math.min(100, Math.round((rented / fleetDays) * 100));
  }, [approvedVehicles, bookings]);

  return (
    <DashboardLayout title={t('Tableau de bord Propriétaire')}
      actions={<button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary"><Icon name="add" size={20} />{t('Ajouter un véhicule')}</button>}>
      <div className="flex flex-col gap-6">

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
          <div className="card flex flex-col gap-3 justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-info">{t('Flotte {{city}}', { city: user?.city || 'Douala & Yaoundé' })}</span>
              <span className={`font-body-sm text-body-sm ${online ? 'text-primary' : 'text-error'}`}>{online ? t('· Synchronisé') : t('· API injoignable')}</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white">{t('Tableau de bord Propriétaire')}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{t('Bonjour {{name}}, voici les performances consolidées et les réservations urgentes de votre flotte au Cameroun.', { name: user?.firstName || '' })}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => navigate('/owner/requests')} className="btn-secondary py-2"><Icon name="inbox" size={18} />{t('Demandes de location')} {requests.length > 0 && <span className="ml-1 px-1.5 rounded-full bg-error text-on-error text-[11px]">{requests.length}</span>}</button>
              <button onClick={load} className="btn-secondary py-2"><Icon name="refresh" size={18} />{t('Actualiser')}</button>
            </div>
          </div>

          <div className="card-dark flex flex-col gap-4 relative overflow-hidden">
            <span className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant flex items-center gap-1.5"><Icon name="account_balance_wallet" size={18} className="text-primary-fixed-dim" />{t('Solde disponible au retrait')}</span>
              <span className="badge-primary">{t('Instantané')}</span>
            </div>
            <div className="relative font-display-lg text-display-lg text-surface-bright">{formatNumber(wallet?.balance ?? 0)} <span className="font-label-lg text-label-lg text-primary-fixed-dim">FCFA</span></div>
            <div className="relative grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-highest/20"><div className="overline text-surface-variant">{t('Revenus versés (cumul)')}</div><div className="font-headline-sm text-headline-sm text-surface-bright">{formatNumber(totalEarned)} FCFA</div></div>
              <div className="p-3 rounded-xl bg-surface-container-highest/20"><div className="overline text-surface-variant">{t('Véhicules en ligne')}</div><div className="font-headline-sm text-headline-sm text-surface-bright">{approvedVehicles} / {vehicles.length}</div></div>
            </div>
            <button onClick={() => navigate('/owner/revenue')} className="relative btn-primary justify-center">{t('Retirer mes revenus')}<Icon name="arrow_forward" size={18} /></button>
            <div className="relative flex justify-center gap-4 font-body-sm text-body-sm text-surface-variant"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />MTN MoMo</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />Orange Money</span></div>
          </div>
        </div>

        {/* Demandes urgentes */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="emergency" className="text-error" />{t('Demandes à traiter en priorité')}{requests.length > 0 && <span className="badge-error">{t('{{n}} urgente(s)', { n: requests.length })}</span>}</h3>
            <Link to="/owner/requests" className="font-label-md text-label-md text-primary">{t('Voir toutes les demandes')} →</Link>
          </div>
          {requests.length === 0 && <div className="card py-6 text-center font-body-md text-body-md text-on-surface-variant">{t('Aucune demande en attente — vous êtes à jour.')}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.slice(0, 4).map((r) => {
              const vehicle = vehicles.find((v) => v.id === r.vehicle);
              const ttl = countdown(new Date(r.created_at).getTime() + responseHours * 3600000);
              return (
                <div key={r.id} className="card flex flex-col gap-3 ring-1 ring-error/20">
                  <div className="flex gap-3">
                    <img src={vehicleImage(vehicle || r)} alt="" className="w-24 h-20 rounded-lg object-cover bg-surface-container" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2"><Link to={`/client/bookings/${r.id}`} className="font-headline-sm text-headline-sm text-on-surface dark:text-white truncate hover:text-primary">{r.vehicle_name}</Link>
                        <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-[11px] h-fit">{vehicle?.plate || ''}</span></div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{t('{{n}} j · {{s}} au {{e}}', { n: r.days, s: formatDate(r.start_date), e: formatDate(r.end_date) })}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1"><Icon name="person" size={14} />{r.client_name}{r.driver_type !== 'none' && ` · ${t(r.driver_type === 'internal' ? 'Chauffeur AutoLink' : 'Votre chauffeur requis')}`}</div>
                    </div>
                    <div className="text-right shrink-0"><div className="overline">{t('Gain net')}</div><div className="font-headline-sm text-headline-sm text-primary">{formatNumber(r.owner_amount)} <span className="text-[11px]">FCFA</span></div></div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {ttl ? <span className="flex items-center gap-1 font-label-sm text-label-sm text-error"><Icon name="timer" size={16} />{t('Expire dans {{t}}', { t: ttl })}</span> : <span />}
                    <span className="flex gap-2 ml-auto">
                      <button onClick={() => answer(r, false)} disabled={busy === r.id} className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">{t('Refuser')}</button>
                      <button onClick={() => answer(r, true)} disabled={busy === r.id} className="btn-primary py-2 px-4"><Icon name="check_circle" size={18} />{t('Accepter')}</button>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Taux d'occupation", value: `${occupancy} %`, icon: 'speed', sub: t('jours réservés / disponibles') },
            { label: 'Note moyenne flotte', value: vehicles.some((v) => v.rating) ? `${avgRating.toFixed(2)} / 5` : '—', icon: 'star', sub: t('sur les avis clients') },
            { label: 'Véhicules en ligne', value: `${approvedVehicles} / ${vehicles.length}`, icon: 'directions_car', sub: t('en révision ou suspendus hors ligne') },
            { label: 'Locations actives', value: upcoming.length, icon: 'event_available', sub: t('confirmées ou en cours') },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card">
              <div className="flex items-center justify-between"><span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{t(kpi.label)}</span><Icon name={kpi.icon} size={20} className="text-primary" /></div>
              <div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{kpi.value}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* Graphique revenus */}
          <div className="card flex flex-col gap-4">
            <div className="flex items-center justify-between"><h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Évolution des revenus locatifs')}</h3><span className="badge-neutral">{t('6 derniers mois')}</span></div>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-3">{t('Montants nets perçus après commission plateforme (FCFA)')}</p>
            <div className="flex items-end gap-4 h-44">
              {monthly.map((month, i) => (
                <div key={month.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div title={`${formatNumber(month.total)} FCFA`} className={`w-full rounded-t-xl ${i === monthly.length - 1 ? 'bg-primary' : 'bg-secondary-container'}`} style={{ height: `${Math.max(4, (month.total / maxMonth) * 100)}%` }} />
                  <span className={`font-label-sm text-label-sm ${i === monthly.length - 1 ? 'text-primary' : 'text-on-surface-variant'}`}>{month.label}</span>
                </div>
              ))}
            </div>
            {/* Commission info */}
            <div className="rounded-xl p-4 bg-primary-fixed/30 text-on-primary-fixed-variant flex items-start gap-3">
              <Icon name="shield" className="text-primary shrink-0" />
              <p className="font-body-sm text-body-sm">{t('Votre part (50 % de chaque location) est bloquée en séquestre pendant la location puis versée automatiquement sur votre solde au retour du véhicule.')}</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="card flex flex-col gap-3">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="notifications" className="text-primary" />{t('Notifications')}</h3>
            <ListToolbar search={notificationSearch} onSearchChange={setNotificationSearch} sortField={notificationSortField} onSortFieldChange={setNotificationSortField} sortOrder={notificationSortOrder} onSortOrderChange={setNotificationSortOrder}
              sortOptions={[{ value: 'created_at', label: t('Date') }, { value: 'title', label: t('Titre') }, { value: 'is_read', label: t('Statut') }]}
              placeholder={t('Rechercher une notification')} />
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {notifs.slice(0, 8).map((n) => (
                <div key={n.id} className={`p-3 rounded-xl font-body-sm text-body-sm ${n.is_read ? 'bg-surface-container-low text-on-surface-variant dark:bg-slate-900' : 'bg-primary-fixed/20 border border-primary-fixed/40 text-on-surface dark:text-white'}`}>
                  <span className="font-label-md text-label-md">{n.title}</span> — {n.message}
                </div>
              ))}
              {!notifs.length && <p className="py-4 text-center font-body-sm text-body-sm text-on-surface-variant">{t('Aucune notification trouvée.')}</p>}
            </div>
            <Link to="/notifications" className="btn-secondary py-2 mt-auto">{t('Tout voir')}</Link>
          </div>
        </div>

        {/* Planning des locations */}
        <section className="card p-0 overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div><h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Prochaines locations confirmées')}</h3><p className="font-body-sm text-body-sm text-on-surface-variant">{t('Planning immédiat des départs et prises en charge')}</p></div>
            <Link to="/owner/requests" className="btn-secondary py-2">{t('Calendrier complet')}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-md">
              <thead className="table-head">
                <tr><th className="px-5 py-3">{t('Véhicule')}</th><th className="px-5 py-3">{t('Locataire')}</th><th className="px-5 py-3">{t('Période')}</th><th className="px-5 py-3">{t('Conduite')}</th><th className="px-5 py-3">{t('Statut')}</th><th className="px-5 py-3">{t('Actions')}</th></tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 6).map((b) => (
                  <tr key={b.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/60">
                    <td className="px-5 py-3"><Link to={`/client/bookings/${b.id}`} className="font-label-lg text-label-lg text-on-surface dark:text-white hover:text-primary">{b.vehicle_name}</Link></td>
                    <td className="px-5 py-3">{b.client_name}{b.client_phone && <div className="font-body-sm text-body-sm text-on-surface-variant">{b.client_phone}</div>}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(b.start_date)} → {formatDate(b.end_date)}<div className="font-body-sm text-body-sm text-on-surface-variant">{t('{{n}} j', { n: b.days })}</div></td>
                    <td className="px-5 py-3"><span className="badge-neutral">{b.driver_type === 'owner' ? t('Votre chauffeur') : b.driver_type === 'internal' ? t('Chauffeur AutoLink') : t('Auto-partage')}</span></td>
                    <td className="px-5 py-3"><span className={B_STATUS[b.status]?.cls}>{t(B_STATUS[b.status]?.label)}</span></td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {['confirmed', 'active'].includes(b.status) && <button onClick={() => markVehicleBack(b.id)} disabled={busy === b.id} className="btn-secondary py-1.5 px-3"><Icon name="check" size={16} />{busy === b.id ? t('…') : t('Véhicule récupéré')}</button>}
                      <Link to={`/messages?booking=${b.id}`} className="ml-2 btn-secondary py-1.5 px-3"><Icon name="chat" size={16} /></Link>
                    </td>
                  </tr>
                ))}
                {!upcoming.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">{t('Aucune location à venir.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
