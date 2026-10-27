import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { IMG } from '../landing/data';

/* Hero de la page « Comment ça marche » — badge, titre, double CTA, visuel. */
export default function HowHero() {
  const navigate = useNavigate();
  return (
    <section className="pt-28 lg:pt-36 pb-14 bg-gradient-to-br from-teal-50 via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block bg-teal-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            Comment ça marche
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-5">
            Louer en toute sérénité à <span className="text-teal-600">Douala et Yaoundé</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-xl">
            De la réservation au déblocage de la caution, découvrez comment AutoLink Pro
            sécurise chaque étape de votre location — sans paperasse ni mauvaise surprise.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/catalogue')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-md">
              Réserver un véhicule <ArrowRight size={17} />
            </button>
            <button className="flex items-center gap-2 border-2 border-slate-200 hover:border-teal-500 hover:text-teal-700 text-slate-700 font-bold px-6 py-3.5 rounded-xl transition-colors bg-white">
              <Play size={16} className="text-teal-600" /> Voir la vidéo (1 min)
            </button>
          </div>
        </div>

        {/* Visuel + cartes flottantes */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
            <img src={IMG.hero} alt="Véhicule AutoLink Pro" className="w-full h-72 lg:h-96 object-cover" />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-3">
            <span className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} className="text-teal-600" />
            </span>
            <div>
              <div className="text-sm font-black text-slate-900">Caution sécurisée</div>
              <div className="text-[11px] text-slate-400">Déblocage automatique</div>
            </div>
          </div>
          <div className="absolute -top-5 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-3.5 flex items-center gap-2.5">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-slate-900">4,9/5</span>
            <span className="text-[11px] text-slate-400">3 400+ locations</span>
          </div>
        </div>
      </div>
    </section>
  );
}
