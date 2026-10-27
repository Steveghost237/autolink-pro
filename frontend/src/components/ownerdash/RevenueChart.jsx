import React from 'react';
import { ComposedChart, Bar, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

/* « Évolution des revenus locatifs » — barres + courbe de tendance (recharts). */
export default function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h3 className="font-black text-slate-900">Évolution des revenus locatifs</h3>
          <p className="text-xs text-slate-400 mt-0.5">Montants nets perçus après commission de la plateforme (FCFA)</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-teal-500 rounded-sm" /> Revenu net</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-400 rounded" /> Tendance</span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={v => [`${Math.round(v).toLocaleString('fr-FR')} FCFA`, 'Revenu']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="#99f6e4"
              // dernière barre (mois courant) en teal plein
              shape={props => {
                const { x, y, width, height, payload } = props;
                const isMax = payload.revenue === max;
                return <rect x={x} y={y} width={width} height={height} rx={6} fill={isMax ? '#0d9488' : '#ccfbf1'} />;
              }} />
            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
