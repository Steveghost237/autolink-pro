import React, { useState } from 'react';
import { Wallet, Plus, X, Loader, CheckCircle } from 'lucide-react';
import { walletAPI } from '../services/api';

const TOPUP_METHODS = [
  { id: 'mtn',    label: 'MTN MoMo',    color: 'bg-yellow-400', text: 'text-yellow-900' },
  { id: 'orange', label: 'Orange Money', color: 'bg-orange-500', text: 'text-white' },
  { id: 'senbid', label: 'SenBid',      color: 'bg-teal-500',   text: 'text-white' },
  { id: 'paybid', label: 'PayBid',      color: 'bg-indigo-500', text: 'text-white' },
  { id: 'paypal', label: 'PayPal',      color: 'bg-blue-700',   text: 'text-white' },
  { id: 'stripe', label: 'Stripe',      color: 'bg-violet-600', text: 'text-white' },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function TopUpModal({ onClose, onDone }) {
  const [amount, setAmount] = useState(25000);
  const [method, setMethod] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await walletAPI.topup(amount, method, phone);
      // Stripe / PayPal : redirection vers la page de paiement sécurisée —
      // le solde n'est crédité qu'au retour, après vérification serveur.
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      setDone(data);
      onDone?.(data.balance);
    } catch (e) {
      setError(e.response?.data?.detail || 'API injoignable — recharge impossible hors ligne.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Wallet size={18} /> Recharger mon solde</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Recharge effectuée</h4>
            <p className="text-sm text-slate-500 mb-2">Référence : {done.transaction?.reference}</p>
            <p className="text-2xl font-black text-primary-600 mb-6">{Number(done.balance).toLocaleString()} FCFA</p>
            <button onClick={onClose} className="btn-primary w-full">Fermer</button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div>
              <label className="label">Montant (FCFA)</label>
              <input type="number" min={500} step={500} className="input-field" value={amount}
                onChange={e => setAmount(Number(e.target.value))} />
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${amount === a ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                    {a.toLocaleString()} F
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Moyen de paiement</label>
              <div className="grid grid-cols-3 gap-2">
                {TOPUP_METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${method === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600'}`}>
                    <div className={`w-8 h-8 ${m.color} rounded-lg flex items-center justify-center`}>
                      <span className={`text-[10px] font-black ${m.text}`}>{m.label.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {(method === 'mtn' || method === 'orange' || method === 'senbid' || method === 'paybid') && (
              <div>
                <label className="label">Numéro de téléphone</label>
                <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button onClick={submit} disabled={loading || amount < 500}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 font-bold">
              {loading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? 'Traitement...' : `Recharger ${amount.toLocaleString()} FCFA`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
