import React from 'react';
import { RotateCcw, ShieldCheck, AlertTriangle, Gauge, Fuel } from 'lucide-react';

/* « Conditions de location & annulation » + « Politique carburant/kilométrage » */
export default function RentalConditions({ vehicle: v }) {
  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5">Conditions de location &amp; annulation</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: RotateCcw, title: 'Annulation gratuite',
              text: 'Jusqu\'à 24h avant le départ. Modification gratuite jusqu\'à 15 min avant la prise en charge.',
            },
            {
              icon: ShieldCheck, title: 'Paiement sécurisé',
              text: 'Fonds conservés par AutoLink Pro jusqu\'à la confirmation du trajet. Aucun débit avant la location.',
            },
            {
              icon: AlertTriangle, title: 'Politique de retard',
              text: '30 minutes d\'attente offertes. Au-delà, facturation horaire ou réattribution possible.',
            },
          ].map(c => (
            <div key={c.title} className="border border-slate-100 rounded-xl p-4">
              <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center mb-3">
                <c.icon size={17} className="text-teal-600" />
              </div>
              <h3 className="font-black text-slate-900 text-sm mb-1.5">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-slate-900 mb-5">Politique carburant &amp; kilométrage</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
              <Gauge size={17} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm mb-1">{v.kmIncluded} km inclus / jour</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Au-delà : {v.kmRate} FCFA / km supplémentaire, décompté au retour du véhicule.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-slate-100 rounded-xl p-4">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
              <Fuel size={17} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm mb-1">Carburant à niveau identique</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Le véhicule est remis avec le plein — il doit être restitué au même niveau.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
