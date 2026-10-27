import React from 'react';
import { Gauge, Star, Car, Banknote } from 'lucide-react';

/* Rangée de 4 KPI : occupation, note, véhicules actifs, revenu/jour. */
export default function StatsRow({ occupancy = 0, rating = 0, activeVehicles = 0, revenuePerDay = 0 }) {
  const stats = [
    { icon: Gauge,    label: "Taux d'occupation",    value: `${Math.round(occupancy)} %`,  sub: '+6 % vs mois dernier', accent: 'text-teal-600' },
    { icon: Star,     label: 'Note moyenne flotte',  value: `${rating} /5`,                sub: 'sur 58 avis locataires', accent: 'text-amber-500' },
    { icon: Car,      label: 'Véhicules actifs',     value: `${activeVehicles} en ligne`,  sub: 'tous contrôlés', accent: 'text-teal-600' },
    { icon: Banknote, label: 'Revenu moyen / jour',  value: `${Math.round(revenuePerDay).toLocaleString('fr-FR')} FCFA`, sub: 'brut — avant commission', accent: 'text-teal-600' },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.label}</span>
            <s.icon size={15} className="text-slate-300" />
          </div>
          <div className={`text-2xl font-black ${s.accent}`}>{s.value}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
