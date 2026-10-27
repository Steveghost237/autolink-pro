import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import { INVOICE } from './data';
import { CATALOG_VEHICLES } from '../../utils/carImages';

/* Section « Exemple de facturation transparente » — véhicule + décomposition du prix. */
export default function InvoiceExample() {
  const navigate = useNavigate();
  const rav4 = CATALOG_VEHICLES.find(v => /rav4/i.test(v.name)) || CATALOG_VEHICLES[0];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Véhicule exemple */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-4">
              <Receipt size={12} /> Exemple concret
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
              Exemple de facturation transparente — <span className="text-teal-600">Location {INVOICE.vehicle.split('—')[0].trim()}</span>
            </h2>
            <p className="text-slate-500 leading-relaxed mb-7">
              Voici exactement ce que vous payez : chaque ligne est visible avant de confirmer,
              et le même détail reste accessible dans votre espace client.
            </p>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex items-center gap-4 mb-5">
              <img src={rav4.image} alt={rav4.name} className="w-28 h-20 object-cover rounded-xl" />
              <div>
                <div className="font-black text-slate-900">{INVOICE.vehicle}</div>
                <div className="text-xs text-slate-500">{INVOICE.period}</div>
                <span className="inline-block mt-1.5 bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md">Véhicule vérifié</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-teal-600 rounded-2xl px-5 py-4 text-white">
              <ShieldCheck size={22} className="shrink-0" />
              <p className="text-sm font-bold">Engagement AutoLink Pro : si le prix final diffère du devis, la différence vous est remboursée.</p>
            </div>
          </div>

          {/* Facture détaillée */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center gap-2.5 bg-slate-50 border-b border-slate-100 px-6 py-4">
              <FileText size={16} className="text-teal-600" />
              <span className="font-black text-slate-900 text-sm">Détail de la facturation</span>
              <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase">Réf. ALP-DLA-2024-089</span>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {INVOICE.lines.map(l => (
                  <li key={l.label} className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-2 ${l.included ? 'text-slate-700' : 'text-slate-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${l.included ? 'bg-teal-500' : 'bg-slate-300'}`} />
                      {l.label}
                    </span>
                    <span className={`font-bold ${l.amount.startsWith('−') ? 'text-emerald-600' : 'text-slate-900'}`}>{l.amount}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t-2 border-dashed border-slate-200 pt-5 mb-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Total de la réservation</div>
                    <div className="font-black text-slate-900 text-3xl">{INVOICE.total}</div>
                    <div className="text-xs text-teal-600 font-semibold mt-1">{INVOICE.totalNote}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-5">
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={14} className="text-teal-600" /> {INVOICE.cautionNote}
                </span>
                <span className="font-black text-slate-900 text-sm">{INVOICE.caution}</span>
              </div>
              <button onClick={() => navigate('/catalogue')}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                Réserver à ce tarif <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
