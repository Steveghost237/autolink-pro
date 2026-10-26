import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, FileText, UserCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { driversAPI } from '../../services/api';

const STATUS = { pending: 'En attente', review: 'En examen', approved: 'Approuvé', rejected: 'Refusé' };
const SORT_OPTIONS = [
  { value: 'applied_at', label: 'Date de candidature' },
  { value: 'experience_years', label: 'Expérience' },
  { value: 'status', label: 'Statut' },
  { value: 'reviewed_at', label: 'Date d’examen' },
];
const CHECKLIST = [
  ['has_valid_license', 'Permis valide'],
  ['has_clean_criminal_record', 'Casier judiciaire vérifié'],
  ['has_medical_certificate', 'Certificat médical vérifié'],
  ['driving_test_passed', 'Test de conduite réussi'],
  ['training_completed', 'Formation terminée'],
];
const DOCUMENTS = [
  ['license_document', 'Permis'],
  ['criminal_record_document', 'Casier judiciaire'],
  ['medical_certificate_document', 'Certificat médical'],
];

function ReviewApplication({ application, onClose, onSaved }) {
  const confirm = useConfirm();
  const [form, setForm] = useState(application);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const save = async (decision) => {
    if (decision === 'approved' && !(
      form.has_valid_license && form.has_clean_criminal_record &&
      form.has_medical_certificate && form.driving_test_passed && form.training_completed &&
      Number(form.experience_years) >= 2 && DOCUMENTS.every(([key]) => Boolean(form[key]))
    )) {
      setError('Validez tous les critères et vérifiez les documents avant l’approbation.');
      return;
    }
    if (decision === 'rejected' && !form.reviewer_notes?.trim()) {
      setError('Ajoutez une note expliquant le refus.');
      return;
    }
    const actionLabel = decision === 'approved' ? 'approuver' : decision === 'rejected' ? 'refuser' : 'enregistrer';
    if (!(await confirm({
      title: `Confirmer : ${actionLabel} la candidature ?`,
      message: `${application.applicant_name || application.applicant_email} — cette décision sera enregistrée.`,
      confirmLabel: decision === 'approved' ? 'Approuver' : decision === 'rejected' ? 'Refuser' : 'Enregistrer',
      danger: decision === 'rejected',
    }))) return;
    setSaving(true);
    try {
      const payload = {
        status: decision,
        experience_years: form.experience_years,
        has_valid_license: form.has_valid_license,
        has_clean_criminal_record: form.has_clean_criminal_record,
        has_medical_certificate: form.has_medical_certificate,
        driving_test_passed: form.driving_test_passed,
        driving_test_score: form.driving_test_score || null,
        training_completed: form.training_completed,
        reviewer_notes: form.reviewer_notes || '',
      };
      await driversAPI.updateAdminApplication(application.id, payload);
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La décision n’a pas pu être enregistrée.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="card my-auto max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div><h2 className="text-xl font-bold">{application.applicant_name || application.applicant_email}</h2><p className="text-sm text-slate-500">{application.applicant_email} · {application.applicant_phone || 'Téléphone non renseigné'}</p></div>
          <button onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <p className="text-sm text-slate-600">Expérience : {form.experience_years} an(s) · Candidature du {new Date(application.applied_at).toLocaleDateString('fr-FR')} · conformité {application.compliance_score}%</p>
        <div className="space-y-2">
          {CHECKLIST.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <input type="checkbox" checked={Boolean(form[key])} onChange={event => setForm(value => ({ ...value, [key]: event.target.checked }))} />
              {label}
            </label>
          ))}
          <label className="block text-sm">Années d’expérience
            <input type="number" min="0" className="input-field mt-1" value={form.experience_years}
              onChange={event => setForm(value => ({ ...value, experience_years: event.target.value }))} />
          </label>
          <label className="block text-sm">Résultat du test de conduite
            <input type="number" min="0" max="100" className="input-field mt-1" value={form.driving_test_score || ''}
              onChange={event => setForm(value => ({ ...value, driving_test_score: event.target.value }))} />
          </label>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Documents soumis</h3>
          {DOCUMENTS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>{label}</span>
              {application[key] ? <a className="text-primary-600 underline" href={application[key]} target="_blank" rel="noreferrer">Consulter</a> : <span className="text-slate-400">Non fourni</span>}
            </div>
          ))}
        </div>
        <label className="block text-sm">Notes du réviseur
          <textarea rows={3} className="input-field mt-1" value={form.reviewer_notes || ''}
            onChange={event => setForm(value => ({ ...value, reviewer_notes: event.target.value }))} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button disabled={saving} className="btn-outline flex-1" onClick={() => save('review')}>Enregistrer l’examen</button>
          <button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700" onClick={() => save('rejected')}><XCircle size={16} /> Refuser</button>
          <button disabled={saving} className="btn-primary flex-1" onClick={() => save('approved')}><CheckCircle size={16} className="mr-1 inline" /> Approuver</button>
        </div>
      </div>
    </div>
  );
}

export default function DriverRecruitment() {
  const [view, setView] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('applied_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [driverCount, setDriverCount] = useState(0);
  const [driverPage, setDriverPage] = useState(1);
  const [driverSearch, setDriverSearch] = useState('');
  const [driverSortField, setDriverSortField] = useState('certified_at');
  const [driverSortOrder, setDriverSortOrder] = useState('desc');

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.adminApplications({
        page, page_size: 20, search: search.trim(), status: status || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      setApplications(data.results || []);
      setCount(data.count ?? 0);
      setError('');
    } catch (_) { setError('Impossible de charger les candidatures.'); }
  }, [page, search, status, sortField, sortOrder]);
  useEffect(() => { load(); }, [load]);

  const loadDrivers = useCallback(async () => {
    try {
      const { data } = await driversAPI.adminProfiles({
        page: driverPage, page_size: 20, search: driverSearch.trim(),
        ordering: `${driverSortOrder === 'desc' ? '-' : ''}${driverSortField}`,
      });
      setDrivers(data.results || []);
      setDriverCount(data.count ?? 0);
      setError('');
    } catch (_) { setError('Impossible de charger les profils chauffeurs.'); }
  }, [driverPage, driverSearch, driverSortField, driverSortOrder]);
  useEffect(() => { if (view === 'drivers') loadDrivers(); }, [view, loadDrivers]);

  return (
    <DashboardLayout title="Recrutement des chauffeurs">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className={view === 'applications' ? 'btn-primary' : 'btn-outline'} onClick={() => setView('applications')}>Candidatures</button>
          <button className={view === 'drivers' ? 'btn-primary' : 'btn-outline'} onClick={() => setView('drivers')}>Chauffeurs actifs</button>
          <a className="btn-outline" href="/driver/application">Formulaire candidat</a>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {view === 'applications' ? (
        <>
        <p className="text-sm text-slate-500">{count} candidature(s)</p>
        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder="Rechercher candidat, email, permis" />
          <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          {applications.map(application => (
            <article key={application.id} className="card flex flex-wrap items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                {(application.applicant_name || application.applicant_email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{application.applicant_name || 'Candidat'} · {STATUS[application.status] || application.status}</h2>
                <p className="text-sm text-slate-500">{application.applicant_email} · {application.experience_years} an(s) d’expérience · conformité {application.compliance_score}%</p>
                <p className="text-xs text-slate-400">{new Date(application.applied_at).toLocaleDateString('fr-FR')} · {application.applicant_phone || 'Téléphone non renseigné'}</p>
              </div>
              <div className="flex gap-2">
                {DOCUMENTS.some(([key]) => application[key]) && <FileText size={18} className="text-slate-500" aria-label="Documents joints" />}
                <button className="btn-primary flex items-center gap-2" onClick={() => setSelected(application)}><UserCheck size={16} /> Examiner</button>
              </div>
            </article>
          ))}
          {applications.length === 0 && <div className="card py-14 text-center text-slate-500">Aucune candidature à afficher.</div>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Page {page} / {Math.max(1, Math.ceil(count / 20))}</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>Suivant</button>
          </div>
        </div>
        </>
        ) : (
        <section className="space-y-4">
          <p className="text-sm text-slate-500">{driverCount} chauffeur(s)</p>
          <div className="card">
            <ListToolbar search={driverSearch} onSearchChange={value => { setDriverSearch(value); setDriverPage(1); }}
              sortField={driverSortField} onSortFieldChange={value => { setDriverSortField(value); setDriverPage(1); }}
              sortOrder={driverSortOrder} onSortOrderChange={value => { setDriverSortOrder(value); setDriverPage(1); }}
              sortOptions={[
                { value: 'certified_at', label: 'Date de certification' },
                { value: 'rating', label: 'Note' },
                { value: 'total_trips', label: 'Courses' },
                { value: 'total_earned', label: 'Gains' },
                { value: 'is_online', label: 'Disponibilité' },
              ]} placeholder="Rechercher un chauffeur" />
          </div>
          <div className="space-y-3">
            {drivers.map(profile => (
              <article key={profile.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{profile.driver_name || profile.driver_email}</h2>
                  <p className="text-sm text-slate-500">{profile.driver_email} · {profile.total_trips} course(s) · {Number(profile.rating).toFixed(1)} / 5</p>
                  <p className="text-xs text-slate-500">{profile.assigned_vehicle ? `Véhicule #${profile.assigned_vehicle}` : 'Aucun véhicule attribué'} · {profile.is_online ? 'En ligne' : 'Hors ligne'}</p>
                </div>
                <div className="text-right"><div className="font-semibold">{Number(profile.total_earned).toLocaleString('fr-FR')} FCFA</div><div className="text-xs text-slate-500">Gains enregistrés</div></div>
              </article>
            ))}
            {drivers.length === 0 && <div className="card py-14 text-center text-slate-500">Aucun profil chauffeur à afficher.</div>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Page {driverPage} / {Math.max(1, Math.ceil(driverCount / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={driverPage <= 1} onClick={() => setDriverPage(value => value - 1)}>Précédent</button>
              <button className="btn-outline px-3 py-1" disabled={driverPage * 20 >= driverCount} onClick={() => setDriverPage(value => value + 1)}>Suivant</button>
            </div>
          </div>
        </section>
        )}
      </div>
      {selected && <ReviewApplication application={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </DashboardLayout>
  );
}
