import React from 'react';
import { Wallet, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* Mini sparkline SVG — tendance des revenus. */
const Spark = ({ points = '0,28 20,24 40,26 60,18 80,20 100,12 120,14 140,6' }) => (
  <svg viewBox="0 0 140 34" className="w-full h-8" preserveAspectRatio="none">
    <polyline points={points} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* 3 cartes soldes — maquette Revenus & Retraits. */
export default function RevenueCards({ available = 0, pending = 0, total = 0, onWithdraw }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solde disponible immédiat</span>
          <Wallet size={15} className="text-teal-500" />
        </div>
        <div className="text-3xl font-black text-slate-900">{fmt(available)} <span className="text-sm text-slate-400">FCFA</span></div>
        <p className="text-[10px] text-teal-600 font-bold mt-1">Retirable via MTN MoMo / Orange</p>
        <button onClick={onWithdraw} className="mt-3 text-[10px] font-black text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
          Prêt au transfert · Déclencher →
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">En attente de virement</span>
          <Clock size={15} className="text-amber-500" />
        </div>
        <div className="text-3xl font-black text-slate-900">{fmt(pending)} <span className="text-sm text-slate-400">FCFA</span></div>
        <p className="text-[10px] text-slate-400 mt-1">Locations en cours &amp; vérification état des lieux</p>
        <div className="mt-3 flex gap-2">
          <span className="text-[9px] font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-slate-500">2 virements sur 7 jours</span>
          <span className="text-[9px] font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-slate-500">Libération sous 48 h</span>
        </div>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total cumulé généré</span>
          <TrendingUp size={15} className="text-teal-500" />
        </div>
        <div className="text-3xl font-black text-slate-900">{fmt(total)} <span className="text-sm text-slate-400">FCFA</span></div>
        <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1"><ArrowUpRight size={10} /> +18,4 % vs T2 2025</p>
        <div className="mt-2"><Spark /></div>
      </div>
    </div>
  );
}
