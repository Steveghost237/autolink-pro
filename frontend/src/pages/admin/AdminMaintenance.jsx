import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, AlertTriangle, Save } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { maintenanceAPI } from '../../services/api';

const STATUS = {
  pending:     { label: 'En attente',  style: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'En cours',    style: 'bg-blue-100 text-blue-700' },
  resolved:    { label: 'Résolue',     style: 'bg-emerald-100 text-emerald-700' },
  cancelled:   { label: 'Annulée',     style: 'bg-slate-100 text-slate-500' },
};
const PRIORITY_STYLE = {
  low: 'bg-slate-100 text-slate-500', normal: 'bg-sky-100 text-sky-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [draft, setDraft] = useState({}); // id → {status, admin_notes}
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await maintenanceAPI.list();
      setRequests(data.results || data || []);
      setOffline(false);
    } catch (_) { setOffline(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setD = (id, k, v) => setDraft(d => ({ ...d, [id]: { ...d[id], [k]: v } }));

  const save = async (r) => {
    setBusy(r.id);
    const d = draft[r.id] || {};
    try {
      await maintenanceAPI.update(r.id, {
        status: d.status || r.status,
        admin_notes: d.admin_notes ?? r.admin_notes,
      });
      load();
    } catch (_) {}
    setBusy(null);
  };

  return (
    <DashboardLayout title="Maintenance véhicules">
      <div className="max-w-5xl mx-auto space-y-4">
        <p className="text-sm text-slate-500">
          Demandes de réparation déposées par les propriétaires — suivez et résolvez chaque ticket.
        </p>
        {loading && <p className="text-center text-slate-400 py-10">Chargement…</p>}
        {!loading && offline && (
          <div className="card text-center py-10 text-slate-500"><AlertTriangle size={28} className="mx-auto mb-2 text-amber-400" />API injoignable.</div>
        )}
        {!loading && !offline && requests.length === 0 && (
          <div className="card text-center py-12">
            <Wrench size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Aucune demande de maintenance.</p>
          </div>
        )}
        {requests.map(r => {
          const d = draft[r.id] || {};
          return (
            <div key={r.id} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${STATUS[r.status]?.style || ''}`}><Wrench size={18} /></div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-white">{r.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[r.priority] || ''}`}>{r.priority_label}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {r.vehicle_label} · {r.owner_name} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
              {r.description && <p className="text-sm text-slate-600 dark:text-slate-300">{r.description}</p>}
              <div className="grid md:grid-cols-[200px_1fr_auto] gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-slate-500">Statut</label>
                  <select className="input-field mt-1" value={d.status || r.status}
                    onChange={e => setD(r.id, 'status', e.target.value)}>
                    {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Note interne (visible par le propriétaire)</label>
                  <input className="input-field mt-1" placeholder="Ex. Garage partenaire contacté, RDV jeudi…"
                    value={d.admin_notes ?? r.admin_notes} onChange={e => setD(r.id, 'admin_notes', e.target.value)} />
                </div>
                <button onClick={() => save(r)} disabled={busy === r.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">
                  <Save size={14} /> {busy === r.id ? '…' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
