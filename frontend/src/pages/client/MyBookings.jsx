import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, Download, Phone, X, Car, Calendar, CreditCard, ClipboardList,
  Loader, AlertTriangle, MessageSquare, ShieldCheck, BadgeCheck
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { bookingsAPI } from '../../services/api';

const STATUS = {
  completed: { label: 'Terminée',         chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  pending:   { label: 'Attente paiement', chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',           dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmée',        chip: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',                       dot: 'bg-sky-500' },
  active:    { label: 'En cours',         chip: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',                 dot: 'bg-blue-500 animate-pulse' },
  cancelled: { label: 'Annulée',          chip: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',                       dot: 'bg-red-500' },
  disputed:  { label: 'Litige',           chip: 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',                       dot: 'bg-red-600' },
};

const TIER_LABEL = { basic: 'Économique', standard: 'Intermédiaire', premium: 'Premium', gold: 'Luxe', collection: 'Super Luxe' };
const PAY_LABEL = { mtn: 'MTN MoMo', orange: 'Orange Money', senbid: 'SenBid', paybid: 'PayBid', paypal: 'PayPal', stripe: 'Stripe', wallet: 'Solde AutoLink' };

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch (_) { return iso; }
};

const mapApiBooking = (b) => ({
  id: b.id,
  vehicle: b.vehicle_name || 'Véhicule',
  vehiclePlate: b.vehicle_plate || '',
  vehicleTier: TIER_LABEL[b.vehicle_tier] || null,
  vehicleImage: b.vehicle_image || null,
  ownerId: b.owner_id || null,
  ownerName: b.owner_name || '',
  driver: b.driver_name || (b.driver_type === 'internal' ? 'Attribution automatique…' : b.driver_type === 'owner' ? 'Chauffeur du propriétaire' : 'Sans chauffeur'),
  driverPhone: b.driver_phone || null,
  driverType: b.driver_type || 'none',
  startDate: b.start_date,
  endDate: b.end_date,
  days: b.days,
  amount: Number(b.subtotal || 0),
  status: b.status,
  escrowStatus: b.escrow_status || null,
  disputeReason: b.dispute_reason || '',
  payMethod: PAY_LABEL[b.payment_method] || '—',
  rating: b.client_rating || null,
  commission: Number(b.commission_amount || 0),
  deposit: Number(b.deposit_amount || 0),
  discount: Number(b.discount_percent || 0),
  depositStatus: b.deposit_status || null,
});

function RatingModal({ booking, onClose }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-amber-400 fill-current" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Merci pour votre avis !</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-5">Votre notation aide la communauté AutoLink.</p>
        <button onClick={onClose} className="btn-primary w-full">Fermer</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Évaluer la location</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-primary-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Car size={28} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="font-semibold text-slate-800 dark:text-white">{booking.vehicle}</div>
            <div className="text-sm text-slate-500">Chauffeur : {booking.driver}</div>
          </div>
          <div>
            <label className="label text-center block">Votre note</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setStars(n)} className={`text-3xl transition-transform hover:scale-110 ${n <= stars ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Partagez votre expérience..."
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Annuler</button>
          <button onClick={() => setSubmitted(true)} className="btn-primary flex-1 py-2.5">Envoyer l'avis</button>
        </div>
      </div>
    </div>
  );
}

function DisputeModal({ booking, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setSending(true);
    setError('');
    try {
      await bookingsAPI.dispute(booking.id, reason);
      onDone();
    } catch (_) {
      setError('Impossible d\'envoyer le litige — vérifiez votre connexion.');
    }
    setSending(false);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><AlertTriangle size={18} className="text-red-500" /> Signaler un problème</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-300"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Véhicule : <strong>{booking.vehicle}</strong><br />
            En cas de panne ou de problème imputable au véhicule, la caution du propriétaire
            reste <strong>gelée</strong> et un administrateur AutoLink arbitre votre dossier.
          </p>
          <div>
            <label className="label">Décrivez le problème</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Ex: panne moteur, climatisation HS, véhicule non conforme…"
              value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1 py-2.5">Annuler</button>
          <button onClick={submit} disabled={!reason.trim() || sending}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
            {sending ? 'Envoi…' : 'Ouvrir le litige'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [['all', 'Toutes'], ['confirmed', 'Confirmées'], ['active', 'En cours'], ['completed', 'Terminées'], ['cancelled', 'Annulées'], ['disputed', 'Litiges']];

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [ratingBooking, setRatingBooking] = useState(null);
  const [disputeBooking, setDisputeBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [payBanner, setPayBanner] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('payment');
    if (q) {
      setPayBanner(q);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await bookingsAPI.getAll();
      setBookings((res.data.results || res.data || []).map(mapApiBooking));
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cancelBooking = async (id) => {
    setCancelling(id);
    try {
      await bookingsAPI.updateStatus(id, 'cancelled');
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      setActionError('Annulation impossible — vérifiez votre connexion puis réessayez.');
    }
    setCancelling(null);
  };

  const countFor = (s) => s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab);

  return (
    <DashboardLayout title="Mes réservations">
      <div className="max-w-4xl mx-auto space-y-6">

        {payBanner === 'success' && (
          <div className="rounded-xl border px-4 py-3 text-sm font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-2">
            <BadgeCheck size={16} /> Paiement confirmé — votre réservation est validée. Le propriétaire a été notifié.
          </div>
        )}
        {actionError && (
          <div className="rounded-xl border px-4 py-3 text-sm font-semibold bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 flex justify-between items-center">
            {actionError}
            <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        )}
        {(payBanner === 'canceled' || payBanner === 'error') && (
          <div className="rounded-xl border px-4 py-3 text-sm font-semibold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
            {payBanner === 'canceled'
              ? 'Paiement annulé — la réservation reste en attente et aucun montant n\'a été débité.'
              : 'Le paiement n\'a pas abouti — la réservation reste en attente.'}
          </div>
        )}

        {/* Onglets filtrants avec compteurs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
            {TABS.map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${tab === val
                  ? 'bg-white dark:bg-slate-900 shadow text-sky-700 dark:text-sky-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === val ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {countFor(val)}
                </span>
              </button>
            ))}
          </div>
          {loading && <Loader size={16} className="animate-spin text-slate-400" />}
        </div>

        <div className="space-y-4">
          {filtered.map(b => {
            const st = STATUS[b.status] || STATUS.pending;
            return (
              <div key={b.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="flex">
                  {/* Photo véhicule */}
                  <div className="w-24 sm:w-36 shrink-0 bg-gradient-to-br from-sky-100 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
                    {b.vehicleImage
                      ? <img src={b.vehicleImage} alt={b.vehicle} className="w-full h-full object-cover" />
                      : <Car size={30} className="text-sky-400" />}
                  </div>

                  <div className="flex-1 p-4 sm:p-5 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{b.vehicle}</h3>
                          {b.vehicleTier && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wide">{b.vehicleTier}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">BK-{String(b.id).padStart(4, '0')}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${st.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>

                    {/* Infos en pastilles */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[13px] text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-sky-500" />
                        {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                        <span className="text-slate-400">· {b.days} jour{b.days > 1 ? 's' : ''}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Car size={14} className="text-slate-400" /> {b.driver}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard size={14} className="text-slate-400" /> {b.payMethod}
                      </span>
                    </div>

                    {/* Séquestre / litige / note */}
                    {b.escrowStatus === 'held' && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 rounded-lg px-2.5 py-1.5">
                        <ShieldCheck size={13} /> Paiement sécurisé — caution bloquée jusqu'à la fin de la location
                      </div>
                    )}
                    {b.escrowStatus === 'disputed' && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg px-2.5 py-1.5">
                        <AlertTriangle size={13} /> Litige en cours — caution gelée en attendant l'arbitrage AutoLink
                      </div>
                    )}
                    {b.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(b.rating)].map((_, i) => <Star key={i} size={12} className="text-amber-400 fill-current" />)}
                        <span className="text-xs text-slate-400 ml-1">Votre évaluation</span>
                      </div>
                    )}
                  </div>

                  {/* Bloc prix */}
                  <div className="hidden sm:flex flex-col items-end justify-center px-5 border-l border-slate-100 dark:border-slate-700 shrink-0 text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                      {fmt(b.amount)} <span className="text-xs font-semibold text-slate-400">FCFA</span>
                    </div>
                    {b.discount > 0 && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">-{b.discount}% longue durée</div>
                    )}
                    {b.deposit > 0 && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 whitespace-nowrap">
                        Caution {fmt(b.deposit)} F {b.depositStatus === 'released' ? '· restituée' : b.depositStatus === 'held' ? '· bloquée' : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Prix mobile */}
                <div className="sm:hidden px-4 pb-2 -mt-1 text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white">{fmt(b.amount)} FCFA</span>
                  {b.deposit > 0 && <span className="text-[11px] text-amber-600 ml-2">Caution {fmt(b.deposit)} F</span>}
                </div>

                {/* Actions */}
                {b.status !== 'cancelled' && (
                  <div className="px-4 sm:px-5 py-3 flex flex-wrap gap-2 border-t border-slate-50 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/60">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-sky-300 hover:text-sky-700 dark:hover:text-sky-300 px-3 py-2 rounded-lg transition-all">
                      <Download size={13} /> Reçu
                    </button>
                    {b.ownerId && (
                      <button onClick={() => navigate(`/messages?peer=${b.ownerId}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 px-3 py-2 rounded-lg transition-colors">
                        <MessageSquare size={13} /> Contacter {b.ownerName?.split(' ')[0] || 'le propriétaire'}
                      </button>
                    )}
                    {b.driverPhone && (
                      <a href={`tel:${b.driverPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors">
                        <Phone size={13} /> Appeler le chauffeur
                      </a>
                    )}
                    {b.status === 'completed' && !b.rating && (
                      <button onClick={() => setRatingBooking(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors">
                        <Star size={13} /> Évaluer la location
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(b.status) && (
                      <button onClick={() => cancelBooking(b.id)} disabled={cancelling === b.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ml-auto">
                        <X size={13} /> {cancelling === b.id ? 'Annulation…' : 'Annuler (remboursé)'}
                      </button>
                    )}
                    {['confirmed', 'active'].includes(b.status) && (
                      <button onClick={() => setDisputeBooking(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors">
                        <AlertTriangle size={13} /> Signaler un problème
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={28} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{offline ? 'Serveur injoignable' : 'Aucune réservation'}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-5">
                {offline
                  ? 'Impossible de contacter le serveur — vérifiez votre connexion puis rechargez la page.'
                  : "Vous n'avez pas encore de réservation dans cette catégorie."}
              </p>
              {!offline && (
                <button onClick={() => navigate('/client/search')} className="btn-primary px-6 py-2.5">
                  Trouver un véhicule
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {ratingBooking && <RatingModal booking={ratingBooking} onClose={() => setRatingBooking(null)} />}
      {disputeBooking && (
        <DisputeModal booking={disputeBooking}
          onClose={() => setDisputeBooking(null)}
          onDone={() => { setDisputeBooking(null); load(); }} />
      )}
    </DashboardLayout>
  );
}
