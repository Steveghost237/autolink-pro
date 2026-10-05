import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { maintenanceAPI, vehiclesAPI } from '../../services/api';

const STATUS = {
  pending:     { label: 'En attente',   style: 'bg-amber-100 text-amber-700',   icon: Clock },
  in_progress: { label: 'En cours',     style: 'bg-blue-100 text-blue-700',     icon: Wrench },
  resolved:    { label: 'Résolue',      style: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled:   { label: 'Annulée',      style: 'bg-slate-100 text-slate-500',   icon: XCircle },
};
const PRIORITY = {
  low: 'Basse', normal: 'Normale', high: 'Haute', urgent: 'Urgente',
};

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle: '', title: '', description: '', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [req, veh] = await Promise.all([
        maintenanceAPI.list(),
        vehiclesAPI.list({ mine: 1 }),
      ]);
      setRequests(req.data.results || req.data || []);
      setVehicles(veh.data.results || veh.data || []);
      setOffline(false);
    } catch (_) { setOffline(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.vehicle || !form.title.trim()) return;
    setSaving(true); setError('');
    try {
      await maintenanceAPI.create(form);
      setForm({ vehicle: '', title: '', description: '', priority: 'normal' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.vehicle?.[0] || 'Envoi impossible — réessayez.');
    }
    setSaving(false);
  };

  const cancel = async (id) => {
    try { await maintenanceAPI.update(id, { status: 'cancelled' }); load(); } catch (_) {}
  };

  return (
    <DashboardLayout title="Maintenance de mes véhicules">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Demandes de réparation</h2>
            <p className="text-sm text-slate-500">Signalez une panne ou un besoin d'entretien — l'équipe AutoLink suit le dossier.</p>
          </div>
          <button onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
            <Plus size={16} /> Nouvelle demande
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="card space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Décrire le besoin</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Véhicule concerné *</label>
                <select className="input-field mt-1" required value={form.vehicle}
                  onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}>
                  <option value="">— Choisir —</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year} ({v.plate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Priorité</label>
                <select className="input-field mt-1" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {Object.entries(PRIORITY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Titre *</label>
              <input className="input-field mt-1" required placeholder="Ex. Bruit moteur, plaquettes de frein…"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
              <textarea className="input-field mt-1" rows={3} placeholder="Symptômes, contexte, photos à fournir…"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? 'Envoi…' : 'Envoyer la demande'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-sm font-semibold">
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {loading && <p className="text-center text-slate-400 py-10">Chargement…</p>}
          {!loading && offline && (
            <div className="card text-center py-10 text-slate-500"><AlertTriangle size={28} className="mx-auto mb-2 text-amber-400" />API injoignable.</div>
          )}
          {!loading && !offline && requests.length === 0 && (
            <div className="card text-center py-12">
              <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucune demande de maintenance pour le moment.</p>
            </div>
          )}
          {requests.map(r => {
            const S = STATUS[r.status] || STATUS.pending;
            const Icon = S.icon;
            return (
              <div key={r.id} className="card flex flex-wrap items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${S.style}`}><Icon size={20} /></div>
                <div className="flex-1 min-w-52">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-white">{r.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${S.style}`}>{r.status_label || S.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{PRIORITY[r.priority]}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{r.vehicle_label} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                  {r.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{r.description}</p>}
                  {r.admin_notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2">
                      <strong>Équipe AutoLink :</strong> {r.admin_notes}
                    </p>
                  )}
                </div>
                {r.status === 'pending' && (
                  <button onClick={() => cancel(r.id)}
                    className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    Annuler
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
