import React from 'react';
import { ShieldCheck, Star, CheckCircle } from 'lucide-react';
import { IMG } from './data';
import SearchWidget from './SearchWidget';

/* Hero de la landing : titre + visuel + barre de recherche */
export default function Hero() {
  return (
    <section id="accueil" className="pt-24 lg:pt-32 pb-10 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Texte */}
          <div>
            <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-teal-500 rounded-full" />
              N°1 de la location vérifiée au Cameroun
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-black text-slate-900 leading-tight mb-6">
              Louez un véhicule <span className="text-teal-600">vérifié</span> à Douala &amp; Yaoundé en toute sérénité
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
              Berlines, SUV et véhicules de luxe inspectés, avec chauffeur certifié
              ou en autoconduite. Paiement sécurisé par Mobile Money, assistance 24/7.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
              {['Annulation gratuite 24h avant', 'Chauffeurs certifiés', 'Assurance incluse'].map(t => (
                <span key={t} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-teal-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative hidden lg:block">
            <img src={IMG.hero} alt="Véhicule AutoLink Pro"
              className="w-full h-[420px] object-cover rounded-3xl shadow-2xl"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; e.target.parentElement.style.borderRadius = '1.5rem'; }} />
            {/* Carte flottante */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center">
                <ShieldCheck size={22} className="text-teal-600" />
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm">100% vérifiés</div>
                <div className="text-xs text-slate-500">Inspection en 50 points</div>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-3">
              <div className="flex -space-x-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <div className="text-sm font-black text-slate-900">4,9/5</div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mt-12 lg:mt-14">
          <SearchWidget />
        </div>
      </div>
    </section>
  );
}
