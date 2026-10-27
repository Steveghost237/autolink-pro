import React from 'react';
import { ArrowRight, TrendingUp, Percent, Clock } from 'lucide-react';
import { IMG } from '../landing/data';

/* Hero « Devenir propriétaire » — promesse + visuel revenus. */
export default function PartnerHero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="pt-28 lg:pt-36 pb-14 bg-gradient-to-br from-teal-50 via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Monétisez votre véhicule
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
            Votre voiture dort au garage ? <span className="text-teal-600">Faites-la travailler en toute sécurité.</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-xl">
            Confiez votre véhicule à AutoLink Pro : nous gérons locataires, contrats,
            assurances et paiements — vous touchez 85 % de chaque location.
          </p>
          <div className="flex flex-wrap gap-4 mb-9">
            <button onClick={() => scrollTo('candidature')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-md">
              Devenir partenaire <ArrowRight size={17} />
            </button>
            <button onClick={() => scrollTo('simulateur')}
              className="border-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-colors bg-white">
              Découvrez les avantages
            </button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-teal-600" /> Jusqu'à 20 jours loués/mois</span>
            <span className="flex items-center gap-1.5"><Percent size={14} className="text-teal-600" /> 85 % des revenus pour vous</span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-teal-600" /> Mise en ligne sous 48 h</span>
          </div>
        </div>

        {/* Visuel + carte revenus */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <img src={IMG.standPremium} alt="Véhicule partenaire" className="w-full h-72 lg:h-96 object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 sm:right-auto bg-slate-900 rounded-2xl shadow-2xl px-6 py-4">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-0.5">Votre SUV peut rapporter</div>
            <div className="text-white font-black text-2xl">765 000 <span className="text-sm text-teal-400">FCFA/mois</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
