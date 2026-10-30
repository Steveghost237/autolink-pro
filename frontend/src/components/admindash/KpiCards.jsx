import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Wallet, Percent, Car, Wrench } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* 4 indicateurs de performance clés — CA brut, commissions, flotte, interventions. */
export default function KpiCards({ grossRevenue = 0, commission = 0, activeFleet = 0, totalFleet = 0, interventions = 0, sparkData = [] }) {
  const occupancy = totalFleet ? Math.round((activeFleet / totalFleet) * 100) : 0;

  const cards = [
    {
      label: "Chiffre d'Affaires Brut (Brut)",
      value: `${fmt(grossRevenue)}`, unit: 'FCFA',
      sub: 'Réservations & services',
      extra: <ResponsiveContainer width="100%" height={36}>
        <LineChart data={sparkData}><Line type="monotone" dataKey="v" stroke="#0d9488" strokeWidth={2} dot={false} /></LineChart>
      </ResponsiveContainer>,
    },
    {
      label: 'Commissions AutoLink Pro (15%)',
      value: `${fmt(commission)}`, unit: 'FCFA',
      sub: 'Part plateforme — MoMo & Cemac séquestres',
      extra: <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-teal-600">
        <Percent size={11} /> {fmt(commission)} prélevés sur {fmt(grossRevenue)} FCFA
      </div>,
    },
    {
      label: 'Flotte en Circulation Active',
      value: `${activeFleet}`, unit: `${totalFleet} véhicules actifs`,
      sub: `Taux d'occupation : ${occupancy} %`,
      extra: <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(occupancy, 100)}%` }} />
      </div>,
    },
    {
      label: 'Interventions Hubs Confirmées',
      value: `${interventions}`, unit: 'opérations',
      sub: 'Contrôles & zéro incident majeur',
      extra: <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
        <Wrench size={11} /> 100 % complétées ce mois
      </div>,
    },
  ];

  const icons = [Wallet, Percent, Car, Wrench];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-slate-900 text-sm">Indicateurs de Performance Clés <span className="text-slate-400 font-semibold">(Octobre 2025)</span></h2>
        <span className="text-[10px] font-bold text-slate-400">Données temps réel — Douala & Yaoundé</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = icons[i];
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</span>
                <Icon size={14} className="text-slate-300" />
              </div>
              <div className="text-3xl font-black text-slate-900 leading-none">
                {c.value} <span className="text-[11px] font-bold text-slate-400">{c.unit}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">{c.sub}</div>
              {c.extra}
            </div>
          );
        })}
      </div>
    </div>
  );
}
