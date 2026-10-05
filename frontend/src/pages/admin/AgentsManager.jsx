import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, CheckCircle, XCircle, TrendingUp, DollarSign, Users, Copy, ToggleLeft, ToggleRight, Search, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { usersAPI } from '../../services/api';

export default function AgentsManager() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({ first_name: '', last_name: '', email: '', phone: '', commission_rate: 5, password: '' });
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await usersAPI.list({ role: 'INTERMEDIARY' });
      setAgents(data.results || data || []);
    } catch (_) { /* API injoignable */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAgent = async (a) => {
    try {
      await usersAPI.update(a.id, { is_active: !a.is_active });
      setAgents(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !a.is_active } : x));
    } catch (_) {}
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const createAgent = async () => {
    if (!newAgent.email || !newAgent.first_name || !newAgent.password) return;
    setSaving(true);
    setError('');
    try {
      await usersAPI.create({ ...newAgent, role: 'INTERMEDIARY', is_verified: true });
      setShowCreate(false);
      setNewAgent({ first_name: '', last_name: '', email: '', phone: '', commission_rate: 5, password: '' });
      load();
    } catch (err) {
      const data = err.response?.data;
      const first = data && Object.values(data)[0];
      setError(Array.isArray(first) ? first[0] : (first || 'Création impossible.'));
    }
    setSaving(false);
  };

  const filtered = agents.filter(a =>
    `${a.first_name} ${a.last_name} ${a.email} ${a.referral_code || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const active = agents.filter(a => a.is_active);
  const totalCommissions = active.reduce((s, a) => s + Number(a.commissions_total || 0), 0);
  const totalBookings = active.reduce((s, a) => s + (a.bookings_count || 0), 0);

  return (
    <DashboardLayout title="Intermédiaires">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users,      label: 'Intermédiaires actifs',  value: active.length,                          color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
            { icon: TrendingUp, label: 'Réservations apportées', value: totalBookings,                          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: DollarSign, label: 'Commissions générées',   value: `${totalCommissions.toLocaleString()} F`, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { icon: Tag,        label: 'Taux moyen',             value: `${(active.reduce((s,a)=>s+Number(a.commission_rate||0),0) / (active.length||1)).toFixed(1)} %`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
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

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-52">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" className="input-field pl-9" placeholder="Rechercher un intermédiaire ou un code..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus size={18} /> Créer un intermédiaire
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {['Code', 'Intermédiaire', 'Réservations', 'Commissions', 'Taux', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 px-4 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded">{a.referral_code || '—'}</code>
                        {a.referral_code && (
                          <button onClick={() => copyCode(a.referral_code)} className="text-slate-400 hover:text-violet-600 transition-colors">
                            {copied === a.referral_code ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">{a.first_name} {a.last_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{a.email} · {a.phone || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white">{a.bookings_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-orange-600">{Number(a.commissions_total || 0).toLocaleString()} F</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{Number(a.commission_rate)} %</td>
                    <td className="px-4 py-3">
                      {a.is_active
                        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle size={13} /> Actif</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-red-500"><XCircle size={13} /> Inactif</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAgent(a)} title={a.is_active ? 'Désactiver' : 'Activer'}
                        className="text-slate-400 hover:text-violet-600 transition-colors">
                        {a.is_active ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Aucun intermédiaire trouvé.</div>
          )}
          {loading && (
            <div className="text-center py-12 text-slate-400">Chargement…</div>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md my-auto">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Tag size={18} /> Nouvel intermédiaire</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><XCircle size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Prénom</label>
                    <input type="text" className="input-field" placeholder="Jean"
                      value={newAgent.first_name} onChange={e => setNewAgent(f => ({ ...f, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Nom</label>
                    <input type="text" className="input-field" placeholder="Nkounga"
                      value={newAgent.last_name} onChange={e => setNewAgent(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="agent@email.com"
                    value={newAgent.email} onChange={e => setNewAgent(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Téléphone (+237)</label>
                  <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                    value={newAgent.phone} onChange={e => setNewAgent(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Commission (%)</label>
                    <input type="number" className="input-field" min={1} max={15} value={newAgent.commission_rate}
                      onChange={e => setNewAgent(f => ({ ...f, commission_rate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="label">Mot de passe initial</label>
                    <input type="text" className="input-field" placeholder="Min. 6 caractères"
                      value={newAgent.password} onChange={e => setNewAgent(f => ({ ...f, password: e.target.value }))} />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Commission prélevée sur la part AutoLink — transparent pour le propriétaire. Le code parrain est généré automatiquement.</p>
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="btn-outline flex-1 py-3">Annuler</button>
                <button onClick={createAgent} disabled={saving} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus size={16} /> Créer le compte</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
