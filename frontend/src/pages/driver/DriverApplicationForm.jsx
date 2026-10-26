import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { driversAPI } from '../../services/api';

const CHECKS = [
  ['has_valid_license', 'Permis de conduire valide'],
  ['has_clean_criminal_record', 'Casier judiciaire vierge'],
  ['has_medical_certificate', 'Certificat médical valide'],
  ['driving_test_passed', 'Test de conduite réussi'],
  ['training_completed', 'Formation AutoLink terminée'],
];
const DOCUMENTS = [
  ['license_document', 'Copie du permis'],
  ['criminal_record_document', 'Extrait de casier judiciaire'],
  ['medical_certificate_document', 'Certificat médical'],
];

const initialForm = {
  experience_years: 0, has_valid_license: false, license_number: '',
  license_expiry: '', has_clean_criminal_record: false,
  has_medical_certificate: false, driving_test_passed: false,
  driving_test_score: '', training_completed: false,
};

export default function DriverApplicationForm() {
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.applications({ page_size: 1 });
      const current = (data.results || data)[0];
      if (current) {
        setApplication(current);
        setForm(value => ({ ...value, ...current }));
      }
    } catch (_) {
      setError('Impossible de charger votre candidature.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) payload.append(key, value);
    });
    Object.entries(documents).forEach(([key, file]) => { if (file) payload.append(key, file); });
    try {
      const response = application
        ? await driversAPI.updateApplication(application.id, payload)
        : await driversAPI.createApplication(payload);
      setApplication(response.data);
      setForm(value => ({ ...value, ...response.data }));
      setSuccess('Votre candidature a été enregistrée.');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La candidature n’a pas pu être enregistrée.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Devenir chauffeur">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={submit} className="card space-y-5">
          <div>
            <h2 className="text-xl font-bold">Candidature chauffeur</h2>
            <p className="mt-1 text-sm text-slate-500">Renseignez votre expérience, les vérifications effectuées et les documents à examiner.</p>
          </div>
          {loading ? <p className="py-8 text-center text-slate-500">Chargement…</p> : (
            <>
              {application && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Statut : <strong>{application.status}</strong>{application.reviewer_notes && ` — ${application.reviewer_notes}`}</p>}
              <label className="block text-sm">Années d’expérience
                <input className="input-field mt-1" type="number" min="0" required value={form.experience_years}
                  onChange={event => setForm(value => ({ ...value, experience_years: event.target.value }))} />
              </label>
              <label className="block text-sm">Numéro du permis
                <input className="input-field mt-1" value={form.license_number || ''}
                  onChange={event => setForm(value => ({ ...value, license_number: event.target.value }))} />
              </label>
              <label className="block text-sm">Expiration du permis
                <input className="input-field mt-1" type="date" value={form.license_expiry || ''}
                  onChange={event => setForm(value => ({ ...value, license_expiry: event.target.value }))} />
              </label>
              <div className="space-y-2">
                <h3 className="font-semibold">Éléments de candidature</h3>
                {CHECKS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                    <input type="checkbox" checked={Boolean(form[key])}
                      onChange={event => setForm(value => ({ ...value, [key]: event.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Documents justificatifs</h3>
                {DOCUMENTS.map(([key, label]) => (
                  <label key={key} className="block text-sm">{label}
                    {application?.[key] && <a className="ml-2 text-primary-600 underline" href={application[key]} target="_blank" rel="noreferrer">Document actuel</a>}
                    <input className="input-field mt-1" type="file" accept="image/*" onChange={event => setDocuments(value => ({ ...value, [key]: event.target.files[0] }))} />
                  </label>
                ))}
              </div>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-emerald-700">{success}</p>}
              <button className="btn-primary w-full" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer ma candidature'}</button>
            </>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
