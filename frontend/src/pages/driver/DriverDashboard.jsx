import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { bookingsAPI, driversAPI, vehiclesAPI } from '../../services/api';
import { Car, CheckCircle, Clock, MapPin, Phone, Star, Wifi, WifiOff } from 'lucide-react';
import { formatDate, formatNumber,  uiText } from '../../i18n';

const SORT_OPTIONS = [
  { value: 'start_date', label: uiText("pages.driver.DriverDashboard", "Date de début") },
  { value: 'end_date', label: uiText("pages.driver.DriverDashboard", "Date de fin") },
  { value: 'status', label: uiText("pages.driver.DriverDashboard", "Statut") },
];
const EARNING_SORT_OPTIONS = [
  { value: 'created_at', label: uiText("pages.driver.DriverDashboard", "Date") },
  { value: 'amount', label: uiText("pages.driver.DriverDashboard", "Montant") },
  { value: 'booking__start_date', label: uiText("pages.driver.DriverDashboard", "Date de course") },
];
const STATUS = {
  pending: uiText("pages.driver.DriverDashboard", "En attente"),
  confirmed: uiText("pages.driver.DriverDashboard", "À venir"),
  active: uiText("pages.driver.DriverDashboard", "En cours"),
  completed: uiText("pages.driver.DriverDashboard", "Terminée"),
  cancelled: uiText("pages.driver.DriverDashboard", "Annulée"),
};

export default function DriverDashboard() {
  const confirm = useConfirm();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSortField, setLedgerSortField] = useState('created_at');
  const [ledgerSortOrder, setLedgerSortOrder] = useState('desc');
  const [bookings, setBookings] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('start_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [bookingResponse, profileResponse, earningsResponse] = await Promise.all([
        bookingsAPI.list({
          page, page_size: 20, search: search.trim(), status: status || undefined,
          ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
        }),
        driversAPI.profiles({ page_size: 1 }),
        driversAPI.earnings(),
      ]);
      setBookings(bookingResponse.data.results || []);
      setCount(bookingResponse.data.count ?? 0);
      setProfile((profileResponse.data.results || [])[0] || null);
      setEarnings(earningsResponse.data);
      setError('');
    } catch (_) {
      setError(uiText("pages.driver.DriverDashboard", "Impossible de charger votre espace chauffeur."));
    }
  }, [page, search, status, sortField, sortOrder]);
  useEffect(() => { load(); }, [load]);

  const loadLedger = useCallback(async () => {
    try {
      const { data } = await driversAPI.earningLedger({
        page: ledgerPage, page_size: 20, search: ledgerSearch.trim(),
        ordering: `${ledgerSortOrder === 'desc' ? '-' : ''}${ledgerSortField}`,
      });
      setLedger(data.results || []);
      setLedgerCount(data.count ?? 0);
    } catch (_) {
      setLedger([]);
      setLedgerCount(0);
    }
  }, [ledgerPage, ledgerSearch, ledgerSortField, ledgerSortOrder]);
  useEffect(() => { loadLedger(); }, [loadLedger]);

  useEffect(() => {
    if (!profile?.assigned_vehicle) { setVehicle(null); return; }
    vehiclesAPI.detail(profile.assigned_vehicle).then(response => setVehicle(response.data)).catch(() => setVehicle(null));
  }, [profile?.assigned_vehicle]);

  const setAvailability = async () => {
    try {
      const { data } = await driversAPI.availability(!profile?.is_online);
      setProfile(data);
    } catch (_) { setError(uiText("pages.driver.DriverDashboard", "La disponibilité n’a pas pu être modifiée.")); }
  };

  const actOnRide = async (booking, action) => {
    if (action === 'refuse' && !(await confirm({
      title: uiText("pages.driver.DriverDashboard", "Refuser cette course ?"),
      message: uiText("pages.driver.DriverDashboard", "Le refus sera enregistré dans votre dossier de course."),
      confirmLabel: uiText("pages.driver.DriverDashboard", "Refuser"), danger: true,
    }))) return;
    if (action === 'finish' && !(await confirm({
      title: uiText("pages.driver.DriverDashboard", "Terminer cette course ?"),
      message: uiText("pages.driver.DriverDashboard", "La course sera clôturée."),
      confirmLabel: uiText("pages.driver.DriverDashboard", "Terminer"),
    }))) return;
    setBusy(booking.id);
    try {
      if (action === 'accept') await bookingsAPI.acceptDriverRide(booking.id);
      if (action === 'refuse') await bookingsAPI.refuseDriverRide(booking.id);
      if (action === 'start') await bookingsAPI.updateStatus(booking.id, 'active');
      if (action === 'finish') await bookingsAPI.updateStatus(booking.id, 'completed');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.driver.DriverDashboard", "Cette action n’a pas pu être réalisée."));
    } finally {
      setBusy(null);
    }
  };

  const monthLabel = value => formatDate(new Date(value), { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout title={uiText("pages.driver.DriverDashboard", "Espace chauffeur")}>
      <div className="mx-auto max-w-6xl space-y-5">
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <section className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-slate-900 to-primary-900 text-white">
          <div>
            <h2 className="text-2xl font-bold">{uiText("pages.driver.DriverDashboard", "Bonjour,") + " "}{user?.first_name || user?.username}</h2>
            <p className="text-sm text-white/70">{uiText("pages.driver.DriverDashboard", "Gérez votre disponibilité et les courses qui vous sont attribuées.")}</p>
          </div>
          {profile && <button onClick={setAvailability} className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold ${profile.is_online ? 'bg-primary' : 'bg-slate-600'}`}>
            {profile.is_online ? <Wifi size={17} /> : <WifiOff size={17} />}
            {profile.is_online ? uiText("pages.driver.DriverDashboard", "En ligne") : uiText("pages.driver.DriverDashboard", "Hors ligne")}
          </button>}
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [uiText("pages.driver.DriverDashboard", "Note"), profile ? `${formatNumber(Number(profile.rating), { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5` : '—', Star],
            [uiText("pages.driver.DriverDashboard", "Courses terminées"), earnings?.total_trips ?? 0, CheckCircle],
            [uiText("pages.driver.DriverDashboard", "Gains enregistrés"), earnings ? `${formatNumber(Number(earnings.total_earned))} FCFA` : '—', Car],
            [uiText("pages.driver.DriverDashboard", "Véhicule attribué"), vehicle ? `${vehicle.brand} ${vehicle.model}` : profile?.assigned_vehicle ? uiText("pages.driver.DriverDashboard", "Véhicule #{{id}}", { id: profile.assigned_vehicle }) : uiText("pages.driver.DriverDashboard", "Aucun"), Car],
          ].map(([label, value, Icon]) => <div key={label} className="card flex items-center gap-3">
            <Icon size={20} className="text-primary-600" /><div><div className="font-bold">{value}</div><div className="text-xs text-on-surface-variant">{label}</div></div>
          </div>)}
        </div>

        <section className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-bold">{uiText("pages.driver.DriverDashboard", "Mes courses")}</h2><p className="text-sm text-on-surface-variant">{count}{" " + uiText("pages.driver.DriverDashboard", "course(s)")}</p></div>
            {vehicle && <p className="text-sm text-on-surface-variant">{uiText("pages.driver.DriverDashboard", "Véhicule attribué :") + " "}{vehicle.brand} {vehicle.model}{" " + uiText("pages.driver.DriverDashboard", "·") + " "}{vehicle.plate}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
              sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
              sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
              sortOptions={SORT_OPTIONS} placeholder={uiText("pages.driver.DriverDashboard", "Rechercher client, véhicule, adresse")} />
            <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
              <option value="">{uiText("pages.driver.DriverDashboard", "Tous les statuts")}</option>
              {Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {bookings.map(booking => (
              <article key={booking.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{booking.client_name}{" " + uiText("pages.driver.DriverDashboard", "·") + " "}{booking.vehicle_name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant"><Clock size={14} />{booking.start_date}{" " + uiText("pages.driver.DriverDashboard", "→") + " "}{booking.end_date}{" " + uiText("pages.driver.DriverDashboard", "·") + " "}{STATUS[booking.status] || booking.status}</p>
                    {booking.client_phone && <a href={`tel:${booking.client_phone}`} className="mt-1 inline-flex items-center gap-1 text-sm text-primary-600"><Phone size={14} />{booking.client_phone}</a>}
                    {booking.pickup_address && <a className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickup_address)}`}><MapPin size={14} />{uiText("pages.driver.DriverDashboard", "Départ :") + " "}{booking.pickup_address}</a>}
                    {booking.dropoff_address && <a className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.dropoff_address)}`}><MapPin size={14} />{uiText("pages.driver.DriverDashboard", "Arrivée :") + " "}{booking.dropoff_address}</a>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {booking.status === 'confirmed' && booking.driver_response === 'offered' && <>
                      <button disabled={busy === booking.id} className="btn-primary" onClick={() => actOnRide(booking, 'accept')}>{uiText("pages.driver.DriverDashboard", "Accepter")}</button>
                      <button disabled={busy === booking.id} className="btn-outline text-error" onClick={() => actOnRide(booking, 'refuse')}>{uiText("pages.driver.DriverDashboard", "Refuser")}</button>
                    </>}
                    {booking.status === 'confirmed' && booking.driver_response === 'accepted' && <button disabled={busy === booking.id} className="btn-primary" onClick={() => actOnRide(booking, 'start')}>{uiText("pages.driver.DriverDashboard", "Démarrer")}</button>}
                    {booking.status === 'active' && <button disabled={busy === booking.id} className="btn-primary" onClick={() => actOnRide(booking, 'finish')}>{uiText("pages.driver.DriverDashboard", "Terminer la course")}</button>}
                  </div>
                </div>
              </article>
            ))}
            {bookings.length === 0 && <p className="py-8 text-center text-on-surface-variant">{uiText("pages.driver.DriverDashboard", "Aucune course ne correspond à votre recherche.")}</p>}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span>{uiText("pages.driver.DriverDashboard", "Page") + " "}{page}{" " + uiText("pages.driver.DriverDashboard", "/") + " "}{Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.driver.DriverDashboard", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.driver.DriverDashboard", "Suivant")}</button>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-3 font-bold">{uiText("pages.driver.DriverDashboard", "Gains mensuels")}</h2>
          {(earnings?.monthly_earnings || []).every(item => !Number(item.earnings)) && <p className="text-sm text-on-surface-variant">{uiText("pages.driver.DriverDashboard", "Aucun gain enregistré.")}</p>}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(earnings?.monthly_earnings || []).map(item => (
              <div key={item.month} className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-3 text-sm">
                <div className="font-semibold">{monthLabel(`${item.month}-01`)}</div>
                <div className="text-on-surface-variant">{Number(item.trips || 0)}{" " + uiText("pages.driver.DriverDashboard", "course(s) ·") + " "}{formatNumber(Number(item.earnings || 0))}{" " + uiText("pages.driver.DriverDashboard", "F")}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="card space-y-4">
          <div><h2 className="font-bold">{uiText("pages.driver.DriverDashboard", "Historique des gains")}</h2><p className="text-sm text-on-surface-variant">{ledgerCount}{" " + uiText("pages.driver.DriverDashboard", "écriture(s)")}</p></div>
          <ListToolbar search={ledgerSearch} onSearchChange={value => { setLedgerSearch(value); setLedgerPage(1); }}
            sortField={ledgerSortField} onSortFieldChange={value => { setLedgerSortField(value); setLedgerPage(1); }}
            sortOrder={ledgerSortOrder} onSortOrderChange={value => { setLedgerSortOrder(value); setLedgerPage(1); }}
            sortOptions={EARNING_SORT_OPTIONS} placeholder={uiText("pages.driver.DriverDashboard", "Rechercher par véhicule ou client")} />
          <div className="divide-y">
            {ledger.map(entry => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div><div className="font-semibold">{entry.booking_reference}{" " + uiText("pages.driver.DriverDashboard", "·") + " "}{entry.vehicle_name}</div><div className="text-on-surface-variant">{formatDate(new Date(entry.created_at))}</div></div>
                <strong className="text-primary">{uiText("pages.driver.DriverDashboard", "+")}{formatNumber(Number(entry.amount))}{" " + uiText("pages.driver.DriverDashboard", "F")}</strong>
              </div>
            ))}
            {ledger.length === 0 && <p className="py-6 text-center text-sm text-on-surface-variant">{uiText("pages.driver.DriverDashboard", "Aucun gain correspondant à votre recherche.")}</p>}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span>{uiText("pages.driver.DriverDashboard", "Page") + " "}{ledgerPage}{" " + uiText("pages.driver.DriverDashboard", "/") + " "}{Math.max(1, Math.ceil(ledgerCount / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={ledgerPage <= 1} onClick={() => setLedgerPage(value => value - 1)}>{uiText("pages.driver.DriverDashboard", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={ledgerPage * 20 >= ledgerCount} onClick={() => setLedgerPage(value => value + 1)}>{uiText("pages.driver.DriverDashboard", "Suivant")}</button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
