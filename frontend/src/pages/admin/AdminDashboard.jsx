import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI, usersAPI, vehiclesAPI } from '../../services/api';
import {
  Users, Car, DollarSign, TrendingUp, UserCheck, ClipboardList,
  ArrowRight, AlertTriangle, CheckCircle, Clock, Shield, RefreshCw,
  XCircle, CheckCircle2, Wifi, WifiOff
} from 'lucide-react';
import { formatTime, formatNumber,  uiText } from '../../i18n';

const POLL_INTERVAL = 8000; // rafraîchissement toutes les 8s

const STATUS_STYLE = {
  pending:   { label: uiText("pages.admin.AdminDashboard", "Attente paiement"), cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: uiText("pages.admin.AdminDashboard", "Confirmée"),  cls: 'bg-blue-100 text-blue-700' },
  active:    { label: uiText("pages.admin.AdminDashboard", "En cours"),   cls: 'bg-purple-100 text-purple-700' },
  completed: { label: uiText("pages.admin.AdminDashboard", "Terminée"),   cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: uiText("pages.admin.AdminDashboard", "Annulée"),    cls: 'bg-red-100 text-red-700' },
  disputed:  { label: uiText("pages.admin.AdminDashboard", "Litige"),     cls: 'bg-red-100 text-red-700' },
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return uiText("pages.admin.AdminDashboard", "il y a {{count}} s", { count: diff });
  if (diff < 3600) return uiText("pages.admin.AdminDashboard", "il y a {{count}} min", { count: Math.floor(diff / 60) });
  if (diff < 86400) return uiText("pages.admin.AdminDashboard", "il y a {{count}} h", { count: Math.floor(diff / 3600) });
  return uiText("pages.admin.AdminDashboard", "il y a {{count}} j", { count: Math.floor(diff / 86400) });
};

export default function AdminDashboard() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [busy, setBusy] = useState(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingSortField, setBookingSortField] = useState('created_at');
  const [bookingSortOrder, setBookingSortOrder] = useState('desc');
  const [userSearch, setUserSearch] = useState('');
  const [userSortField, setUserSortField] = useState('created_at');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleSortField, setVehicleSortField] = useState('created_at');
  const [vehicleSortOrder, setVehicleSortOrder] = useState('desc');

  const fetchAll = useCallback(async () => {
    try {
      const [s, b, u, v] = await Promise.all([
        bookingsAPI.stats(),
        bookingsAPI.list({
          page_size: 50,
          search: bookingSearch.trim(),
          ordering: `${bookingSortOrder === 'desc' ? '-' : ''}${bookingSortField}`,
        }),
        usersAPI.list({
          page_size: 50,
          search: userSearch.trim(),
          ordering: `${userSortOrder === 'desc' ? '-' : ''}${userSortField}`,
        }),
        vehiclesAPI.list({
          page_size: 50,
          search: vehicleSearch.trim(),
          ordering: `${vehicleSortOrder === 'desc' ? '-' : ''}${vehicleSortField}`,
        }),
      ]);
      setStats(s.data);
      setBookings(b.data.results || b.data);
      setUsers(u.data.results || u.data);
      setVehicles(v.data.results || v.data);
      setOnline(true);
      setLastSync(new Date());
    } catch (_) {
      setOnline(false);
    }
  }, [
    bookingSearch, bookingSortField, bookingSortOrder,
    userSearch, userSortField, userSortOrder,
    vehicleSearch, vehicleSortField, vehicleSortOrder,
  ]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchAll]);

  const resolveDispute = async (booking, decision) => {
    const refund = decision === 'refund';
    const confirmed = await confirm({
      title: refund ? uiText("pages.admin.AdminDashboard", "Rembourser le client ?") : uiText("pages.admin.AdminDashboard", "Payer le propriétaire ?"),
      message: refund
        ? uiText("pages.admin.AdminDashboard", "Le paiement et la caution applicables seront remboursés au client. Cette décision clôturera le litige.")
        : uiText("pages.admin.AdminDashboard", "Les fonds bloqués seront versés au propriétaire. Cette décision clôturera le litige."),
      confirmLabel: refund ? uiText("pages.admin.AdminDashboard", "Rembourser") : uiText("pages.admin.AdminDashboard", "Payer le propriétaire"),
      danger: refund,
    });
    if (!confirmed) return;
    setBusy(booking.id);
    try {
      await bookingsAPI.resolveDispute(booking.id, decision);
      await fetchAll();
    } catch (_) {}
    setBusy(null);
  };

  const toggleUserActive = async (u) => {
    if (u.is_active) {
      const confirmed = await confirm({
        title: uiText("pages.admin.AdminDashboard", "Suspendre ce compte ?"),
        message: uiText("pages.admin.AdminDashboard", "Le compte de {{name}} ne pourra plus se connecter.", { name: u.first_name || u.username }),
        confirmLabel: uiText("pages.admin.AdminDashboard", "Suspendre"),
        danger: true,
      });
      if (!confirmed) return;
    }
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      await fetchAll();
    } catch (_) {}
  };

  const setVehicleStatus = async (v, status) => {
    const approved = status === 'approved';
    const confirmed = await confirm({
      title: approved ? uiText("pages.admin.AdminDashboard", "Approuver ce véhicule ?") : uiText("pages.admin.AdminDashboard", "Suspendre ce véhicule ?"),
      message: uiText("pages.admin.AdminDashboard", "{{vehicle}} sera {{status}}.", { vehicle: `${v.brand} ${v.model} (${v.plate})`, status: approved ? uiText("pages.admin.AdminDashboard", "mis en ligne") : uiText("pages.admin.AdminDashboard", "refusé et suspendu") }),
      confirmLabel: approved ? uiText("pages.admin.AdminDashboard", "Approuver") : uiText("pages.admin.AdminDashboard", "Suspendre"),
      danger: !approved,
    });
    if (!confirmed) return;
    try {
      await vehiclesAPI.update(v.id, { status });
      await fetchAll();
    } catch (_) {}
  };

  const disputedBookings = bookings.filter(b => b.status === 'disputed');
  const pendingVehicles = vehicles.filter(v => v.status === 'pending');

  return (
    <DashboardLayout title={uiText("pages.admin.AdminDashboard", "Tableau de bord Admin")}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Bandeau connexion temps réel */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${online ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            {online
              ? uiText("pages.admin.AdminDashboard", "Connecté à l'API — dernière synchro {{time}}", { time: lastSync ? formatTime(lastSync) : '…' })
              : uiText("pages.admin.AdminDashboard", "API injoignable — vérifiez votre connexion")}
          </div>
          <button onClick={fetchAll} className="flex items-center gap-1 underline">
            <RefreshCw size={13} />{" " + uiText("pages.admin.AdminDashboard", "Actualiser") + " "}</button>
        </div>

        {/* Alertes — cas exceptionnels uniquement */}
        {(disputedBookings.length > 0 || pendingVehicles.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              {disputedBookings.length > 0 && <><strong>{disputedBookings.length}{" " + uiText("pages.admin.AdminDashboard", "litige(s)")}</strong>{" " + uiText("pages.admin.AdminDashboard", "à arbitrer.") + " "}</>}
              {pendingVehicles.length > 0 && <><strong>{pendingVehicles.length}{" " + uiText("pages.admin.AdminDashboard", "véhicule(s)")}</strong>{" " + uiText("pages.admin.AdminDashboard", "à vérifier avant mise en ligne.")}</>}
            </div>
          </div>
        )}

        {/* KPIs temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: uiText("pages.admin.AdminDashboard", "Utilisateurs"), value: stats?.users ?? '—', color: 'text-blue-600 bg-blue-50' },
            { icon: Car, label: uiText("pages.admin.AdminDashboard", "Véhicules"), value: stats?.vehicles ?? '—', color: 'text-primary-600 bg-primary-50' },
            { icon: TrendingUp, label: uiText("pages.admin.AdminDashboard", "Réservations"), value: stats?.bookings_total ?? '—', color: 'text-purple-600 bg-purple-50' },
            { icon: DollarSign, label: uiText("pages.admin.AdminDashboard", "Commission totale"), value: stats ? `${Math.round(stats.commission_total / 1000)}K F` : '—', color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        <ListToolbar
          search={bookingSearch}
          onSearchChange={setBookingSearch}
          sortField={bookingSortField}
          onSortFieldChange={setBookingSortField}
          sortOrder={bookingSortOrder}
          onSortOrderChange={setBookingSortOrder}
          sortOptions={[
            { value: 'created_at', label: uiText("pages.admin.AdminDashboard", "Date de création") },
            { value: 'start_date', label: uiText("pages.admin.AdminDashboard", "Date de début") },
            { value: 'subtotal', label: uiText("pages.admin.AdminDashboard", "Montant") },
            { value: 'status', label: uiText("pages.admin.AdminDashboard", "Statut") },
          ]}
          placeholder={uiText("pages.admin.AdminDashboard", "Rechercher une réservation")}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Litiges à arbitrer — seule action admin sur les réservations */}
          {disputedBookings.length > 0 && (
            <div className="lg:col-span-2 card border-2 border-red-200">
              <h3 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                <AlertTriangle size={18} />{" " + uiText("pages.admin.AdminDashboard", "Litiges à arbitrer") + " "}</h3>
              <p className="text-xs text-slate-400 mb-4">{uiText("pages.admin.AdminDashboard", "La caution est gelée jusqu'à votre décision.")}</p>
              <div className="space-y-3">
                {disputedBookings.map(b => (
                  <div key={b.id} className="border border-red-100 bg-red-50/50 rounded-xl p-3">
                    <p className="text-sm font-semibold text-slate-800">{uiText("pages.admin.AdminDashboard", "BK-")}{String(b.id).padStart(4, '0')}{" " + uiText("pages.admin.AdminDashboard", "—") + " "}{b.client_name}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{b.vehicle_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(b.start_date)}{" " + uiText("pages.admin.AdminDashboard", "→") + " "}{formatDate(b.end_date)}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{formatNumber(Number(b.subtotal))}{" " + uiText("pages.admin.AdminDashboard", "F bloqués") + " "}</p>
                    {b.dispute_reason && (
                      <p className="text-xs text-red-700 mt-1 italic">{uiText("pages.admin.AdminDashboard", "«") + " "}{b.dispute_reason}{" " + uiText("pages.admin.AdminDashboard", "»")}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button disabled={busy === b.id} onClick={() => resolveDispute(b, 'refund')}
                        className="text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700">{uiText("pages.admin.AdminDashboard", "Rembourser le client") + " "}</button>
                      <button disabled={busy === b.id} onClick={() => resolveDispute(b, 'release')}
                        className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{uiText("pages.admin.AdminDashboard", "Payer le propriétaire") + " "}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Réservations en direct — supervision (lecture seule) */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900">{uiText("pages.admin.AdminDashboard", "Réservations en direct")}</h3>
              <span className="text-xs text-slate-400">{uiText("pages.admin.AdminDashboard", "synchro auto") + " "}{POLL_INTERVAL / 1000}{uiText("pages.admin.AdminDashboard", "s")}</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">{uiText("pages.admin.AdminDashboard", "Confirmées automatiquement après paiement — supervision uniquement.")}</p>
            {bookings.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">
                {online ? uiText("pages.admin.AdminDashboard", "Aucune réservation pour le moment.") : uiText("pages.admin.AdminDashboard", "API injoignable.")}
              </p>
            )}
            <div className="space-y-3">
              {bookings.map(b => {
                const st = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
                return (
                  <div key={b.id} className="flex items-start gap-3 border border-slate-100 rounded-xl p-3">
                    <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Car size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{uiText("pages.admin.AdminDashboard", "BK-")}{String(b.id).padStart(4, '0')}{" " + uiText("pages.admin.AdminDashboard", "—") + " "}{b.client_name || uiText("pages.admin.AdminDashboard", "Client")}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{b.vehicle_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(b.start_date)}{" " + uiText("pages.admin.AdminDashboard", "→") + " "}{formatDate(b.end_date)}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{formatNumber(Number(b.subtotal))}{" " + uiText("pages.admin.AdminDashboard", "F") + " "}{b.driver_name ? ` · ${uiText("pages.admin.AdminDashboard", "Chauffeur :")} ${b.driver_name}` : ''}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{timeAgo(b.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      {b.escrow_status && (
                        <span className="text-[10px] text-slate-400">
                          {b.escrow_status === 'held' ? uiText("pages.admin.AdminDashboard", "Caution bloquée") :
                           b.escrow_status === 'released' ? uiText("pages.admin.AdminDashboard", "Propriétaire payé") :
                           b.escrow_status === 'refunded' ? uiText("pages.admin.AdminDashboard", "Client remboursé") : uiText("pages.admin.AdminDashboard", "Caution gelée")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne droite : validation véhicules + gestion utilisateurs */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">{uiText("pages.admin.AdminDashboard", "Véhicules à valider")}</h3>
              <ListToolbar
                search={vehicleSearch}
                onSearchChange={setVehicleSearch}
                sortField={vehicleSortField}
                onSortFieldChange={setVehicleSortField}
                sortOrder={vehicleSortOrder}
                onSortOrderChange={setVehicleSortOrder}
                sortOptions={[
                  { value: 'created_at', label: uiText("pages.admin.AdminDashboard", "Date d’ajout") },
                  { value: 'year', label: uiText("pages.admin.AdminDashboard", "Année") },
                  { value: 'computed_rate', label: uiText("pages.admin.AdminDashboard", "Tarif indicatif") },
                  { value: 'rating', label: uiText("pages.admin.AdminDashboard", "Note") },
                ]}
                placeholder={uiText("pages.admin.AdminDashboard", "Rechercher un véhicule")}
                className="mb-4"
              />
              {pendingVehicles.length === 0 && <p className="text-sm text-slate-400">{uiText("pages.admin.AdminDashboard", "Aucun en attente.")}</p>}
              <div className="space-y-3">
                {pendingVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{v.brand} {v.model}</p>
                      <p className="text-xs text-slate-400">{v.plate}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{v.owner_name}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setVehicleStatus(v, 'approved')} className="p-1.5 bg-emerald-500 text-white rounded-lg" title={uiText("pages.admin.AdminDashboard", "Approuver")}><CheckCircle2 size={14} /></button>
                      <button onClick={() => setVehicleStatus(v, 'suspended')} className="p-1.5 bg-red-500 text-white rounded-lg" title={uiText("pages.admin.AdminDashboard", "Suspendre")}><XCircle size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">{uiText("pages.admin.AdminDashboard", "Comptes utilisateurs")}</h3>
              <ListToolbar
                search={userSearch}
                onSearchChange={setUserSearch}
                sortField={userSortField}
                onSortFieldChange={setUserSortField}
                sortOrder={userSortOrder}
                onSortOrderChange={setUserSortOrder}
                sortOptions={[
                  { value: 'created_at', label: uiText("pages.admin.AdminDashboard", "Date d’inscription") },
                  { value: 'username', label: uiText("pages.admin.AdminDashboard", "Nom d’utilisateur") },
                  { value: 'email', label: uiText("pages.admin.AdminDashboard", "Email") },
                  { value: 'role', label: uiText("pages.admin.AdminDashboard", "Rôle") },
                ]}
                placeholder={uiText("pages.admin.AdminDashboard", "Rechercher un compte")}
                className="mb-4"
              />
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}{" " + uiText("pages.admin.AdminDashboard", "·") + " "}{u.role}</p>
                    </div>
                    <button onClick={() => toggleUserActive(u)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? uiText("pages.admin.AdminDashboard", "Actif") : uiText("pages.admin.AdminDashboard", "Suspendu")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
