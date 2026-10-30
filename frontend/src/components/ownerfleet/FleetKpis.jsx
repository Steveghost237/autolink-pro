import React from 'react';
import { Car, KeyRound, Banknote, Gauge } from 'lucide-react';

/* Bandeau KPI « Mes Véhicules & Flotte » — maquette propriétaire. */
export default function FleetKpis({ total = 0, rented = 0, activeMissions = 0, occupancy = 0, revenue = 0, avgScore = 0, toOptimize = 0 }) {
  const kpis = [
    {
      icon: Car, label: 'Flotte répertoriée', value: `${total} Véhicule${total > 1 ? 's' : ''}`,
      sub: `${rented} en location active`,
    },
    {
      icon: KeyRound, label: 'Locations en cours', value: `${activeMissions} Mission${activeMissions > 1 ? 's' : ''}`,
      sub: `Taux d'occupation ${Math.round(occupancy)} %`,
    },
    {
      icon: Banknote, label: 'Revenus flotte cumulés',
      value: <>{Math.round(revenue).toLocaleString('fr-FR')} <span className="text-sm text-teal-600">FCFA</span></>,
      sub: '+16 % vs mois précédent',
    },
    {
      icon: Gauge, label: 'Score qualité moyen', value: `${Math.round(avgScore)} /100`,
      sub: `${toOptimize} annonce${toOptimize > 1 ? 's' : ''} à optimiser`,
    },
  ];
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k.label}</span>
            <k.icon size={15} className="text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{k.value}</div>
          <div className="text-[11px] text-teal-600 font-bold mt-1">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
