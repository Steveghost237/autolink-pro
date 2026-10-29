import React from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { Bell, Car, Wallet, Wrench, Star } from 'lucide-react';

const NOTIFS = [
  { id: 1, icon: Car, title: 'Nouvelle demande de location', text: 'Nadia Fouda souhaite louer votre Kia Sorento du 31/10 au 02/11 — Bonanjo.', time: 'Il y a 12 min', unread: true, type: 'reservation' },
  { id: 2, icon: Wallet, title: 'Revenus disponibles', text: '45 000 FCFA ajoutés à votre solde — commission 10 % déduite.', time: 'Il y a 1 h', unread: true, type: 'revenus' },
  { id: 3, icon: Wrench, title: 'Inspection de contrôle validée', text: 'Votre Toyota Corolla a passé le contrôle technique avec succès.', time: 'Hier 16:20', unread: false, type: 'inspection' },
  { id: 4, icon: Star, title: 'Nouvel avis locataire', text: 'Jules Mbappe a laissé une note de 4.8/5 sur votre Hyundai Tucson.', time: 'Mar 12:05', unread: false, type: 'avis' },
  { id: 5, icon: Bell, title: 'Rappel maintenance', text: 'Vidange moteur recommandée pour la Kia Picanto (45 200 km).', time: 'Lun 09:00', unread: false, type: 'rappel' },
];
export default function OwnerNotifications() {
  return (
    <OwnerLayout title="Notifications" subtitle="Activité de votre flotte en temps réel">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {NOTIFS.map((n, i) => (
          <div key={n.id} className={`flex items-start gap-4 px-5 py-4 ${i > 0 ? 'border-t border-slate-50' : ''} ${n.unread ? 'bg-emerald-50/30' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}><n.icon className="w-5 h-5" /></div>
            <div className="flex-1"><div className="flex justify-between items-start"><h3 className={`text-sm font-semibold ${n.unread ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</h3>{n.unread && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5" />}</div><p className="text-sm text-slate-500 mt-0.5">{n.text}</p><p className="text-xs text-slate-400 mt-1">{n.time}</p></div>
          </div>))}
      </div>
    </OwnerLayout>
  );
}
