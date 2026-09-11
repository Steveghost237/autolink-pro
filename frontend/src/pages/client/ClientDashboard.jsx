import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Car, Search, FileText, Star, Clock, CreditCard, ArrowRight, MapPin, Timer, Navigation, Calendar } from 'lucide-react';
import { SPECIFIC_CARS } from '../../utils/carImages';

const RECENT_BOOKINGS = [
  { id: 'BK-0024', vehicle: 'Hyundai Tucson 2023', driver: 'Armand Nkounga', date: '2025-08-20', type: 'Journée', amount: 45000, status: 'completed', rating: 5 },
  { id: 'BK-0025', vehicle: 'BMW Série 5 2022',    driver: 'Eric Mvondo',    date: '2025-08-15', type: '8 heures', amount: 24000, status: 'completed', rating: 4 },
  { id: 'BK-0026', vehicle: 'Mercedes GLE 350',    driver: 'En attente',     date: '2025-09-05', type: 'Interurbain', amount: 95000, status: 'pending',   rating: null },
];

const FEATURED_VEHICLES = [
  { name: 'Toyota Corolla 2022', category: 'Berline', price: 25000, rating: 4.8, image: SPECIFIC_CARS.corolla,     available: true  },
  { name: 'Hyundai Tucson 2023', category: 'SUV',     price: 45000, rating: 4.7, image: SPECIFIC_CARS.tucson,      available: true  },
  { name: 'BMW Série 5 2022',    category: 'Luxe',    price: 80000, rating: 5.0, image: SPECIFIC_CARS.bmw5,        available: false },
];

const STATUS_STYLES = {
  completed: 'badge-success',
  pending: 'badge-warning',
  active: 'badge-info',
  cancelled: 'badge-error',
};

const RENTAL_QUICK = [
  { id: 'urban_3h',  label: '3 heures',    icon: Timer,      desc: 'Courses & RDV',          color: 'bg-blue-600' },
  { id: 'urban_8h',  label: '8 heures',    icon: Clock,      desc: 'Demi-journée / Pro',     color: 'bg-teal-600' },
  { id: 'urban_day', label: '24 heures',   icon: Calendar,   desc: 'Journée complète',       color: 'bg-primary-600' },
  { id: 'intercity', label: 'Interurbain', icon: Navigation, desc: 'Douala ↔ Yaoundé',       color: 'bg-orange-500' },
];

const STATUS_LABELS = { completed: 'Terminé', pending: 'En attente', active: 'En cours', confirmed: 'Confirmé', cancelled: 'Annulé' };

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const totalSpent = RECENT_BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0);

  return (
    <DashboardLayout title="Tableau de bord">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
            alt="AutoLink Pro"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <p className="text-white/70 text-sm mb-1">Bienvenue,</p>
            <h2 className="text-2xl font-black text-white mb-4">{user?.firstName} {user?.lastName}</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/client/search')} className="flex items-center gap-2 bg-white text-slate-900 font-semibold py-2 px-4 rounded-xl hover:bg-slate-100 transition-all shadow-lg text-sm">
                <Search size={16} /> Réserver un véhicule
              </button>
              <button onClick={() => navigate('/client/bookings')} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-2 px-4 rounded-xl transition-all text-sm">
                <FileText size={16} /> Mes réservations
              </button>
            </div>
          </div>
        </div>

        {/* Rental type quick access */}
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-3">Choisir un type de location</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RENTAL_QUICK.map(({ id, label, icon: Icon, desc, color }) => (
              <button
                key={id}
                onClick={() => navigate(`/client/search?type=${id}`)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary-300 hover:shadow-md transition-all text-left group"
              >
                <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FileText,  label: 'Réservations totales', value: RECENT_BOOKINGS.length,            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { icon: CreditCard,label: 'Total dépensé',        value: `${totalSpent.toLocaleString()} F`, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
            { icon: Star,      label: 'Note moyenne donnée',  value: '4.7 / 5',                          color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            { icon: Car,       label: 'Véhicules essayés',    value: 3,                                   color: 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Réservations récentes</h3>
              <button onClick={() => navigate('/client/bookings')} className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {RECENT_BOOKINGS.map(b => (
                <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <Car size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{b.vehicle}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {b.driver} · {b.date} · {b.type}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{b.amount.toLocaleString()} F</div>
                    <span className={STATUS_STYLES[b.status]}>{STATUS_LABELS[b.status] || b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured vehicles */}
          <div className="card">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Véhicules disponibles</h3>
            <div className="space-y-3">
              {FEATURED_VEHICLES.map(v => (
                <div key={v.name} className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary-300 transition-colors">
                  <img src={v.image} alt={v.name} className="w-16 h-12 rounded-lg object-cover shrink-0" onError={e => { e.target.style.display='none'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white text-xs leading-tight">{v.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Star size={10} className="text-amber-400 fill-amber-400" /> {v.rating} · {v.category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-primary-600">{v.price.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">F/jour</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/client/search')} className="btn-primary w-full mt-4 py-2.5 text-sm flex items-center justify-center gap-2">
              <Search size={16} /> Voir tout le catalogue
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
