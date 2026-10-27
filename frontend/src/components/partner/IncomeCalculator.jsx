import React, { useState } from 'react';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';
import { SIM_GAMMES, OWNER_SHARE } from './data';

/* Section « Estimez le revenu mensuel net de votre véhicule » — simulateur interactif. */
export default function IncomeCalculator() {
  const [gamme, setGamme] = useState('premium');
  const [days, setDays] = useState(15);

  const g = SIM_GAMMES.find(x => x.id === gamme);
  const gross = g.dayPrice * days;
  const net = Math.round(gross * OWNER_SHARE / 1000) * 1000;
  const fmt = n => n.toLocaleString('fr-FR');

  return (
    <section id="simulateur" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Simulateur de revenus</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Estimez le <span className="text-teal-600">revenu mensuel net</span> de votre véhicule
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Ajustez la gamme et le nombre de jours loués — le revenu estimé se calcule instantanément.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Réglages */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 lg:p-9">
            <div className="flex items-center gap-2.5 mb-6">
              <Calculator size={18} className="text-teal-600" />
              <h3 className="font-black text-slate-900">Votre situation</h3>
            </div>

            <label className="label">Gamme de votre véhicule</label>
            <div className="grid grid-cols-2 gap-2.5 mb-7">
              {SIM_GAMMES.map(x => (
                <button key={x.id} type="button" onClick={() => setGamme(x.id)}
                  className={`py-3 px-3 rounded-xl border-2 text-xs font-bold transition-all ${gamme === x.id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {x.label}
                  <span className="block text-[10px] font-medium text-slate-400 mt-0.5">{fmt(x.dayPrice)} FCFA/j</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Jours de location par mois</label>
              <span className="bg-teal-600 text-white text-xs font-black px-3 py-1 rounded-lg">{days} jours</span>
            </div>
            <input type="range" min="4" max="30" value={days} onChange={e => setDays(+e.target.value)}
              className="w-full accent-teal-600 mb-2" />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>4 j — tranquille</span><span>15 j — bon rythme</span><span>30 j — full time</span>
            </div>
          </div>

          {/* Résultat */}
          <div className="bg-slate-900 rounded-3xl p-7 lg:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Revenu net estimé</span>
                <span className="bg-teal-600/20 text-teal-300 text-[10px] font-bold px-2.5 py-1 rounded-full">85 % pour vous</span>
              </div>
              <div className="font-black text-white text-5xl mb-2">
                {fmt(net)} <span className="text-lg text-teal-400">FCFA</span>
              </div>
              <p className="text-sm text-slate-400 mb-7">
                par mois, pour un véhicule <strong className="text-slate-200">{g.label}</strong> loué {days} jours.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex justify-between border-b border-white/10 pb-2.5">
                  <span>Revenu brut ({days} j × {fmt(g.dayPrice)})</span>
                  <span className="text-slate-200 font-bold">{fmt(gross)} FCFA</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2.5">
                  <span>Commission AutoLink Pro (15 %)</span>
                  <span className="text-slate-200 font-bold">−{fmt(gross - net)} FCFA</span>
                </li>
                <li className="flex justify-between">
                  <span className="flex items-center gap-1.5"><TrendingUp size={13} className="text-teal-400" /> Versé chaque lundi par Mobile Money</span>
                </li>
              </ul>
            </div>
            <button onClick={() => document.getElementById('candidature')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl transition-colors">
              Commencer votre aventure <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
