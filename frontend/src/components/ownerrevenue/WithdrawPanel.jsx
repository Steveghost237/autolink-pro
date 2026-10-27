import React, { useState } from 'react';
import { Smartphone, Landmark, ShieldCheck, Zap, Lock, CheckCircle2 } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

const METHODS = [
  { id: 'mtn',    icon: Smartphone, name: 'MTN MoMo',       sub: '+237 670 ·· ·· 90 — Marc T.', badge: 'Compte vérifié', cls: 'border-amber-300 bg-amber-50/60' },
  { id: 'orange', icon: Smartphone, name: 'Orange Money',   sub: '+237 699 ·· ·· 34 — Marc T.', badge: 'Actif (Tier 2)', cls: 'border-slate-200 bg-white' },
  { id: 'uba',    icon: Landmark,   name: 'UBA Cameroun',   sub: 'RIB 0400 1300 1304 — MARC T. ATANGANA', badge: 'Virement 24 h CEMAC', cls: 'border-slate-200 bg-white' },
];

/* Panneau « Demander un retrait de fonds » + Protocole Sécurisé. */
export default function WithdrawPanel({ balance = 0 }) {
  const [method, setMethod] = useState('mtn');
  const [amount, setAmount] = useState(balance ? Math.min(balance, 500000) : 0);
  const [sent, setSent] = useState(false);

  const confirm = () => { setSent(true); setTimeout(() => setSent(false), 4000); };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
      {/* Formulaire retrait */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 mb-1">Demander un retrait de fonds</h3>
        <p className="text-[11px] text-slate-400 mb-5">Transfert sécurisé vers votre solde Mobile Money ou compte bancaire.</p>

        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">1. Sélectionner le compte bénéficiaire</div>
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`text-left border rounded-2xl p-3.5 transition-all ${method === m.id ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
              <m.icon size={16} className="text-teal-600 mb-2" />
              <div className="text-xs font-black text-slate-800">{m.name}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 leading-snug">{m.sub}</div>
              <div className="text-[9px] font-bold text-teal-700 mt-1.5 flex items-center gap-1"><CheckCircle2 size={9} /> {m.badge}</div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Montant à encaisser (FCFA)</span>
          <span className="text-[10px] font-bold text-teal-600">Plafond disponible : {fmt(balance)} FCFA</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-3">
          <span className="text-[10px] font-black text-slate-400">XAF</span>
          <input type="number" value={amount} min={1000} max={balance} onChange={e => setAmount(Number(e.target.value))}
            className="flex-1 bg-transparent text-xl font-black text-slate-900 focus:outline-none" />
          <span className="text-[10px] font-bold text-slate-400">FCFA</span>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {[100000, 250000, 500000].map(v => (
            <button key={v} onClick={() => setAmount(Math.min(v, balance))}
              className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-colors ${amount === v ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-200 text-slate-500 hover:border-teal-400'}`}>
              + {fmt(v)} FCFA
            </button>
          ))}
          <button onClick={() => setAmount(balance)}
            className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors">
            Tout retirer ({fmt(balance)} FCFA)
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap mb-4">
          <span className="flex items-center gap-2 text-[10px] text-slate-500">
            <Zap size={12} className="text-teal-600" /> Créditation instantanée sous 15 minutes (réseau MTN MoMo API &amp; agrégation agréée GIMAC)
          </span>
          <span className="text-[10px] font-bold text-slate-400">Frais : 0 FCFA</span>
        </div>

        <button onClick={confirm} disabled={!amount || amount <= 0 || sent}
          className={`w-full flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-xl transition-colors ${sent ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-40'}`}>
          {sent ? <><CheckCircle2 size={15} /> Demande de retrait enregistrée</> : <><Lock size={14} /> Confirmer le retrait de {fmt(amount)} FCFA</>}
        </button>
      </div>

      {/* Protocole sécurisé */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2"><ShieldCheck size={15} className="text-teal-600" /> Protocole Sécurisé</h4>
        <div className="space-y-4">
          {[
            { t: 'Double authentification OTP', d: 'Toutes les transactions sont soumises à la double authentification (OTP transmis par SMS sur votre numéro certifié).' },
            { t: 'Commission zéro retrait', d: 'Chaque virement Mobile Money est intégralement pris en charge par la plateforme, la gestion et le tracking GPS.' },
            { t: 'Assurance Tous Risques activée', d: 'Chaque retrait est converti en déduction sur vos gains nets.' },
          ].map(s => (
            <div key={s.t} className="border-l-2 border-teal-500 pl-3">
              <div className="text-[11px] font-black text-slate-800 mb-0.5">{s.t}</div>
              <p className="text-[10px] text-slate-500 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 bg-slate-50 rounded-xl p-3 text-[10px] text-slate-500">
          <strong className="text-slate-700">Assistance Comptable AutoLink</strong><br />Support 24/7 — Douala
        </div>
      </div>
    </div>
  );
}
