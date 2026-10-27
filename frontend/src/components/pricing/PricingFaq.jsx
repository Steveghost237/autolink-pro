import React, { useState } from 'react';
import { ChevronDown, Building2, MessageCircle, ArrowRight } from 'lucide-react';
import { FAQS_TARIFS } from './data';

/* Section « Questions fréquentes sur nos tarifs » — accordéon + cartes devis/assistance. */
export default function PricingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        {/* Accordéon */}
        <div>
          <p className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Tout sur nos prix</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">
            Questions fréquentes sur <span className="text-teal-600">nos tarifs</span>
          </h2>
          <div className="space-y-3">
            {FAQS_TARIFS.map((f, i) => (
              <div key={f.q} className={`bg-white rounded-2xl border transition-all ${open === i ? 'border-teal-200 shadow-md' : 'border-slate-100'}`}>
                <button onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-4">
                  <span className="font-bold text-slate-900 text-sm">{f.q}</span>
                  <ChevronDown size={17} className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180 text-teal-600' : ''}`} />
                </button>
                {open === i && (
                  <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar devis flotte + assistance */}
        <div className="space-y-5 lg:sticky lg:top-28">
          <div className="bg-teal-600 rounded-3xl p-7 text-white">
            <span className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mb-4">
              <Building2 size={20} />
            </span>
            <h3 className="font-black text-lg mb-2">Besoin d'un devis pour une flotte ou longue durée ?</h3>
            <p className="text-teal-100 text-sm leading-relaxed mb-5">
              Entreprises, administrations et ONG : tarifs négociés, facturation groupée et interlocuteur dédié.
            </p>
            <button className="w-full flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm py-3 rounded-xl hover:bg-teal-50 transition-colors">
              Demander un devis personnalisé <ArrowRight size={15} />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">
            <h3 className="font-black text-slate-900 text-sm mb-1.5">Assistance Tarifaire Directe</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Une question sur un prix ou une option ? Notre équipe répond en moins de 10 minutes.
            </p>
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl transition-colors">
              <MessageCircle size={15} /> WhatsApp direct
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
