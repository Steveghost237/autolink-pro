import React, { useCallback, useEffect, useState } from 'react';
import { Ban, CheckCircle, Plus, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { usersAPI } from '../../services/api';

const ROLES = [
  ['CLIENT', 'Client'], ['OWNER', 'Propriétaire'], ['DRIVER', 'Chauffeur'],
  ['CONTROLLER', 'Contrôleur'], ['ADMIN', 'Administrateur'],
];
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date d’inscription' },
  { value: 'username', label: 'Nom d’utilisateur' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Rôle' },
  { value: 'is_active', label: 'Statut' },
];
const EMPTY_FORM = {
  username: '', email: '', first_name: '', last_name: '', phone: '',
  role: 'CLIENT', password: '',
};

export default function ManageUsers() {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.list({
        page, page_size: 20, search: search.trim(), role: role || undefined,
        is_active: active || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      setUsers(data.results || []);
      setCount(data.count ?? data.length ?? 0);
      setError('');
    } catch (_) {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, active, sortField, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const saveUser = async (id, changes) => {
    try {
      await usersAPI.update(id, changes);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La modification a échoué.');
    }
  };

  const toggleActive = async (user) => {
    if (user.is_active && !(await confirm({
      title: 'Suspendre ce compte ?',
      message: `${user.first_name || user.username} ne pourra plus se connecter.`,
      confirmLabel: 'Suspendre', danger: true,
    }))) return;
    await saveUser(user.id, { is_active: !user.is_active });
  };

  const deleteUser = async (user) => {
    if (!(await confirm({
      title: 'Supprimer ce compte ?',
      message: `Le compte ${user.email} sera supprimé définitivement.`,
      confirmLabel: 'Supprimer', danger: true,
    }))) return;
    try {
      await usersAPI.delete(user.id);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Ce compte ne peut pas être supprimé.');
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await usersAPI.create(form);
      setCreating(false);
      setForm(EMPTY_FORM);
      setPage(1);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La création du compte a échoué.');
    }
  };

  return (
    <DashboardLayout title="Gestion des utilisateurs">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{count} compte(s)</p>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={17} /> Créer un utilisateur
          </button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar
            search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder="Rechercher nom, email, téléphone"
          />
          <select className="input-field w-auto" value={role} onChange={event => { setRole(event.target.value); setPage(1); }}>
            <option value="">Tous les rôles</option>
            {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="input-field w-auto" value={active} onChange={event => { setActive(event.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Suspendus</option>
          </select>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>{['Utilisateur', 'Rôle', 'Statut', 'Vérifié', 'Inscription', 'Activité', 'Actions'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</div>
                    <div className="text-xs text-slate-500">{user.email} · {user.phone || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select aria-label={`Rôle de ${user.username}`} className="input-field w-auto py-1"
                      value={user.role} onChange={event => saveUser(user.id, { role: event.target.value })}>
                      {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">{user.is_active ? 'Actif' : 'Suspendu'}</td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={user.is_verified} aria-label={`Vérifier ${user.username}`}
                      onChange={event => saveUser(user.id, { is_verified: event.target.checked })} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {user.bookings_count || 0} réservation(s) · {user.vehicles_count || 0} véhicule(s) · {user.trips_count || 0} course(s)
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button title={user.is_active ? 'Suspendre' : 'Réactiver'} onClick={() => toggleActive(user)}
                        className={`rounded-lg p-2 ${user.is_active ? 'text-red-600' : 'text-emerald-600'}`}>
                        {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button title="Supprimer" onClick={() => deleteUser(user)} className="rounded-lg p-2 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && <div className="py-12 text-center text-slate-500"><Users className="mx-auto mb-2" />Aucun utilisateur trouvé.</div>}
          {loading && <p className="p-6 text-center text-slate-500">Chargement…</p>}
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span>Page {page} / {Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>Suivant</button>
            </div>
          </div>
        </div>
      </div>
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={createUser} className="card w-full max-w-xl space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Créer un utilisateur</h2><button type="button" onClick={() => setCreating(false)}>Fermer</button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['username', 'Nom d’utilisateur'], ['email', 'Email'], ['first_name', 'Prénom'],
                ['last_name', 'Nom'], ['phone', 'Téléphone'], ['password', 'Mot de passe'],
              ].map(([key, label]) => <label key={key} className="text-sm">{label}<input required className="input-field mt-1" type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'} value={form[key]} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} /></label>)}
              <label className="text-sm">Rôle<select className="input-field mt-1" value={form.role} onChange={event => setForm(value => ({ ...value, role: event.target.value }))}>{ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            <button className="btn-primary w-full">Créer le compte</button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
