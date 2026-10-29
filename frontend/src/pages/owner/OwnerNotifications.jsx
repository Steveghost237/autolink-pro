import React from 'react';
import OwnerLayout from '../../components/ownerdash/OwnerLayout';
import Icon from '../../components/Icon';

const ITEMS = [
  { icon: 'inbox', color: 'bg-emerald-100 text-emerald-700', title: 'Nouvelle demande de location', text: 'Nadia Fouda souhaite louer votre Kia Sorento du 31/10 au 02/11 — Bonanjo.', time: 'Il y a 12 min', unread: true },
  { icon: 'payments', color: 'bg-teal-100 text-teal-700', title: 'Revenus disponibles', text: '45 000 FCFA ajoutés à votre solde — commission 10 % déduite.', time: 'Il y a 1 h', unread: true },
  { icon: 'verified', color: 'bg-sky-100 text-sky-700', title: 'Inspection de contrôle validée', text: 'Votre Toyota Corolla a passé le contrôle technique avec succès.', time: 'Hier 16:20', unread: false },
  { icon: 'star', color: 'bg-amber-100 text-amber-700', title: 'Nouvel avis locataire', text: 'Jules Mbappe a laissé une note de 4.8/5 sur votre Hyundai Tucson.', time: 'Mar 12:05', unread: false },
  { icon: 'build', color: 'bg-rose-100 text-rose-700', title: 'Rappel maintenance', text: 'Vidange moteur recommandée pour la Kia Picanto (45 200 km).', time: 'Lun 09:00', unread: false },
];

export default function OwnerNotifications() {
  return (
    <OwnerLayout>
      <div className="max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Notifications</h2>
          <button className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 hover:text-emerald-700"><Icon name="done_all" size={16} />Tout marquer lu</button>
        </div>
        {ITEMS.map((n, i) => (
          <div key={i} className={`flex gap-4 p-4 rounded-3xl border shadow-sm transition-all ${n.unread ? 'bg-emerald-50/60 border-emerald-100' : 'bg-white border-slate-100'}`}>
            <span className={`w-11 h-11 rounded-2xl ${n.color} flex items-center justify-center shrink-0`}><Icon name={n.icon} size={20} /></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><b className="text-sm text-slate-900">{n.title}</b>{n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500" />}</div>
              <p className="text-[13px] text-slate-600 mt-0.5">{n.text}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </OwnerLayout>
  );
}
