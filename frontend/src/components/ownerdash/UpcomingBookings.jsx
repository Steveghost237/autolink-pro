import React from 'react';
import { CalendarRange, MoreHorizontal } from 'lucide-react';
import { CATALOG_VEHICLES } from '../../utils/carImages';

const carImg = (name = '') => {
  const found = CATALOG_VEHICLES.find(v => name.toLowerCase().includes((v.model || '').toLowerCase()) && v.model);
  return found?.image || CATALOG_VEHICLES[0].image;
};

const STATUS = {
  confirmed: { label: 'Prêt pour départ',  cls: 'bg-teal-100 text-teal-700' },
  active:    { label: 'Course en cours',   cls: 'bg-sky-100 text-sky-700' },
  pending:   { label: 'À confirmer',       cls: 'bg-amber-100 text-amber-700' },
};

const DRIVER = {
  none:     'Autonome',
  owner:    'Chauffeur proprio',
  internal: 'Chauffeur AutoLink',
};

const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }); } catch (_) { return d || '—'; } };

/* « Prochaines locations confirmées » — planning détaillé de la flotte. */
export default function UpcomingBookings({ bookings }) {
  const rows = bookings
    .filter(b => ['confirmed', 'active'].includes(b.status))
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
        <div>
          <h3 className="font-black text-slate-900">Prochaines locations confirmées</h3>
          <p className="text-xs text-slate-400 mt-0.5">Planning immédiat des départs en cours de vos véhicules</p>
        </div>
        <span className="text-xs font-bold text-teal-600 flex items-center gap-1.5"><CalendarRange size={13} /> {rows.length} course(s)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[720px]">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-6 py-3">Véhicule</th>
              <th className="px-4 py-3">Locataire &amp; contact</th>
              <th className="px-4 py-3">Période de location</th>
              <th className="px-4 py-3">Point de remise</th>
              <th className="px-4 py-3">Mode de conduite</th>
              <th className="px-4 py-3">Statut opérationnel</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">Aucune location confirmée pour le moment.</td></tr>
            )}
            {rows.map(b => {
              const st = STATUS[b.status] || STATUS.pending;
              return (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={carImg(b.vehicle_name)} alt="" className="w-14 h-10 object-cover rounded-lg" />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[130px]">{b.vehicle_name || 'Véhicule'}</div>
                        <div className="text-[10px] text-slate-400">#{b.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-800 text-xs">{b.client_name || 'Client'}</div>
                    <div className="text-[10px] text-slate-400">Certifié AutoLink</div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-medium">
                    {fmtDate(b.start_date)}<br /><span className="text-slate-400">au {fmtDate(b.end_date)}</span>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-medium">Hub AutoLink<br /><span className="text-slate-400">{b.city || 'Douala'}</span></td>
                  <td className="px-4 py-4 text-xs text-slate-600 font-medium">{DRIVER[b.driver_type] || 'Autonome'}</td>
                  <td className="px-4 py-4"><span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${st.cls}`}>{st.label}</span></td>
                  <td className="px-4 py-4"><button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
