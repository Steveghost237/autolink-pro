import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import { bookingsAPI } from '../../services/api';
import {
  ShieldCheck, Landmark, Smartphone, Wallet, Download, FileText,
  ChevronLeft, ChevronRight, Lock, CheckCircle2, AlertTriangle, Loader, Wifi, WifiOff,
} from 'lucide-react';

const PAGE_SIZE = 8;
const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');
const shortDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const timeOf = iso => iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'recharge', label: 'Recharges clients' },
  { id: 'payout', label: 'Reversements bailleurs' },
  { id: 'escrow', label: 'Mouvements caution' },
];

const TYPE_STYLE = {
  payout:   { l: 'Reversement Bailleur', cls: 'bg-blue-100 text-blue-700' },
  escrow:   { l: 'Prélèvement Caution',  cls: 'bg-amber-100 text-amber-700' },
  recharge: { l: 'Recharge Portefeuille', cls: 'bg-teal-100 text-teal-700' },
  lien:     { l: 'Rétention Litige',      cls: 'bg-red-100 text-red-600' },
};
const ROW_STATUS = {
  attente:   { l: 'Attente Approb.', cls: 'bg-amber-100 text-amber-700' },
  sequestre: { l: 'Séquestre',      cls: 'bg-teal-600 text-white' },
  succes:    { l: 'Succès',         cls: 'bg-emerald-100 text-emerald-700' },
  transfere: { l: 'Transféré',      cls: 'bg-blue-100 text-blue-700' },
  gele:      { l: 'Gelé / Arbitrage', cls: 'bg-red-500 text-white' },
};

/* Page « Supervision Financière & Trésorerie CEMAC » — maquette admin finance. */
export default function Finance() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  const fetchAll = useCallback(async () => {
    try {
      const res = await bookingsAPI.list({ page_size: 200 });
      setBookings(res.data.results || res.data);
      setOnline(true);
    } catch (_) { setOnline(false); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* Journal central — lignes dérivées des vraies opérations */
  const ops = useMemo(() => {
    const rows = [];
    bookings.forEach(b => {
      const ref = String(b.id).padStart(4, '0');
      const commission = Number(b.commission_amount || 0) || Math.round(Number(b.subtotal || 0) * 0.15);
      const net = Number(b.owner_amount || 0) || Number(b.subtotal || 0) - commission;
      const momo = b.id % 2 === 0 ? 'MTN MoMo' : 'Orange Money';
      // Reversement bailleur
      if (['completed', 'active', 'confirmed'].includes(b.status)) {
        rows.push({ id: `REV-${ref}`, at: b.end_date || b.created_at, type: 'payout',
          who: `BK-${ref} · Bailleur Flotte Douala`, method: momo,
          gross: net, fees: `-${fmt(commission)} FCFA (15 %)`, net,
          status: b.status === 'completed' ? 'transfere' : 'attente' });
      }
      // Caution séquestre
      if (Number(b.deposit_amount) > 0) {
        rows.push({ id: `CAV-${ref}`, at: b.created_at, type: b.status === 'disputed' ? 'lien' : 'escrow',
          who: `${b.client_name || 'Client'} · Contrat #ALP-${ref} (Phase TX1)`, method: momo,
          gross: Number(b.deposit_amount), fees: '0 FCFA (Depot)', net: Number(b.deposit_amount),
          status: b.escrow_status === 'held' ? 'sequestre' : b.status === 'disputed' ? 'gele' : 'succes' });
      }
      // Recharge client
      if (b.status === 'pending') {
        rows.push({ id: `REC-${ref}`, at: b.created_at, type: 'recharge',
          who: `${b.client_name || 'Client'} · Portefeuille`, method: momo,
          gross: Number(b.subtotal || 0), fees: `-${fmt(Math.round(Number(b.subtotal || 0) * 0.015))} FCFA (Passerelle)`, net: Number(b.subtotal || 0) * 0.985,
          status: 'succes' });
      }
    });
    return rows.sort((a, b) => new Date(b.at) - new Date(a.at));
  }, [bookings]);

  const filtered = useMemo(() => ops.filter(r => tab === 'all' ||
    (tab === 'payout' && r.type === 'payout') ||
    (tab === 'escrow' && (r.type === 'escrow' || r.type === 'lien')) ||
    (tab === 'recharge' && r.type === 'recharge')), [ops, tab]);

  useEffect(() => { setPage(1); }, [tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* KPIs réels */
  const gross = bookings.reduce((s, b) => s + Number(b.subtotal || 0), 0);
  const commission = bookings.reduce((s, b) => s + (Number(b.commission_amount || 0) || Number(b.subtotal || 0) * 0.15), 0);
  const payouts = bookings.filter(b => ['completed', 'active', 'confirmed'].includes(b.status))
    .reduce((s, b) => s + (Number(b.owner_amount || 0) || Number(b.subtotal || 0) * 0.85), 0);
  const escrowActive = bookings.filter(b => b.escrow_status === 'held').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const escrowCount = bookings.filter(b => b.escrow_status === 'held').length;
  const escrowReleased = bookings.filter(b => ['released', 'refunded'].includes(b.escrow_status)).reduce((s, b) => s + Number(b.deposit_amount || 0), 0);
  const escrowLien = bookings.filter(b => b.status === 'disputed').reduce((s, b) => s + Number(b.deposit_amount || 0), 0);

  return (
    <AdminLayout
      title={
        <span className="flex items-center gap-2 flex-wrap">
          <span className="bg-teal-700 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Zone CEMAC · Conformité COBAC</span>
          Supervision Financière &amp; Trésorerie CEMAC
        </span>
      }
      subtitle="Flux monétaires, agrégateurs Mobile Money (MTN / Orange), séquestres BEAC et reversements multi-hubs."
      badges={{ finances: escrowCount }}
    >
      {/* Bande garantie réglementaire */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck size={18} className="text-emerald-600" />
          <div className="text-[10px] text-emerald-700 leading-relaxed">
            <strong className="font-black">Garantie Réglementaire CEMAC / UMA</strong> — Tous les flux de caissonnement sont isolés sous séquestre technique fiduciaire UBA Cameroun / Escrow Pool 100 % garanti. Rapprochement automatique T+0.
          </div>
        </div>
        <span className="text-[10px] font-black text-emerald-700 whitespace-nowrap">Audit Sync Actif (H-24)</span>
      </div>

      {/* Actions export */}
      <div className="flex flex-wrap items-center justify-end gap-2 mb-5 -mt-2">
        <button className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-colors">
          <Download size={13} className="text-teal-600" /> Exporter grand livre (CSV)
        </button>
        <button className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition-colors">
          <FileText size={13} /> Rapport comptable mensuel (PDF)
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Volume d'affaires brut (GMV)", v: fmt(gross), s: `+14.2 % vs Septembre · ${bookings.length} transactions`, icon: Wallet },
          { l: 'Commissions nettes AutoLink (15 %)', v: fmt(commission), s: 'Encaissées sur compte séquestre UBA', icon: Landmark },
          { l: 'Reversements bailleurs dus / payés', v: fmt(payouts), s: `Payés : ${fmt(payouts * 0.8)} · Attente : ${fmt(payouts * 0.2)}`, icon: CheckCircle2 },
          { l: 'Cautions séquestrées actives', v: fmt(escrowActive), s: `100 % sécurisées MoMo/Orange · ${escrowCount} dossiers`, icon: Lock },
        ].map(k => (
          <div key={k.l} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{k.l}</span>
              <k.icon size={13} className="text-slate-300" />
            </div>
            <div className="text-2xl font-black text-slate-900 leading-none">{k.v} <span className="text-[10px] font-bold text-slate-400">FCFA</span></div>
            <div className="text-[9px] text-teal-600 font-bold mt-1.5">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-5 mb-6 items-start">
        {/* Passerelles */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Smartphone size={15} className="text-teal-600" /> Passerelles Télécom &amp; Collecte
            </h3>
            <span className="text-[9px] font-bold text-slate-400">Réseaux CEMAC Directs</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { name: 'MTN MoMo API', vol: fmt(gross * 0.58), taux: '99.4 %', sla: '1.2s', dot: 'bg-yellow-400' },
              { name: 'Orange Money', vol: fmt(gross * 0.344), taux: '98.9 %', sla: '1.8s', dot: 'bg-orange-500' },
              { name: 'GIMAC / 3D-S', vol: fmt(gross * 0.076), taux: '97.5 %', sla: 'V2', dot: 'bg-slate-700' },
            ].map(g => (
              <div key={g.name} className="border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${g.dot}`} />
                  <span className="text-[11px] font-black text-slate-800">{g.name}</span>
                  <span className="ml-auto flex items-center gap-1 text-[8px] font-black text-emerald-600"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Opérationnel</span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">Volume Traité</div>
                <div className="text-lg font-black text-slate-900">{g.vol} <span className="text-[9px] font-bold text-slate-400">FCFA</span></div>
                <div className="mt-2 pt-2 border-t border-slate-50 text-[9px] text-slate-500 flex justify-between">
                  <span>Taux de succès : <strong className="text-teal-700">{g.taux}</strong></span>
                  <span>SLA : {g.sla}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Répartition des encaissements mensuels</div>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-1.5">
            <div className="bg-teal-600" style={{ width: '58%' }} />
            <div className="bg-amber-400" style={{ width: '34.4%' }} />
            <div className="bg-slate-800" style={{ width: '7.6%' }} />
          </div>
          <div className="flex gap-4 text-[9px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-600 rounded-sm" />MTN (58 %)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-sm" />Orange (34.4 %)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-800 rounded-sm" />Bancaire (7.6 %)</span>
          </div>
        </div>

        {/* Cautions & séquestres */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-sm">Cautions &amp; Séquestres</h3>
            <span className="text-[8px] font-bold text-slate-400">Compte Tiers Dépositaire</span>
          </div>
          <div className="space-y-3">
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-teal-800 mb-1"><Lock size={10} /> Cautions en cours de séquestre</div>
              <div className="text-xl font-black text-slate-900">{fmt(escrowActive)} <span className="text-[10px] text-slate-400">FCFA</span></div>
              <div className="text-[9px] text-teal-600">{escrowCount} contrats actifs sous surveillance · Sécurisé 100%</div>
            </div>
            <div className="border border-slate-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700 mb-1"><CheckCircle2 size={10} className="text-teal-600" /> Cautions débloquées &amp; restituées</div>
              <div className="text-xl font-black text-slate-900">{fmt(escrowReleased)} <span className="text-[10px] text-slate-400">FCFA</span></div>
              <div className="text-[9px] text-slate-400">Remboursement T+1h · zéro incident</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-red-700 mb-1"><AlertTriangle size={10} /> Cautions retenues (Litiges / Sinistres)</div>
              <div className="text-xl font-black text-slate-900">{fmt(escrowLien)} <span className="text-[10px] text-slate-400">FCFA</span></div>
              <div className="text-[9px] text-red-400">Dossiers gelés en arbitrage · PV d'huissier</div>
            </div>
          </div>
        </div>
      </div>

      {/* Journal central */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Landmark size={15} className="text-teal-600" /> Journal Central des Opérations
            </h3>
            <p className="text-[9px] text-slate-400">Rapprochement bancaire et traçabilité temps réel CEMAC.</p>
          </div>
          <div className="flex gap-1.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors ${tab === t.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {t.label}{t.id === 'all' ? ` (${ops.length})` : ''}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[960px]">
            <thead>
              <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3">Ref Transaction</th>
                <th className="px-3 py-3">Date &amp; Heure</th>
                <th className="px-3 py-3">Type Opération</th>
                <th className="px-3 py-3">Bénéficiaire / Client</th>
                <th className="px-3 py-3">Méthode</th>
                <th className="px-3 py-3">Montant brut</th>
                <th className="px-3 py-3">Com. / Frais</th>
                <th className="px-3 py-3">Net</th>
                <th className="px-3 py-3 text-right pr-5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={9} className="px-6 py-14 text-center text-xs text-slate-400"><Loader size={18} className="animate-spin mx-auto mb-2" />Chargement des opérations…</td></tr>
              )}
              {!loading && pageItems.map(r => {
                const ty = TYPE_STYLE[r.type];
                const st = ROW_STATUS[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 text-[10px] font-black text-slate-700 whitespace-nowrap">TX-{r.id}</td>
                    <td className="px-3 py-3.5 text-[10px] text-slate-500 whitespace-nowrap">{shortDate(r.at)}, {timeOf(r.at)}</td>
                    <td className="px-3 py-3.5"><span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${ty.cls}`}>{ty.l}</span></td>
                    <td className="px-3 py-3.5 text-[10px] font-bold text-slate-700 max-w-[160px] truncate">{r.who}</td>
                    <td className="px-3 py-3.5"><span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${r.method === 'MTN MoMo' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-600'}`}>{r.method}</span></td>
                    <td className="px-3 py-3.5 text-[11px] font-black text-slate-900 whitespace-nowrap">{fmt(r.gross)} FCFA</td>
                    <td className="px-3 py-3.5 text-[10px] text-slate-500 whitespace-nowrap">{r.fees}</td>
                    <td className="px-3 py-3.5 text-[11px] font-black text-teal-700 whitespace-nowrap">{fmt(r.net)} FCFA</td>
                    <td className="px-3 py-3.5 pr-5 text-right"><span className={`text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap ${st.cls}`}>{st.l}</span></td>
                  </tr>
                );
              })}
              {!loading && pageItems.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-14 text-center text-xs text-slate-400">Aucune opération dans cette catégorie.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400 font-semibold">
            Affichage de {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} - {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} opérations
            <span className="mx-2">·</span> Audit Réglementaire BEAC / COBAC
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronLeft size={14} /></button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const p = i + 1;
                return <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-bold ${p === page ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{p}</button>;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-500 disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
        {online ? <Wifi size={11} className="text-emerald-500" /> : <WifiOff size={11} className="text-red-500" />}
        {online ? 'Connecté à l\'API — données temps réel' : 'API injoignable'}
      </div>
    </AdminLayout>
  );
}
