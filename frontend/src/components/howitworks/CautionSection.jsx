import React from 'react';
import { ShieldX, ShieldCheck } from 'lucide-react';
import { CAUTION_RISKS, CAUTION_GAINS, CAUTION_ICONS } from './data';

/* Section « Caution Sécurisée » — comparatif risques classiques vs garantie AutoLink. */
export default function CautionSection() {
  const Risk = CAUTION_ICONS.risk;
  const Gain = CAUTION_ICONS.gain;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            La garantie <span className="text-teal-600">Caution Sécurisée</span> : fini les cautions confisquées
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Nous avons remplacé l'argent en main propre par un séquestre digital transparent.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Risques de la location classique */}
          <div className="bg-red-50/70 border border-red-100 rounded-3xl p-7 lg:p-9">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <ShieldX size={19} className="text-red-500" />
              </span>
              <h3 className="font-black text-red-700">Location classique — les problèmes rencontrés</h3>
            </div>
            <ul className="space-y-3.5">
              {CAUTION_RISKS.map(r => (
                <li key={r} className="flex items-start gap-3 text-sm text-slate-600">
                  <Risk size={17} className="text-red-400 shrink-0 mt-0.5" /> {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Garantie AutoLink Pro */}
          <div className="bg-teal-50/80 border border-teal-100 rounded-3xl p-7 lg:p-9">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <ShieldCheck size={19} className="text-teal-600" />
              </span>
              <h3 className="font-black text-teal-800">Garantie tiers &amp; dédommagement automatique</h3>
            </div>
            <ul className="space-y-3.5">
              {CAUTION_GAINS.map(g => (
                <li key={g} className="flex items-start gap-3 text-sm text-slate-700">
                  <Gain size={17} className="text-teal-600 shrink-0 mt-0.5" /> {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
