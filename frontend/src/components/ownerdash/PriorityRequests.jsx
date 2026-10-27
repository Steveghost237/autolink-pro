import React, { useState, useEffect } from 'react';
import { Timer, ShieldCheck, Star, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { CATALOG_VEHICLES } from '../../utils/carImages';

const carImg = (name = '') => {
  const found = CATALOG_VEHICLES.find(v => name.toLowerCase().includes((v.model || '').toLowerCase()) && v.model);
  return found?.image || CATALOG_VEHICLES[0].image;
};

const fmtDate = d => { try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); } catch (_) { return d; } };

/* Compte à rebours « Expire dans … » — délai de réponse de 8 h après création. */
const useCountdown = (createdAt) => {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const end = new Date(createdAt).getTime() + 8 * 3600 * 1000;
      const d = Math.max(0, end - Date.now());
      const h = String(Math.floor(d / 3600000)).padStart(2, '0');
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
      setLeft(`${h}h ${m}m`);
    };
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [createdAt]);
  return left;
};

function RequestCard({ b, onDecide, busy }) {
  const left = useCountdown(b.created_at);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
      <img src={carImg(b.vehicle_name)} alt={b.vehicle_name} className="w-full sm:w-28 h-24 sm:h-20 object-cover rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4 className="font-black text-slate-900 truncate">{b.vehicle_name || 'Véhicule'}</h4>
          <div className="text-right shrink-0">
            <div className="font-black text-slate-900 text-sm">{Number(b.total_price || 0).toLocaleString('fr-FR')} <span className="text-[10px] text-teal-600">FCFA</span></div>
            <div className="text-[10px] text-slate-400 font-medium">{fmtDate(b.start_date)} → {fmtDate(b.end_date)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[9px] font-black">
            {(b.client_name || 'C').split(' ').map(x => x[0]).join('').slice(0, 2)}
          </span>
          <span className="text-xs font-semibold text-slate-700">{b.client_name || 'Client'}</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400"><Star size={10} className="text-amber-400 fill-amber-400" /> 4,8</span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md"><ShieldCheck size={10} /> Locataire certifié</span>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-500">
            <Timer size={12} /> Expire dans {left}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onDecide(b.id, 'cancelled')} disabled={busy === b.id}
              className="border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              Refuser
            </button>
            <button onClick={() => onDecide(b.id, 'confirmed')} disabled={busy === b.id}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {busy === b.id ? <Loader size={12} className="animate-spin" /> : null} Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Section « Demandes à traiter en priorité » — réservations en attente. */
export default function PriorityRequests({ bookings, onChanged }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const pending = bookings.filter(b => b.status === 'pending');

  const decide = async (id, status) => {
    setBusy(id);
    try { await bookingsAPI.updateStatus(id, status); } catch (_) {}
    setBusy(null);
    onChanged?.();
  };

  return (
    <section className="bg-slate-50/60 rounded-3xl border border-slate-100 p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Demandes à traiter en priorité
          {pending.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">{pending.length} en attente</span>}
        </h3>
        <button onClick={() => navigate('/owner/requests')} className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">Voir toutes les demandes <ArrowRight size={12} /></button>
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          Aucune demande en attente — vos nouvelles réservations apparaîtront ici.
        </p>
      ) : (
        <div className="grid xl:grid-cols-2 gap-4">
          {pending.map(b => <RequestCard key={b.id} b={b} onDecide={decide} busy={busy} />)}
        </div>
      )}
    </section>
  );
}
