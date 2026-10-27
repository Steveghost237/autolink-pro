import React, { useState, useEffect, useCallback, useRef } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { RevenueCards, WithdrawPanel, RevenueTable, WithdrawHistory } from '../../components/ownerrevenue';
import { ChevronDown, FileDown, ShieldCheck, RefreshCw } from 'lucide-react';
import { bookingsAPI, walletAPI } from '../../services/api';

export default function OwnerRevenue() {
  const [bookings, setBookings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [online, setOnline] = useState(true);
  const withdrawRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [b, w] = await Promise.all([bookingsAPI.list({ page_size: 100 }), walletAPI.get()]);
      setBookings(b.data.results || b.data || []);
      setBalance(Number(w.data.balance || 0));
      setTransactions(w.data.transactions || []);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = bookings.filter(b => ['confirmed', 'active'].includes(b.status))
    .reduce((s, b) => s + Number(b.owner_amount || 0), 0);
  const total = bookings.filter(b => b.status === 'completed')
    .reduce((s, b) => s + Number(b.owner_amount || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <OwnerLayout badges={{ demandes: pendingCount }} balance={balance}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Trésorerie &amp; règlements CEMAC <span className="w-1 h-1 bg-slate-300 rounded-full inline-block mx-1" /> Exercice fiscal 2025
              {!online && <button onClick={load} className="ml-2 text-red-500 inline-flex items-center gap-1"><RefreshCw size={9} /> Hors ligne</button>}
            </div>
            <h1 className="text-3xl font-black text-slate-900">Revenus &amp; <span className="text-teal-600">Retraits Propriétaire</span></h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
              Solde consolidé des locations réalisées, retraits instantanés vers Mobile Money et relevés de compte qualité certifiée.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:border-teal-400">
              Octobre 2025 (Mois en cours) <ChevronDown size={12} />
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:border-teal-400">
              <FileDown size={12} /> Relevé fiscal (PDF)
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:border-teal-400">
              <FileDown size={12} /> Export Excel / CSV
            </button>
          </div>
        </div>

        {/* Soldes */}
        <RevenueCards available={balance} pending={pending} total={total}
          onWithdraw={() => withdrawRef.current?.scrollIntoView({ behavior: 'smooth' })} />

        {/* Retrait */}
        <div ref={withdrawRef}><WithdrawPanel balance={balance} /></div>

        {/* Table revenus */}
        <RevenueTable bookings={bookings} />

        {/* Historique */}
        <WithdrawHistory transactions={transactions} />

        {/* Bande conformité */}
        <div className="bg-slate-900 rounded-3xl p-5 flex items-center gap-4 flex-wrap">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={18} className="text-teal-400" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-black text-white">Conformité Monétaire COBAC &amp; Banque Centrale (BEAC)</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              AutoLink Pro opère via un prestataire de paiement agréé. Vos fonds sont séquestrés sur des
              comptes de cantonnement sous surveillance prudentielle en zone CEMAC.
            </p>
          </div>
          <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Douala · Yaoundé · Kribi</span>
        </div>
      </div>
    </OwnerLayout>
  );
}
