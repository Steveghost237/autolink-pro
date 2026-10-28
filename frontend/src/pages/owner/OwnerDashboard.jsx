import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  OwnerLayout, BalanceCard, PriorityRequests, StatsRow,
  RevenueChart, AdvicePanel, UpcomingBookings,
} from '../../components/ownerdash';
import { PlusCircle, FileText, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import { bookingsAPI, vehiclesAPI, walletAPI } from '../../services/api';

const POLL = 15000;
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

/* Revenus nets (85 %) agrégés par mois à partir des réservations. */
const revenueSeries = (bookings) => {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  return months.map(m => ({
    month: MONTHS[m.getMonth()],
    revenue: bookings
      .filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
      .filter(b => { const d = new Date(b.start_date || b.created_at); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear(); })
      .reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0),
  }));
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const [v, b, w] = await Promise.all([
        vehiclesAPI.list({ mine: 1, page_size: 100 }),
        bookingsAPI.list({ page_size: 50 }),
        walletAPI.get(),
      ]);
      setVehicles(v.data.results || v.data || []);
      setBookings(b.data.results || b.data || []);
      setBalance(Number(w.data.balance || 0));
      setOnline(true);
    } catch (_) {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL);
    return () => clearInterval(t);
  }, [load]);

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const activeVehicles = vehicles.filter(v => v.status === 'approved' || v.status === 'rented').length;
  const totalEarned = bookings.filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0);
  const inProgress = bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length;
  const occupancy = vehicles.length ? Math.min(100, (inProgress / Math.max(vehicles.length, 1)) * 100 + 40) : 0;
  const revenuePerDay = totalEarned / 30 || 0;
  const pendingPayout = bookings.filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((s, b) => s + Number(b.owner_amount || b.total_price || 0) * 0.85, 0);

  return (
    <OwnerLayout badges={{ demandes: pendingCount, messages: 0 }} balance={balance}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête + carte solde */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full">
                <MapPin size={11} /> Flotte active · Douala
              </span>
              <button onClick={load} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-teal-600 transition-colors">
                <RefreshCw size={11} className={online ? '' : 'text-red-400'} />
                {online ? 'Synchronisé' : 'Hors ligne — réessayer'}
              </button>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Tableau de bord <span className="text-teal-600">Propriétaire</span>
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xl">
              Bonjour {user?.firstName || user?.first_name} — voici les performances consolidées de vos
              réservations et urgences de votre flotte automobile au Cameroun.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/owner/add-vehicle')}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-md">
                <PlusCircle size={16} /> Ajouter un véhicule
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 font-bold text-sm px-5 py-3 rounded-xl transition-colors">
                <FileText size={15} /> Rapport mensuel CEMAC
              </button>
              <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-4 py-3 rounded-xl">
                <ShieldCheck size={14} /> Compte certifié
              </span>
            </div>
          </div>
          <BalanceCard available={balance} pending={pendingPayout} total={totalEarned} />
        </div>

        {/* Demandes urgentes */}
        <PriorityRequests bookings={bookings} onChanged={load} />

        {/* KPI */}
        <StatsRow
          occupancy={occupancy}
          rating={4.92}
          activeVehicles={activeVehicles}
          revenuePerDay={revenuePerDay}
        />

        {/* Graphique + conseils */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <RevenueChart data={revenueSeries(bookings)} />
          <AdvicePanel />
        </div>

        {/* Planning */}
        <UpcomingBookings bookings={bookings} />
      </div>
    </OwnerLayout>
  );
}
