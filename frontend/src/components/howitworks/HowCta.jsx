import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Car } from 'lucide-react';

/* Bandeau CTA final — « Prêt à réserver votre prochain véhicule ? » */
export default function HowCta() {
  const navigate = useNavigate();
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl px-8 py-12 lg:px-14 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-teal-400 text-xs font-black uppercase tracking-widest mb-3">Prêt à vous lancer ?</p>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug max-w-2xl">
              Prêt à réserver votre prochain véhicule à Douala ou Yaoundé ?
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-xl">
              Rejoignez les milliers de clients qui louent en toute sérénité avec AutoLink Pro.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0">
            <button onClick={() => navigate('/catalogue')}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 py-3.5 rounded-xl transition-colors">
              Réserver un véhicule <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/register')}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl transition-colors border border-white/10">
              <Car size={16} /> Créer un compte
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
