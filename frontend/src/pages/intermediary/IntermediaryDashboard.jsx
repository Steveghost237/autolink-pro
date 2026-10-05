import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI, vehiclesAPI } from '../../services/api';
import {
  Tag, Copy, CheckCircle, TrendingUp, DollarSign, Users, Car,
  Plus, AlertCircle, Share2, Clock
} from 'lucide-react';

const STATUS_LABEL = {
  pending: 'En attente', confirmed: 'Confirmé', active: 'En cours',
  completed: 'Terminé', cancelled: 'Annulé', disputed: 'Litige',
};
const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700',
  active: 'bg-indigo-100 text-indigo-700', completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500', disputed: 'bg-red-100 text-red-600',
};

export default function IntermediaryDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    client_email: '', vehicle: '', start_date: '', end_date: '',
    driver_type: 'none', pickup: '', notes: '',
  });

  const load = useCallback(async () => {
    try {
      const { data } = await bookingsAPI.list();
      setBookings(data.results || data || []);
    } catch (_) {}
    try {
      const { data } = await vehiclesAPI.getAll({ status: 'approved' });
      setVehicles(data.results || data || []);
    } catch (_) {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const code = user?.referral_code || '—';
  const shareLink = `${window.location.origin}/register?ref=${code}`;
  const earned = bookings
    .filter(b => ['confirmed', 'active', 'completed'].includes(b.status))
    .reduce((s, b) => s + Number(b.intermediary_commission || 0), 0);
  const pending = bookings
    .filter(b => b.status === 'pending')
    .reduce((s, b) => s + Number(b.intermediary_commission || 0), 0);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await bookingsAPI.create({
        vehicle: Number(form.vehicle),
        start_date: form.start_date,
        end_date: form.end_date,
        pickup_address: form.pickup,
        driver_type: form.driver_type,
        notes: form.notes,
        on_behalf_email: form.client_email.trim(),
      });
      setDone(true);
      setShowForm(false);
      setForm({ client_email: '', vehicle: '', start_date: '', end_date: '', driver_type: 'none', pickup: '', notes: '' });
      load();
      setTimeout(() => setDone(false), 6000);
    } catch (err) {
      const data = err.response?.data;
      const first = data && (data.on_behalf_email || data.vehicle || Object.values(data)[0]);
      setError(Array.isArray(first) ? first[0] : (first || 'Création impossible — réessayez.'));
    }
    setSending(false);
  };

  return (
    <DashboardLayout title="Espace Intermédiaire">
      <div className="max-w-5xl mx-auto space-y-6">

        {done && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium">
            <CheckCircle size={18} /> Réservation transmise — le client a été notifié pour payer.
          </div>
        )}

        {/* Code parrain */}
        <div className="card bg-gradient-to-br from-violet-700 to-purple-900 text-white">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <Tag size={28} />
            </div>
            <div className="flex-1 min-w-60">
              <h2 className="text-xl font-black mb-1">Votre code intermédiaire</h2>
              <p className="text-violet-200 text-sm mb-3">
                Partagez-le à vos clients et propriétaires : chaque inscription ou
                réservation faite avec ce code vous rapporte {Number(user?.commission_rate ?? 5)} % de commission.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-2xl font-black tracking-widest bg-white/15 px-4 py-2 rounded-xl">{code}</code>
                <button onClick={() => copy(code)}
                  className="bg-white/15 hover:bg-white/25 p-2.5 rounded-xl transition-colors" title="Copier le code">
                  {copied === code ? <CheckCircle size={18} className="text-emerald-300" /> : <Copy size={18} />}
                </button>
                <button onClick={() => copy(shareLink)}
                  className="bg-white/15 hover:bg-white/25 px-3 py-2.5 rounded-xl transition-colors text-sm font-semibold flex items-center gap-1.5">
                  {copied === shareLink ? <CheckCircle size={15} className="text-emerald-300" /> : <Share2 size={15} />}
                  Lien d'inscription
                </button>
              </div>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-white text-violet-800 font-bold px-5 py-3 rounded-xl hover:bg-violet-50 transition-colors flex items-center gap-2 shrink-0">
              <Plus size={18} /> Réserver pour un client
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Réservations apportées', value: bookings.length, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
            { icon: Users, label: 'Filleuls inscrits', value: user?.referred_count ?? 0, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { icon: DollarSign, label: 'Commissions gagnées', value: `${earned.toLocaleString()} F`, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: Clock, label: 'Commissions en attente', value: `${pending.toLocaleString()} F`, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Réservations attribuées */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Car size={18} className="text-violet-600" /> Réservations attribuées
            </h3>
          </div>
          {bookings.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">
              Aucune réservation attribuée — partagez votre code ou réservez pour un client.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    {['Réservation', 'Client', 'Véhicule', 'Période', 'Statut', 'Commission'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 px-4 py-3 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">BK-{String(b.id).padStart(4, '0')}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{b.client_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{b.vehicle_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{b.start_date} → {b.end_date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[b.status]}`}>
                          {STATUS_LABEL[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-violet-600">
                        {Number(b.intermediary_commission || 0).toLocaleString()} F
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal : réserver pour un client */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
          <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 my-auto">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Réserver pour un client</h3>
            <p className="text-xs text-slate-500 -mt-2">La réservation sera créée au nom du client — il sera notifié pour payer depuis son compte.</p>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div>
              <label className="label">Email du client (compte AutoLink existant)</label>
              <input type="email" required className="input-field" placeholder="client@email.com"
                value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Véhicule</label>
              <select required className="input-field" value={form.vehicle}
                onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}>
                <option value="">— Choisir un véhicule —</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} {v.year} — {Number(v.daily_rate).toLocaleString()} F/j
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Début</label>
                <input type="date" required className="input-field" value={form.start_date}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Fin</label>
                <input type="date" required className="input-field" value={form.end_date}
                  min={form.start_date}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Option chauffeur</label>
              <select className="input-field" value={form.driver_type}
                onChange={e => setForm(f => ({ ...f, driver_type: e.target.value }))}>
                <option value="none">Sans chauffeur</option>
                <option value="internal">Chauffeur AutoLink</option>
                <option value="owner">Chauffeur du propriétaire</option>
              </select>
            </div>
            <div>
              <label className="label">Lieu de prise en charge</label>
              <input type="text" className="input-field" placeholder="Ex : Aéroport de Douala"
                value={form.pickup} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes (optionnel)</label>
              <textarea className="input-field resize-none" rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3">Annuler</button>
              <button type="submit" disabled={sending}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-colors flex items-center justify-center gap-2">
                {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={16} /> Créer</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
