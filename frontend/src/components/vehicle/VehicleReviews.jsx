import React from 'react';
import { Star } from 'lucide-react';
import { vehicleReviews } from '../../utils/vehicleDetails';

const BARS = [72, 20, 6, 2, 0]; // répartition 5★ → 1★

/* « Avis certifiés de voyageurs » — note globale + avis */
export default function VehicleReviews({ vehicle: v }) {
  const reviews = vehicleReviews(v);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-7">
        <h2 className="font-black text-slate-900 sm:flex-1">Avis certifiés de voyageurs</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-black text-slate-900">{v.rating}</div>
            <div className="flex gap-0.5 justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className={i < Math.round(v.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
              ))}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{v.reviews} avis vérifiés</div>
          </div>
          <div className="space-y-1">
            {BARS.map((pct, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-3">{5 - i}</span>
                <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {reviews.map(r => (
          <div key={r.name + r.date} className="border-t border-slate-50 pt-5 first:border-0 first:pt-0">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center font-black text-xs">
                {r.initials}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                <div className="text-[11px] text-slate-400">Location vérifiée · {r.city} · {r.date}</div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < r.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
