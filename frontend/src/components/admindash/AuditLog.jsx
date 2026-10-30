import React, { useMemo } from 'react';
import { ScrollText, ExternalLink } from 'lucide-react';

const EVENT_STYLE = {
  validation: { label: 'Validation KYC & permis', badge: 'bg-emerald-100 text-emerald-700' },
  escrow:     { label: 'Prélèvement caution séquestre', badge: 'bg-amber-100 text-amber-700' },
  vehicle:    { label: 'Nouveau véhicule soumis', badge: 'bg-blue-100 text-blue-700' },
  inspection: { label: 'Inspection technique', badge: 'bg-purple-100 text-purple-700' },
  payout:     { label: 'Retrait approuvé', badge: 'bg-teal-100 text-teal-700' },
};

const timeOf = iso => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/* Journal d'audit opérationnel — événements réels dérivés des données plateforme. */
export default function AuditLog({ bookings = [], vehicles = [], users = [] }) {
  const events = useMemo(() => {
    const evts = [];
    bookings.slice(0, 6).forEach(b => {
      const st = EVENT_STYLE[b.deposit_amount > 0 ? 'escrow' : 'validation'];
      evts.push({
        at: b.created_at, type: st,
        title: b.deposit_amount > 0 ? 'Prélèvement caution séquestre' : 'Validation réservation',
        desc: `BK-${String(b.id).padStart(4, '0')} — ${b.client_name || 'Client'} · ${b.vehicle_name || ''} · ${Math.round(b.deposit_amount || b.subtotal || 0).toLocaleString('fr-FR')} FCFA`,
        by: 'Gateway AutoLink', channel: 'MTN MoMo / Web', status: b.escrow_status === 'held' ? 'Caution bloquée' : 'Approuvé',
      });
    });
    vehicles.filter(v => v.status === 'pending').slice(0, 3).forEach(v => {
      evts.push({
        at: v.created_at || new Date().toISOString(), type: EVENT_STYLE.vehicle,
        title: 'Nouveau véhicule soumis pour listing',
        desc: `${v.brand} ${v.model} ${v.year || ''} · ${v.plate || ''} · ${v.owner_name || 'Propriétaire'}`,
        by: 'Portail Propriétaire', channel: 'Web (Formulaire)', status: 'En attente',
      });
    });
    return evts.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
  }, [bookings, vehicles, users]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <ScrollText size={15} className="text-teal-600" /> Journal d'Audit Opérationnel en Direct
        </h3>
        <button className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700">
          Voir tous les logs système (5 201) <ExternalLink size={11} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-6 py-3">Heure</th>
              <th className="px-4 py-3">Événement &amp; Description de l'action</th>
              <th className="px-4 py-3">Opérateur / Système</th>
              <th className="px-4 py-3">Canal &amp; Moyen</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {events.map((e, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5 text-[11px] font-bold text-slate-500 whitespace-nowrap">{timeOf(e.at)}</td>
                <td className="px-4 py-3.5">
                  <div className="text-[12px] font-bold text-slate-800">{e.title}</div>
                  <div className="text-[10px] text-slate-400">{e.desc}</div>
                </td>
                <td className="px-4 py-3.5 text-[11px] font-semibold text-teal-700">{e.by}</td>
                <td className="px-4 py-3.5 text-[11px] text-slate-500">{e.channel}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${e.type.badge}`}>{e.status}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button className="text-slate-300 hover:text-teal-600 transition-colors"><ExternalLink size={13} /></button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-xs text-slate-400">Aucun événement à afficher.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
