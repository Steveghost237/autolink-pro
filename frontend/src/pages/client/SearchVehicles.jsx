import React, { useState, useEffect } from 'react';
import { Search, Star, Users, Fuel, CheckCircle, X, Car, Filter, Tag, ChevronDown, ChevronRight, AlertCircle, Timer, Navigation, Calendar, Clock, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { RENTAL_TYPES, SPECIFIC_CARS, getVehicleImage } from '../../utils/carImages';
import { vehiclesAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TIERS } from '../../utils/carImages';

const TIER_STYLE = {
  basic:      { label: 'Économique',    cls: 'bg-slate-600' },
  standard:   { label: 'Intermédiaire', cls: 'bg-blue-600' },
  premium:    { label: 'Premium',       cls: 'bg-purple-600' },
  gold:       { label: 'Luxe',          cls: 'bg-amber-500' },
  collection: { label: 'Super Luxe',    cls: 'bg-rose-700' },
};

// Mappe un véhicule API vers le format affiché par les cartes
const mapApiVehicle = (v) => {
  const model = (v.model || '').toLowerCase();
  // Photo réelle du modèle (Wikimedia) en priorité, sinon illustration par catégorie
  let image = v.image_url || getVehicleImage(v.category);
  if (!v.image_url) {
    if (model.includes('corolla')) image = SPECIFIC_CARS.corolla;
    else if (model.includes('tucson')) image = SPECIFIC_CARS.tucson;
    else if (model.includes('serie') || model.includes('série')) image = SPECIFIC_CARS.bmw5;
    else if (model.includes('gle')) image = SPECIFIC_CARS.mercedesGLE;
    else if (model.includes('sportage')) image = SPECIFIC_CARS.sportage;
    else if (model.includes('evoque')) image = SPECIFIC_CARS.rangeRover;
    else if (model.includes('sprinter')) image = SPECIFIC_CARS.sprinter;
    else if (model.includes('hiace')) image = SPECIFIC_CARS.hiace;
  }
  return {
    id: v.id,
    name: `${v.brand} ${v.model} ${v.year}`,
    category: v.category,
    tier: v.tier || 'standard',
    image,
    price: Number(v.daily_rate || v.computed_rate),
    kmIncluded: v.km_included_per_day || 200, kmRate: v.extra_km_rate || 150,
    deposit: Number(v.deposit_amount) || 0,
    city: v.city || 'Douala',
    rating: Number(v.rating) || 4.7,
    reviews: v.rating_count || 0,
    available: v.status === 'approved',
    plate: v.plate, seats: v.seats, fuel: v.fuel, year: v.year,
    gestionnaire: v.owner_name || 'AutoLink',
    score: v.condition_score,
    fromApi: true,
  };
};

const CATEGORIES = ['Tous', 'Berline', 'SUV', 'Van', 'Minibus', 'Luxe'];

const PAYMENT_METHODS = [
  { value: 'wallet', label: 'Solde AutoLink',  color: 'bg-emerald-500', border: 'border-emerald-500' },
  { value: 'mtn',    label: 'MTN MoMo',        color: 'bg-yellow-400', border: 'border-yellow-400' },
  { value: 'orange', label: 'Orange Money',    color: 'bg-orange-500', border: 'border-orange-500' },
  { value: 'senbid', label: 'SenBid',          color: 'bg-teal-500',   border: 'border-teal-500' },
  { value: 'paybid', label: 'PayBid',          color: 'bg-indigo-500', border: 'border-indigo-500' },
  { value: 'stripe', label: 'Carte (Stripe)',  color: 'bg-purple-500', border: 'border-purple-500' },
];

const DRIVER_OPTIONS = [
  { value: 'none',     label: 'Sans chauffeur',        sub: 'Vous conduisez' },
  { value: 'internal', label: 'Chauffeur AutoLink',    sub: 'Assigné automatiquement' },
  { value: 'owner',    label: 'Chauffeur du proprio',  sub: 'Fourni avec la voiture' },
];

function BookingModal({ vehicle, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [rentalType, setRentalType] = useState(RENTAL_TYPES[2]);
  const [form, setForm] = useState({ date: '', time: '08:00', pickup: '', destination: '', days: 1, agentCode: '', driverType: 'none', paymentMethod: 'wallet', phone: '' });
  const [agentValid, setAgentValid] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [saved, setSaved] = useState(false);
  const VALID_CODES = ['AGT-DBL-001', 'AGT-YDE-002', 'AGT-DBL-003'];

  const submitBooking = async () => {
    setSubmitting(true);
    setApiError(null);
    try {
      const end = new Date(form.date);
      end.setDate(end.getDate() + (rentalType.id === 'long_haul' ? form.days : 1));
      const res = await bookingsAPI.create({
        vehicle: vehicle.id,
        start_date: form.date,
        end_date: end.toISOString().split('T')[0],
        pickup_address: form.pickup,
        dropoff_address: form.destination,
        driver_type: form.driverType,
        payment_method: form.paymentMethod,
        notes: `Type: ${rentalType.label} | Heure: ${form.time} | Tel: ${form.phone}${form.agentCode ? ` | Agent: ${form.agentCode}` : ''}`,
      });
      // Stripe / PayPal : la réservation reste en attente — on redirige vers
      // la page de paiement sécurisée ; confirmation au retour vérifié.
      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
        return;
      }
      setSaved(res.data?.status === 'confirmed');
      setStep(3);
    } catch (err) {
      if (err.response?.status === 401) {
        setApiError('Session expirée — reconnectez-vous.');
      } else if (!err.response) {
        setApiError('Serveur injoignable — vérifiez votre connexion puis réessayez.');
      } else {
        const data = err.response?.data;
        setApiError(data?.payment || data?.vehicle || data?.driver_type || 'Erreur lors de la réservation — réessayez.');
      }
    }
    setSubmitting(false);
  };

  const computePrice = () => {
    let base = 0;
    if (rentalType.id === 'urban_3h')  base = Math.max(vehicle.price * 0.15, rentalType.minPrice);
    else if (rentalType.id === 'urban_8h')  base = Math.max(vehicle.price * 0.30, rentalType.minPrice);
    else if (rentalType.id === 'urban_day') base = vehicle.price;
    else if (rentalType.id === 'intercity') base = Math.max(vehicle.price * 1.5, rentalType.minPrice);
    else base = vehicle.price * form.days;
    return Math.round(base);
  };

  const basePrice   = computePrice();
  const kmIncluded  = vehicle.kmIncluded || rentalType.kmIncluded;
  const commission  = Math.round(basePrice * 0.50);
  const deposit     = vehicle.deposit || 0;

  const checkAgent = (code) => {
    if (!code) { setAgentValid(null); return; }
    setAgentValid(VALID_CODES.includes(code.toUpperCase()) ? true : false);
  };

  if (step === 3) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {saved ? 'Réservation confirmée' : 'Réservation enregistrée'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-1">{vehicle.name} — {rentalType.label}</p>
        <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">Prise en charge : {form.pickup || 'Non précisé'}</p>
        {form.driverType === 'internal' && <p className="text-xs text-blue-600 font-medium">Un chauffeur AutoLink vous sera assigné automatiquement.</p>}
        {form.driverType === 'owner' && <p className="text-xs text-blue-600 font-medium">Le propriétaire se présentera avec son chauffeur.</p>}
        {agentValid === true && <p className="text-xs text-emerald-600 font-medium mb-1">Code agent {form.agentCode} appliqué</p>}
        <p className="text-xl font-black text-primary-600 my-3">{basePrice.toLocaleString()} FCFA</p>
        {saved ? (
          <p className="text-xs text-emerald-600 font-medium mb-6">
            Paiement reçu — réservation confirmée automatiquement. Le propriétaire a été notifié.
            Retrouvez-la dans « Mes réservations ».
          </p>
        ) : (
          <p className="text-xs text-slate-400 mb-6">Enregistrée — en attente de confirmation du paiement.</p>
        )}
        <button onClick={onClose} className="btn-primary w-full">Retour au catalogue</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl my-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{vehicle.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.category} · {vehicle.fuel} · {vehicle.seats} places</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center px-5 py-3 gap-2 border-b border-slate-100 dark:border-slate-700">
          {['Type & date', 'Détails', 'Paiement'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step === i+1 ? 'text-primary-600' : step > i+1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === i+1 ? 'bg-primary-600 text-white' : step > i+1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{step > i+1 ? '✓' : i+1}</div>
                {s}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-5 space-y-5">
          {/* Step 1: Type de location + date */}
          {step === 1 && (
            <>
              <div>
                <label className="label">Type de location</label>
                <div className="grid grid-cols-1 gap-2">
                  {RENTAL_TYPES.map(rt => (
                    <label key={rt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${rentalType.id === rt.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-primary-200'}`}>
                      <input type="radio" name="rental" className="sr-only" onChange={() => setRentalType(rt)} />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rentalType.id === rt.id ? 'bg-primary-600' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {rt.id === 'urban_3h' ? <Timer size={15} className={rentalType.id === rt.id ? 'text-white' : 'text-slate-500'} /> :
                         rt.id === 'intercity' ? <Navigation size={15} className={rentalType.id === rt.id ? 'text-white' : 'text-slate-500'} /> :
                         rt.id === 'long_haul' ? <Calendar size={15} className={rentalType.id === rt.id ? 'text-white' : 'text-slate-500'} /> :
                         <Clock size={15} className={rentalType.id === rt.id ? 'text-white' : 'text-slate-500'} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{rt.label}</span>
                          <span className="text-xs font-bold text-primary-600">
                            {rt.id === 'long_haul' ? `${vehicle.price.toLocaleString()} F/jour` :
                             rt.id === 'urban_3h' ? `dès ${Math.max(Math.round(vehicle.price*0.15), rt.minPrice).toLocaleString()} F` :
                             rt.id === 'urban_8h' ? `dès ${Math.max(Math.round(vehicle.price*0.30), rt.minPrice).toLocaleString()} F` :
                             rt.id === 'intercity' ? `dès ${Math.max(Math.round(vehicle.price*1.5), rt.minPrice).toLocaleString()} F` :
                             `${vehicle.price.toLocaleString()} F`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rt.description} · {rt.kmIncluded} km inclus</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              {rentalType.id === 'long_haul' && (
                <div>
                  <label className="label">Nombre de jours</label>
                  <input type="number" className="input-field" min={2} max={30} value={form.days}
                    onChange={e => setForm(f => ({ ...f, days: Math.max(2, Number(e.target.value)) }))} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Date de départ</label>
                  <input type="date" className="input-field" value={form.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Heure</label>
                  <input type="time" className="input-field" value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Adresses + code agent + options */}
          {step === 2 && (
            <>
              <div>
                <label className="label">Adresse de prise en charge</label>
                <input type="text" className="input-field" placeholder="Ex: Bonanjo, Douala"
                  value={form.pickup} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))} />
              </div>
              {(rentalType.id === 'intercity' || rentalType.id === 'long_haul') && (
                <div>
                  <label className="label">Destination</label>
                  <input type="text" className="input-field" placeholder="Ex: Yaoundé Centre"
                    value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                </div>
              )}
              <div>
                <label className="label">Option chauffeur</label>
                <div className="grid grid-cols-3 gap-2">
                  {DRIVER_OPTIONS.map(opt => (
                    <label key={opt.value} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${form.driverType === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600'}`}>
                      <input type="radio" className="sr-only" onChange={() => setForm(f => ({ ...f, driverType: opt.value }))} />
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.sub}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Tag size={13} /> Code agent partenaire <span className="text-slate-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <input type="text" className="input-field uppercase" placeholder="Ex: AGT-DBL-001" maxLength={12}
                    value={form.agentCode}
                    onChange={e => { setForm(f => ({ ...f, agentCode: e.target.value.toUpperCase() })); checkAgent(e.target.value); }} />
                  {form.agentCode && (
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold flex items-center gap-1 ${agentValid ? 'text-emerald-600' : 'text-red-500'}`}>
                      {agentValid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                      {agentValid ? 'Valide' : 'Invalide'}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">Forfait kilométrique inclus</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400">
                  <span>Km inclus : {rentalType.kmIncluded} km</span>
                  <span>Au-delà : {vehicle.kmRate} F/km</span>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Récapitulatif + paiement */}
          {step === 2 && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm mt-2">
              <div className="font-semibold text-slate-800 dark:text-white mb-2">Récapitulatif</div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{rentalType.label}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{form.date || '—'} à {form.time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Prise en charge</span><span className="font-medium">{form.pickup || '—'}</span></div>
              <div className="flex justify-between text-slate-500"><span>Km inclus</span><span>{kmIncluded} km · {vehicle.kmRate} F/km supp.</span></div>
              {agentValid === true && <div className="flex justify-between text-emerald-600"><span>Code agent</span><span>{form.agentCode}</span></div>}
              <div className="flex justify-between text-slate-500"><span>Location</span><span className="font-medium">{basePrice.toLocaleString()} F</span></div>
              {deposit > 0 && <div className="flex justify-between text-amber-700 dark:text-amber-400"><span>Caution (restituée au retour)</span><span className="font-medium">+{deposit.toLocaleString()} F</span></div>}
              <div className="flex justify-between font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-600 pt-2 mt-2 text-base">
                <span>Total à débiter</span><span className="text-primary-600">{(basePrice + deposit).toLocaleString()} FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700">
          {step < 2 ? (
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-outline flex-1 py-3">Annuler</button>
              <button onClick={() => setStep(2)} disabled={!form.date}
                className="btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center gap-2">
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">Numéro de téléphone pour le paiement</label>
                <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.value} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === pm.value ? `${pm.border} bg-slate-50 dark:bg-slate-700` : 'border-slate-200 dark:border-slate-600'}`}>
                    <input type="radio" name="payment" className="sr-only" onChange={() => setForm(f => ({ ...f, paymentMethod: pm.value }))} />
                    <div className={`w-7 h-7 ${pm.color} rounded-lg`} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">{pm.label}</span>
                  </label>
                ))}
              </div>
              {apiError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} /> {apiError}
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline px-5 py-3">Retour</button>
                <button onClick={submitBooking} disabled={!form.phone || submitting}
                  className="btn-primary flex-1 py-3 disabled:opacity-50 flex items-center justify-center gap-2 font-bold">
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {submitting ? 'Envoi en cours...' : `Confirmer et payer — ${basePrice.toLocaleString()} FCFA`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchVehicles() {
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('Tous');
  const [maxPrice, setMaxPrice]       = useState(200000);
  const [onlyAvailable, setOnly]      = useState(true);
  const [selectedVehicle, setSelected] = useState(null);
  const [selectedType, setType]       = useState('');
  const [selectedTier, setTier]       = useState('');
  const [vehicles, setVehicles]       = useState([]);
  const [offline, setOffline]         = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type');
    if (t) setType(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    vehiclesAPI.getAll()
      .then(res => {
        if (!mounted) return;
        const list = (res.data.results || res.data || []).map(mapApiVehicle);
        setVehicles(list);
        setLoadingList(false);
      })
      .catch(() => { setOffline(true); setLoadingList(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = vehicles.filter(v =>
    (category === 'Tous' || v.category === category) &&
    (selectedTier === '' || v.tier === selectedTier) &&
    v.price <= maxPrice &&
    (!onlyAvailable || v.available) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout title="Catalogue de véhicules">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Rental type selector */}
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Filtrer par type de location</p>
          <div className="flex flex-wrap gap-2">
            {[{ id: '', label: 'Tous les types' }, ...RENTAL_TYPES].map(rt => (
              <button key={rt.id} onClick={() => setType(rt.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${selectedType === rt.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-400'}`}>
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tier selector */}
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Gamme du véhicule</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{ id: '', label: 'Toutes les gammes', desc: 'Économique à Super Luxe' }, ...TIERS].map(t => (
              <button key={t.id} onClick={() => setTier(t.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${selectedTier === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-primary-200'}`}>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{t.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Search & filters */}
        <div className="card">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-52 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" className="input-field pl-10" placeholder="Rechercher un véhicule, une marque..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Prix max :</span>
              <input type="range" min={15000} max={200000} step={5000} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))} className="w-28 accent-primary-600" />
              <span className="text-sm font-bold text-primary-600 whitespace-nowrap">{maxPrice.toLocaleString()} F</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={onlyAvailable} onChange={e => setOnly(e.target.checked)} className="w-4 h-4 accent-primary-600 rounded" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Disponibles uniquement</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === c ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{filtered.length} véhicule(s) trouvé(s)</p>
          <p className="text-xs text-slate-400">Tous les véhicules incluent un chauffeur certifié AutoLink</p>
        </div>

        {/* Vehicle cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(v => (
            <div key={v.id} className={`bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border transition-all group ${v.available ? 'border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1' : 'border-slate-100 dark:border-slate-700 opacity-60'}`}>
              <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img src={v.image} alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { e.target.style.display='none'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {!v.available && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">Indisponible</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{v.category}</span>
                  <span className={`${TIER_STYLE[v.tier]?.cls || 'bg-slate-600'} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                    {TIER_STYLE[v.tier]?.label || 'Standard'}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  <Star size={10} className="fill-amber-400 text-amber-400" />{v.rating}
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs font-mono">{v.plate}</div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{v.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{v.fuel} · {v.seats} places · Score qualité {v.score}/100</p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 mb-3 text-xs text-blue-700 dark:text-blue-400">
                  {v.kmIncluded} km inclus · {v.kmRate} F/km supp.
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-primary-700 dark:text-primary-400">{v.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-500"> F/jour</span>
                  </div>
                  <button disabled={!v.available} onClick={() => setSelected(v)}
                    className={`text-sm py-2 px-4 rounded-xl font-bold transition-all ${v.available ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                    {v.available ? 'Réserver' : 'Complet'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && !loadingList && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car size={28} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{offline ? 'Serveur injoignable' : 'Aucun véhicule trouvé'}</h3>
            <p className="text-slate-500 dark:text-slate-400">{offline ? 'Impossible de contacter le serveur — vérifiez votre connexion puis rechargez la page.' : 'Modifiez vos filtres pour élargir la recherche.'}</p>
          </div>
        )}
        {loadingList && (
          <div className="text-center py-20 text-slate-400 text-sm">Chargement des véhicules…</div>
        )}
      </div>
      {selectedVehicle && <BookingModal vehicle={selectedVehicle} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
