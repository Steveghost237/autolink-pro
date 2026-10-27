# -*- coding: utf-8 -*-
import re
p = 'frontend/src/pages/client/SearchVehicles.jsx'
s = open(p, encoding='utf-8').read()

# 1. Imports : union
s = s.replace("""<<<<<<< HEAD
import { Search, Star, Users, Fuel, CheckCircle, X, Car, Filter, Tag, ChevronDown, ChevronRight, AlertCircle, Timer, Navigation, Calendar, Clock, Loader, ShieldCheck } from 'lucide-react';
=======
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle, X, Car, Filter, ChevronRight, AlertCircle, Timer, Navigation, Calendar, Clock, Loader, Heart } from 'lucide-react';
>>>>>>> prod/devin/autolink-features""",
"""import { useNavigate } from 'react-router-dom';
import { Search, Star, Users, Fuel, CheckCircle, X, Car, Filter, Tag, ChevronDown, ChevronRight, AlertCircle, Timer, Navigation, Calendar, Clock, Loader, ShieldCheck, Heart } from 'lucide-react';""")

# 2. States : leur version + agentCode
s = s.replace("""<<<<<<< HEAD
  const [rentalType, setRentalType] = useState(RENTAL_TYPES[2]);
  const [form, setForm] = useState({ date: '', time: '08:00', pickup: '', destination: '', days: 1, agentCode: '', driverType: 'none', paymentMethod: 'wallet', phone: '' });
=======
  const requestedType = new URLSearchParams(window.location.search).get('type');
  const requestedDays = Number(new URLSearchParams(window.location.search).get('days')) || 1;
  const [rentalType, setRentalType] = useState(() => RENTAL_TYPES.find(item => item.id === requestedType) || RENTAL_TYPES[2]);
  const [form, setForm] = useState({ date: '', time: '08:00', pickup: '', destination: '', days: requestedDays, driverType: 'none', paymentMethod: 'wallet', phone: '' });
  const [configuredMethods, setConfiguredMethods] = useState(['wallet']);
  const [allMethods, setAllMethods] = useState(['wallet']);
  useEffect(() => { paymentsAPI.methods().then(({ data }) => {
    setConfiguredMethods(data.booking_methods || ['wallet']);
    setAllMethods(data.booking_methods || ['wallet']);
  }).catch(() => {}); }, []);
>>>>>>> prod/devin/autolink-features""",
"""  const requestedType = new URLSearchParams(window.location.search).get('type');
  const requestedDays = Number(new URLSearchParams(window.location.search).get('days')) || 1;
  const [rentalType, setRentalType] = useState(() => RENTAL_TYPES.find(item => item.id === requestedType) || RENTAL_TYPES[2]);
  const [form, setForm] = useState({ date: '', time: '08:00', pickup: '', destination: '', days: requestedDays, agentCode: '', driverType: 'none', paymentMethod: 'wallet', phone: '' });
  const [configuredMethods, setConfiguredMethods] = useState(['wallet']);
  const [allMethods, setAllMethods] = useState(['wallet']);
  useEffect(() => { paymentsAPI.methods().then(({ data }) => {
    setConfiguredMethods(data.booking_methods || ['wallet']);
    setAllMethods(data.booking_methods || ['wallet']);
  }).catch(() => {}); }, []);""")

# 3. Payload : union
s = s.replace("""<<<<<<< HEAD
        agent_code: form.agentCode || '',
=======
        phone: form.phone,
>>>>>>> prod/devin/autolink-features""",
"""        agent_code: form.agentCode || '',
        phone: form.phone,""")

# 4. apiError : leur version + agent_code dans le pick
s = s.replace("""<<<<<<< HEAD
        setApiError(data?.payment || data?.vehicle || data?.driver_type || data?.agent_code || 'Erreur lors de la réservation — réessayez.');
=======
        setApiError(uiText("pages.client.SearchVehicles", data?.payment || data?.vehicle || data?.driver_type || 'Erreur lors de la réservation — réessayez.'));
>>>>>>> prod/devin/autolink-features""",
"""        setApiError(uiText("pages.client.SearchVehicles", data?.payment || data?.vehicle || data?.driver_type || data?.agent_code || 'Erreur lors de la réservation — réessayez.'));""")

# 5. bloc vide côté ours
s = s.replace("""<<<<<<< HEAD

=======
>>>>>>> prod/devin/autolink-features
""", "")

# 6. Récap modale : leur i18n + ligne agentCode
s = s.replace("""<<<<<<< HEAD
        <p className="text-slate-500 dark:text-slate-400 mb-1">{vehicle.name} — {rentalType.label}</p>
        <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">Prise en charge : {form.pickup || 'Non précisé'}</p>
        {form.driverType === 'internal' && <p className="text-xs text-blue-600 font-medium">Un chauffeur AutoLink vous sera assigné automatiquement.</p>}
        {form.driverType === 'owner' && <p className="text-xs text-blue-600 font-medium">Le propriétaire se présentera avec son chauffeur.</p>}
        {form.agentCode && <p className="text-xs text-emerald-600 font-medium mb-1">Code intermédiaire {form.agentCode} appliqué</p>}
        <p className="text-xl font-black text-primary-600 my-3">{basePrice.toLocaleString()} FCFA</p>
=======
""", "")
s = s.replace("""        <p className="text-xl font-black text-primary-600 my-3">{formatNumber(basePrice)}{" " + uiText("pages.client.SearchVehicles", "FCFA")}</p>
>>>>>>> prod/devin/autolink-features""",
"""        {form.agentCode && <p className="text-xs text-emerald-600 font-medium mb-1">{uiText("pages.client.SearchVehicles", "Code intermédiaire")} {form.agentCode} {uiText("pages.client.SearchVehicles", "appliqué")}</p>}
        <p className="text-xl font-black text-primary-600 my-3">{formatNumber(basePrice)}{" " + uiText("pages.client.SearchVehicles", "FCFA")}</p>""")

# 7. Champ code agent : garder le nôtre, i18n-isé
s = s.replace("""<<<<<<< HEAD
              <div>
                <label className="label flex items-center gap-2">
                  <Tag size={13} /> Code agent partenaire <span className="text-slate-400">(optionnel)</span>
                </label>
                <div className="relative">
                  <input type="text" className="input-field uppercase" placeholder="Ex: AL-4F2K9B" maxLength={12}
                    value={form.agentCode}
                    onChange={e => setForm(f => ({ ...f, agentCode: e.target.value.toUpperCase() }))} />
                  {form.agentCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold flex items-center gap-1 text-slate-400" title="Le code est vérifié à la validation">
                      <Tag size={14} />
                    </div>
                  )}
                </div>
              </div>
=======
>>>>>>> prod/devin/autolink-features""",
"""              <div>
                <label className="label flex items-center gap-2">
                  <Tag size={13} /> {uiText("pages.client.SearchVehicles", "Code agent partenaire")} <span className="text-slate-400">({uiText("pages.client.SearchVehicles", "optionnel")})</span>
                </label>
                <div className="relative">
                  <input type="text" className="input-field uppercase" placeholder="Ex: AL-4F2K9B" maxLength={12}
                    value={form.agentCode}
                    onChange={e => setForm(f => ({ ...f, agentCode: e.target.value.toUpperCase() }))} />
                  {form.agentCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold flex items-center gap-1 text-slate-400" title={uiText("pages.client.SearchVehicles", "Le code est vérifié à la validation")}>
                      <Tag size={14} />
                    </div>
                  )}
                </div>
              </div>""")

# 8. Récapitulatif : leur i18n + ligne agentCode
s = s.replace("""<<<<<<< HEAD
              <div className="font-semibold text-slate-800 dark:text-white mb-2">Récapitulatif</div>
              <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{rentalType.label}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{form.date || '—'} à {form.time}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Prise en charge</span><span className="font-medium">{form.pickup || '—'}</span></div>
              <div className="flex justify-between text-slate-500"><span>Km inclus</span><span>{kmIncluded} km · {vehicle.kmRate} F/km supp.</span></div>
              {form.agentCode && <div className="flex justify-between text-emerald-600"><span>Code intermédiaire</span><span>{form.agentCode}</span></div>}
              <div className="flex justify-between text-slate-500"><span>Location</span><span className="font-medium">{basePrice.toLocaleString()} F</span></div>
              {deposit > 0 && <div className="flex justify-between text-amber-700 dark:text-amber-400"><span>Caution (restituée au retour)</span><span className="font-medium">+{deposit.toLocaleString()} F</span></div>}
=======
""", "")
s = s.replace("""              {deposit > 0 && <div className="flex justify-between text-amber-700 dark:text-amber-400"><span>{uiText("pages.client.SearchVehicles", "Caution (restituée au retour)")}</span><span className="font-medium">{uiText("pages.client.SearchVehicles", "+")}{formatNumber(deposit)}{" " + uiText("pages.client.SearchVehicles", "F")}</span></div>}
>>>>>>> prod/devin/autolink-features""",
"""              {form.agentCode && <div className="flex justify-between text-emerald-600"><span>{uiText("pages.client.SearchVehicles", "Code intermédiaire")}</span><span>{form.agentCode}</span></div>}
              {deposit > 0 && <div className="flex justify-between text-amber-700 dark:text-amber-400"><span>{uiText("pages.client.SearchVehicles", "Caution (restituée au retour)")}</span><span className="font-medium">{uiText("pages.client.SearchVehicles", "+")}{formatNumber(deposit)}{" " + uiText("pages.client.SearchVehicles", "F")}</span></div>}""")

# 9. Badge "Bientôt" : leur version — nettoyer marqueurs résiduels
s = s.replace("""<<<<<<< HEAD
=======
""", "").replace(">>>>>>> prod/devin/autolink-features\n", "")
open(p, 'w', encoding='utf-8').write(s)
print('marqueurs:', s.count('<<<'), s.count('======='), s.count('>>>'))
