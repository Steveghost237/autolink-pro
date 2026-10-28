import React from 'react';
import { AlertOctagon, FileCheck, ClipboardCheck, Contact, Scale, Smartphone, ArrowRight } from 'lucide-react';

const fmt = n => Math.round(Number(n || 0)).toLocaleString('fr-FR');

/* File d'attente prioritaire — 5 colonnes d'actions opérationnelles. */
export default function PriorityQueue({ pendingVehicles = [], disputedBookings = [], pendingClients = 0, pendingPayouts = 0, urgentCount = 0 }) {
  const cards = [
    {
      icon: FileCheck, iconCls: 'bg-amber-50 text-amber-600',
      badge: 'Nouveau', badgeCls: 'bg-amber-500',
      title: 'Transmissions Propriétaires',
      desc: `${pendingVehicles.length} dossier(s) de mise en ligne — contrats, photos & pièces à valider.`,
      meta: 'SLA : validation sous 120 min',
      cta: 'Traiter les dossiers', ctaCls: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
    {
      icon: ClipboardCheck, iconCls: 'bg-blue-50 text-blue-600',
      badge: 'En attente', badgeCls: 'bg-blue-500',
      title: 'Audit & Visite Technique',
      desc: 'Inspections 50 points à planifier avec les hubs Douala & Yaoundé.',
      meta: 'Hub Akwa & Bastos disponibles',
      cta: 'Voir le planning', ctaCls: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    },
    {
      icon: Contact, iconCls: 'bg-purple-50 text-purple-600',
      badge: 'KYC', badgeCls: 'bg-purple-500',
      title: 'KYC & Permis Clients',
      desc: `${pendingClients} profil(s) client à certifier — CNI, permis de conduire & selfie.`,
      meta: 'Vérification manuelle requise',
      cta: 'Vérifier les documents', ctaCls: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    },
    {
      icon: Scale, iconCls: 'bg-red-50 text-red-600',
      badge: 'Urgent', badgeCls: 'bg-red-500',
      title: 'Litiges Ouverts',
      desc: `${disputedBookings.length} litige(s) — caution en séquestre gelée jusqu'à arbitrage.`,
      meta: 'Médiation sous 7 jours',
      cta: 'Arbitrer maintenant', ctaCls: 'bg-red-500 hover:bg-red-600 text-white',
    },
    {
      icon: Smartphone, iconCls: 'bg-teal-50 text-teal-600',
      badge: 'File MoMo', badgeCls: 'bg-slate-700',
      title: 'Retraits Mobile Money',
      desc: `${pendingPayouts} demande(s) de retrait propriétaire en attente de virement.`,
      meta: `File : ${fmt(pendingPayouts * 250000)} FCFA`,
      cta: 'Autoriser les virements', ctaCls: 'bg-teal-600 hover:bg-teal-700 text-white',
    },
  ];

  return (
    <div className="mb-6">
      {/* Bandeau alerte SLA */}
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <AlertOctagon size={17} className="text-white" />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-black text-red-700">
              {urgentCount} dossier{urgentCount > 1 ? 's' : ''} requise{urgentCount > 1 ? 'nt' : ''} une validation immédiate sous 120 minutes
            </div>
            <div className="text-[11px] text-red-400 truncate">
              Dossiers sans traitement : mise en ligne de véhicules, arbitrages & virements en attente.
            </div>
          </div>
        </div>
        <button className="hidden sm:flex shrink-0 items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-colors">
          Consulter la file <ArrowRight size={13} />
        </button>
      </div>

      {/* Titre section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-black text-slate-900 text-sm">
          File d'Attente Prioritaire
          <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full align-middle">
            {cards.length} tickets à traiter
          </span>
        </h2>
        <span className="text-[10px] font-bold text-slate-400">Traitement SLA standard : &lt; 15 min</span>
      </div>

      {/* 5 cartes d'action */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconCls}`}>
                <c.icon size={17} />
              </span>
              <span className={`${c.badgeCls} text-white text-[9px] font-black px-2 py-0.5 rounded-md`}>{c.badge}</span>
            </div>
            <h3 className="text-[13px] font-black text-slate-900 mb-1.5 leading-snug">{c.title}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3 flex-1">{c.desc}</p>
            <div className="text-[10px] font-bold text-slate-400 mb-3 border-t border-slate-50 pt-2.5">{c.meta}</div>
            <button className={`w-full text-[11px] font-black py-2.5 rounded-xl transition-colors ${c.ctaCls}`}>
              {c.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
