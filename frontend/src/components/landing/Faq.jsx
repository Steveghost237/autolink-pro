import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data';

/* « Foire Aux Questions » — accordéon */
export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Foire Aux Questions
          </h2>
          <p className="text-slate-500">
            Tout ce qu'il faut savoir avant de réserver votre véhicule.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left">
                <span className={`font-bold text-sm ${open === i ? 'text-teal-600' : 'text-slate-900'}`}>
                  {f.q}
                </span>
                <ChevronDown size={18}
                  className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180 text-teal-600' : 'text-slate-400'}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/aide" className="text-teal-600 hover:text-teal-700 font-bold text-sm transition-colors">
            Consulter le centre d'aide complet →
          </Link>
        </div>
      </div>
    </section>
  );
}
