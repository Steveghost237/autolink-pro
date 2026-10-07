import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { bookingsAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  CreditCard, FileText, TrendingUp, Car, Calendar, Search,
  CheckCircle, Clock, XCircle, Loader,
} from 'lucide-react';

const STATUS_META = {
  completed: { label: 'Terminées',  color: '#10B981', icon: CheckCircle },
  confirmed: { label: 'Confirmées', color: '#0EA5E9', icon: CheckCircle },
  active:    { label: 'En cours',   color: '#3B82F6', icon: Loader },
  pending:   { label: 'En attente', color: '#F59E0B', icon: Clock },
  cancelled: { label: 'Annulées',   color: '#EF4444', icon: XCircle },
};

const fmtF = (n) => `${Math.round(n).toLocaleString('fr-FR')} F`;

export default function ClientStats() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getAll()
      .then(res => setBookings(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Dépenses réelles = réservations non annulées
  const stats = useMemo(() => {
    const paid = bookings.filter(b => b.status !== 'cancelled');
    const totalSpent = paid.reduce((s, b) => s + Number(b.subtotal || 0), 0);
    const totalDays = paid.reduce((s, b) => s + Number(b.days || 1), 0);
    const vehicles = new Set(paid.map(b => b.vehicle_name).filter(Boolean));

    // Dépenses des 6 derniers mois
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: d.toLocaleDateString('fr-FR', { month: 'short' }),
        depenses: 0,
        reservations: 0,
      });
    }
    paid.forEach(b => {
      const d = new Date(b.start_date);
      const m = months.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) {
        m.depenses += Number(b.subtotal || 0);
        m.reservations += 1;
      }
    });

    const byStatus = Object.keys(STATUS_META)
      .map(k => ({ name: STATUS_META[k].label, value: bookings.filter(b => b.status === k).length, color: STATUS_META[k].color }))
      .filter(s => s.value > 0);

    const byVehicle = {};
    paid.forEach(b => {
      const k = b.vehicle_name || 'Véhicule';
      byVehicle[k] = (byVehicle[k] || 0) + Number(b.subtotal || 0);
    });
    const topVehicles = Object.entries(byVehicle)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    return {
      totalSpent, totalDays,
      count: bookings.length,
      avg: paid.length ? totalSpent / paid.length : 0,
      vehiclesCount: vehicles.size,
      months, byStatus, topVehicles,
    };
  }, [bookings]);

  const kpis = [
    { icon: CreditCard,  label: 'Total dépensé',      value: fmtF(stats.totalSpent),         color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
    { icon: FileText,    label: 'Réservations',        value: stats.count,                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { icon: TrendingUp,  label: 'Panier moyen',        value: fmtF(stats.avg),                color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
    { icon: Calendar,    label: 'Jours de location',   value: stats.totalDays,                color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { icon: Car,         label: 'Véhicules différents', value: stats.vehiclesCount,           color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
  ];

  return (
    <DashboardLayout title="Statistiques">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Mes dépenses &amp; statistiques</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Suivi de vos locations et recharges sur AutoLink.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpis.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Dépenses par mois */}
          <div className="lg:col-span-2 card">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Dépenses — 6 derniers mois</h3>
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-16">Chargement…</p>
            ) : stats.totalSpent === 0 ? (
              <div className="text-center py-14">
                <p className="text-sm text-slate-400 mb-4">Aucune dépense enregistrée pour le moment.</p>
                <button onClick={() => navigate('/client/search')} className="btn-primary inline-flex items-center gap-2 text-sm">
                  <Search size={15} /> Réserver un véhicule
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.months}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" tickFormatter={v => `${(v / 1000).toLocaleString('fr-FR')}k`} />
                  <Tooltip
                    formatter={(v, name) => name === 'depenses' ? [fmtF(v), 'Dépenses'] : [v, 'Réservations']}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}
                  />
                  <Bar dataKey="depenses" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Répartition par statut */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Réservations par statut</h3>
            {stats.byStatus.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-16">Aucune réservation.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {stats.byStatus.map(s => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Legend formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.15)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top véhicules par dépense */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Véhicules les plus loués</h3>
          {stats.topVehicles.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Aucune location payée pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {stats.topVehicles.map((v, i) => {
                const max = stats.topVehicles[0].amount || 1;
                return (
                  <div key={v.name} className="flex items-center gap-4">
                    <span className="w-6 text-xs font-black text-slate-400">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{v.name}</span>
                        <span className="text-sm font-bold text-primary-600 shrink-0 ml-3">{fmtF(v.amount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
                          style={{ width: `${Math.round((v.amount / max) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
