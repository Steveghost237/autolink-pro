import React, { useState } from 'react';
import { DollarSign, TrendingUp, Download, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';

const MONTHLY_DATA = [
  { month: 'Fév', ca: 2800000, commission: 1400000, versements: 1400000 },
  { month: 'Mar', ca: 3200000, commission: 1600000, versements: 1600000 },
  { month: 'Avr', ca: 3800000, commission: 1900000, versements: 1900000 },
  { month: 'Mai', ca: 4100000, commission: 2050000, versements: 2050000 },
  { month: 'Juin', ca: 3700000, commission: 1850000, versements: 1850000 },
  { month: 'Juil', ca: 4500000, commission: 2250000, versements: 2250000 },
  { month: 'Août', ca: 4760000, commission: 2380000, versements: 2380000 },
];

const PAYMENT_METHODS = [
  { name: 'MTN Money', value: 42, color: '#EAB308' },
  { name: 'Orange Money', value: 31, color: '#F97316' },
  { name: 'PayPal', value: 15, color: '#3B82F6' },
  { name: 'Stripe', value: 12, color: '#8B5CF6' },
];

const TRANSACTIONS = [
  { id: 'TX001', type: 'booking', client: 'Marie Konan', vehicle: 'Toyota Corolla 2022', amount: 50000, commission: 25000, owner_share: 25000, method: 'MTN Money', date: '2025-08-20', status: 'completed' },
  { id: 'TX002', type: 'booking', client: 'Yves Kouadio', vehicle: 'BMW Série 5', amount: 80000, commission: 40000, owner_share: 40000, method: 'Orange Money', date: '2025-08-20', status: 'completed' },
  { id: 'TX003', type: 'booking', client: 'Awa Diallo', vehicle: 'Hyundai Tucson', amount: 135000, commission: 67500, owner_share: 67500, method: 'PayPal', date: '2025-08-19', status: 'completed' },
  { id: 'TX004', type: 'booking', client: 'Paul Bamba', vehicle: 'Mercedes Sprinter', amount: 110000, commission: 55000, owner_share: 55000, method: 'Stripe', date: '2025-08-19', status: 'pending' },
  { id: 'TX005', type: 'refund', client: 'Fatou Coulibaly', vehicle: 'Ford Ranger', amount: -40000, commission: 0, owner_share: 0, method: 'MTN Money', date: '2025-08-18', status: 'refunded' },
];

const fmt = (n) => n.toLocaleString();

export default function Finance() {
  const [period, setPeriod] = useState('month');
  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2];
  const growth = (((currentMonth.ca - prevMonth.ca) / prevMonth.ca) * 100).toFixed(1);

  return (
    <DashboardLayout title="Finance & Commissions">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'CA ce mois', value: `${fmt(currentMonth.ca)} FCFA`, change: `+${growth}%`, up: true, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
            { label: 'Commission AutoLink (50%)', value: `${fmt(currentMonth.commission)} FCFA`, change: '50% du CA', up: true, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Versé propriétaires (50%)', value: `${fmt(currentMonth.versements)} FCFA`, change: '50% du CA', up: true, icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
            { label: 'Transactions ce mois', value: '1 247', change: '+18 vs hier', up: true, icon: Calendar, color: 'bg-accent-50 text-accent-600' },
          ].map(({ label, value, change, up, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}><Icon size={20} /></div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 leading-tight">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Commission explainer */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">Modèle de commission AutoLink — Répartition automatique</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-3xl font-black">100%</div>
              <div className="text-primary-200 text-sm mt-1">Client paie</div>
              <div className="text-xs text-primary-300 mt-1">Montant total de la location</div>
            </div>
            <div className="bg-accent-500/30 rounded-xl p-4 border border-accent-400/50">
              <div className="text-3xl font-black text-accent-300">50%</div>
              <div className="text-accent-200 text-sm mt-1">AutoLink garde</div>
              <div className="text-xs text-accent-300 mt-1">Commission plateforme</div>
            </div>
            <div className="bg-emerald-500/30 rounded-xl p-4 border border-emerald-400/50">
              <div className="text-3xl font-black text-emerald-300">50%</div>
              <div className="text-emerald-200 text-sm mt-1">Caution propriétaire</div>
              <div className="text-xs text-emerald-300 mt-1">Bloquée puis versée au retour du véhicule</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900">Évolution des revenus (7 mois)</h3>
              <button className="flex items-center gap-1.5 text-sm text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MONTHLY_DATA}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v/1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${fmt(v)} FCFA`} />
                <Bar dataKey="ca" name="CA Total" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" name="Commission AutoLink" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="versements" name="Versé propriétaires" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods Pie */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Moyens de paiement</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={PAYMENT_METHODS} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {PAYMENT_METHODS.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {PAYMENT_METHODS.map(m => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-slate-600">{m.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900">Transactions récentes</h3>
            <button className="flex items-center gap-1.5 text-sm text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
              <Download size={14} /> Exporter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['ID', 'Client', 'Véhicule', 'Montant total', 'Commission (50%)', 'Caution proprio (50%)', 'Méthode', 'Date', 'Statut'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TRANSACTIONS.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-slate-500">{t.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{t.client}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{t.vehicle}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{fmt(Math.abs(t.amount))} F</td>
                    <td className="py-3 px-3 font-semibold text-accent-600">{t.commission > 0 ? fmt(t.commission) : '—'} F</td>
                    <td className="py-3 px-3 font-semibold text-emerald-600">{t.owner_share > 0 ? fmt(t.owner_share) : '—'} F</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{t.method}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="py-3 px-3">
                      <span className={t.status === 'completed' ? 'badge-success' : t.status === 'pending' ? 'badge-warning' : 'badge-error'}>
                        {t.status === 'completed' ? 'Confirmé' : t.status === 'pending' ? 'En attente' : 'Remboursé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
