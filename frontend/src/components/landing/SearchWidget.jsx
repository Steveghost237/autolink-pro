import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';

/* Barre de recherche de véhicule — redirige vers le catalogue public
   avec les critères en query params (?ville=&debut=&fin=). */
export default function SearchWidget({ compact = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ debut: '', fin: '', depart: 'Douala', retour: 'Douala' });

  const submit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams({ ville: form.depart, retour: form.retour });
    if (form.debut) q.set('debut', form.debut);
    if (form.fin)   q.set('fin', form.fin);
    navigate(`/catalogue?${q.toString()}`);
  };

  const fields = [
    { key: 'debut',  label: 'Dates de début', icon: Calendar, type: 'date' },
    { key: 'fin',    label: 'Dates de fin',   icon: Calendar, type: 'date' },
    { key: 'depart', label: 'Lieu de départ', icon: MapPin,   type: 'select', options: ['Douala', 'Yaoundé'] },
    { key: 'retour', label: 'Lieu de retour', icon: MapPin,   type: 'select', options: ['Douala', 'Yaoundé', 'Autre ville'] },
  ];

  return (
    <form onSubmit={submit}
      className={`bg-white rounded-2xl shadow-xl border border-slate-100 ${compact ? 'p-3' : 'p-4 lg:p-5'}`}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
              {f.label}
            </label>
            <div className="relative">
              <f.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {f.type === 'select' ? (
                <select value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none">
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type="date" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              )}
            </div>
          </div>
        ))}
        <button type="submit"
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md text-sm h-[46px]">
          <Search size={17} />
          Trouver ma voiture
        </button>
      </div>
    </form>
  );
}
