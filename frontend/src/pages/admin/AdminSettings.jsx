import React, { useState } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import {
  Percent, Smartphone, Tag, Clock, MapPin, Scale, UserCog,
  CheckCircle2, RotateCcw, Save, FileText, Plus, ShieldCheck, User,
} from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

const TABS = ['Commissions & Frais', 'Grille & Gammes', 'Passerelles & Seuils', 'Politiques Délais', 'Hubs Opérationnels', 'Textes OHADA / COBAC', 'Équipe & Rôles'];

const GAMMES = [
  { tier: 'Économique', name: 'Citadine Agile', ex: 'Toyota Yaris, Kia Picanto, Hyundai i10', min: 20000, max: 35000, caution: 80000 },
  { tier: 'Standard', name: 'SUV Urbain & Berline', ex: 'Toyota RAV4, Hyundai Tucson, Kia Sportage', min: 35000, max: 65000, caution: 150000 },
  { tier: 'Premium', name: 'SUV Prestige & 4×4 Baroudeur', ex: 'Toyota Land Cruiser, Ford Everest, Mercedes GLC', min: 70000, max: 140000, caution: 300000 },
  { tier: 'Gold / Util', name: 'Pick-up Pro Chantier / Mission', ex: 'Toyota Hilux, Mitsubishi L200, Ford Ranger 4×4', min: 90000, max: 110000, caution: 250000 },
  { tier: 'Van / Mini', name: 'Minibus & Convoi Exécutif', ex: 'Toyota HiAce 14 pl, Hyundai H-1 VIP Executive', min: 85000, max: 160000, caution: 350000 },
];

const GATEWAYS = [
  { name: 'MTN Mobile Money (Cameroun)', d: 'Agrégateur certifié — Escrow Pool 100 %', on: true, dot: 'bg-yellow-400' },
  { name: 'Orange Money Cameroun', d: 'Passerelle WebPay (JSB / 3D-Secure)', on: true, dot: 'bg-orange-500' },
  { name: 'Carte Visa / Mastercard & GIMAC', d: '3D-Secure V2 — en cours de validation finale', on: false, dot: 'bg-slate-700' },
  { name: 'Virement Bancaire UBA (Atlantique)', d: 'Frais de transfert inclus : 0,5 %', on: true, dot: 'bg-red-500' },
];

const HUBS = [
  { code: 'DLA', name: 'Douala Métropole', zone: 'Akwa · Bonanjo · Aéroport NSI', status: 'Actif', nb: 840, ok: true },
  { code: 'YAO', name: 'Yaoundé Capitale', zone: 'Bastos · Nlongkak · Nsimalen', status: 'Actif', nb: 512, ok: true },
  { code: 'KBI', name: 'Kribi Port & Littoral', zone: 'Déploiement pilote — recrutement en cours', status: 'Bientôt', nb: 0, ok: false },
];

const TEAM = [
  { name: 'Alexandre N.', email: 'alexandre.n@autolink.pro', role: 'Super Admin', zone: 'Douala & Yaoundé', badge: 'bg-teal-100 text-teal-700' },
  { name: 'Guy M.', email: 'guy.m@autolink.pro', role: 'Inspecteur Hub', zone: 'Hub Akwa & Aéroport', badge: 'bg-blue-100 text-blue-700' },
  { name: 'Sandrine E.', email: 'sandrine.e@autolink.pro', email2: 'MOBILE CEMAC', role: 'Comptable', zone: 'Trésorerie & Arbitrage', badge: 'bg-amber-100 text-amber-700' },
];

const LEGAL = [
  { t: 'Conditions Générales d\'Utilisation', d: 'CGU v3.2 — Validées par le cabinet OHADA — publié 01/2025' },
  { t: 'Contrat-Cadre Location Automobile', d: 'Modèle bailleur-locataire — conforme Code Civil camerounais' },
  { t: 'Protocole de Séquestre Bancaire', d: 'Convention UBA Cameroun — fonds isolés sous tutelle fiduciaire' },
  { t: 'Signature électronique certifiée', d: 'Prestataire agréé — valeur probante devant juridiction CEMAC' },
];

export default function AdminSettings() {
  const [tab, setTab] = useState(0);
  const [commission, setCommission] = useState(15);
  const [fixedFee, setFixedFee] = useState(250);
  const [litigation, setLitigation] = useState(true);
  const [gates, setGates] = useState(() => GATEWAYS.map(g => g.on));
  const [minWithdraw, setMinWithdraw] = useState(5000);
  const [maxOp, setMaxOp] = useState(25000);
  const [acceptDelay, setAcceptDelay] = useState(120);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const inputCls = 'bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-black text-slate-900 w-24 text-center focus:outline-none focus:ring-2 focus:ring-teal-500';

  return (
    <AdminLayout
      title="Paramètres Généraux & Règles Métier CEMAC"
      subtitle="Console Ops · Configuration globale plateforme — tarifs, séquestres, passerelles et conformité OHADA."
    >
      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mb-4 -mt-2">
        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-teal-400 px-3.5 py-2 rounded-xl transition-colors">
          <RotateCcw size={12} /> Réinitialiser défauts usine
        </button>
        <button onClick={save}
          className={`flex items-center gap-1.5 text-[11px] font-black px-4 py-2 rounded-xl transition-colors ${saved ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
          {saved ? <><CheckCircle2 size={13} /> Configuration sauvegardée</> : <><Save size={13} /> Sauvegarder la configuration</>}
        </button>
      </div>

      {/* Onglets */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`text-[10px] font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${tab === i ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-400'}`}>{t}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start mb-5">
        {/* 1. Commissions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
            <Percent size={15} className="text-teal-600" /> 1. Commissions &amp; Frais de Service
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">Barèmes prélevés sur chaque transaction encaissée (XAF).</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Commission standard</label>
              <div className="flex items-center gap-2"><input type="number" value={commission} onChange={e => setCommission(Number(e.target.value))} className={inputCls} /><span className="text-xs font-bold text-slate-400">%</span></div>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Frais fixes plateforme</label>
              <div className="flex items-center gap-2"><input type="number" value={fixedFee} onChange={e => setFixedFee(Number(e.target.value))} className={inputCls} /><span className="text-xs font-bold text-slate-400">FCFA</span></div>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Taux payé UCO/XAF</label>
              <div className="flex items-center gap-2"><input type="number" value={615} readOnly className={`${inputCls} bg-slate-100 text-slate-500`} /><span className="text-xs font-bold text-slate-400">FCFA</span></div>
            </div>
          </div>
          <label className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 cursor-pointer">
            <span className="text-[11px] font-bold text-teal-800 flex items-center gap-2"><ShieldCheck size={13} /> Couverture Litige &amp; Garantie Active Cameroun</span>
            <span onClick={() => setLitigation(!litigation)} className={`w-10 h-5 rounded-full relative transition-colors ${litigation ? 'bg-teal-600' : 'bg-slate-300'}`}>
              <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${litigation ? 'left-6' : 'left-1'}`} />
            </span>
          </label>
        </div>

        {/* 3. Passerelles */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1">
            <Smartphone size={15} className="text-teal-600" /> 3. Passerelles &amp; Seuils
          </h3>
          <p className="text-[10px] text-slate-400 mb-4">MTN MoMo, Orange et carte — activés pour la zone CEMAC.</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Montant min. retrait</div>
              <div className="flex items-center gap-1.5 mt-1"><input type="number" value={minWithdraw} onChange={e => setMinWithdraw(Number(e.target.value))} className="bg-transparent text-sm font-black text-slate-900 w-20 focus:outline-none" /><span className="text-[9px] text-slate-400 font-bold">FCFA</span></div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">Plafond opérateur / Tx</div>
              <div className="flex items-center gap-1.5 mt-1"><input type="number" value={maxOp} onChange={e => setMaxOp(Number(e.target.value))} className="bg-transparent text-sm font-black text-slate-900 w-20 focus:outline-none" /><span className="text-[9px] text-slate-400 font-bold">000 FCFA</span></div>
            </div>
          </div>
          <div className="space-y-2">
            {GATEWAYS.map((g, i) => (
              <label key={g.name} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-teal-200 transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{g.name}</div>
                  <div className="text-[9px] text-slate-400">{g.d}</div>
                </div>
                <span onClick={e => { e.preventDefault(); setGates(s => s.map((x, j) => j === i ? !x : x)); }}
                  className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${gates[i] ? 'bg-teal-600' : 'bg-slate-300'}`}>
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${gates[i] ? 'left-5' : 'left-1'}`} />
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grille tarifaire */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Tag size={15} className="text-teal-600" /> 2. Grille Tarifaire par Gamme &amp; Séquestre de Caution</h3>
          <button className="text-[10px] font-bold text-teal-600 hover:text-teal-700">Modifier</button>
        </div>
        <p className="text-[10px] text-slate-400 mb-4">Plafonds statiques recommandés par l'algorithme d'assignation tarifaire.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="py-2.5 pr-4">Gamme de véhicule</th>
                <th className="py-2.5 pr-4">Véhicules (exemples)</th>
                <th className="py-2.5 pr-4">Prix plancher (jour)</th>
                <th className="py-2.5 pr-4">Prix plafond (jour)</th>
                <th className="py-2.5 pr-4">Caution séquestre défaut</th>
                <th className="py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {GAMMES.map(g => (
                <tr key={g.tier} className="hover:bg-slate-50/60">
                  <td className="py-3 pr-4"><span className="text-[11px] font-black text-teal-700">{g.tier}</span><br /><span className="text-[10px] text-slate-500">{g.name}</span></td>
                  <td className="py-3 pr-4 text-[10px] text-slate-500">{g.ex}</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.min)} FCFA</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.max)} FCFA</td>
                  <td className="py-3 pr-4 text-[11px] font-black text-slate-900">{fmt(g.caution)} FCFA</td>
                  <td className="py-3 text-right"><button className="text-[9px] font-black text-slate-400 border border-slate-200 px-2 py-1 rounded-lg hover:border-teal-400 hover:text-teal-600">✎</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* 4. Délais */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-1"><Clock size={15} className="text-teal-600" /> 4. Délais d'Arbitrage &amp; Annulation</h3>
          <p className="text-[10px] text-slate-400 mb-4">Règles d'engagement et barèmes d'indemnisation.</p>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-[10px] font-bold text-slate-600 flex-1">Délai limite d'acceptation propriétaire</label>
            <input type="number" value={acceptDelay} onChange={e => setAcceptDelay(Number(e.target.value))} className={inputCls} />
            <span className="text-[10px] font-bold text-slate-400">minutes</span>
          </div>
          <div className="space-y-2">
            {[
              { t: '+ 48 heures avant départ', s: '100 % Remboursé (Zéro pénalité)', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              { t: 'Entre 24h et 48h avant départ', s: '50 % Remboursé (retenue bailleur)', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
              { t: '< 24 heures ou No-Show', s: 'Retenue 1 jour de location', cls: 'bg-red-50 text-red-600 border-red-100' },
            ].map(r => (
              <div key={r.t} className={`flex items-center justify-between border rounded-xl px-3.5 py-2.5 ${r.cls}`}>
                <span className="text-[10px] font-bold">{r.t}</span>
                <span className="text-[10px] font-black">{r.s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Hubs */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><MapPin size={15} className="text-teal-600" /> 5. Pôles &amp; Hubs Opérationnels</h3>
            <button className="flex items-center gap-1 text-[10px] font-black text-teal-600"><Plus size={11} /> Nouveau Hub</button>
          </div>
          <p className="text-[10px] text-slate-400 mb-4">Zones de déploiement des prises en charge et restitution.</p>
          <div className="space-y-2.5">
            {HUBS.map(h => (
              <div key={h.code} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0">{h.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{h.name} <span className={`ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-md ${h.ok ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>{h.status}</span></div>
                  <div className="text-[9px] text-slate-400">{h.zone}</div>
                </div>
                <span className="text-[10px] font-black text-slate-700 whitespace-nowrap">{h.nb ? `${h.nb} véhicules` : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* 6. Textes légaux */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 mb-4"><Scale size={15} className="text-teal-600" /> 6. Textes Légaux &amp; Conformité</h3>
          <div className="space-y-2.5">
            {LEGAL.map(l => (
              <div key={l.t} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <FileText size={14} className="text-teal-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{l.t}</div>
                  <div className="text-[9px] text-slate-400">{l.d}</div>
                </div>
                <button className="text-[9px] font-black text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg shrink-0">Éditer</button>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Équipe */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><UserCog size={15} className="text-teal-600" /> 7. Équipe Administrative &amp; Rôles Console</h3>
            <button className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors"><Plus size={11} /> Ajouter un administrateur</button>
          </div>
          <div className="space-y-2.5">
            {TEAM.map(m => (
              <div key={m.name} className="flex items-center gap-3 border border-slate-100 rounded-xl px-3.5 py-3">
                <span className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0"><User size={13} /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-800">{m.name} <span className={`ml-1 text-[8px] font-black px-1.5 py-0.5 rounded-md ${m.badge}`}>{m.role}</span></div>
                  <div className="text-[9px] text-slate-400">{m.email} · {m.zone}</div>
                </div>
                <span className="text-[9px] font-black text-slate-400">03/2025</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-3">Authentification OTP obligatoire pour toute session à privilège Super-Admin.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
