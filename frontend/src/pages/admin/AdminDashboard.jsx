import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { bookingsAPI, usersAPI, vehiclesAPI } from '../../services/api';
import {
  Users, Car, DollarSign, TrendingUp, UserCheck, ClipboardList,
  ArrowRight, AlertTriangle, CheckCircle, Clock, Shield, RefreshCw,
  XCircle, CheckCircle2, Wifi, WifiOff
} from 'lucide-react';

const POLL_INTERVAL = 8000; // rafraîchissement toutes les 8s

const STATUS_STYLE = {
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmée',  cls: 'bg-blue-100 text-blue-700' },
  active:    { label: 'En cours',   cls: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Terminée',   cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulée',    cls: 'bg-red-100 text-red-700' },
  disputed:  { label: 'Litige',     cls: 'bg-red-100 text-red-700' },
};

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [busy, setBusy] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [s, b, u, v] = await Promise.all([
        bookingsAPI.stats(),
        bookingsAPI.list({ page_size: 50 }),
        usersAPI.list({ page_size: 50 }),
        vehiclesAPI.list({ page_size: 50 }),
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
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchAll]);

  const setBookingStatus = async (id, status) => {
    setBusy(id);
    try {
      await bookingsAPI.update(id, { status });
      await fetchAll();
    } catch (_) {}
    setBusy(null);
  };

  const toggleUserActive = async (u) => {
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      await fetchAll();
    } catch (_) {}
  };

  const setVehicleStatus = async (v, status) => {
    try {
      await vehiclesAPI.update(v.id, { status });
      await fetchAll();
    } catch (_) {}
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const pendingVehicles = vehicles.filter(v => v.status === 'pending');

  return (
    <DashboardLayout title="Tableau de bord Admin">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Bandeau connexion temps réel */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${online ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            {online
              ? `Connecté à l'API — dernière synchro ${lastSync ? lastSync.toLocaleTimeString('fr-FR') : '…'}`
              : 'API injoignable — données démo'}
          </div>
          <button onClick={fetchAll} className="flex items-center gap-1 underline">
            <RefreshCw size={13} /> Actualiser
          </button>
        </div>

        {/* Alertes */}
        {(pendingBookings.length > 0 || pendingVehicles.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              <strong>{pendingBookings.length} réservation(s)</strong> et <strong>{pendingVehicles.length} véhicule(s)</strong> en attente de validation.
            </div>
          </div>
        )}

        {/* KPIs temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Utilisateurs', value: stats?.users ?? '—', color: 'text-blue-600 bg-blue-50' },
            { icon: Car, label: 'Véhicules', value: stats?.vehicles ?? '—', color: 'text-primary-600 bg-primary-50' },
            { icon: TrendingUp, label: 'Réservations', value: stats?.bookings_total ?? '—', color: 'text-purple-600 bg-purple-50' },
            { icon: DollarSign, label: 'Commission totale', value: stats ? `${Math.round(stats.commission_total / 1000)}K F` : '—', color: 'text-emerald-600 bg-emerald-50' },
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Réservations en direct */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Réservations en direct</h3>
              <span className="text-xs text-slate-400">synchro auto {POLL_INTERVAL / 1000}s</span>
            </div>
            {bookings.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">
                {online ? 'Aucune réservation pour le moment.' : 'API injoignable.'}
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
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        BK-{String(b.id).padStart(4, '0')} — {b.client_name || 'Client'} · {b.vehicle_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {b.start_date} → {b.end_date} · {Number(b.subtotal).toLocaleString()} F · il y a {timeAgo(b.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                      {b.status === 'pending' && (
                        <div className="flex gap-1">
                          <button disabled={busy === b.id} onClick={() => setBookingStatus(b.id, 'confirmed')}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600" title="Confirmer">
                            <CheckCircle2 size={14} />
                          </button>
                          <button disabled={busy === b.id} onClick={() => setBookingStatus(b.id, 'cancelled')}
                            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Annuler">
                            <XCircle size={14} />
                          </button>
                        </div>
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
              <h3 className="font-bold text-slate-900 mb-4">Véhicules à valider</h3>
              {pendingVehicles.length === 0 && <p className="text-sm text-slate-400">Aucun en attente.</p>}
              <div className="space-y-3">
                {pendingVehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{v.brand} {v.model}</p>
                      <p className="text-xs text-slate-400">{v.plate} · {v.owner_name}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setVehicleStatus(v, 'approved')} className="p-1.5 bg-emerald-500 text-white rounded-lg" title="Approuver"><CheckCircle2 size={14} /></button>
                      <button onClick={() => setVehicleStatus(v, 'suspended')} className="p-1.5 bg-red-500 text-white rounded-lg" title="Suspendre"><XCircle size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Comptes utilisateurs</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between border border-slate-100 rounded-xl p-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email} · {u.role}</p>
                    </div>
                    <button onClick={() => toggleUserActive(u)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Actif' : 'Suspendu'}
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
