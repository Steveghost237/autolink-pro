import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Car, TrendingUp, DollarSign, Clock, PlusCircle, ArrowRight, CheckCircle, AlertTriangle, BarChart2, MapPin, Settings } from 'lucide-react';
import { SPECIFIC_CARS } from '../../utils/carImages';

const MY_VEHICLES = [
  {
    id: 1, name: 'Toyota Corolla 2022', plate: 'LT-1234-A', image: SPECIFIC_CARS.corolla,
    mode: 'platform', status: 'available', dailyRate: 25000, kmIncluded: 300, kmRate: 120,
    totalEarned: 1120000, bookings: 44, kmTotal: 8240,
    lastInspection: '2025-08-10', insurance: '2026-03-15', conditionScore: 94,
  },
  {
    id: 2, name: 'Hyundai Tucson 2023', plate: 'LT-5678-B', image: SPECIFIC_CARS.tucson,
    mode: 'home', status: 'rented', dailyRate: 45000, kmIncluded: 300, kmRate: 120,
    totalEarned: 1980000, bookings: 44, kmTotal: 12880,
    lastInspection: '2025-08-05', insurance: '2026-01-20', conditionScore: 97,
  },
];

const RECENT_TRANSACTIONS = [
  { id: 'T-0038', vehicle: 'Hyundai Tucson 2023', client: 'Marie Mballa',   type: 'Journée',     amount: 45000,  myShare: 35100, date: '2025-09-08', status: 'paid' },
  { id: 'T-0037', vehicle: 'Toyota Corolla 2022', client: 'Eric Mvondo',    type: 'Interurbain',  amount: 60000,  myShare: 46800, date: '2025-09-06', status: 'paid' },
  { id: 'T-0036', vehicle: 'Toyota Corolla 2022', client: 'Aline Ngono',    type: '8 heures',    amount: 12500,  myShare: 9750,  date: '2025-09-04', status: 'paid' },
  { id: 'T-0039', vehicle: 'Hyundai Tucson 2023', client: 'Robert Owona',   type: 'Longue durée', amount: 135000, myShare: 0,     date: '2025-09-10', status: 'pending' },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeVehicle, setActiveVehicle] = useState(MY_VEHICLES[0]);

  const totalEarned  = MY_VEHICLES.reduce((s, v) => s + v.totalEarned, 0);
  const myNetEarned  = Math.round(totalEarned * 0.78);
  const totalKm      = MY_VEHICLES.reduce((s, v) => s + v.kmTotal, 0);
  const totalBookings = MY_VEHICLES.reduce((s, v) => s + v.bookings, 0);

  return (
    <DashboardLayout title="Espace Gestionnaire">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80"
            alt="Gestionnaire" className="w-full h-44 object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <p className="text-white/70 text-sm mb-1">Gestionnaire de parc,</p>
            <h2 className="text-2xl font-black text-white mb-1">{user?.firstName} {user?.lastName}</h2>
            <p className="text-white/60 text-sm mb-4">{MY_VEHICLES.length} véhicule(s) sur la plateforme</p>
            <button onClick={() => navigate('/owner/add-vehicle')}
              className="w-fit flex items-center gap-2 bg-white text-slate-900 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all shadow-lg text-sm">
              <PlusCircle size={16} /> Enregistrer un véhicule
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Car,       label: 'Véhicules enregistrés', value: MY_VEHICLES.length,              color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', sub: null },
            { icon: DollarSign,label: 'Revenus nets',           value: `${myNetEarned.toLocaleString()} F`, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20', sub: '78% de chaque location' },
            { icon: TrendingUp,label: 'Locations totales',      value: totalBookings,                    color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20', sub: null },
            { icon: MapPin,    label: 'Km parcourus (flotte)',  value: `${totalKm.toLocaleString()} km`, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', sub: null },
          ].map(({ icon: Icon, label, value, color, sub }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
              {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>

        {/* Commission info */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={20} className="text-teal-700 dark:text-teal-400" />
          </div>
          <div>
            <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-1">Votre part = 78 % de chaque location</h4>
            <p className="text-sm text-teal-700 dark:text-teal-400">AutoLink prélève 22 % de commission. Les km supplémentaires ({activeVehicle.kmRate} F/km) sont entièrement reversés au gestionnaire. Versement MTN / Orange Money sous 24h après confirmation.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vehicles */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Mes véhicules</h3>
              <button onClick={() => navigate('/owner/vehicles')} className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Gérer <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-4">
              {MY_VEHICLES.map(v => (
                <div key={v.id} className={`border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${activeVehicle.id === v.id ? 'border-primary-400' : 'border-slate-100 dark:border-slate-700'}`}
                  onClick={() => setActiveVehicle(v)}>
                  <div className="flex items-center gap-3 p-3">
                    <img src={v.image} alt={v.name} className="w-20 h-14 rounded-lg object-cover shrink-0" onError={e => { e.target.style.display='none'; }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">{v.plate}</div>
                      <div className="flex items-center gap-2">
                        <span className={v.status === 'available' ? 'badge-success' : 'badge-info'}>
                          {v.status === 'available' ? 'Disponible' : 'En location'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary-700 dark:text-primary-400 text-sm">{v.dailyRate.toLocaleString()} F</div>
                      <div className="text-xs text-slate-400">/jour</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700 text-center text-xs">
                    <div className="p-2">
                      <div className="font-bold text-slate-900 dark:text-white">{Math.round(v.totalEarned * 0.78).toLocaleString()} F</div>
                      <div className="text-slate-400">Revenus nets</div>
                    </div>
                    <div className="p-2">
                      <div className="font-bold text-slate-900 dark:text-white">{v.bookings}</div>
                      <div className="text-slate-400">Locations</div>
                    </div>
                    <div className="p-2">
                      <div className="font-bold text-slate-900 dark:text-white">{v.kmTotal.toLocaleString()}</div>
                      <div className="text-slate-400">Km total</div>
                    </div>
                    <div className={`p-2 ${v.conditionScore >= 90 ? 'bg-emerald-50 dark:bg-emerald-900/20' : v.conditionScore >= 75 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className={`font-bold ${v.conditionScore >= 90 ? 'text-emerald-700' : v.conditionScore >= 75 ? 'text-amber-700' : 'text-red-700'}`}>{v.conditionScore}/100</div>
                      <div className="text-slate-400">Score</div>
                    </div>
                  </div>
                  <div className="px-3 pb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Forfait : {v.kmIncluded} km inclus · {v.kmRate} F/km supp.</span>
                    {new Date(v.insurance) < new Date(Date.now() + 60 * 86400000) && (
                      <div className="flex items-center gap-1 text-amber-700"><AlertTriangle size={11} /> Assurance {v.insurance}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Derniers versements</h3>
              <button className="text-sm text-primary-600 font-medium flex items-center gap-1">
                <BarChart2 size={14} /> Exporter
              </button>
            </div>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    {t.status === 'paid' ? <CheckCircle size={16} className="text-emerald-600" /> : <Clock size={16} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.vehicle}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{t.client} · {t.type} · {t.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${t.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {t.status === 'paid' ? `+${t.myShare.toLocaleString()} F` : 'En attente'}
                    </div>
                    <div className="text-xs text-slate-400">{t.id}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-primary-700 dark:text-primary-400">Total versé ce mois</div>
                <div className="text-xs text-primary-600 dark:text-primary-500">Orange Money / MTN</div>
              </div>
              <div className="text-xl font-black text-primary-700 dark:text-primary-400">
                {RECENT_TRANSACTIONS.filter(t => t.status === 'paid').reduce((s, t) => s + t.myShare, 0).toLocaleString()} F
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
