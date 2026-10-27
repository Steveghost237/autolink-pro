import React from 'react';
import { STEPS_5 } from './data';

/* Mini-maquette d'interface — illustre chaque étape sans capture réelle. */
const MockScreen = ({ mock }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden w-full max-w-sm ml-auto">
    <div className="flex items-center gap-1.5 bg-slate-50 border-b border-slate-100 px-4 py-2.5">
      <span className="w-2 h-2 bg-slate-200 rounded-full" />
      <span className="w-2 h-2 bg-slate-200 rounded-full" />
      <span className="w-2 h-2 bg-slate-200 rounded-full" />
      <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">{mock.tag}</span>
    </div>
    <div className="p-4 space-y-2.5">
      {mock.lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-3 py-2.5">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0" />
          <span className="text-xs font-semibold text-slate-700 truncate">{l}</span>
        </div>
      ))}
      <div className="bg-teal-600 text-white text-center text-xs font-bold py-2.5 rounded-lg mt-1">
        {mock.btn}
      </div>
    </div>
  </div>
);

/* Section « Comment fonctionne votre location en 5 étapes simples ». */
export default function StepsFive() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Comment fonctionne votre location en <span className="text-teal-600">5 étapes simples</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Un parcours entièrement digitalisé, pensé pour vous faire gagner du temps.
          </p>
        </div>

        <div className="space-y-6">
          {STEPS_5.map((s, i) => (
            <div key={s.num}
              className={`grid lg:grid-cols-2 gap-8 items-center rounded-3xl border border-slate-100 p-7 lg:p-10 ${i % 2 ? 'bg-slate-50' : 'bg-white'}`}>
              <div className={i % 2 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-black text-teal-100 leading-none">{s.num}</span>
                  <span className="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center shadow-md">
                    <s.icon size={20} className="text-white" />
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed max-w-lg">{s.desc}</p>
              </div>
              <div className={i % 2 ? 'lg:order-1' : ''}>
                <MockScreen mock={s.mock} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
