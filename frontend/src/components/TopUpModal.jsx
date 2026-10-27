import React, { useState, useEffect } from 'react';
import { Wallet, Plus, X, Loader, CheckCircle } from 'lucide-react';
import { walletAPI } from '../services/api';
import { formatNumber, uiText } from '../i18n';

const TOPUP_METHODS = [
  { id: 'mtn',    label: 'MTN MoMo',     color: 'bg-yellow-400', text: 'text-yellow-900' },
  { id: 'orange', label: 'Orange Money', color: 'bg-orange-500', text: 'text-white' },
  { id: 'senbid', label: 'SenBid',       color: 'bg-teal-500',   text: 'text-white' },
  { id: 'paybid', label: 'PayBid',       color: 'bg-indigo-500', text: 'text-white' },
  { id: 'paypal', label: 'PayPal',       color: 'bg-blue-700',   text: 'text-white' },
  { id: 'stripe', label: 'Stripe',       color: 'bg-violet-600', text: 'text-white' },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function TopUpModal({ onClose, onDone }) {
  const [amount, setAmount] = useState(25000);
  const [method, setMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [configuredMethods, setConfiguredMethods] = useState([]);

  useEffect(() => { walletAPI.methods().then(({ data }) => {
    setConfiguredMethods(data.configured_methods || []);
    if (data.methods?.length) setMethod(data.methods[0]);
  }).catch(() => {
    // Hors ligne / endpoint absent : toutes les méthodes disponibles
    setConfiguredMethods(TOPUP_METHODS.map(m => m.id));
    setMethod('mtn');
  }); }, []);

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
      if (method === 'mtn' && data.status === 'pending') {
        setError(uiText("components.TopUpModal", "Validez le paiement sur votre téléphone"));
        for (let attempt = 0; attempt < 36; attempt += 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const { data: status } = await walletAPI.status(data.reference);
          if (status.status === 'completed') {
            setDone({ transaction: { reference: data.reference }, balance: status.balance_after });
            onDone?.(status.balance_after);
            setError('');
            return;
          }
          if (status.status === 'failed') {
            setError(uiText("components.TopUpModal", "Le paiement a échoué."));
            setLoading(false);
            return;
          }
        }
        setError(uiText("components.TopUpModal", "Le paiement est toujours en attente. Vérifiez votre portefeuille plus tard."));
        setLoading(false);
        return;
      }
      setDone(data);
      onDone?.(data.balance);
    } catch (e) {
      setError(e.response?.data?.detail || uiText("components.TopUpModal", "API injoignable — recharge impossible hors ligne."));
    }
    setLoading(false);
  };

  const isConfigured = (id) => configuredMethods.length === 0 || configuredMethods.includes(id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Wallet size={18} />{uiText("components.TopUpModal", "Recharger mon solde")}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{uiText("components.TopUpModal", "Recharge effectuée")}</h4>
            <p className="text-sm text-slate-500 mb-2">{uiText("components.TopUpModal", "Référence :") + " "}{done.transaction?.reference}</p>
            <p className="text-2xl font-black text-primary-600 mb-6">{formatNumber(Number(done.balance))}{" " + uiText("components.TopUpModal", "FCFA")}</p>
            <button onClick={onClose} className="btn-primary w-full">{uiText("components.TopUpModal", "Fermer")}</button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div>
              <label className="label">{uiText("components.TopUpModal", "Montant (FCFA)")}</label>
              <input type="number" min={500} step={500} className="input-field" value={amount}
                onChange={e => setAmount(Number(e.target.value))} />
              <div className="flex flex-wrap gap-2 mt-2">
                {QUICK_AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${amount === a ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                    {formatNumber(a)}{" " + uiText("components.TopUpModal", "F") + " "}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">{uiText("components.TopUpModal", "Moyen de paiement")}</label>
              <div className="grid grid-cols-3 gap-2">
                {TOPUP_METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    disabled={!isConfigured(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${method === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600'} ${!isConfigured(m.id) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className={`w-8 h-8 ${m.color} rounded-lg flex items-center justify-center`}>
                      <span className={`text-[10px] font-black ${m.text}`}>{m.label.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">{m.label}</span>
                    {!isConfigured(m.id) && <span className="text-[10px] text-slate-400">{uiText("components.TopUpModal", "Bientôt")}</span>}
                  </button>
                ))}
              </div>
            </div>
            {(method === 'mtn' || method === 'orange' || method === 'senbid' || method === 'paybid') && (
              <div>
                <label className="label">{uiText("components.TopUpModal", "Numéro de téléphone")}</label>
                <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!isConfigured(method) && <p className="text-sm text-amber-600">{uiText("components.TopUpModal", "Ce moyen de paiement n'est pas encore configuré. Veuillez en choisir un autre.")}</p>}
            <button onClick={submit} disabled={loading || !method || !isConfigured(method) || amount < 500}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 font-bold">
              {loading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? uiText("components.TopUpModal", "Traitement...") : `Recharger ${formatNumber(amount)} FCFA`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
