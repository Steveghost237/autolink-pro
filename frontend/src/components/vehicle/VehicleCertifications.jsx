import React from 'react';
import { BadgeCheck, FileCheck, Wrench, UserCheck, ClipboardCheck } from 'lucide-react';
import { certificationScores, galleryFor } from '../../utils/vehicleDetails';

const ICONS = [ClipboardCheck, FileCheck, Wrench, UserCheck];

/* « Fiches des certifications véhicules » — scores d'inspection + photos terrain */
export default function VehicleCertifications({ vehicle: v }) {
  const cert = certificationScores(v);
  const photos = galleryFor(v).slice(1, 5);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-slate-900 flex items-center gap-2">
          <BadgeCheck size={18} className="text-teal-600" /> Fiches des certifications véhicules
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-full border-[3px] border-teal-500 flex items-center justify-center">
            <span className="text-xs font-black text-teal-700">{cert.global}%</span>
          </div>
          <span className="text-xs text-slate-500 font-medium leading-tight">Score<br />global</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {cert.items.map((c, i) => {
          const Icon = ICONS[i];
          return (
            <div key={c.label} className="border border-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Icon size={15} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{c.label}</div>
                    <div className="text-[10px] text-slate-400">{c.note}</div>
                  </div>
                </div>
                <span className="text-sm font-black text-teal-600">{c.value}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${c.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Photos de l'inspection terrain */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {photos.map((p, i) => (
          <img key={i} src={p} alt={`Inspection ${i + 1}`}
            className="h-16 w-full object-cover rounded-lg"
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#134e4a'; }} />
        ))}
      </div>
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
        <BadgeCheck size={12} className="text-teal-600" />
        Certifiée par nos experts de terrain {v.inspected?.replace('Inspecté le', 'le')}/2025 à {v.area}
      </p>
    </section>
  );
}
