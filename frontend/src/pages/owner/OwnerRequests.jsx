import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { RequestCard, RequestDetail } from '../../components/ownerrequests';
import { ChevronDown, Zap, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { bookingsAPI, vehiclesAPI } from '../../services/api';

const TABS = [
  { id: 'pending',   label: 'À traiter',  match: b => b.status === 'pending' },
  { id: 'accepted',  label: 'Acceptées',  match: b => ['confirmed', 'active'].includes(b.status) },
  { id: 'refused',   label: 'Refusées',   match: b => ['cancelled', 'disputed'].includes(b.status) },
  { id: 'done',      label: 'Terminées',  match: b => b.status === 'completed' },
];

export default function OwnerRequests() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('pending');
  const [vehicle, setVehicle] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(null);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [b, v] = await Promise.all([bookingsAPI.list({ page_size: 50 }), vehiclesAPI.list({ mine: 1, page_size: 100 })]);
      const list = b.data.results || b.data || [];
      setBookings(list);
      setVehicles(v.data.results || v.data || []);
      setSelected(s => list.find(x => x.id === s?.id) || list.find(x => x.status === 'pending') || null);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, status) => {
    setBusy(id);
    try { await bookingsAPI.updateStatus(id, status); } catch (_) {}
    setBusy(null);
    load();
  };

  const visible = useMemo(() => {
    const t = TABS.find(x => x.id === tab);
    return bookings.filter(t.match).filter(b => !vehicle || String(b.vehicle) === vehicle);
  }, [bookings, tab, vehicle]);

  const counts = useMemo(() => Object.fromEntries(TABS.map(t => [t.id, bookings.filter(t.match).length])), [bookings]);

  return (
    <OwnerLayout badges={{ demandes: counts.pending }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Opérations de flotte <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1"><Clock size={10} /> Temps moyen de réponse : 18 min</span>
              {!online && <button onClick={load} className="text-red-500 flex items-center gap-1"><RefreshCw size={9} /> Hors ligne</button>}
            </div>
            <h1 className="text-3xl font-black text-slate-900">Demandes de location &amp; <span className="text-teal-600">Réservations</span></h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            <span className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs font-black px-4 py-2.5 rounded-xl">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> {counts.pending} demande{counts.pending > 1 ? 's' : ''} en attente de réponse
            </span>
            <span className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl">
              <Zap size={13} className="text-teal-600" /> Acceptation instantanée <span className="text-[9px] font-black text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Désactivée</span>
            </span>
            <span className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl">
              <ShieldCheck size={13} className="text-teal-600" /> Score MoMo CEMAC 98,4 %
            </span>
          </div>
        </div>

        {/* Onglets + filtres */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${tab === t.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-700'}`}>
                {t.id === 'pending' && <span className={`w-1.5 h-1.5 rounded-full ${tab === t.id ? 'bg-red-400' : 'bg-red-500'}`} />}
                {t.label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{counts[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { val: vehicle, set: setVehicle, label: 'Véhicule', opts: vehicles.map(v => ({ v: String(v.id), l: `${v.brand} ${v.model}` })), placeholder: 'Tous les véhicules' },
              { val: '', set: () => {}, label: 'Zone', opts: [{ v: 'dla', l: 'Douala & Kribi' }, { v: 'yao', l: 'Yaoundé' }], placeholder: 'Douala & Kribi' },
              { val: '', set: () => {}, label: 'Tri', opts: [{ v: 'exp', l: "Urgence d'expiration" }, { v: 'price', l: 'Montant décroissant' }], placeholder: "Tri : Urgence d'expiration" },
            ].map((s, i) => (
              <div key={i} className="relative">
                <select value={s.val} onChange={e => s.set(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
                  <option value="">{s.label} : {s.placeholder}</option>
                  {s.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Liste + dossier */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-4">
            {visible.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
                <p className="font-bold text-slate-500">Aucune demande dans cet onglet.</p>
                <p className="text-sm mt-1">Les nouvelles demandes de vos clients apparaîtront ici.</p>
              </div>
            ) : visible.map(b => (
              <RequestCard key={b.id} b={b} selected={selected?.id === b.id}
                onSelect={setSelected} onDecide={decide} busy={busy} />
            ))}
          </div>
          <RequestDetail b={selected} onDecide={decide} busy={busy} />
        </div>
      </div>
    </OwnerLayout>
  );
}
