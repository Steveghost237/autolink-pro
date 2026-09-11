import React, { useState } from 'react';
import { Star, Download, Phone, MessageCircle, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const BOOKINGS = [
  { id: 'BK001', vehicle: 'Toyota Corolla 2022', emoji: '🚗', driver: 'Armand Traoré', driverPhone: '+225 07 88 99 00', startDate: '2025-08-18', endDate: '2025-08-20', days: 2, amount: 50000, status: 'completed', payMethod: 'MTN Money', rating: 5, commission: 12500 },
  { id: 'BK002', vehicle: 'Hyundai Tucson 2023', emoji: '🚙', driver: 'Kofi Mensah', driverPhone: '+225 05 44 55 66', startDate: '2025-08-13', endDate: '2025-08-16', days: 3, amount: 135000, status: 'completed', payMethod: 'Orange Money', rating: 4, commission: 33750 },
  { id: 'BK003', vehicle: 'BMW Série 5 2022', emoji: '🏎️', driver: 'En attente d\'attribution', driverPhone: null, startDate: '2025-09-01', endDate: '2025-09-02', days: 1, amount: 80000, status: 'pending', payMethod: 'PayPal', rating: null, commission: 20000 },
  { id: 'BK004', vehicle: 'Ford Ranger 2021', emoji: '🛻', driver: 'Thierry Gbagbo', driverPhone: '+225 07 11 22 33', startDate: '2025-07-10', endDate: '2025-07-12', days: 2, amount: 80000, status: 'cancelled', payMethod: 'Carte Stripe', rating: null, commission: 0 },
];

const STATUS = {
  completed: { label: 'Terminé', style: 'badge-success' },
  pending: { label: 'En attente', style: 'badge-warning' },
  active: { label: 'En cours', style: 'badge-info' },
  cancelled: { label: 'Annulé', style: 'badge-error' },
};

function RatingModal({ booking, onClose }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-3">⭐</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Merci pour votre avis !</h3>
        <p className="text-slate-500 mb-5">Votre notation aide la communauté AutoLink.</p>
        <button onClick={onClose} className="btn-primary w-full">Fermer</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Évaluer la course</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-4xl mb-2">{booking.emoji}</div>
            <div className="font-semibold text-slate-800">{booking.vehicle}</div>
            <div className="text-sm text-slate-500">Chauffeur : {booking.driver}</div>
          </div>
          <div>
            <label className="label text-center block">Votre note</label>
            <div className="flex justify-center gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setStars(n)} className={`text-3xl transition-transform hover:scale-110 ${n <= stars ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Partagez votre expérience..."
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Annuler</button>
          <button onClick={() => setSubmitted(true)} className="btn-primary flex-1 py-2.5">Envoyer l'avis</button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const [tab, setTab] = useState('all');
  const [ratingBooking, setRatingBooking] = useState(null);

  const filtered = tab === 'all' ? BOOKINGS : BOOKINGS.filter(b => b.status === tab);

  return (
    <DashboardLayout title="Mes réservations">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {[['all', 'Toutes'], ['pending', 'En attente'], ['completed', 'Terminées'], ['cancelled', 'Annulées']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === val ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 p-5">
                <div className="text-4xl">{b.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900">{b.vehicle}</h3>
                    <span className={STATUS[b.status]?.style}>{STATUS[b.status]?.label}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    📅 {b.startDate} → {b.endDate} ({b.days} jour{b.days > 1 ? 's' : ''})
                  </div>
                  <div className="text-sm text-slate-500">
                    🚗 {b.driver} · 💳 {b.payMethod}
                  </div>
                  {b.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(b.rating)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-current" />)}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-slate-900">{b.amount.toLocaleString()} <span className="text-sm font-normal text-slate-400">FCFA</span></div>
                  {b.status === 'completed' && (
                    <div className="text-xs text-slate-400 mt-0.5">Commission : {b.commission.toLocaleString()} F</div>
                  )}
                </div>
              </div>

              {b.status !== 'cancelled' && (
                <div className="px-5 pb-4 pt-0 flex flex-wrap gap-2 border-t border-slate-50">
                  <button className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                    <Download size={12} /> Reçu
                  </button>
                  {b.driverPhone && (
                    <button className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Phone size={12} /> Appeler chauffeur
                    </button>
                  )}
                  {b.status === 'completed' && !b.rating && (
                    <button onClick={() => setRatingBooking(b)} className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Star size={12} /> Évaluer
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <button className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                      <X size={12} /> Annuler
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="font-bold text-slate-900 mb-2">Aucune réservation</h3>
              <p className="text-slate-500">Vous n'avez pas encore de réservation dans cette catégorie.</p>
            </div>
          )}
        </div>
      </div>
      {ratingBooking && <RatingModal booking={ratingBooking} onClose={() => setRatingBooking(null)} />}
    </DashboardLayout>
  );
}
