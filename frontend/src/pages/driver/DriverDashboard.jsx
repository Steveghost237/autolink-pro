import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { bookingsAPI, notificationsAPI } from '../../services/api';
import { Car, Star, DollarSign, Clock, MapPin, Phone, CheckCircle, Navigation, Award, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const POLL = 10000;

const STATUS_LABEL = {
  confirmed: { label: 'À venir', cls: 'bg-blue-100 text-blue-700' },
  active:    { label: 'En cours', cls: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Terminée', cls: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulée',  cls: 'bg-red-100 text-red-700' },
};

export default function DriverDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [b, n] = await Promise.all([bookingsAPI.list({ page_size: 50 }), notificationsAPI.list()]);
      setBookings(b.data.results || b.data || []);
      setNotifs(n.data.results || []);
      setOnline(true);
    } catch (_) {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (id, status) => {
    setBusy(id);
    try {
      await bookingsAPI.updateStatus(id, status);
      await load();
    } catch (_) {}
    setBusy(null);
  };

  const upcoming = bookings.filter(b => b.status === 'confirmed');
  const active = bookings.filter(b => b.status === 'active');
  const history = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const totalEarned = bookings.filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.subtotal || 0) * 0.10, 0); // part indicative chauffeur

  return (
    <DashboardLayout title="Espace Chauffeur">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Bandeau connexion */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${online ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            {online ? 'Connecté — courses synchronisées automatiquement' : 'API injoignable'}
          </div>
          <button onClick={load} className="flex items-center gap-1 underline"><RefreshCw size={13} /> Actualiser</button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Bonjour, {user?.first_name || user?.firstName}</h2>
          <p className="text-white/60 text-sm">Chauffeur interne AutoLink — les courses vous sont assignées automatiquement.</p>
        </div>

        {/* Notifications */}
        {notifs.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-3">Notifications</h3>
            <div className="space-y-2">
              {notifs.slice(0, 5).map(n => (
                <div key={n.id} className={`p-3 rounded-xl text-sm ${n.is_read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-slate-800 font-medium'}`}>
                  <span className="font-semibold">{n.title} — </span>{n.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Courses à venir', value: upcoming.length, color: 'text-blue-600 bg-blue-50', icon: Clock },
            { label: 'En cours', value: active.length, color: 'text-emerald-600 bg-emerald-50', icon: Navigation },
            { label: 'Terminées', value: history.length, color: 'text-slate-600 bg-slate-100', icon: CheckCircle },
            { label: 'Gains cumulés', value: `${Math.round(totalEarned).toLocaleString()} F`, color: 'text-primary-600 bg-primary-50', icon: DollarSign },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}><Icon size={16} /></div>
              <div className="font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Courses actives + à venir */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Mes courses</h3>
            {active.length === 0 && upcoming.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">Aucune course assignée pour le moment.</p>
            )}
            <div className="space-y-4">
              {[...active, ...upcoming].map(b => {
                const st = STATUS_LABEL[b.status] || STATUS_LABEL.confirmed;
                return (
                  <div key={b.id} className={`border-2 rounded-xl p-4 ${b.status === 'active' ? 'border-emerald-300 bg-emerald-50' : 'border-primary-100 bg-primary-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-slate-900 text-sm">{b.client_name} — {b.vehicle_name}</div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5"><Clock size={11} /> {b.start_date} → {b.end_date}</div>
                      {b.pickup_address && <div className="flex items-center gap-1.5"><MapPin size={11} className="text-emerald-500" /> Départ : {b.pickup_address}</div>}
                      {b.dropoff_address && <div className="flex items-center gap-1.5"><Navigation size={11} className="text-red-500" /> Arrivée : {b.dropoff_address}</div>}
                    </div>
                    <div className="flex gap-2">
                      {b.status === 'confirmed' && (
                        <button onClick={() => setStatus(b.id, 'active')} disabled={busy === b.id}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                          <Navigation size={12} /> Démarrer la course
                        </button>
                      )}
                      {b.status === 'active' && (
                        <button onClick={() => setStatus(b.id, 'completed')} disabled={busy === b.id}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
                          <CheckCircle size={12} /> {busy === b.id ? 'Clôture…' : 'Course terminée — libérer la voiture'}
                        </button>
                      )}
                      {b.client_phone && (
                        <a href={`tel:${b.client_phone}`} className="flex items-center justify-center gap-1.5 text-xs bg-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-300">
                          <Phone size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historique */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Historique</h3>
            {history.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Aucune course terminée.</p>}
            <div className="space-y-3">
              {history.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0"><Car size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm">{b.client_name} — {b.vehicle_name}</div>
                    <div className="text-xs text-slate-500">{b.start_date} → {b.end_date}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(STATUS_LABEL[b.status] || STATUS_LABEL.completed).cls}`}>
                    {(STATUS_LABEL[b.status] || STATUS_LABEL.completed).label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
