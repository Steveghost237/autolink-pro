import React from 'react';
import { Banknote, ArrowUpRight } from 'lucide-react';

/* Carte navy « Solde disponible au retrait » — maquette dashboard propriétaire. */
export default function BalanceCard({ available = 0, pending = 0, total = 0 }) {
  const fmt = n => Math.round(n).toLocaleString('fr-FR');
  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solde disponible au retrait</span>
        <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">Instantané</span>
      </div>
      <div className="text-4xl font-black mb-5">
        {fmt(available)} <span className="text-base text-teal-400">FCFA</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">En attente de virement</div>
          <div className="font-black text-sm">{fmt(pending)} <span className="text-[10px] text-slate-400">FCFA</span></div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Total cumulé 2025</div>
          <div className="font-black text-sm">{fmt(total)} <span className="text-[10px] text-slate-400">FCFA</span></div>
        </div>
      </div>
      <button className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl transition-colors mb-3">
        <Banknote size={16} /> Retirer mes revenus <ArrowUpRight size={14} />
      </button>
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> MTN MoMo
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-2" /> Orange Money
        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full ml-2" /> Virement CEMAC
      </div>
    </div>
  );
}
