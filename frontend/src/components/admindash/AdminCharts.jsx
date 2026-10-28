import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { TrendingUp, PieChart, MapPin } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/* Graphique « Évolution des Réservations et Revenus » — 6 derniers mois. */
export function RevenueChart({ bookings = [] }) {
  const data = useMemo(() => {
    const map = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      map[`${d.getFullYear()}-${d.getMonth()}`] = { m: MONTHS[d.getMonth()], resa: 0, rev: 0 };
    }
    bookings.forEach(b => {
      const d = new Date(b.created_at || b.start_date);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (map[k]) { map[k].resa += 1; map[k].rev += Number(b.subtotal || 0) / 1000; }
    });
    return Object.values(map);
  }, [bookings]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <TrendingUp size={15} className="text-teal-600" /> Évolution des Réservations et Revenus
        </h3>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-600 rounded-sm" /> Véhicules</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full" /> CA (K FCFA)</span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mb-4">Volume de réservations et chiffre d'affaires brut (30 derniers jours inclus).</p>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="m" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v, name) => name === 'res' ? `${v} locations` : `${fmt(v * 1000)} FCFA`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar yAxisId="l" dataKey="resa" name="Locations" fill="#0d9488" radius={[5, 5, 0, 0]} barSize={22} />
          <Line yAxisId="r" type="monotone" dataKey="rev" name="Revenus (K FCFA)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-50">
        {[
          { l: 'Durée Moy. Location', v: '3,8 jours' },
          { l: 'Panier Moyen', v: '172 500 F' },
          { l: 'Taux Chauffeur Pro', v: '38 %' },
        ].map(s => (
          <div key={s.l}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.l}</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Répartition par gamme — parts de la flotte. */
const TIER_COLORS = { basic: '#94a3b8', standard: '#0d9488', premium: '#f59e0b', gold: '#0f766e', collection: '#7c3aed' };
const TIER_NAMES = { basic: 'Citadines Économiques', standard: 'Berlines & SUV Urbains', premium: 'Berlines Prestige', gold: 'SUV & 4x4 Haut de Gamme', collection: 'Collection & Pick-up' };

export function TierRepartition({ vehicles = [] }) {
  const counts = useMemo(() => {
    const c = {};
    vehicles.forEach(v => { const t = v.tier || 'standard'; c[t] = (c[t] || 0) + 1; });
    const total = vehicles.length || 1;
    return Object.entries(c).map(([t, n]) => ({
      t, n, pct: Math.round((n / total) * 100),
      name: TIER_NAMES[t] || t, color: TIER_COLORS[t] || '#0d9488',
    })).sort((a, b) => b.pct - a.pct);
  }, [vehicles]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
        <PieChart size={15} className="text-teal-600" /> Répartition par Gamme
      </h3>
      <p className="text-[10px] text-slate-400 mb-4">Part de la flotte par catégorie tarifaire.</p>
      <div className="space-y-3">
        {counts.map(r => (
          <div key={r.t}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-700">{r.name}</span>
              <span className="font-black text-slate-900">{r.pct} %</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.color }} />
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">{r.n} véhicule{r.n > 1 ? 's' : ''}</div>
          </div>
        ))}
        {counts.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Aucune donnée.</p>}
      </div>
    </div>
  );
}

/* Activité par hub régional — locations par ville. */
export function HubActivity({ bookings = [] }) {
  const hubs = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      const city = (b.pickup_address || '').includes('Yaoundé') || /yde|yaound/i.test(b.pickup_address || '') ? 'Yaoundé' : 'Douala';
      map[city] = (map[city] || 0) + 1;
    });
    const total = bookings.length || 1;
    return [
      { name: 'Douala — Akwa Centre', pct: Math.round(((map['Douala'] || 0) / total) * 100), n: map['Douala'] || 0 },
      { name: 'Yaoundé — Bastos', pct: Math.round(((map['Yaoundé'] || 0) / total) * 100), n: map['Yaoundé'] || 0 },
    ];
  }, [bookings]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mt-4">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
        <MapPin size={15} className="text-teal-600" /> Activité par Hub Régional
      </h3>
      <p className="text-[10px] text-slate-400 mb-4">Volume des locations par point de remise.</p>
      <div className="space-y-3">
        {hubs.map(h => (
          <div key={h.name} className="bg-slate-50 rounded-xl px-3.5 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">{h.name}</span>
              <span className="text-sm font-black text-teal-700">{h.pct} %</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">{h.n} location{h.n > 1 ? 's' : ''} · hub actif</div>
          </div>
        ))}
      </div>
    </div>
  );
}
