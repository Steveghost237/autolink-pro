import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { kycAPI } from '../services/api';
import { formatNumber, formatDate, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Profile', text, options);

const ROLE_LABELS = { CLIENT: 'Client', OWNER: 'Propriétaire', DRIVER: 'Chauffeur', ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur' };

const KYC = {
  none: { label: 'Documents non fournis', cls: 'badge-neutral', icon: 'help', text: "Déposez votre pièce d'identité (et votre permis si vous conduisez) pour réserver plus rapidement." },
  pending: { label: 'En cours de vérification', cls: 'badge-warning', icon: 'hourglass_top', text: 'Notre équipe vérifie vos documents. Vous serez notifié dès leur validation.' },
  approved: { label: 'Identité vérifiée', cls: 'badge-success', icon: 'verified', text: 'Vos documents sont validés. Vous pouvez réserver sans formalité supplémentaire.' },
  rejected: { label: 'Documents refusés', cls: 'badge-error', icon: 'gpp_bad', text: 'Vos documents ont été refusés. Déposez de nouvelles pièces lisibles et en cours de validité.' },
};

const EMPTY = (user) => ({
  first_name: user?.firstName || '', last_name: user?.lastName || '', phone: user?.phone || '',
  city: user?.city || '', address: user?.address || '', date_of_birth: user?.date_of_birth || '',
});

function DocumentSlot({ label, hint, current, file, onFile, verified }) {
  return (
    <label className={`flex flex-col gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${file ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant hover:border-primary/60 dark:border-slate-600'}`}>
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-label-lg text-label-lg text-on-surface dark:text-white"><Icon name="badge" className="text-primary" />{t(label)}</span>
        {current && !file && <span className={verified ? 'badge-success' : 'badge-info'}><Icon name={verified ? 'verified' : 'description'} size={14} />{verified ? t('Validé') : t('Déposé')}</span>}
      </span>
      <span className="font-body-sm text-body-sm text-on-surface-variant">{file ? file.name : t(hint)}</span>
      <span className="flex items-center gap-2 font-label-md text-label-md text-primary"><Icon name="upload_file" size={18} />{file ? t('Changer le fichier') : current ? t('Remplacer le document') : t('Choisir un fichier (JPG, PNG, PDF · 8 Mo max)')}</span>
      {current && !file && <a href={current} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-body-sm text-body-sm text-on-surface-variant underline w-fit">{t('Voir le document actuel')}</a>}
      <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
    </label>
  );
}

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth();
  const [form, setForm] = useState(EMPTY(user));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [docs, setDocs] = useState({ id_document: null, driving_license: null, driving_license_expires_at: '' });
  const [uploading, setUploading] = useState(false);
  const [kycMsg, setKycMsg] = useState(null);

  useEffect(() => { refreshUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(EMPTY(user)); }, [user]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(EMPTY(user));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res = await updateUser({ ...form, date_of_birth: form.date_of_birth || null });
    setMsg(res.success
      ? { ok: true, text: res.offline ? t('Profil mis à jour localement — synchronisation au retour de la connexion.') : t('Profil mis à jour avec succès.') }
      : { ok: false, text: res.error || t('Erreur lors de la mise à jour.') });
    setSaving(false);
  };

  const uploadDocs = async () => {
    setUploading(true); setKycMsg(null);
    const payload = new FormData();
    if (docs.id_document) payload.append('id_document', docs.id_document);
    if (docs.driving_license) payload.append('driving_license', docs.driving_license);
    if (docs.driving_license_expires_at) payload.append('driving_license_expires_at', docs.driving_license_expires_at);
    try {
      await kycAPI.upload(payload);
      await refreshUser();
      setDocs({ id_document: null, driving_license: null, driving_license_expires_at: '' });
      setKycMsg({ ok: true, text: t('Documents envoyés. Notre équipe les vérifie rapidement.') });
    } catch (e) {
      const data = e.response?.data || {};
      setKycMsg({ ok: false, text: String(Object.values(data).flat()[0] || t('Envoi impossible — réessayez.')) });
    }
    setUploading(false);
  };

  const kyc = KYC[user?.kyc_status] || KYC.none;
  const hasWallet = ['CLIENT', 'OWNER', 'DRIVER'].includes(user?.role) && user?.balance != null;
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <DashboardLayout title={t('Profil & paramètres')} subtitle={t('Gérez vos informations personnelles et vos documents justificatifs.')}>
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">
        <aside className="flex flex-col gap-4">
          <div className="card flex flex-col items-center text-center gap-3">
            <span className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-xl text-headline-xl">{initials}</span>
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant flex items-center justify-center gap-1"><Icon name="mail" size={16} />{user?.email}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="badge-info">{t(ROLE_LABELS[user?.role] || user?.role || '')}</span>
              <span className={kyc.cls}><Icon name={kyc.icon} size={14} />{t(kyc.label)}</span>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-outline-variant/30">
              <div><div className="overline">{t('Membre depuis')}</div><div className="font-label-lg text-label-lg">{user?.created_at ? formatDate(user.created_at) : '—'}</div></div>
              <div><div className="overline">{t('Identifiant')}</div><div className="font-mono text-[12px] truncate">{user?.username || user?.email}</div></div>
            </div>
          </div>
          {hasWallet && (
            <div className="card-dark flex items-center justify-between gap-3">
              <div>
                <div className="font-label-sm text-label-sm uppercase tracking-wider text-surface-variant">{t('Solde AutoLink')}</div>
                <div className="font-headline-lg text-headline-lg text-surface-bright">{formatNumber(user.balance)} <span className="font-label-md text-label-md text-primary-fixed-dim">FCFA</span></div>
              </div>
              <Link to={user.role === 'CLIENT' ? '/client/wallet' : user.role === 'OWNER' ? '/owner/revenue' : '/driver/revenue'} className="btn-primary py-2 px-3"><Icon name="account_balance_wallet" size={18} />{user.role === 'CLIENT' ? t('Portefeuille') : t('Retraits')}</Link>
            </div>
          )}
          <Link to="/settings" className="card flex items-center justify-between hover:shadow-elevation-2">
            <span className="flex items-center gap-2 font-label-lg text-label-lg"><Icon name="settings" className="text-primary" />{t('Préférences, langue & sécurité')}</span><Icon name="chevron_right" />
          </Link>
        </aside>

        <div className="flex flex-col gap-6">
          <form onSubmit={save} className="card flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="person" className="text-primary" />{t('Informations personnelles')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label><span className="label">{t('Prénom')}</span><input className="input-field" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} /></label>
              <label><span className="label">{t('Nom')}</span><input className="input-field" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} /></label>
              <label><span className="label">{t('Téléphone (Mobile Money)')}</span><input type="tel" className="input-field" placeholder="+237 6XX XX XX XX" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
              <label><span className="label">{t('Date de naissance')}</span><input type="date" className="input-field" value={form.date_of_birth || ''} onChange={(e) => set('date_of_birth', e.target.value)} /></label>
              <label><span className="label">{t('Ville')}</span><input className="input-field" placeholder={t('Douala, Yaoundé…')} value={form.city} onChange={(e) => set('city', e.target.value)} /></label>
              <label><span className="label">{t('Email')}</span><input type="email" className="input-field opacity-70 cursor-not-allowed" value={user?.email || ''} disabled /></label>
              <label className="sm:col-span-2"><span className="label">{t('Adresse')}</span><textarea rows={2} className="input-field" value={form.address} onChange={(e) => set('address', e.target.value)} /></label>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{t("L'adresse email ne peut pas être modifiée — contactez le support.")}</p>
            {msg && <p className={`rounded-xl px-4 py-3 font-body-md text-body-md flex items-center gap-2 ${msg.ok ? 'bg-primary-fixed/40 text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}><Icon name={msg.ok ? 'check_circle' : 'error'} size={18} />{msg.text}</p>}
            <button type="submit" disabled={saving || !dirty} className="btn-primary w-fit self-end">{saving ? t('Enregistrement…') : t('Enregistrer les modifications')}</button>
          </form>

          <section className="card flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white flex items-center gap-2"><Icon name="verified_user" className="text-primary" />{t('Documents & vérification d’identité')}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t(kyc.text)}</p>
                {user?.kyc_status === 'rejected' && user?.kyc_note && <p className="font-body-sm text-body-sm text-error mt-1">{t('Motif :')} {user.kyc_note}</p>}
              </div>
              <span className={kyc.cls}><Icon name={kyc.icon} size={14} />{t(kyc.label)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentSlot label="Pièce d'identité (CNI / passeport)" hint="Recto lisible, en cours de validité" current={user?.id_document} verified={user?.id_document_verified}
                file={docs.id_document} onFile={(file) => setDocs((d) => ({ ...d, id_document: file }))} />
              <DocumentSlot label="Permis de conduire" hint="Obligatoire si vous conduisez vous-même" current={user?.driving_license} verified={user?.kyc_status === 'approved'}
                file={docs.driving_license} onFile={(file) => setDocs((d) => ({ ...d, driving_license: file }))} />
            </div>
            {(docs.driving_license || user?.driving_license) && (
              <label className="sm:w-1/2"><span className="label">{t("Date d'expiration du permis")}</span><input type="date" className="input-field" value={docs.driving_license_expires_at || user?.driving_license_expires_at || ''} onChange={(e) => setDocs((d) => ({ ...d, driving_license_expires_at: e.target.value }))} /></label>
            )}
            {kycMsg && <p className={`rounded-xl px-4 py-3 font-body-md text-body-md ${kycMsg.ok ? 'bg-primary-fixed/40 text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>{kycMsg.text}</p>}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="lock" size={16} />{t('Vos documents sont stockés de façon sécurisée et consultés uniquement par l’équipe de vérification.')}</span>
              <button onClick={uploadDocs} disabled={uploading || (!docs.id_document && !docs.driving_license)} className="btn-primary shrink-0"><Icon name="cloud_upload" size={18} />{uploading ? t('Envoi…') : t('Envoyer pour vérification')}</button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
