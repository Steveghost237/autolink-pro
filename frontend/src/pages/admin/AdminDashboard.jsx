import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Users, Car, DollarSign, TrendingUp, UserCheck, ClipboardList,
  ArrowRight, AlertTriangle, CheckCircle, Clock, Shield
} from 'lucide-react';

const PLATFORM_STATS = {
  totalUsers: 5247, totalVehicles: 523, totalBookings: 15890, totalRevenue: 47600000,
  platformCommission: 11900000, pendingDrivers: 12, pendingVehicles: 8, activeBookings: 47,
};

const RECENT_ACTIVITY = [
  { type: 'booking', msg: 'Nouvelle réservation BK089 — Marie Konan · Toyota Corolla', time: '5 min', color: 'bg-blue-100 text-blue-600' },
  { type: 'payment', msg: 'Paiement reçu 80 000 FCFA (commission 20 000 F) — BMW Série 5', time: '12 min', color: 'bg-emerald-100 text-emerald-600' },
  { type: 'driver', msg: 'Nouveau candidat chauffeur : Kofi Boateng — Permis B', time: '1h', color: 'bg-amber-100 text-amber-600' },
  { type: 'vehicle', msg: 'Véhicule soumis pour validation : Kia Sportage 2023', time: '2h', color: 'bg-purple-100 text-purple-600' },
  { type: 'inspection', msg: 'Fiche d\'inspection complétée — Ford Ranger 2021', time: '3h', color: 'bg-primary-100 text-primary-600' },
  { type: 'alert', msg: 'Assurance expirante dans 15 jours — Hyundai Tucson (AB 5678)', time: '4h', color: 'bg-red-100 text-red-600' },
];

const QUICK_ACTIONS = [
  { icon: UserCheck, label: 'Recrutement chauffeurs', path: '/admin/drivers', badge: '12 en attente', color: 'bg-amber-500' },
  { icon: Car, label: 'Valider véhicules', path: '/admin/users', badge: '8 en attente', color: 'bg-purple-500' },
  { icon: ClipboardList, label: 'Inspections', path: '/admin/inspections', badge: '3 à faire', color: 'bg-primary-500' },
  { icon: DollarSign, label: 'Finance & commissions', path: '/admin/finance', badge: null, color: 'bg-emerald-500' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Tableau de bord Admin">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alert banner */}
        {(PLATFORM_STATS.pendingDrivers > 0 || PLATFORM_STATS.pendingVehicles > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              <strong>{PLATFORM_STATS.pendingDrivers} candidats chauffeurs</strong> et <strong>{PLATFORM_STATS.pendingVehicles} véhicules</strong> en attente de validation.
            </div>
            <button onClick={() => navigate('/admin/drivers')} className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline whitespace-nowrap">
              Voir maintenant
            </button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Utilisateurs', value: PLATFORM_STATS.totalUsers.toLocaleString(), change: '+8.3%', color: 'text-blue-600 bg-blue-50' },
            { icon: Car, label: 'Véhicules actifs', value: PLATFORM_STATS.totalVehicles, change: '+12 ce mois', color: 'text-primary-600 bg-primary-50' },
            { icon: TrendingUp, label: 'Réservations', value: PLATFORM_STATS.totalBookings.toLocaleString(), change: '+245 ce mois', color: 'text-purple-600 bg-purple-50' },
            { icon: DollarSign, label: 'Commission AutoLink', value: `${(PLATFORM_STATS.platformCommission / 1000000).toFixed(1)}M FCFA`, change: '25% du CA', color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ icon: Icon, label, value, change, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">{change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(({ icon: Icon, label, path, badge, color }) => (
            <button key={label} onClick={() => navigate(path)} className="card hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
                {badge && <span className="badge-warning">{badge}</span>}
              </div>
              <div className="font-semibold text-slate-900 text-sm">{label}</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary-600 font-medium">
                Accéder <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Activity */}
          <div className="lg:col-span-2 card">
            <h3 className="font-bold text-slate-900 mb-5">Activité en temps réel</h3>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                    {a.type === 'booking' ? <Car size={14} /> : a.type === 'payment' ? <DollarSign size={14} /> : a.type === 'driver' ? <UserCheck size={14} /> : a.type === 'alert' ? <AlertTriangle size={14} /> : a.type === 'inspection' ? <ClipboardList size={14} /> : <Car size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{a.msg}</p>
                    <p className="text-xs text-slate-400 mt-0.5">il y a {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Santé de la plateforme</h3>
              <div className="space-y-4">
                {[
                  { label: 'Courses actives', value: PLATFORM_STATS.activeBookings, max: 100, color: 'bg-blue-500' },
                  { label: 'Véhicules disponibles', value: 423, max: 523, color: 'bg-emerald-500' },
                  { label: 'Chauffeurs en ligne', value: 87, max: 200, color: 'bg-primary-500' },
                  { label: 'Taux de satisfaction', value: 94, max: 100, color: 'bg-amber-500', suffix: '%' },
                ].map(({ label, value, max, color, suffix }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-900">{value}{suffix || `/${max}`}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900 mb-4">Revenus du mois</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Chiffre d'affaires total</span><span className="font-bold">{(4760000).toLocaleString()} F</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Commission AutoLink (25%)</span><span className="font-bold text-emerald-600">{(1190000).toLocaleString()} F</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Reversé propriétaires (75%)</span><span className="font-bold text-blue-600">{(3570000).toLocaleString()} F</span></div>
                <div className="border-t border-slate-100 pt-2 flex justify-between text-sm"><span className="text-slate-500">Croissance vs mois dernier</span><span className="font-bold text-emerald-600">+18.5%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
