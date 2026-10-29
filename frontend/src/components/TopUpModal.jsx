import React, { useEffect, useState } from 'react';
import { walletAPI } from '../services/api';
import { formatNumber, uiText } from '../i18n';
import Icon from './Icon';

const t = (text, options) => uiText('components.TopUpModal', text, options);

export const TOPUP_METHODS = [
  { id: 'mtn', label: 'MTN Mobile Money', short: 'MoMo', tile: 'bg-yellow-400 text-yellow-950' },
  { id: 'orange', label: 'Orange Money', short: 'OM', tile: 'bg-orange-500 text-white' },
  { id: 'stripe', label: 'Carte bancaire (Stripe)', short: 'CB', tile: 'bg-secondary text-on-secondary', icon: 'credit_card' },
  { id: 'paypal', label: 'PayPal', short: 'PP', tile: 'bg-blue-700 text-white' },
];

export const QUICK_AMOUNTS = [5000, 15000, 30000, 50000, 100000];

export function MethodPicker({ methods, value, onChange, configured }) {
  return (
    <div className="flex flex-col gap-2">
      {methods.map((m) => {
        const enabled = configured.includes(m.id);
        const selected = value === m.id;
        return (
          <button key={m.id} type="button" disabled={!enabled} onClick={() => onChange(m.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selected
              ? 'border-primary bg-primary-fixed/20 ring-1 ring-primary'
              : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container dark:bg-slate-800 dark:border-slate-700'} ${enabled ? '' : 'opacity-50 cursor-not-allowed'}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary' : 'border-outline'}`}>
              {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-label-sm text-label-sm font-black ${m.tile}`}>
              {m.icon ? <Icon name={m.icon} size={20} /> : m.short}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-label-lg text-label-lg text-on-surface dark:text-white">{t(m.label)}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">
                {enabled ? (m.id === 'mtn' || m.id === 'orange' ? t('Validation par push USSD') : t('Paiement sécurisé hébergé')) : t('Non configuré')}
              </span>
            </span>
            {!enabled && <Icon name="lock" size={18} className="text-outline" />}
          </button>
        );
      })}
    </div>
  );
}

export default function TopUpModal({ onClose, onDone, initialAmount = 25000 }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(initialAmount);
  const [method, setMethod] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [configured, setConfigured] = useState([]);

  useEffect(() => {
    walletAPI.methods().then(({ data }) => {
      const list = data.configured_methods || data.methods || [];
      setConfigured(list);
      const first = TOPUP_METHODS.find((m) => list.includes(m.id));
      if (first) setMethod(first.id);
    }).catch(() => {});
  }, []);

  const mobile = method === 'mtn' || method === 'orange';

  const submit = async () => {
    setLoading(true); setError(''); setStep(3);
    try {
      const { data } = await walletAPI.topup(amount, method, phone);
      // Stripe / PayPal / Orange : redirection vers la page de paiement sécurisée —
      // le solde n'est crédité qu'au retour, après vérification serveur.
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      if (method === 'mtn' && data.status === 'pending') {
        setError(t('Validez le paiement sur votre téléphone'));
        for (let attempt = 0; attempt < 36; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          const { data: status } = await walletAPI.status(data.reference);
          if (status.status === 'completed') {
            setDone({ transaction: { reference: data.reference }, balance: status.balance_after });
            onDone?.(status.balance_after);
            setError('');
            setLoading(false);
            return;
          }
          if (status.status === 'failed') {
            setError(t('Le paiement a échoué.'));
            setLoading(false);
            return;
          }
        }
        setError(t('Le paiement est toujours en attente. Vérifiez votre portefeuille plus tard.'));
        setLoading(false);
        return;
      }
      setDone(data);
      onDone?.(data.balance);
    } catch (e) {
      setError(e.response?.data?.detail || t('API injoignable — recharge impossible hors ligne.'));
    }
    setLoading(false);
  };

  const steps = [t('Montant'), t('Paiement'), mobile ? t('USSD / OTP') : t('Confirmation')];

  return (
    <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" role="dialog" aria-modal="true">
      <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-elevation-3 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              <span className="w-2 h-2 rounded-full bg-primary" />{t('Transaction cryptée 256-bit')}
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface dark:text-white mt-1">{t('Recharger mon portefeuille AutoLink')}</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center" aria-label={t('Fermer')}>
            <Icon name="close" />
          </button>
        </div>

        <div className="mx-6 mb-5 px-3 py-2.5 rounded-xl bg-surface-container-low dark:bg-slate-900 flex items-center gap-3">
          {steps.map((label, index) => {
            const number = index + 1;
            const reached = step >= number;
            return (
              <React.Fragment key={label}>
                {index > 0 && <span className={`flex-1 h-0.5 ${step > index ? 'bg-primary' : 'bg-outline-variant/50'}`} />}
                <span className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-label-md text-label-md ${reached ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {step > number || (done && number === 3) ? <Icon name="check" size={18} /> : number}
                  </span>
                  <span className="hidden sm:block leading-tight">
                    <span className="block text-[11px] text-on-surface-variant">{step === number ? t('Actuelle') : t('Étape {{n}}', { n: number })}</span>
                    <span className={`block font-label-md text-label-md ${step === number ? 'text-primary' : 'text-on-surface dark:text-slate-200'}`}>{label}</span>
                  </span>
                </span>
              </React.Fragment>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-5 flex items-center justify-between mb-5">
            <span className="font-body-lg text-body-lg text-on-surface-variant dark:text-slate-400">{t('Montant à créditer :')}</span>
            <span className="font-display-lg text-headline-xl text-on-surface dark:text-white">{formatNumber(amount)} <span className="font-label-lg text-label-lg text-primary">FCFA</span></span>
          </div>

          {done ? (
            <div className="text-center py-4">
              <span className="w-16 h-16 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center mx-auto mb-4"><Icon name="check_circle" size={40} fill /></span>
              <h4 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Recharge effectuée')}</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t('Référence :')} {done.transaction?.reference}</p>
              <p className="font-headline-lg text-headline-lg text-primary mt-3 mb-6">{t('Nouveau solde : {{amount}} FCFA', { amount: formatNumber(Number(done.balance)) })}</p>
              <button onClick={onClose} className="btn-primary w-full">{t('Fermer')}</button>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <button key={value} type="button" onClick={() => setAmount(value)}
                    className={`py-3 rounded-xl font-headline-sm text-headline-sm transition-all ${amount === value ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container dark:bg-slate-900 dark:text-white'}`}>
                    +{formatNumber(value)}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="label">{t('Montant personnalisé (FCFA)')}</span>
                <input type="number" min={500} step={500} className="input-field" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </label>
              <button onClick={() => setStep(2)} disabled={amount < 500} className="btn-primary w-full">
                {t('Continuer vers le paiement')}<Icon name="arrow_forward" size={18} />
              </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-4">
              <span className="overline">{t('Choisissez votre compte de débit')}</span>
              <MethodPicker methods={TOPUP_METHODS} value={method} onChange={setMethod} configured={configured} />
              {mobile && (
                <label className="block">
                  <span className="label">{t('Numéro de téléphone')}</span>
                  <input type="tel" className="input-field" placeholder="+237 6XX XX XX XX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              )}
              {!configured.length && <p className="font-body-sm text-body-sm text-tertiary">{t("Aucun moyen de paiement n'est encore configuré.")}</p>}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-secondary"><Icon name="arrow_back" size={18} />{t('Retour')}</button>
                <button onClick={submit} disabled={!method || !configured.includes(method) || (mobile && !phone)} className="btn-primary flex-1">
                  <Icon name="bolt" size={18} />{t('Recharger {{amount}} FCFA', { amount: formatNumber(amount) })}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              {loading && <span className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />}
              {error && <p className={`font-body-md text-body-md ${loading ? 'text-on-surface-variant' : 'text-error'}`}>{error}</p>}
              {!loading && (
                <button onClick={() => { setStep(2); setError(''); }} className="btn-secondary"><Icon name="arrow_back" size={18} />{t('Modifier le paiement')}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
