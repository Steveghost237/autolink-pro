import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Car, TrendingUp, DollarSign, Clock, PlusCircle, ArrowRight, CheckCircle, AlertTriangle, MapPin, RefreshCw, Wifi, WifiOff, Bell, ShieldCheck } from 'lucide-react';
import { bookingsAPI, vehiclesAPI, notificationsAPI, walletAPI } from '../../services/api';

const POLL = 10000;

const V_STATUS = {
  pending:    { label: 'En vérification', cls: 'bg-amber-100 text-amber-700' },
  approved:   { label: 'Disponible',      cls: 'bg-emerald-100 text-emerald-700' },
  rented:     { label: 'En location',     cls: 'bg-blue-100 text-blue-700' },
  maintenance:{ label: 'Maintenance',     cls: 'bg-orange-100 text-orange-700' },
  suspended:  { label: 'Suspendu',        cls: 'bg-red-100 text-red-700' },
};

const B_STATUS = {
  pending:   { label: 'Attente paiement', cls: 'text-amber-600' },
  confirmed: { label: 'Confirmée',        cls: 'text-blue-600' },
  active:    { label: 'En cours',         cls: 'text-purple-600' },
  completed: { label: 'Terminée',         cls: 'text-emerald-600' },
  cancelled: { label: 'Annulée',          cls: 'text-red-600' },
  disputed:  { label: 'Litige',           cls: 'text-red-700' },
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [balance, setBalance] = useState(0);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [v, b, n, w] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 50 }),
        notificationsAPI.list(),
        walletAPI.get(),
      ]);
      // Le backend renvoie déjà uniquement les véhicules du propriétaire connecté
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setNotifs(n.data.results || []);
      setBalance(Number(w.data.balance || 0));
      setOnline(true);
    } catch (_) {
      setOnline(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  const markVehicleBack = async (bookingId) => {
    setBusy(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, 'completed');
      await load();
    } catch (_) {}
    setBusy(null);
  };

  const activeBookings = bookings.filter(b => ['confirmed', 'active'].includes(b.status));
  const doneBookings = bookings.filter(b => b.status === 'completed');
  const totalEarned = doneBookings.reduce((s, b) => s + Number(b.owner_amount || 0), 0);

  return (
    <DashboardLayout title="Espace Propriétaire">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Bandeau connexion */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium ${online ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            {online ? 'Connecté — vos réservations arrivent en temps réel' : 'API injoignable — vérifiez votre connexion'}
          </div>
          <button onClick={load} className="flex items-center gap-1 underline"><RefreshCw size={13} /> Actualiser</button>
        </div>

        {/* Welcome + solde */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80"
            alt="Propriétaire" className="w-full h-44 object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <p className="text-white/70 text-sm mb-1">Propriétaire,</p>
            <h2 className="text-2xl font-black text-white mb-1">{user?.first_name || user?.firstName} {user?.last_name || user?.lastName}</h2>
            <p className="text-white/60 text-sm mb-4">
              {vehicles.length} véhicule(s) · Solde : <span className="font-bold text-white">{balance.toLocaleString()} F</span>
            </p>
            <button onClick={() => navigate('/owner/add-vehicle')}
              className="w-fit flex items-center gap-2 bg-white text-slate-900 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all shadow-lg text-sm">
              <PlusCircle size={16} /> Mettre une voiture en location
            </button>
          </div>
        </div>

        {/* Notifications — nouvelles réservations */}
        {notifs.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Bell size={17} className="text-primary-600" /> Notifications</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifs.slice(0, 8).map(n => (
                <div key={n.id} className={`p-3 rounded-xl text-sm ${n.is_read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 border border-blue-100 text-slate-800'}`}>
                  <span className="font-semibold">{n.title} — </span>{n.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Car,        label: 'Mes véhicules',      value: vehicles.length,                       color: 'text-blue-600 bg-blue-50' },
            { icon: TrendingUp, label: 'Locations actives',  value: activeBookings.length,                 color: 'text-purple-600 bg-purple-50' },
            { icon: DollarSign, label: 'Revenus versés',     value: `${Math.round(totalEarned).toLocaleString()} F`, color: 'text-emerald-600 bg-emerald-50' },
            { icon: ShieldCheck,label: 'Solde (cautions)',   value: `${Math.round(balance).toLocaleString()} F`,   color: 'text-teal-600 bg-teal-50' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}><Icon size={20} /></div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Commission info — nouveau modèle 50/50 + caution */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-teal-700" />
          </div>
          <div>
            <h4 className="font-semibold text-teal-800 mb-1">Votre part = 50 % de chaque location, versée à la fin</h4>
            <p className="text-sm text-teal-700">
              À chaque paiement client, AutoLink conserve 50 % (commission + garantie) et bloque vos 50 %
              <strong> en caution</strong> pendant la location — pour couvrir une éventuelle panne ou un litige.
              Si tout se passe bien, la caution vous est <strong>versée automatiquement</strong> sur votre solde dès le retour du véhicule.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Véhicules */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Mes véhicules</h3>
              <button onClick={() => navigate('/owner/vehicles')} className="text-sm text-primary-600 font-medium flex items-center gap-1">
                Gérer <ArrowRight size={14} />
              </button>
            </div>
            {vehicles.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">
                {online ? 'Aucun véhicule enregistré — ajoutez-en un pour commencer.' : 'API injoignable.'}
              </p>
            )}
            <div className="space-y-3">
              {vehicles.map(v => {
                const st = V_STATUS[v.status] || V_STATUS.pending;
                return (
                  <div key={v.id} className="border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{v.brand} {v.model} {v.year}</div>
                      <div className="text-xs text-slate-400 font-mono">{v.plate}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-primary-700 text-sm">{Number(v.computed_rate || v.daily_rate).toLocaleString()} F</div>
                        <div className="text-xs text-slate-400">/jour · {v.tier_label || v.tier}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Locations en cours / à venir + historique */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Locations de mes véhicules</h3>
            {bookings.length === 0 && (
              <p className="text-sm text-slate-400 py-8 text-center">Aucune location pour le moment.</p>
            )}
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {bookings.map(b => {
                const st = B_STATUS[b.status] || B_STATUS.pending;
                return (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900 truncate">{b.vehicle_name}</div>
                      <span className={`text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {b.client_name} · {b.start_date} → {b.end_date}
                      {b.driver_type === 'owner' && ' · Votre chauffeur requis'}
                      {b.driver_type === 'internal' && ` · Chauffeur AutoLink${b.driver_name ? ` : ${b.driver_name}` : ''}`}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        Caution : {Number(b.owner_amount || 0).toLocaleString()} F
                        {b.escrow_status === 'held' && ' (bloquée)'}
                        {b.escrow_status === 'released' && ' (versée)'}
                        {b.escrow_status === 'disputed' && ' (gelée — litige)'}
                      </span>
                      {['confirmed', 'active'].includes(b.status) && (
                        <button onClick={() => markVehicleBack(b.id)} disabled={busy === b.id}
                          className="text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg disabled:opacity-50">
                          {busy === b.id ? '…' : 'Véhicule récupéré'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
