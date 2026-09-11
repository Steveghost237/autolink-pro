import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Car, Star, DollarSign, Clock, MapPin, Phone, CheckCircle, XCircle, Navigation, Award } from 'lucide-react';

const TRIPS = [
  { id: 'T001', client: 'Marie Konan', phone: '+225 07 12 34 56', vehicle: 'Toyota Corolla 2022', emoji: '🚗', pickup: 'Plateau, Abidjan', dropoff: 'Cocody, Abidjan', date: '2025-08-20', amount: 15000, status: 'completed', rating: 5 },
  { id: 'T002', client: 'Yves Kouadio', phone: '+225 05 78 90 12', vehicle: 'Toyota Corolla 2022', emoji: '🚗', pickup: 'Aéroport FHB', dropoff: 'Hôtel Ivoire', date: '2025-08-22', amount: 20000, status: 'completed', rating: 4 },
  { id: 'T003', client: 'Awa Diallo', phone: '+225 07 45 67 89', vehicle: 'Toyota Corolla 2022', emoji: '🚗', pickup: 'Marcory, Abidjan', dropoff: 'Yopougon', date: '2025-08-25', amount: 18000, status: 'active', rating: null },
];

const UPCOMING = [
  { id: 'U001', client: 'Paul Bamba', phone: '+225 07 99 00 11', vehicle: 'Toyota Corolla 2022', emoji: '🚗', pickup: 'Bingerville', dropoff: 'Plateau', date: '2025-08-26', time: '08:00', amount: 25000 },
  { id: 'U002', client: 'Fatou Diallo', phone: '+225 05 22 33 44', vehicle: 'Toyota Corolla 2022', emoji: '🚗', pickup: 'Cocody', dropoff: 'Aéroport FHB', date: '2025-08-27', time: '14:30', amount: 22000 },
];

const DRIVER_STATS = { rating: 4.8, totalTrips: 312, totalEarned: 4680000, monthlyEarned: 480000, acceptanceRate: 94, onTimeRate: 98 };

export default function DriverDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <DashboardLayout title="Tableau de bord Chauffeur">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-primary-900 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Bonjour, {user?.firstName} 🚗</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(DRIVER_STATS.rating) ? 'text-amber-400 fill-current' : 'text-slate-600'} />)}
                  <span className="text-amber-400 font-bold ml-1">{DRIVER_STATS.rating}</span>
                </div>
                <span className="badge-success">Chauffeur certifié ✓</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
                <button onClick={() => setIsOnline(!isOnline)} className={`relative w-12 h-6 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${isOnline ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {isOnline && <span className="text-xs text-emerald-400">● Disponible pour des courses</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Note', value: `${DRIVER_STATS.rating}★`, color: 'text-amber-600 bg-amber-50', icon: Star },
            { label: 'Courses', value: DRIVER_STATS.totalTrips, color: 'text-blue-600 bg-blue-50', icon: Car },
            { label: 'Revenus mois', value: `${(DRIVER_STATS.monthlyEarned / 1000).toFixed(0)}K F`, color: 'text-emerald-600 bg-emerald-50', icon: DollarSign },
            { label: 'Total gagné', value: `${(DRIVER_STATS.totalEarned / 1000000).toFixed(1)}M F`, color: 'text-primary-600 bg-primary-50', icon: Award },
            { label: 'Acceptation', value: `${DRIVER_STATS.acceptanceRate}%`, color: 'text-purple-600 bg-purple-50', icon: CheckCircle },
            { label: 'Ponctualité', value: `${DRIVER_STATS.onTimeRate}%`, color: 'text-primary-600 bg-primary-50', icon: Clock },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} />
              </div>
              <div className="font-black text-slate-900">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Trips */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Prochaines courses</h3>
            {UPCOMING.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock size={32} className="mx-auto mb-2" />
                <p>Aucune course planifiée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {UPCOMING.map(t => (
                  <div key={t.id} className="border-2 border-primary-100 bg-primary-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{t.client}</div>
                          <div className="text-xs text-slate-500">{t.date} à {t.time}</div>
                        </div>
                      </div>
                      <div className="font-bold text-primary-700">{t.amount.toLocaleString()} F</div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5"><MapPin size={11} className="text-emerald-500" /> Départ : {t.pickup}</div>
                      <div className="flex items-center gap-1.5"><Navigation size={11} className="text-red-500" /> Arrivée : {t.dropoff}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                        <CheckCircle size={12} /> Accepter
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-slate-200 text-slate-600 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium">
                        <XCircle size={12} /> Décliner
                      </button>
                      <a href={`tel:${t.phone}`} className="flex items-center justify-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                        <Phone size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Historique des courses</h3>
            <div className="space-y-3">
              {TRIPS.map(t => (
                <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${t.status === 'active' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}`}>
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900 text-sm">{t.client}</span>
                      {t.status === 'active' && <span className="badge-success text-xs animate-pulse">En cours</span>}
                      {t.status === 'completed' && t.rating && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(t.rating)].map((_, i) => <Star key={i} size={10} className="text-amber-400 fill-current" />)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{t.pickup} → {t.dropoff}</div>
                    <div className="text-xs text-slate-400">{t.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-emerald-600 text-sm">+{t.amount.toLocaleString()} F</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Véhicule assigné</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-6xl">🚗</div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-lg">Toyota Corolla 2022</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="badge-primary">AB 1234 CI</span>
                <span className="badge-success">Assurance valide</span>
                <span className="badge-info">Essence</span>
                <span className="badge-success">État : 92/100</span>
              </div>
              <div className="text-sm text-slate-500 mt-2">Propriétaire : Jean Kouassi · Dernière inspection : 2025-08-10</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary-700">25 000</div>
              <div className="text-xs text-slate-500">FCFA/jour tarif</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
