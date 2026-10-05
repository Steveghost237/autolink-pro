import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Ban, CheckCircle, Users, Car, UserCheck, Shield, Share2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { usersAPI } from '../../services/api';

const ROLE_CONFIG = {
  CLIENT:       { label: 'Client',        style: 'badge-info',    icon: Users },
  OWNER:        { label: 'Propriétaire',  style: 'badge-primary', icon: Car },
  DRIVER:       { label: 'Chauffeur',     style: 'badge-warning', icon: UserCheck },
  ADMIN:        { label: 'Admin',         style: 'badge-error',   icon: Shield },
  CONTROLLER:   { label: 'Contrôleur',    style: 'bg-purple-100 text-purple-700', icon: Shield },
  INTERMEDIARY: { label: 'Intermédiaire', style: 'bg-violet-100 text-violet-700', icon: Share2 },
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await usersAPI.list(params);
      setUsers(data.results || data || []);
    } catch (_) { /* API injoignable */ }
    setLoading(false);
  }, [roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce recherche
    return () => clearTimeout(t);
  }, [load]);

  const update = async (u, payload) => {
    setBusy(u.id);
    try {
      const { data } = await usersAPI.update(u.id, payload);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...data } : x));
    } catch (_) {}
    setBusy(null);
  };

  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <DashboardLayout title="Gestion des utilisateurs">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Clients',        count: counts.CLIENT || 0,       icon: Users,     color: 'bg-blue-50 text-blue-600' },
            { label: 'Propriétaires',  count: counts.OWNER || 0,        icon: Car,       color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Intermédiaires', count: counts.INTERMEDIARY || 0, icon: Share2, color: 'bg-violet-50 text-violet-600' },
            { label: 'Chauffeurs',     count: counts.DRIVER || 0,       icon: UserCheck, color: 'bg-amber-50 text-amber-600' },
          ].map(({ label, count, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}><Icon size={22} /></div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{count}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card flex flex-wrap gap-4">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" className="input-field pl-9" placeholder="Rechercher par nom, email ou code..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="ALL">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="OWNER">Propriétaires</option>
            <option value="INTERMEDIARY">Intermédiaires</option>
            <option value="DRIVER">Chauffeurs (archives)</option>
            <option value="CONTROLLER">Contrôleurs</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {['Utilisateur', 'Rôle', 'Statut', 'Vérifié', 'Inscrit le', 'Réservations', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtered(users, roleFilter).map(u => {
                  const RC = ROLE_CONFIG[u.role] || ROLE_CONFIG.CLIENT;
                  const Icon = RC.icon;
                  const active = u.is_active;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {(u.first_name || u.username || '?').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                            {u.referral_code && <code className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{u.referral_code}</code>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={RC.style}><Icon size={10} className="inline mr-1" />{RC.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        {active
                          ? <span className="badge-success">Actif</span>
                          : <span className="badge-error">Suspendu</span>}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_verified
                          ? <CheckCircle size={16} className="text-emerald-500" />
                          : <button disabled={busy === u.id} onClick={() => update(u, { is_verified: true })}
                              className="text-xs text-primary-600 font-semibold hover:underline">Vérifier</button>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                        {u.role === 'INTERMEDIARY'
                          ? `${u.bookings_count} apportée(s) · ${Number(u.commissions_total || 0).toLocaleString()} F`
                          : `${u.bookings_count ?? 0} réservation(s)`}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors" title="Voir profil"><Eye size={15} /></button>
                          {u.role !== 'ADMIN' && (
                            <button disabled={busy === u.id}
                              onClick={() => update(u, { is_active: !active })}
                              className={`p-1.5 rounded-lg transition-colors ${active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-emerald-50 text-emerald-600'}`}
                              title={active ? 'Suspendre' : 'Réactiver'}>
                              {active ? <Ban size={15} /> : <CheckCircle size={15} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filtered(users, roleFilter).length === 0 && (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun utilisateur trouvé</p>
            </div>
          )}
          {loading && <div className="text-center py-12 text-slate-400">Chargement…</div>}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500">
            {users.length} utilisateur(s)
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Filtre local complémentaire (recherche déjà côté serveur via ?search=)
function filtered(users, roleFilter) {
  return users.filter(u => roleFilter === 'ALL' || u.role === roleFilter);
}
