import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { vehiclesAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';

const EMPTY = {
  name: '', brand: '', model: '', year: '', plate: '', category: '',
  fuel: '', seats: '', color: '', dailyRate: '', mode: '', description: '',
  insurance: '', insuranceExpiry: '', technicalControl: '',
  mileage: '', marketValue: '', city: 'Douala', driverAvailable: true,
  conditionChecks: [],
};

const STEPS = [
  { label: 'Informations', desc: 'Données du véhicule' },
  { label: 'Mode', desc: 'Gestion du véhicule' },
  { label: 'Documents', desc: 'Pièces requises' },
  { label: 'Confirmation', desc: 'Récapitulatif' },
];

const FUEL_TYPES = [
  { value: 'essence', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'super', label: 'Super' },
  { value: 'gasoil', label: 'Gasoil' },
  { value: 'hybrid', label: 'Hybride' },
  { value: 'electric', label: 'Électrique' },
];
const CATEGORIES = ['Berline', 'SUV', 'Van', 'Minibus', 'Pick-up', 'Citadine'];
const INSURANCE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'all_risk', label: 'Tous risques' },
];
const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Buéa', 'Limbé', 'Kribi', 'Garoua', 'Ngaoundéré', 'Maroua'];

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
  const { id: vehicleId } = useParams();
  const confirm = useConfirm();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState('');
  const [initialKeyFields, setInitialKeyFields] = useState({});
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(Boolean(vehicleId));
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [created, setCreated] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const previews = useMemo(() => mediaFiles.map(({ file }) => URL.createObjectURL(file)), [mediaFiles]);
  useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews]);

  useEffect(() => {
    if (!vehicleId) return;
    Promise.all([vehiclesAPI.detail(vehicleId), vehiclesAPI.media(vehicleId)]).then(([vehicle, media]) => {
      const data = vehicle.data;
      setForm({
        ...EMPTY, brand: data.brand || '', model: data.model || '', year: data.year || '',
        plate: data.plate || '', category: data.category || '', fuel: data.fuel || '',
        seats: data.seats || '', color: data.color || '', dailyRate: data.daily_rate || '',
        mode: data.mode || '', description: data.description || '',
        insurance: data.insurance_type || '', insuranceExpiry: data.insurance_expiry || '',
        technicalControl: data.technical_control_date || '', mileage: data.mileage || '',
        marketValue: data.market_value || '', city: data.city || 'Douala',
        driverAvailable: data.driver_available,
      });
      setExistingMedia(media.data);
      setVehicleStatus(data.status);
      setInitialKeyFields({ brand: data.brand, model: data.model, year: String(data.year), plate: data.plate });
    }).catch(() => setApiError('Impossible de charger le véhicule.')).finally(() => setLoading(false));
  }, [vehicleId]);

  const addFiles = (files) => setMediaFiles(current => [
    ...current,
    ...Array.from(files, file => ({ file, position: 'exterior' })),
  ]);
  const removeExistingMedia = async (media) => {
    if (!(await confirm({ title: 'Supprimer ce média', message: 'Retirer ce média du véhicule ?', confirmLabel: 'Supprimer', danger: true }))) return;
    await vehiclesAPI.deleteMedia(vehicleId, media.id);
    setExistingMedia(items => items.filter(item => item.id !== media.id));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCondition = (item) => {
    set('conditionChecks', form.conditionChecks.includes(item)
      ? form.conditionChecks.filter(c => c !== item)
      : [...form.conditionChecks, item]);
  };

  const submit = async () => {
    if (!vehicleId && mediaFiles.filter(item => item.file.type.startsWith('image/')).length < 4) {
      setApiError('Ajoutez au moins 4 photos avant de soumettre le véhicule.');
      setStep(2);
      return;
    }
    setBusy(true);
    setApiError(null);
    try {
      const payload = {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        plate: form.plate.toUpperCase(),
        category: form.category,
        fuel: form.fuel,
        seats: Number(form.seats) || 5,
        color: form.color || 'Non précisé',
        description: form.description,
        mode: form.mode,
        driver_available: form.driverAvailable,
        daily_rate: Number(form.dailyRate) || 0,
        mileage: Number(form.mileage) || 0,
        market_value: Number(form.marketValue) || null,
        city: form.city,
        insurance_type: form.insurance,
        insurance_expiry: form.insuranceExpiry,
        technical_control_date: form.technicalControl || null,
        condition_score: Math.round((form.conditionChecks.length / CONDITION_ITEMS.length) * 100),
      };
      const res = vehicleId ? await vehiclesAPI.update(vehicleId, payload) : created ? { data: created } : await vehiclesAPI.create(payload);
      setCreated(res.data);
      if (mediaFiles.length) {
        const body = new FormData();
        mediaFiles.forEach(({ file, position }) => {
          body.append('files', file);
          body.append('positions', position);
        });
        await vehiclesAPI.uploadMedia(res.data.id, body);
        setMediaFiles([]);
      }
      if (vehicleId) {
        navigate('/owner/vehicles');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      const first = data && typeof data === 'object' ? Object.values(data)[0] : null;
      setApiError(Array.isArray(first) ? first[0] : first || 'Erreur lors de la soumission. Vous pouvez réessayer le téléversement depuis la modification du véhicule.');
      setStep(3);
    }
    setBusy(false);
  };

  if (loading) return <DashboardLayout title="Modifier un véhicule"><p className="text-center py-20">Chargement…</p></DashboardLayout>;
  if (submitted) return (
    <DashboardLayout title="Véhicule ajouté">
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle size={72} className="text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Véhicule soumis avec succès !</h2>
        {created && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 text-sm">
            <div className="font-bold text-primary-800">Gamme attribuée automatiquement : {created.tier_label || created.tier}</div>
            <div className="text-slate-600 mt-1">
              Prix indicatif : {Number(created.computed_rate || 0).toLocaleString()} F/jour ·
              Votre tarif : {Number(created.daily_rate || 0).toLocaleString()} F/jour<br />
              Caution client : {Number(created.deposit_amount || 0).toLocaleString()} F ·
              {created.km_included_per_day} km/j inclus · {created.extra_km_rate} F/km supp.
            </div>
          </div>
        )}
        <p className="text-slate-500 mb-2">Votre véhicule est en attente de validation par notre équipe de contrôle.</p>
        <p className="text-sm text-slate-400 mb-8">Délai de traitement : 24 à 48 heures ouvrables.</p>
        <div className="space-y-3">
          <button onClick={() => navigate('/owner/vehicles')} className="btn-primary w-full">Voir mes véhicules</button>
          <button onClick={() => { setSubmitted(false); setCreated(null); setStep(0); setForm(EMPTY); }} className="btn-outline w-full">Ajouter un autre véhicule</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={vehicleId ? 'Modifier un véhicule' : 'Ajouter un véhicule'}>
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
                  <input type="text" className="input-field" placeholder="LT 1234 A" value={form.plate} onChange={e => set('plate', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Kilométrage (km)</label>
                  <input type="number" className="input-field" placeholder="45000" min={0} value={form.mileage} onChange={e => set('mileage', e.target.value)} />
                </div>
                <div>
                  <label className="label">Valeur marchande estimée (FCFA)</label>
                  <input type="number" className="input-field" placeholder="12000000" min={0} value={form.marketValue} onChange={e => set('marketValue', e.target.value)} />
                  <p className="text-xs text-slate-400 mt-1">Prix de revente estimé du véhicule.</p>
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
                    {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
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
                <label className="label">Ville de mise à disposition</label>
                <select className="input-field" value={form.city} onChange={e => set('city', e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Le tarif de référence est adapté au marché local (Douala = référence).</p>
              </div>
              <div>
                <label className="label">Tarif souhaité (FCFA/jour)</label>
                <input type="number" className="input-field" placeholder="25000" value={form.dailyRate} onChange={e => set('dailyRate', e.target.value)} />
                <p className="text-xs text-slate-400 mt-1">
                  AutoLink calcule un prix indicatif selon la marque, l'année, le kilométrage, l'état et la valeur marchande.
                  Votre tarif est ajusté dans une fourchette de ±20 % autour de ce prix indicatif.
                </p>
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
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${form.driverAvailable ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}>
                <input type="checkbox" className="w-4 h-4 accent-primary-600" checked={form.driverAvailable} onChange={e => set('driverAvailable', e.target.checked)} />
                <div>
                  <div className="font-semibold text-sm text-slate-900">Je peux fournir mon propre chauffeur</div>
                  <div className="text-xs text-slate-500">Si un client demande « chauffeur du propriétaire », vous devrez vous présenter avec votre chauffeur.</div>
                </div>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type d'assurance</label>
                  <select className="input-field" value={form.insurance} onChange={e => set('insurance', e.target.value)}>
                    <option value="">Choisir...</option>
                    {INSURANCE_TYPES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
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

              <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }} className={`border-2 border-dashed rounded-xl p-5 hover:border-primary-400 transition-colors ${dragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300'}`}>
                <label className="block p-3 text-center cursor-pointer">
                  <input type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => addFiles(e.target.files)} />
                  <Upload size={32} className="text-slate-400 mx-auto mb-3" />
                  <p className="font-medium text-slate-600">Photos et vidéos du véhicule</p>
                  <p className="text-xs text-slate-400 mt-1">Min. 4 photos : avant, arrière, côtés, intérieur. Vidéos facultatives.</p>
                  <p className="text-xs text-primary-600 mt-2">Cliquez ou glissez vos fichiers ici</p>
                </label>
                <div className="mt-3 text-xs">{existingMedia.length} média(s) déjà téléversé(s) · {mediaFiles.filter(item => item.file.type.startsWith('image/')).length} photo(s) sélectionnée(s)</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaFiles.map((item, index) => <div key={`${item.file.name}-${index}`} className="flex gap-2 items-center p-2 rounded bg-slate-50">
                    {item.file.type.startsWith('video/') ? <video src={previews[index]} className="w-20 h-14 object-cover" /> : <img src={previews[index]} alt={item.file.name} className="w-20 h-14 object-cover" />}
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="block max-w-full truncate text-xs">{item.file.name}</span>
                      <select aria-label={`Position de ${item.file.name}`} className="input-field py-1 text-xs"
                        value={item.position} onChange={e => setMediaFiles(items => items.map((media, i) => i === index ? { ...media, position: e.target.value } : media))}>
                        <option value="exterior">Extérieur</option>
                        <option value="interior">Intérieur</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => setMediaFiles(items => items.filter((_, i) => i !== index))} className="text-red-600 text-sm" aria-label={`Retirer ${item.file.name}`}>×</button>
                  </div>)}
                </div>
              </div>
              {existingMedia.length > 0 && <div className="flex flex-wrap gap-2">{existingMedia.map(item => <div key={item.id} className="relative">
                {item.kind === 'video' ? <video src={item.image} className="w-20 h-14 object-cover rounded" /> : <img src={item.image} alt={item.caption || ''} className="w-20 h-14 object-cover rounded" />}
                <button type="button" onClick={() => removeExistingMedia(item)} className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white px-1.5" aria-label="Supprimer le média">×</button>
              </div>)}</div>}
              {vehicleId && vehicleStatus === 'approved' && ['brand', 'model', 'year', 'plate'].some(key => String(form[key]) !== String(initialKeyFields[key])) && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">La modification de la marque, du modèle, de l’année ou de l’immatriculation remettra le véhicule en attente de validation.</p>}
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
                    ['Ville', form.city],
                    ['Kilométrage', form.mileage ? `${Number(form.mileage).toLocaleString()} km` : ''],
                    ['Valeur marchande', form.marketValue ? `${Number(form.marketValue).toLocaleString()} F` : ''],
                    ['Immatriculation', form.plate],
                    ['Carburant', form.fuel],
                    ['Places', form.seats],
                    ['Mode de gestion', form.mode === 'platform' ? 'Confié à AutoLink' : 'À domicile'],
                    ['Assurance', INSURANCE_TYPES.find(i => i.value === form.insurance)?.label],
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
                  <strong>Classification automatique AutoLink</strong><br />
                  La gamme (Économique → Super Luxe) et le prix indicatif sont calculés objectivement à partir de la marque, l'année, le kilométrage, l'état et la valeur marchande — vous ne choisissez pas la gamme.
                  Votre tarif souhaité ({Number(form.dailyRate || 0).toLocaleString()} F) sera ramené dans la fourchette <strong>±20 % du prix indicatif</strong>. Votre part = <strong>50 %</strong> — bloquée en caution pendant chaque location, versée au retour.
                </div>
              </div>
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-red-700">{apiError}</div>
                </div>
              )}
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
              : <button onClick={submit} disabled={busy} className="btn-accent flex-1 py-3 disabled:opacity-50">{busy ? 'Envoi…' : vehicleId ? 'Enregistrer' : created ? 'Réessayer le téléversement' : 'Soumettre le véhicule'}</button>
            }
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
