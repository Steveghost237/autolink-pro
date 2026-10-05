import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, Clock, User, AlertTriangle, FileText, Shield, Award, X, Car, Calendar, UserCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { driversAPI } from '../../services/api';

const CRITERIA = [
  { id: 'license', label: 'Permis de conduire valide (catégorie B min.)', required: true },
  { id: 'criminal', label: 'Extrait de casier judiciaire vierge (< 3 mois)', required: true },
  { id: 'medical', label: 'Certificat médical aptitude physique', required: true },
  { id: 'experience', label: 'Minimum 2 ans d\'expérience de conduite', required: true },
  { id: 'driving_test', label: 'Test de conduite sur circuit AutoLink', required: true },
  { id: 'training', label: 'Formation protocole AutoLink (4h)', required: true },
  { id: 'age', label: 'Âge entre 23 et 55 ans', required: true },
  { id: 'photo', label: 'Photo d\'identité récente', required: true },
  { id: 'id_card', label: 'CNI ou passeport en cours de validité', required: true },
  { id: 'references', label: 'Références professionnelles (optionnel)', required: false },
];

const CANDIDATES = [
  { id: 1, name: 'Kofi Boateng', age: 34, phone: '+225 07 11 22 33', email: 'kofi@mail.com', experience: 6, applied: '2025-08-23', status: 'pending', checks: { license: true, criminal: true, medical: false, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: true, references: true } },
  { id: 2, name: 'Sadia Touré', age: 29, phone: '+225 05 44 55 66', email: 'sadia@mail.com', experience: 3, applied: '2025-08-21', status: 'review', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: true, training: false, age: true, photo: true, id_card: true, references: false } },
  { id: 3, name: 'Brice Nguessan', age: 41, phone: '+225 07 77 88 99', email: 'brice@mail.com', experience: 12, applied: '2025-08-19', status: 'approved', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: true, training: true, age: true, photo: true, id_card: true, references: true } },
  { id: 4, name: 'Amara Coulibaly', age: 27, phone: '+225 05 12 34 56', email: 'amara@mail.com', experience: 2, applied: '2025-08-17', status: 'rejected', checks: { license: false, criminal: false, medical: false, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: false, references: false } },
  { id: 5, name: 'Estelle Kouakou', age: 32, phone: '+225 07 55 66 77', email: 'estelle@mail.com', experience: 5, applied: '2025-08-25', status: 'pending', checks: { license: true, criminal: true, medical: true, experience: true, driving_test: false, training: false, age: true, photo: true, id_card: true, references: false } },
];

const STATUS_CONFIG = {
  pending: { label: 'En attente', style: 'badge-warning', icon: Clock },
  review: { label: 'En cours d\'examen', style: 'badge-info', icon: Eye },
  approved: { label: 'Approuvé', style: 'badge-success', icon: CheckCircle },
  rejected: { label: 'Refusé', style: 'badge-error', icon: XCircle },
};

function CandidateModal({ candidate, onClose }) {
  const [checks, setChecks] = useState({ ...candidate.checks });
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState(null);

  const mandatoryPassed = CRITERIA.filter(c => c.required).every(c => checks[c.id]);
  const score = Math.round((Object.values(checks).filter(Boolean).length / CRITERIA.length) * 100);

  if (decision) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        {decision === 'approved'
          ? <CheckCircle size={52} className="text-emerald-500 mx-auto mb-3" />
          : <XCircle size={52} className="text-red-500 mx-auto mb-3" />}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{decision === 'approved' ? 'Candidature approuvée !' : 'Candidature refusée'}</h3>
        <p className="text-slate-500 mb-5">{candidate.name} {decision === 'approved' ? 'peut maintenant rejoindre AutoLink.' : 'a été informé(e) du refus.'}</p>
        <button onClick={onClose} className="btn-primary w-full">Fermer</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{candidate.name}</h3>
            <p className="text-sm text-slate-500">{candidate.age} ans · {candidate.experience} ans d'expérience · Postulé le {candidate.applied}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Score */}
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}%</div>
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-sm text-slate-500 mt-1">Score de conformité</p>
            </div>
            {!mandatoryPassed && <div className="flex items-center gap-1 text-red-600 text-sm"><AlertTriangle size={14} /> Critères obligatoires manquants</div>}
          </div>

          {/* Checklist */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Critères de recrutement</h4>
            <div className="space-y-2">
              {CRITERIA.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checks[c.id] ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-slate-200 hover:border-slate-300'}`}>
                  <input type="checkbox" checked={checks[c.id]} onChange={e => setChecks(ch => ({ ...ch, [c.id]: e.target.checked }))} className="w-4 h-4 accent-emerald-600" />
                  <div className="flex-1 text-sm font-medium text-slate-800">{c.label}</div>
                  {c.required && <span className="text-xs text-red-500 font-semibold">Obligatoire</span>}
                  {checks[c.id] ? <CheckCircle size={16} className="text-emerald-500 shrink-0" /> : <XCircle size={16} className="text-slate-300 shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes d'évaluation (interne)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Observations sur le candidat, points forts, points faibles..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={() => setDecision('rejected')} className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 rounded-xl transition-colors">
            <XCircle size={16} /> Refuser
          </button>
          <button disabled={!mandatoryPassed} onClick={() => setDecision('approved')}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
            <CheckCircle size={16} /> Approuver
          </button>
        </div>
      </div>
    </div>
  );
}

const REQUEST_STATUS = {
  pending:    { label: 'En attente',           style: 'bg-amber-100 text-amber-700' },
  recruiting: { label: 'Recrutement en cours', style: 'bg-blue-100 text-blue-700' },
  training:   { label: 'Formation en cours',   style: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Chauffeur transmis',   style: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',              style: 'bg-red-100 text-red-600' },
};

function OwnerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.serviceRequests();
      setRequests(data.results || data || []);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (r, status) => {
    try {
      const { data } = await driversAPI.updateServiceRequest(r.id, { status });
      setRequests(prev => prev.map(x => x.id === r.id ? data : x));
    } catch (_) {}
  };

  if (loading) return <p className="text-center py-10 text-slate-400 text-sm">Chargement…</p>;
  if (requests.length === 0) return (
    <div className="text-center py-16">
      <UserCheck size={48} className="mx-auto text-slate-300 mb-4" />
      <h3 className="font-bold text-slate-900 mb-2">Aucune demande de service chauffeur</h3>
      <p className="text-sm text-slate-500">Les demandes des propriétaires apparaîtront ici.</p>
    </div>
  );

  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              {['Propriétaire', 'Chauffeurs', 'Ville', 'Critères', 'Montant', 'Statut'].map(h => (
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
                <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">{Number(r.total_price).toLocaleString()} F</td>
                <td className="px-4 py-3">
                  <select value={r.status} onChange={e => setStatus(r, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${REQUEST_STATUS[r.status]?.style}`}>
                    {Object.entries(REQUEST_STATUS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
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
  const [tab, setTab] = useState('pending');
  const [view, setView] = useState('candidates');
  const [selected, setSelected] = useState(null);

  const filtered = CANDIDATES.filter(c => tab === 'all' || c.status === tab);
  const counts = { all: CANDIDATES.length, pending: CANDIDATES.filter(c => c.status === 'pending').length, review: CANDIDATES.filter(c => c.status === 'review').length, approved: CANDIDATES.filter(c => c.status === 'approved').length, rejected: CANDIDATES.filter(c => c.status === 'rejected').length };

  return (
    <DashboardLayout title="Recrutement Chauffeurs">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Criteria info */}
        <div className="card bg-gradient-to-br from-slate-900 to-primary-900 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Processus de recrutement strict AutoLink</h3>
              <p className="text-slate-300 text-sm">Nous appliquons des critères exigeants pour garantir la sécurité de nos clients. <strong>{CRITERIA.filter(c => c.required).length} critères obligatoires</strong> doivent être validés avant toute approbation.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Vérification permis', 'Casier judiciaire', 'Test de conduite', 'Visite médicale', 'Formation obligatoire'].map(t => (
                  <span key={t} className="text-xs bg-white/10 text-white px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vue : candidatures internes / demandes de service propriétaires */}
        <div className="flex flex-wrap gap-2">
          {[['candidates', 'Candidatures chauffeurs'], ['requests', 'Demandes propriétaires (service)']].map(([val, label]) => (
            <button key={val} onClick={() => setView(val)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${view === val ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {view === 'requests' && <OwnerRequests />}

        {view === 'candidates' && (<>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[['all', 'Tous'], ['pending', 'En attente'], ['review', 'En examen'], ['approved', 'Approuvés'], ['rejected', 'Refusés']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${tab === val ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
              {counts[val] > 0 && <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === val ? 'bg-white text-primary-600' : 'bg-slate-100 text-slate-600'}`}>{counts[val]}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map(c => {
            const SC = STATUS_CONFIG[c.status];
            const Icon = SC.icon;
            const score = Math.round((Object.values(c.checks).filter(Boolean).length / CRITERIA.length) * 100);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900">{c.name}</h3>
                      <span className={SC.style}><Icon size={12} className="inline mr-1" />{SC.label}</span>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1"><User size={13} /> {c.age} ans</span>
                      <span className="inline-flex items-center gap-1"><Car size={13} /> {c.experience} ans d'exp.</span>
                      <span className="inline-flex items-center gap-1"><Calendar size={13} /> {c.applied}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden" style={{ maxWidth: 120 }}>
                        <div className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{score}%</span>
                      <span className="text-xs text-slate-400">{Object.values(c.checks).filter(Boolean).length}/{CRITERIA.length} critères</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {c.status !== 'approved' && c.status !== 'rejected' && (
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1.5 text-sm bg-primary-600 text-white py-2 px-4 rounded-xl hover:bg-primary-700 transition-colors font-medium">
                        <Eye size={14} /> Évaluer
                      </button>
                    )}
                    {(c.status === 'approved' || c.status === 'rejected') && (
                      <button onClick={() => setSelected(c)} className="flex items-center gap-1.5 text-sm bg-slate-100 text-slate-600 py-2 px-4 rounded-xl hover:bg-slate-200 transition-colors font-medium">
                        <FileText size={14} /> Détails
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Award size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-900 mb-2">Aucun candidat dans cette catégorie</h3>
            </div>
          )}
        </div>
        </>)}
      </div>
      {selected && <CandidateModal candidate={selected} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
