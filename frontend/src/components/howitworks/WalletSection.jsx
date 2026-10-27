import React from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { WALLET_FEATURES } from './data';

/* Section « Le Portefeuille AutoLink Pro » — 4 fonctionnalités + carte d'alimentation. */
export default function WalletSection() {
  return (
    <section className="py-20 bg-teal-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Le Portefeuille <span className="text-teal-600">AutoLink Pro</span> : Comment ça fonctionne ?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Un compte intégré qui centralise paiements, cautions et remboursements.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {WALLET_FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
              <span className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon size={20} className="text-teal-600" />
              </span>
              <h3 className="font-black text-slate-900 text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 bg-teal-600/20 rounded-xl flex items-center justify-center shrink-0">
              <Wallet size={22} className="text-teal-400" />
            </span>
            <div>
              <h3 className="font-black text-white">Confiez-nous la gestion de votre caution</h3>
              <p className="text-sm text-slate-400">Blocage et déblocage automatiques, tracés et certifiés à chaque location.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shrink-0">
            Découvrir le portefeuille <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
