import React from 'react';
import { CalendarDays, CalendarRange, ShieldCheck, BadgeCheck } from 'lucide-react';

/* Hero de la page Tarifs — titre + carte comparateur rapide. */
export default function PricingHero() {
  return (
    <section className="pt-28 lg:pt-36 pb-14 bg-gradient-to-br from-teal-50 via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Tarification transparente
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
            Des tarifs clairs, adaptés à vos <span className="text-teal-600">déplacements au Cameroun</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-7 max-w-xl">
            Prix tout inclus dès le départ : assurance, assistance 24/7 et frais de service compris.
            Vous ne payez que ce que vous voyez — jamais de frais cachés.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-teal-600" /> Paiement Mobile Money &amp; carte sécurisés</span>
            <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-teal-600" /> Caution simplement pré-autorisée</span>
          </div>
        </div>

        {/* Comparateur rapide */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-7">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
              <CalendarDays size={20} className="text-teal-600 mb-3" />
              <h3 className="font-black text-slate-900 text-sm mb-1">Location par jour</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">De 3 h à plusieurs semaines. Idéal pour un besoin ponctuel.</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
              <CalendarRange size={20} className="text-slate-500 mb-3" />
              <h3 className="font-black text-slate-900 text-sm mb-1">Abonnement Pro</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">Flotte dédiée et tarifs dégressifs pour les entreprises.</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">À partir de</div>
              <div className="text-white font-black text-xl">25 000 <span className="text-xs text-teal-400">FCFA/jour</span></div>
            </div>
            <span className="text-[10px] bg-teal-600/20 text-teal-300 font-bold px-2.5 py-1 rounded-full">Jusqu'à −20 % en multi-jours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
