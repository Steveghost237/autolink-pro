import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { driversAPI } from '../../services/api';
import {
  Shield, CheckCircle, Clock, Users, FileText, Award,
  UserCheck, AlertCircle, Plus, Phone
} from 'lucide-react';

const PRICE_PER_DRIVER = 75000;

const STEPS = [
  { icon: FileText, title: '1. Recrutement', desc: 'Sourcing et présélection de candidats chauffeurs dans votre ville.' },
  { icon: Shield, title: '2. Vérification', desc: 'Permis, casier judiciaire, certificat médical, références — éthique et valeurs contrôlées.' },
  { icon: Award, title: '3. Formation', desc: 'Test de conduite et formation complète au protocole AutoLink (ponctualité, accueil, sécurité).' },
  { icon: UserCheck, title: '4. Transmission', desc: 'Le chauffeur formé vous est remis : vous le gérez ensuite entièrement et exclusivement.' },
];

const STATUS = {
  pending:    { label: 'En attente',            style: 'bg-amber-100 text-amber-700' },
  recruiting: { label: 'Recrutement en cours',  style: 'bg-blue-100 text-blue-700' },
  training:   { label: 'Formation en cours',    style: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Chauffeur transmis',    style: 'bg-emerald-100 text-emerald-700' },
  cancelled:  { label: 'Annulée',               style: 'bg-red-100 text-red-600' },
};

const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Buea', 'Kribi', 'Garoua', 'Maroua', 'Ngaoundéré'];

export default function DriverService() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ drivers_count: 1, city: 'Douala', requirements: '' });

  const load = useCallback(async () => {
    try {
      const { data } = await driversAPI.serviceRequests();
      setRequests(data.results || data || []);
    } catch (_) { /* API injoignable : liste vide */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await driversAPI.requestService(form);
      setShowForm(false);
      setForm({ drivers_count: 1, city: 'Douala', requirements: '' });
      load();
    } catch (err) {
      const data = err.response?.data;
      const first = data && Object.values(data)[0];
      setError(Array.isArray(first) ? first[0] : (first || 'Envoi impossible — réessayez.'));
    }
    setSending(false);
  };

  return (
    <DashboardLayout title="Service Chauffeur">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero service */}
        <div className="card bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
              <UserCheck size={28} />
            </div>
            <div className="flex-1 min-w-60">
              <h2 className="text-xl font-black mb-1">Recrutement & formation de chauffeur</h2>
              <p className="text-emerald-100 text-sm">
                Pas de chauffeur attitré ? AutoLink recrute, vérifie et forme vos chauffeurs.
                Après transmission, vous les gérez <strong>entièrement et exclusivement</strong>.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2">
                <span className="text-2xl font-black">{PRICE_PER_DRIVER.toLocaleString()} F</span>
                <span className="text-xs text-emerald-100">forfait par chauffeur<br />recruté et formé</span>
              </div>
            </div>
            <button onClick={() => setShowForm(true)}
              className="bg-white text-emerald-800 font-bold px-5 py-3 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2 shrink-0">
              <Plus size={18} /> Demander le service
            </button>
          </div>
        </div>

        {/* Processus */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        {/* Critères vérifiés */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield size={18} className="text-emerald-600" /> Ce que nous vérifions
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Permis de conduire valide', 'Casier judiciaire vierge', 'Certificat médical',
              'Min. 2 ans d\'expérience', 'Test de conduite AutoLink', 'Formation protocole 4h',
              'CNI / passeport valide', 'Références professionnelles'].map(c => (
              <span key={c} className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" /> {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Phone size={12} /> Une question ? Contactez le support AutoLink depuis votre messagerie.
          </p>
        </div>

        {/* Mes demandes */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> Mes demandes
            </h3>
            <span className="text-xs text-slate-400">{requests.length} demande(s)</span>
          </div>
          {loading ? (
            <p className="text-center py-10 text-slate-400 text-sm">Chargement…</p>
          ) : requests.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">
              Aucune demande pour le moment. Cliquez sur « Demander le service ».
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {requests.map(r => {
                const st = STATUS[r.status] || STATUS.pending;
                return (
                  <div key={r.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <UserCheck size={18} />
                    </div>
                    <div className="flex-1 min-w-48">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {r.drivers_count} chauffeur(s) — {r.city}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock size={11} /> {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        {r.requirements && <span className="truncate">· {r.requirements}</span>}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {Number(r.total_price).toLocaleString()} F
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.style}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal demande */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Demander le service</h3>
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nb de chauffeurs</label>
                <input type="number" min={1} max={10} required className="input-field"
                  value={form.drivers_count}
                  onChange={e => setForm(f => ({ ...f, drivers_count: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Ville</label>
                <select className="input-field" value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Critères particuliers (optionnel)</label>
              <textarea className="input-field resize-none" rows={3}
                placeholder="Ex : expérience 4×4, connaissance de l'axe Douala–Yaoundé…"
                value={form.requirements}
                onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-sm text-emerald-800 dark:text-emerald-300 font-semibold text-center">
              Total estimé : {(PRICE_PER_DRIVER * form.drivers_count).toLocaleString()} FCFA
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3">Annuler</button>
              <button type="submit" disabled={sending} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center justify-center gap-2">
                {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={16} /> Envoyer</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
