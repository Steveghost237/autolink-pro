import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import TopUpModal from '../../components/TopUpModal';
import { walletAPI } from '../../services/api';
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, RotateCcw,
  CreditCard, Smartphone, Globe,
} from 'lucide-react';

const KIND_META = {
  topup:  { label: 'Rechargement',    sign: '+', Icon: ArrowDownLeft, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  debit:  { label: 'Paiement',        sign: '-', Icon: ArrowUpRight,  cls: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  refund: { label: 'Remboursement',   sign: '+', Icon: RotateCcw,     cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
};

const METHOD_LABELS = {
  mtn: 'MTN MoMo', orange: 'Orange Money', senbid: 'SenBid', paybid: 'PayBid',
  paypal: 'PayPal', stripe: 'Stripe', wallet: 'Solde AutoLink',
};

const STATUS_BADGE = {
  completed: 'badge-success',
  pending:   'badge-warning',
  failed:    'badge-error',
};
const STATUS_LABELS = { completed: 'Confirmée', pending: 'En attente', failed: 'Échouée' };

const METHOD_ICONS = { mtn: Smartphone, orange: Smartphone, senbid: Smartphone, paybid: Smartphone, paypal: Globe, stripe: CreditCard, wallet: Wallet };

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) { return d; }
};

export default function ClientWallet() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);

  const load = () => {
    walletAPI.get()
      .then(res => {
        setBalance(Number(res.data.balance));
        setTransactions(res.data.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totalIn = transactions
    .filter(t => (t.kind === 'topup' || t.kind === 'refund') && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions
    .filter(t => t.kind === 'debit' && t.status === 'completed')
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <DashboardLayout title="Mon portefeuille">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Solde */}
        <div className="card bg-gradient-to-r from-primary-700 to-primary-900 border-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <Wallet size={24} className="text-white" />
              </div>
              <div>
                <p className="text-primary-200 text-xs font-medium">Solde disponible</p>
                <p className="text-3xl font-black text-white leading-snug">
                  {balance === null ? '—' : `${Number(balance).toLocaleString()} FCFA`}
                </p>
              </div>
            </div>
            <button onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 bg-white text-primary-800 font-bold py-2.5 px-5 rounded-xl hover:bg-primary-50 transition-all text-sm shadow">
              <Plus size={16} /> Recharger
            </button>
          </div>
          <p className="text-primary-200/80 text-xs mt-3">MTN MoMo · Orange Money · SenBid · PayBid · PayPal · Stripe</p>
        </div>

        {/* Totaux */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{totalIn.toLocaleString()} F</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total crédité</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{totalOut.toLocaleString()} F</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total débité</div>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Historique des transactions</h3>
          {loading && <p className="text-sm text-slate-400 text-center py-8">Chargement…</p>}
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Aucune transaction pour le moment.</p>
          )}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {transactions.map(t => {
              const meta = KIND_META[t.kind] || KIND_META.topup;
              const MethodIcon = METHOD_ICONS[t.method] || Wallet;
              return (
                <div key={t.id} className="flex items-center gap-4 py-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.cls}`}>
                    <meta.Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{meta.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <MethodIcon size={11} /> {METHOD_LABELS[t.method] || t.method || '—'} · {fmtDate(t.created_at)}
                    </div>
                    {t.note && <div className="text-[11px] text-slate-400 truncate mt-0.5">{t.note}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${meta.sign === '+' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {meta.sign}{Number(t.amount).toLocaleString()} F
                    </div>
                    <span className={STATUS_BADGE[t.status] || 'badge-warning'}>{STATUS_LABELS[t.status] || t.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onDone={() => load()} />}
    </DashboardLayout>
  );
}
