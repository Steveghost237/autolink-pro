import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const STEPS = [
  { label: 'Informations', desc: 'Données du véhicule' },
  { label: 'Mode', desc: 'Gestion du véhicule' },
  { label: 'Documents', desc: 'Pièces requises' },
  { label: 'Confirmation', desc: 'Récapitulatif' },
];

const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
const CATEGORIES = ['Berline', 'SUV', 'Van', 'Minibus', 'Luxe', 'Pick-up', 'Citadine'];
const INSURANCE_TYPES = ['Standard', 'Premium', 'Tous risques'];

const CONDITION_ITEMS = [
  'Carrosserie sans rayures',
  'Vitres intactes',
  'Intérieur propre',
  'Climatisation fonctionnelle',
  'Freins vérifiés',
  'Pneus en bon état',
  'Feux tous fonctionnels',
  'GPS / Radio fonctionnel',
];

export default function AddVehicle() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: '', plate: '', category: '',
    fuel: '', seats: '', color: '', dailyRate: '', mode: '', description: '',
    insurance: '', insuranceExpiry: '', technicalControl: '',
    conditionChecks: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCondition = (item) => {
    set('conditionChecks', form.conditionChecks.includes(item)
      ? form.conditionChecks.filter(c => c !== item)
      : [...form.conditionChecks, item]);
  };

  const computedPrice = () => {
    let base = Number(form.dailyRate) || 0;
    if (form.insurance === 'Premium' || form.insurance === 'Tous risques') base += 2000;
    const age = new Date().getFullYear() - Number(form.year);
    if (age <= 2) base += 5000;
    else if (age <= 5) base += 2000;
    const conditionBonus = Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 5000);
    return base + conditionBonus;
  };

  if (submitted) return (
    <DashboardLayout title="Véhicule ajouté">
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle size={72} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Véhicule soumis avec succès !</h2>
        <p className="text-slate-500 mb-2">Votre véhicule est en attente de validation par notre équipe de contrôle.</p>
        <p className="text-sm text-slate-400 mb-8">Délai de traitement : 24 à 48 heures ouvrables.</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/owner/vehicles')} className="btn-primary w-full">Voir mes véhicules</button>
          <button onClick={() => { setSubmitted(false); setStep(0); setForm({ name: '', brand: '', model: '', year: '', plate: '', category: '', fuel: '', seats: '', color: '', dailyRate: '', mode: '', description: '', insurance: '', insuranceExpiry: '', technicalControl: '', conditionChecks: [] }); }} className="btn-outline w-full">Ajouter un autre véhicule</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Ajouter un véhicule">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Steps */}
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-slate-200'}`} />
              <div className={`text-xs font-medium mt-1 hidden sm:block ${i === step ? 'text-primary-600' : i < step ? 'text-slate-500' : 'text-slate-300'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{STEPS[step].label}</h2>
            <p className="text-sm text-slate-500">{STEPS[step].desc}</p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Marque</label>
                  <input type="text" className="input-field" placeholder="Toyota, Hyundai..." value={form.brand} onChange={e => set('brand', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Modèle</label>
                  <input type="text" className="input-field" placeholder="Corolla, Tucson..." value={form.model} onChange={e => set('model', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Année</label>
                  <input type="number" className="input-field" placeholder="2022" min={2010} max={2025} value={form.year} onChange={e => set('year', e.target.value)} />
                </div>
                <div>
                  <label className="label">Immatriculation</label>
                  <input type="text" className="input-field" placeholder="AB 1234 CI" value={form.plate} onChange={e => set('plate', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Catégorie</label>
                  <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Choisir...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Carburant</label>
                  <select className="input-field" value={form.fuel} onChange={e => set('fuel', e.target.value)}>
                    <option value="">Choisir...</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre de places</label>
                  <input type="number" className="input-field" placeholder="5" min={2} max={20} value={form.seats} onChange={e => set('seats', e.target.value)} />
                </div>
                <div>
                  <label className="label">Couleur</label>
                  <input type="text" className="input-field" placeholder="Blanc, Gris..." value={form.color} onChange={e => set('color', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Tarif souhaité (FCFA/jour)</label>
                <input type="number" className="input-field" placeholder="25000" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} />
                <p className="text-xs text-slate-400 mt-1">Notre algorithme peut ajuster légèrement le tarif selon l'état et l'assurance.</p>
              </div>
              <div>
                <label className="label">Description (optionnel)</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Équipements supplémentaires, particularités..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">Choisissez comment vous souhaitez proposer votre véhicule :</p>
              {[
                { value: 'platform', title: 'Confier à AutoLink', desc: "Vous nous confiez le véhicule. Nous le gérons, le mettons à disposition 24h/24. Vous n'avez rien à faire. Revenus stables garantis.", pros: ['Zéro gestion de votre part', 'Disponibilité maximale', 'Assurance prise en charge par AutoLink'] },
                { value: 'home', title: 'Garder chez moi (à la demande)', desc: "Le véhicule reste chez vous. Vous le mettez à disposition uniquement quand vous le confirmez. Plus de flexibilité, revenus variables.", pros: ['Vous gardez le contrôle total', 'Mettez à disposition à votre convenance', 'Idéal si vous utilisez aussi le véhicule'] },
              ].map(({ value, title, desc, pros }) => (
                <label key={value} className={`flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${form.mode === value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="mode" value={value} className="mt-1 w-4 h-4 accent-primary-600" onChange={() => set('mode', value)} checked={form.mode === value} />
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{title}</div>
                    <div className="text-sm text-slate-600 mb-3">{desc}</div>
                    <ul className="space-y-1">
                      {pros.map(p => <li key={p} className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-emerald-500 shrink-0" />{p}</li>)}
                    </ul>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type d'assurance</label>
                  <select className="input-field" value={form.insurance} onChange={e => set('insurance', e.target.value)}>
                    <option value="">Choisir...</option>
                    {INSURANCE_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Expiration de l'assurance</label>
                  <input type="date" className="input-field" value={form.insuranceExpiry} onChange={e => set('insuranceExpiry', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Date de visite technique</label>
                <input type="date" className="input-field" value={form.technicalControl} onChange={e => set('technicalControl', e.target.value)} />
              </div>

              <div>
                <label className="label mb-3">État du véhicule (cochez tout ce qui s'applique)</label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITION_ITEMS.map(item => (
                    <label key={item} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${form.conditionChecks.includes(item) ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <input type="checkbox" className="sr-only" checked={form.conditionChecks.includes(item)} onChange={() => toggleCondition(item)} />
                      <CheckCircle size={14} className={form.conditionChecks.includes(item) ? 'text-emerald-600' : 'text-slate-300'} />
                      {item}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-emerald-500 rounded-full transition-all" style={{ width: `${(form.conditionChecks.length / CONDITION_ITEMS.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-primary-600">{Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100)}/100</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <Upload size={32} className="text-slate-400 mx-auto mb-3" />
                <p className="font-medium text-slate-600">Uploader les photos du véhicule</p>
                <p className="text-xs text-slate-400 mt-1">Min. 4 photos : avant, arrière, côtés, intérieur</p>
                <p className="text-xs text-primary-600 mt-2">Cliquez ou glissez vos fichiers ici</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-5">
                <h3 className="font-bold text-primary-800 mb-4">Récapitulatif de votre véhicule</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Véhicule', `${form.brand} ${form.model} ${form.year}`],
                    ['Catégorie', form.category],
                    ['Immatriculation', form.plate],
                    ['Carburant', form.fuel],
                    ['Places', form.seats],
                    ['Mode de gestion', form.mode === 'platform' ? 'Confié à AutoLink' : 'À domicile'],
                    ['Assurance', form.insurance],
                    ['Score d\'état', `${Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100)}/100`],
                  ].map(([k, v]) => v ? (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-slate-500">{k} :</span>
                      <span className="font-semibold text-slate-800 text-right">{v}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                  <strong>Tarif calculé par AutoLink : {computedPrice().toLocaleString()} FCFA/jour</strong><br />
                  Basé sur l'état, l'assurance et l'âge du véhicule. Votre part = <strong>{Math.round(computedPrice() * 0.50).toLocaleString()} FCFA/jour (50%)</strong> — bloquée en caution pendant chaque location, versée au retour du véhicule.
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <strong>Prochaines étapes :</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Notre équipe vérifie votre dossier (24–48h)</li>
                  <li>Un contrôleur inspecte le véhicule physiquement</li>
                  <li>Votre véhicule est mis en ligne sur la plateforme</li>
                </ol>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-outline flex-1 py-3">← Retour</button>}
            {step < 3
              ? <button onClick={() => setStep(s => s + 1)} className="btn-primary flex-1 py-3">Suivant →</button>
              : <button onClick={() => setSubmitted(true)} className="btn-accent flex-1 py-3">Soumettre le véhicule</button>
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
