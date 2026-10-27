import React, { useCallback, useEffect, useState } from 'react';
import { Ban, CheckCircle, Plus, Trash2, Users, Download, FileCheck, XCircle, FileText, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { usersAPI } from '../../services/api';
import { formatDate,  uiText } from '../../i18n';

const ROLES = [
  ['CLIENT', uiText("pages.admin.ManageUsers", "Client")], ['OWNER', uiText("pages.admin.ManageUsers", "Propriétaire")], ['DRIVER', uiText("pages.admin.ManageUsers", "Chauffeur")],
  ['CONTROLLER', uiText("pages.admin.ManageUsers", "Contrôleur")], ['ADMIN', uiText("pages.admin.ManageUsers", "Administrateur")],
];
const SORT_OPTIONS = [
  { value: 'created_at', label: uiText("pages.admin.ManageUsers", "Date d’inscription") },
  { value: 'username', label: uiText("pages.admin.ManageUsers", "Nom d’utilisateur") },
  { value: 'email', label: uiText("pages.admin.ManageUsers", "Email") },
  { value: 'role', label: uiText("pages.admin.ManageUsers", "Rôle") },
  { value: 'is_active', label: uiText("pages.admin.ManageUsers", "Statut") },
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
  const [kycQueue, setKycQueue] = useState([]);
  const [kycBusy, setKycBusy] = useState(null);

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
      setError(uiText("pages.admin.ManageUsers", "Impossible de charger les utilisateurs."));
    } finally {
      setLoading(false);
    }
  }, [page, search, role, active, sortField, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const loadKyc = useCallback(async () => {
    try {
      const { data } = await usersAPI.list({ kyc_status: 'pending', page_size: 50, ordering: 'kyc_submitted_at' });
      setKycQueue(data.results || []);
    } catch (_) { setKycQueue([]); }
  }, []);
  useEffect(() => { loadKyc(); }, [loadKyc]);

  const reviewKyc = async (user, approved) => {
    let note = '';
    if (!approved) {
      note = window.prompt(uiText("pages.admin.ManageUsers", "Motif du refus (affiché au client) :"), '') || '';
      if (note === null) return;
    }
    setKycBusy(user.id);
    try {
      await usersAPI.update(user.id, { kyc_status: approved ? 'approved' : 'rejected', kyc_note: note });
      await Promise.all([loadKyc(), load()]);
    } catch (e) {
      setError(e.response?.data?.detail || uiText("pages.admin.ManageUsers", "La revue a échoué."));
    }
    setKycBusy(null);
  };

  const saveUser = async (id, changes) => {
    try {
      await usersAPI.update(id, changes);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.ManageUsers", "La modification a échoué."));
    }
  };

  const exportToExcel = async () => {
    try {
      const { data } = await usersAPI.list({
        page_size: 1000, search: search.trim(), role: role || undefined,
        is_active: active || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      const rows = data.results || [];
      const headers = ['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Vérifié', 'Inscription', 'Réservations', 'Véhicules', 'Courses'];
      const csvContent = [
        headers.join(','),
        ...rows.map(user => [
          `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
          user.email || '',
          user.phone || '',
          user.role || '',
          user.is_active ? 'Actif' : 'Suspendu',
          user.is_verified ? 'Oui' : 'Non',
          user.created_at ? formatDate(new Date(user.created_at)) : '',
          user.bookings_count || 0,
          user.vehicles_count || 0,
          user.trips_count || 0,
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `utilisateurs_autolink_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(uiText("pages.admin.ManageUsers", "L'export a échoué."));
    }
  };

  const toggleActive = async (user) => {
    if (user.is_active && !(await confirm({
      title: uiText("pages.admin.ManageUsers", "Suspendre ce compte ?"),
      message: `${user.first_name || user.username} ne pourra plus se connecter.`,
      confirmLabel: uiText("pages.admin.ManageUsers", "Suspendre"), danger: true,
    }))) return;
    await saveUser(user.id, { is_active: !user.is_active });
  };

  const deleteUser = async (user) => {
    if (!(await confirm({
      title: uiText("pages.admin.ManageUsers", "Supprimer ce compte ?"),
      message: uiText("pages.admin.ManageUsers", "Le compte {{email}} sera supprimé définitivement.", { email: user.email }),
      confirmLabel: uiText("pages.admin.ManageUsers", "Supprimer"), danger: true,
    }))) return;
    try {
      await usersAPI.delete(user.id);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.ManageUsers", "Ce compte ne peut pas être supprimé."));
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
      setError(requestError.response?.data?.detail || uiText("pages.admin.ManageUsers", "La création du compte a échoué."));
    }
  };

  return (
    <DashboardLayout title={uiText("pages.admin.ManageUsers", "Gestion des utilisateurs")}>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-on-surface-variant">{count}{" " + uiText("pages.admin.ManageUsers", "compte(s)")}</p>
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={17} />{" " + uiText("pages.admin.ManageUsers", "Créer un utilisateur") + " "}</button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}

        {kycQueue.length > 0 && (
          <section className="card border-2 border-tertiary-container/40 bg-tertiary-fixed/50/40">
            <h2 className="font-bold text-tertiary flex items-center gap-2 mb-3"><FileCheck size={18} />{uiText("pages.admin.ManageUsers", "Dossiers KYC à vérifier ({{n}})", { n: kycQueue.length })}</h2>
            <div className="space-y-3">
              {kycQueue.map(user => (
                <article key={user.id} className="bg-white rounded-xl border border-tertiary-container/40 p-4 flex flex-wrap items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-on-surface dark:text-white">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username} <span className="badge badge-info ml-1">{user.role}</span></div>
                    <div className="text-xs text-on-surface-variant">{user.email} · {user.phone || '—'} · {uiText("pages.admin.ManageUsers", "déposé le") + " "}{user.kyc_submitted_at ? formatDate(new Date(user.kyc_submitted_at)) : '—'}</div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      {user.id_document ? <a href={user.id_document} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-700 underline"><FileText size={13} />{uiText("pages.admin.ManageUsers", "Pièce d'identité")}</a> : <span className="text-on-surface-variant">{uiText("pages.admin.ManageUsers", "Pas de CNI")}</span>}
                      {user.driving_license ? <a href={user.driving_license} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-700 underline"><FileText size={13} />{uiText("pages.admin.ManageUsers", "Permis de conduire")}{user.driving_license_expires_at ? ` (${uiText("pages.admin.ManageUsers", "exp.")} ${formatDate(new Date(user.driving_license_expires_at))})` : ''}</a> : <span className="text-on-surface-variant">{uiText("pages.admin.ManageUsers", "Pas de permis")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button disabled={kycBusy === user.id} onClick={() => reviewKyc(user, false)} className="btn-outline text-error flex items-center gap-1 text-sm"><XCircle size={15} />{uiText("pages.admin.ManageUsers", "Refuser")}</button>
                    <button disabled={kycBusy === user.id} onClick={() => reviewKyc(user, true)} className="btn-primary flex items-center gap-1 text-sm"><CheckCircle size={15} />{uiText("pages.admin.ManageUsers", "Valider")}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar
            search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder={uiText("pages.admin.ManageUsers", "Rechercher nom, email, téléphone")}
          />
          <select className="input-field w-auto" value={role} onChange={event => { setRole(event.target.value); setPage(1); }}>
            <option value="">{uiText("pages.admin.ManageUsers", "Tous les rôles")}</option>
            {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select className="input-field w-auto" value={active} onChange={event => { setActive(event.target.value); setPage(1); }}>
            <option value="">{uiText("pages.admin.ManageUsers", "Tous les statuts")}</option>
            <option value="true">{uiText("pages.admin.ManageUsers", "Actifs")}</option>
            <option value="false">{uiText("pages.admin.ManageUsers", "Suspendus")}</option>
          </select>
          <button onClick={exportToExcel} className="btn-outline flex items-center gap-2 text-sm">
            <Download size={16} />{uiText("pages.admin.ManageUsers", "Exporter Excel")}
          </button>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface-container-low dark:bg-slate-900 text-left text-xs uppercase text-on-surface-variant">
              <tr>{["Utilisateur", "Rôle", "Statut", "Vérifié", "Inscription", "Activité", "Actions"].map(label => <th key={label} className="px-4 py-3">{uiText("pages.admin.ManageUsers", label)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.username}</div>
                    <div className="text-xs text-on-surface-variant">{user.email}{" " + uiText("pages.admin.ManageUsers", "·") + " "}{user.phone || uiText("pages.admin.ManageUsers", "—")}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select aria-label={`Rôle de ${user.username}`} className="input-field w-auto py-1"
                      value={user.role} onChange={event => saveUser(user.id, { role: event.target.value })}>
                      {ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">{user.is_active ? uiText("pages.admin.ManageUsers", "Actif") : uiText("pages.admin.ManageUsers", "Suspendu")}</td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={user.is_verified} aria-label={uiText("pages.admin.ManageUsers", "Vérifier {{name}}", { name: user.username })}
                      onChange={event => saveUser(user.id, { is_verified: event.target.checked })} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(new Date(user.created_at))}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {user.bookings_count || 0}{" " + uiText("pages.admin.ManageUsers", "réservation(s) ·") + " "}{user.vehicles_count || 0}{" " + uiText("pages.admin.ManageUsers", "véhicule(s) ·") + " "}{user.trips_count || 0}{" " + uiText("pages.admin.ManageUsers", "course(s)") + " "}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button title={user.is_active ? uiText("pages.admin.ManageUsers", "Suspendre") : uiText("pages.admin.ManageUsers", "Réactiver")} onClick={() => toggleActive(user)}
                        className={`rounded-lg p-2 ${user.is_active ? 'text-error' : 'text-primary'}`}>
                        {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button title={uiText("pages.admin.ManageUsers", "Supprimer")} onClick={() => deleteUser(user)} className="rounded-lg p-2 text-error">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && <div className="py-12 text-center text-on-surface-variant"><Users className="mx-auto mb-2" />{uiText("pages.admin.ManageUsers", "Aucun utilisateur trouvé.")}</div>}
          {loading && <p className="p-6 text-center text-on-surface-variant">{uiText("pages.admin.ManageUsers", "Chargement…")}</p>}
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span>{uiText("pages.admin.ManageUsers", "Page") + " "}{page}{" " + uiText("pages.admin.ManageUsers", "/") + " "}{Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.ManageUsers", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.ManageUsers", "Suivant")}</button>
            </div>
          </div>
        </div>
      </div>
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={createUser} className="card w-full max-w-xl space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{uiText("pages.admin.ManageUsers", "Créer un utilisateur")}</h2><button type="button" onClick={() => setCreating(false)}>{uiText("pages.admin.ManageUsers", "Fermer")}</button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['username', uiText("pages.admin.ManageUsers", "Nom d’utilisateur")], ['email', uiText("pages.admin.ManageUsers", "Email")], ['first_name', uiText("pages.admin.ManageUsers", "Prénom")],
                ['last_name', uiText("pages.admin.ManageUsers", "Nom")], ['phone', uiText("pages.admin.ManageUsers", "Téléphone")], ['password', uiText("pages.admin.ManageUsers", "Mot de passe")],
              ].map(([key, label]) => <label key={key} className="text-sm">{label}<input required className="input-field mt-1" type={key === 'password' ? uiText("pages.admin.ManageUsers", "password") : key === 'email' ? uiText("pages.admin.ManageUsers", "email") : uiText("pages.admin.ManageUsers", "text")} value={form[key]} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} /></label>)}
              <label className="text-sm">{uiText("pages.admin.ManageUsers", "Rôle")}<select className="input-field mt-1" value={form.role} onChange={event => setForm(value => ({ ...value, role: event.target.value }))}>{ROLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            <button className="btn-primary w-full">{uiText("pages.admin.ManageUsers", "Créer le compte")}</button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
