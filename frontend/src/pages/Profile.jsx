import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, Wallet, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS = {
  CLIENT: 'Client', OWNER: 'Gestionnaire / Propriétaire', DRIVER: 'Chauffeur',
  ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur',
};

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.firstName || '',
    last_name: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { refreshUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setForm({
      first_name: user?.firstName || '',
      last_name: user?.lastName || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await updateUser({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
    });
    setMsg(res.success
      ? { ok: true, text: res.offline ? 'Profil mis à jour localement — synchronisation au retour de la connexion.' : 'Profil mis à jour avec succès.' }
      : { ok: false, text: res.error || 'Erreur lors de la mise à jour.' });
    setSaving(false);
  };

  const dirty = form.first_name !== (user?.firstName || '')
    || form.last_name !== (user?.lastName || '')
    || form.phone !== (user?.phone || '');

  return (
    <DashboardLayout title="Mon profil">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Carte identité */}
        <div className="card flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-black shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="badge badge-info">{ROLE_LABELS[user?.role] || user?.role}</span>
              {user?.is_verified || user?.verified ? (
                <span className="badge badge-success flex items-center gap-1"><CheckCircle size={11} /> Vérifié</span>
              ) : (
                <span className="badge badge-warning">Non vérifié</span>
              )}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {user?.email}
            </div>
          </div>
        </div>

        {/* Solde (clients & propriétaires) */}
        {(user?.role === 'CLIENT' || user?.role === 'OWNER') && user?.balance != null && (
          <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet size={24} />
                <div>
                  <div className="text-sm text-primary-100">Solde AutoLink</div>
                  <div className="text-2xl font-black">{Number(user.balance).toLocaleString()} FCFA</div>
                </div>
              </div>
              {user.role === 'CLIENT' && (
                <div className="text-xs text-primary-100 text-right">Rechargez depuis votre tableau de bord</div>
              )}
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        <form onSubmit={save} className="card space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={17} /> Informations personnelles
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <input type="text" className="input-field" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Nom</label>
              <input type="text" className="input-field" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field bg-slate-50 dark:bg-slate-800 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-slate-400 mt-1">L'adresse email ne peut pas être modifiée — contactez le support.</p>
          </div>

          {msg && (
            <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${msg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {msg.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving || !dirty}
              className="btn-primary py-2.5 px-6 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader size={15} className="animate-spin" />}
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        {/* Compte */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Shield size={17} /> Compte
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
            <div>Membre depuis le {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</div>
            <div>Identifiant : <span className="font-mono">{user?.username || user?.email}</span></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
