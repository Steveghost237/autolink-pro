import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CAUTION_RISKS, CAUTION_GAINS, CAUTION_REFUND, CAUTION_SEQUESTER, CAUTION_DISPUTE } from './data';

/* Section « Caution Sécurisée » — les deux blocs en accordéons FAQ déroulants. */
export default function CautionSection() {
  const [open, setOpen] = useState(0);

  const groups = [
    {
      id: 'risks',
      title: 'Location classique — les problèmes rencontrés',
      cardCls: 'border-red-200',
      headCls: 'text-red-300',
      list: CAUTION_RISKS, dotCls: 'bg-red-400',
    },
    {
      id: 'gains',
      title: 'Garantie tiers & dédommagement automatique',
      cardCls: 'border-teal-200',
      headCls: 'text-teal-500',
      list: CAUTION_GAINS, dotCls: 'bg-teal-500',
    },
    {
      id: 'refund',
      title: 'Combien de temps pour récupérer ma caution ?',
      cardCls: 'border-slate-200',
      headCls: 'text-slate-700',
      list: CAUTION_REFUND, dotCls: 'bg-teal-500',
    },
    {
      id: 'sequester',
      title: 'Où est conservée ma caution pendant la location ?',
      cardCls: 'border-slate-200',
      headCls: 'text-slate-700',
      list: CAUTION_SEQUESTER, dotCls: 'bg-teal-500',
    },
    {
      id: 'dispute',
      title: 'Que se passe-t-il en cas de litige sur la caution ?',
      cardCls: 'border-slate-200',
      headCls: 'text-slate-700',
      list: CAUTION_DISPUTE, dotCls: 'bg-teal-500',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-teal-600 mb-3">
            La garantie Caution Sécurisée : fini les cautions confisquées
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Nous avons remplacé l'argent en main propre par un séquestre digital transparent.
          </p>
        </div>

        {/* Les deux blocs en FAQ dropdown */}
        <div className="max-w-3xl mx-auto space-y-4">
          {groups.map((g, gi) => {
            const isOpen = open === gi;
            return (
              <div key={g.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-colors `}>
                <button onClick={() => setOpen(isOpen ? null : gi)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                  <span className={` text-sm sm:text-base `}>{g.title}</span>
                  <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <ul className=" px-5 py-4 space-y-2.5">
                    {g.list.map(item => (
                      <li key={item} className="flex items-start gap-3 text-[13px] font-medium text-slate-600 leading-relaxed">
                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${g.dotCls}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
