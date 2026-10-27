import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, FileText, UserCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { driversAPI } from '../../services/api';
import { formatDate, formatNumber,  uiText } from '../../i18n';

const STATUS = {
  pending: uiText("pages.admin.DriverRecruitment", "En attente"),
  review: uiText("pages.admin.DriverRecruitment", "En examen"),
  approved: uiText("pages.admin.DriverRecruitment", "Approuvé"),
  rejected: uiText("pages.admin.DriverRecruitment", "Refusé"),
};
const SORT_OPTIONS = [
  { value: 'applied_at', label: uiText("pages.admin.DriverRecruitment", "Date de candidature") },
  { value: 'experience_years', label: uiText("pages.admin.DriverRecruitment", "Expérience") },
  { value: 'status', label: uiText("pages.admin.DriverRecruitment", "Statut") },
  { value: 'reviewed_at', label: uiText("pages.admin.DriverRecruitment", "Date d’examen") },
];
const CHECKLIST = [
  ['has_valid_license', uiText("pages.admin.DriverRecruitment", "Permis valide")],
  ['has_clean_criminal_record', uiText("pages.admin.DriverRecruitment", "Casier judiciaire vérifié")],
  ['has_medical_certificate', uiText("pages.admin.DriverRecruitment", "Certificat médical vérifié")],
  ['driving_test_passed', uiText("pages.admin.DriverRecruitment", "Test de conduite réussi")],
  ['training_completed', uiText("pages.admin.DriverRecruitment", "Formation terminée")],
];
const DOCUMENTS = [
  ['license_document', uiText("pages.admin.DriverRecruitment", "Permis")],
  ['criminal_record_document', uiText("pages.admin.DriverRecruitment", "Casier judiciaire")],
  ['medical_certificate_document', uiText("pages.admin.DriverRecruitment", "Certificat médical")],
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
      setError(uiText("pages.admin.DriverRecruitment", "Validez tous les critères et vérifiez les documents avant l’approbation."));
      return;
    }
    if (decision === 'rejected' && !form.reviewer_notes?.trim()) {
      setError(uiText("pages.admin.DriverRecruitment", "Ajoutez une note expliquant le refus."));
      return;
    }
    const actionLabel = decision === 'approved' ? uiText("pages.admin.DriverRecruitment", "approuver") : decision === 'rejected' ? uiText("pages.admin.DriverRecruitment", "refuser") : uiText("pages.admin.DriverRecruitment", "enregistrer");
    if (!(await confirm({
      title: uiText("pages.admin.DriverRecruitment", "Confirmer : {{action}} la candidature ?", { action: actionLabel }),
      message: uiText("pages.admin.DriverRecruitment", "{{name}} — cette décision sera enregistrée.", { name: application.applicant_name || application.applicant_email }),
      confirmLabel: decision === 'approved' ? uiText("pages.admin.DriverRecruitment", "Approuver") : decision === 'rejected' ? uiText("pages.admin.DriverRecruitment", "Refuser") : uiText("pages.admin.DriverRecruitment", "Enregistrer"),
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
      setError(requestError.response?.data?.detail || uiText("pages.admin.DriverRecruitment", "La décision n’a pas pu être enregistrée."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="card my-auto max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div><h2 className="text-xl font-bold">{application.applicant_name || application.applicant_email}</h2><p className="text-sm text-slate-500">{application.applicant_email}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{application.applicant_phone || uiText("pages.admin.DriverRecruitment", "Téléphone non renseigné")}</p></div>
          <button onClick={onClose} aria-label={uiText("pages.admin.DriverRecruitment", "Fermer")}>{uiText("pages.admin.DriverRecruitment", "×")}</button>
        </div>
        <p className="text-sm text-slate-600">{uiText("pages.admin.DriverRecruitment", "Expérience :") + " "}{form.experience_years}{" " + uiText("pages.admin.DriverRecruitment", "an(s) · Candidature du") + " "}{formatDate(new Date(application.applied_at))}{" " + uiText("pages.admin.DriverRecruitment", "· conformité") + " "}{application.compliance_score}{uiText("pages.admin.DriverRecruitment", "%")}</p>
        <div className="space-y-2">
          {CHECKLIST.map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <input type="checkbox" checked={Boolean(form[key])} onChange={event => setForm(value => ({ ...value, [key]: event.target.checked }))} />
              {label}
            </label>
          ))}
          <label className="block text-sm">{uiText("pages.admin.DriverRecruitment", "Années d’expérience") + " "}<input type="number" min="0" className="input-field mt-1" value={form.experience_years}
              onChange={event => setForm(value => ({ ...value, experience_years: event.target.value }))} />
          </label>
          <label className="block text-sm">{uiText("pages.admin.DriverRecruitment", "Résultat du test de conduite") + " "}<input type="number" min="0" max="100" className="input-field mt-1" value={form.driving_test_score || ''}
              onChange={event => setForm(value => ({ ...value, driving_test_score: event.target.value }))} />
          </label>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">{uiText("pages.admin.DriverRecruitment", "Documents soumis")}</h3>
          {DOCUMENTS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>{label}</span>
              {application[key] ? <a className="text-primary-600 underline" href={application[key]} target="_blank" rel="noreferrer">{uiText("pages.admin.DriverRecruitment", "Consulter")}</a> : <span className="text-slate-400">{uiText("pages.admin.DriverRecruitment", "Non fourni")}</span>}
            </div>
          ))}
        </div>
        <label className="block text-sm">{uiText("pages.admin.DriverRecruitment", "Notes du réviseur") + " "}<textarea rows={3} className="input-field mt-1" value={form.reviewer_notes || ''}
            onChange={event => setForm(value => ({ ...value, reviewer_notes: event.target.value }))} />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button disabled={saving} className="btn-outline flex-1" onClick={() => save('review')}>{uiText("pages.admin.DriverRecruitment", "Enregistrer l’examen")}</button>
          <button disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-700" onClick={() => save('rejected')}><XCircle size={16} />{" " + uiText("pages.admin.DriverRecruitment", "Refuser")}</button>
          <button disabled={saving} className="btn-primary flex-1" onClick={() => save('approved')}><CheckCircle size={16} className="mr-1 inline" />{" " + uiText("pages.admin.DriverRecruitment", "Approuver")}</button>
        </div>
      </div>
    </div>
  );
}


const REQUEST_STATUS = {
  pending:    { label: 'En attente',            style: 'bg-amber-100 text-amber-700' },
  recruiting: { label: 'Recrutement en cours',  style: 'bg-blue-100 text-blue-700' },
  training:   { label: 'Formation en cours',    style: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Chauffeur transmis',    style: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',               style: 'bg-red-100 text-red-600' },
};

function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.serviceRequests();
      setRequests(data.results || data || []);
    } catch (_) { setRequests([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (r, status) => {
    try {
      const { data } = await driversAPI.updateServiceRequest(r.id, { status });
      setRequests(prev => prev.map(x => x.id === r.id ? data : x));
    } catch (_) {}
  };

  if (loading) return <p className="text-center py-10 text-slate-400 text-sm">{uiText("pages.admin.DriverRecruitment", "Chargement…")}</p>;
  if (requests.length === 0) return (
    <div className="card py-14 text-center text-slate-500">
      <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
      {uiText("pages.admin.DriverRecruitment", "Aucune demande de service chauffeur.")}
    </div>
  );

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {[uiText("pages.admin.DriverRecruitment", "Propriétaire"), uiText("pages.admin.DriverRecruitment", "Chauffeurs"), uiText("pages.admin.DriverRecruitment", "Ville"), uiText("pages.admin.DriverRecruitment", "Critères"), uiText("pages.admin.DriverRecruitment", "Montant"), uiText("pages.admin.DriverRecruitment", "Statut")].map(h => (
                <th key={h} className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 px-4 py-3 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">{r.owner_name}</div>
                  <div className="text-xs text-slate-500">{r.owner_phone || r.owner_email}</div>
                </td>
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.drivers_count}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{r.city}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-48 truncate">{r.requirements || '—'}</td>
                <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">{formatNumber(Number(r.total_price))} F</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={e => setStatus(r, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${REQUEST_STATUS[r.status]?.style}`}>
                    {Object.entries(REQUEST_STATUS).map(([v, st]) => <option key={v} value={v}>{st.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    } catch (_) { setError(uiText("pages.admin.DriverRecruitment", "Impossible de charger les candidatures.")); }
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
    } catch (_) { setError(uiText("pages.admin.DriverRecruitment", "Impossible de charger les profils chauffeurs.")); }
  }, [driverPage, driverSearch, driverSortField, driverSortOrder]);
  useEffect(() => { if (view === 'drivers') loadDrivers(); }, [view, loadDrivers]);

  return (
    <DashboardLayout title={uiText("pages.admin.DriverRecruitment", "Recrutement des chauffeurs")}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className={view === 'applications' ? uiText("pages.admin.DriverRecruitment", "btn-primary") : uiText("pages.admin.DriverRecruitment", "btn-outline")} onClick={() => setView('applications')}>{uiText("pages.admin.DriverRecruitment", "Candidatures")}</button>
          <button className={view === 'drivers' ? uiText("pages.admin.DriverRecruitment", "btn-primary") : uiText("pages.admin.DriverRecruitment", "btn-outline")} onClick={() => setView('drivers')}>{uiText("pages.admin.DriverRecruitment", "Chauffeurs actifs")}</button>
          <button className={view === 'requests' ? uiText("pages.admin.DriverRecruitment", "btn-primary") : uiText("pages.admin.DriverRecruitment", "btn-outline")} onClick={() => setView('requests')}>{uiText("pages.admin.DriverRecruitment", "Demandes propriétaires")}</button>
          <a className="btn-outline" href="/driver/application">{uiText("pages.admin.DriverRecruitment", "Formulaire candidat")}</a>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {view === 'requests' ? <OwnerRequests /> : view === 'applications' ? (
        <>
        <p className="text-sm text-slate-500">{count}{" " + uiText("pages.admin.DriverRecruitment", "candidature(s)")}</p>
        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder={uiText("pages.admin.DriverRecruitment", "Rechercher candidat, email, permis")} />
          <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
            <option value="">{uiText("pages.admin.DriverRecruitment", "Tous les statuts")}</option>
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
                <h2 className="font-semibold">{application.applicant_name || uiText("pages.admin.DriverRecruitment", "Candidat")}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{STATUS[application.status] || application.status}</h2>
                <p className="text-sm text-slate-500">{application.applicant_email}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{application.experience_years}{" " + uiText("pages.admin.DriverRecruitment", "an(s) d’expérience · conformité") + " "}{application.compliance_score}{uiText("pages.admin.DriverRecruitment", "%")}</p>
                <p className="text-xs text-slate-400">{formatDate(new Date(application.applied_at))}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{application.applicant_phone || uiText("pages.admin.DriverRecruitment", "Téléphone non renseigné")}</p>
              </div>
              <div className="flex gap-2">
                {DOCUMENTS.some(([key]) => application[key]) && <FileText size={18} className="text-slate-500" aria-label={uiText("pages.admin.DriverRecruitment", "Documents joints")} />}
                <button className="btn-primary flex items-center gap-2" onClick={() => setSelected(application)}><UserCheck size={16} />{" " + uiText("pages.admin.DriverRecruitment", "Examiner")}</button>
              </div>
            </article>
          ))}
          {applications.length === 0 && <div className="card py-14 text-center text-slate-500">{uiText("pages.admin.DriverRecruitment", "Aucune candidature à afficher.")}</div>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>{uiText("pages.admin.DriverRecruitment", "Page") + " "}{page}{" " + uiText("pages.admin.DriverRecruitment", "/") + " "}{Math.max(1, Math.ceil(count / 20))}</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.DriverRecruitment", "Précédent")}</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.DriverRecruitment", "Suivant")}</button>
          </div>
        </div>
        </>
        ) : (
        <section className="space-y-4">
          <p className="text-sm text-slate-500">{driverCount}{" " + uiText("pages.admin.DriverRecruitment", "chauffeur(s)")}</p>
          <div className="card">
            <ListToolbar search={driverSearch} onSearchChange={value => { setDriverSearch(value); setDriverPage(1); }}
              sortField={driverSortField} onSortFieldChange={value => { setDriverSortField(value); setDriverPage(1); }}
              sortOrder={driverSortOrder} onSortOrderChange={value => { setDriverSortOrder(value); setDriverPage(1); }}
              sortOptions={[
                { value: 'certified_at', label: uiText("pages.admin.DriverRecruitment", "Date de certification") },
                { value: 'rating', label: uiText("pages.admin.DriverRecruitment", "Note") },
                { value: 'total_trips', label: uiText("pages.admin.DriverRecruitment", "Courses") },
                { value: 'total_earned', label: uiText("pages.admin.DriverRecruitment", "Gains") },
                { value: 'is_online', label: uiText("pages.admin.DriverRecruitment", "Disponibilité") },
              ]} placeholder={uiText("pages.admin.DriverRecruitment", "Rechercher un chauffeur")} />
          </div>
          <div className="space-y-3">
            {drivers.map(profile => (
              <article key={profile.id} className="card flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{profile.driver_name || profile.driver_email}</h2>
                  <p className="text-sm text-slate-500">{profile.driver_email}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{profile.total_trips}{" " + uiText("pages.admin.DriverRecruitment", "course(s) ·") + " "}{Number(profile.rating).toFixed(1)}{" " + uiText("pages.admin.DriverRecruitment", "/ 5")}</p>
                  <p className="text-xs text-slate-500">{profile.assigned_vehicle ? uiText("pages.admin.DriverRecruitment", "Véhicule #{{id}}", { id: profile.assigned_vehicle }) : uiText("pages.admin.DriverRecruitment", "Aucun véhicule attribué")}{" " + uiText("pages.admin.DriverRecruitment", "·") + " "}{profile.is_online ? uiText("pages.admin.DriverRecruitment", "En ligne") : uiText("pages.admin.DriverRecruitment", "Hors ligne")}</p>
                </div>
                <div className="text-right"><div className="font-semibold">{formatNumber(Number(profile.total_earned))}{" " + uiText("pages.admin.DriverRecruitment", "FCFA")}</div><div className="text-xs text-slate-500">{uiText("pages.admin.DriverRecruitment", "Gains enregistrés")}</div></div>
              </article>
            ))}
            {drivers.length === 0 && <div className="card py-14 text-center text-slate-500">{uiText("pages.admin.DriverRecruitment", "Aucun profil chauffeur à afficher.")}</div>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{uiText("pages.admin.DriverRecruitment", "Page") + " "}{driverPage}{" " + uiText("pages.admin.DriverRecruitment", "/") + " "}{Math.max(1, Math.ceil(driverCount / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={driverPage <= 1} onClick={() => setDriverPage(value => value - 1)}>{uiText("pages.admin.DriverRecruitment", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={driverPage * 20 >= driverCount} onClick={() => setDriverPage(value => value + 1)}>{uiText("pages.admin.DriverRecruitment", "Suivant")}</button>
            </div>
          </div>
        </section>
        )}
      </div>
      {selected && <ReviewApplication application={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </DashboardLayout>
  );
}
