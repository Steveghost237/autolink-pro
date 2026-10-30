import React from 'react';
import { Search, Headphones } from 'lucide-react';
import { QUICK_CHIPS } from './data';

/* Hero du centre d'aide — titre + recherche + accès rapides (fond navy). */
export default function HelpHero({ query, setQuery }) {
  return (
    <section className="pt-28 lg:pt-36 pb-12 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block bg-teal-600/20 text-teal-300 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
          Centre d'aide &amp; accompagnement
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
          Comment pouvons-nous <span className="text-teal-400">vous aider ?</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-9">
          Trouvez une réponse immédiate : réservations, caution, Mobile Money,
          documents — ou contactez notre équipe locale à Douala &amp; Yaoundé.
        </p>

        {/* Recherche */}
        <div className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-2xl max-w-2xl mx-auto">
          <Search size={18} className="text-slate-400 ml-3 shrink-0" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Ex : Comment réserver une voiture, payer ou Orange Money…"
            className="flex-1 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
          />
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shrink-0">
            Rechercher
          </button>
        </div>

        {/* Accès rapides */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1 flex items-center gap-1">
            <Headphones size={11} /> Accès rapides :
          </span>
          {QUICK_CHIPS.map(c => (
            <button key={c} onClick={() => setQuery(c)}
              className="text-[11px] font-semibold text-slate-300 bg-white/5 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-full transition-colors">
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
