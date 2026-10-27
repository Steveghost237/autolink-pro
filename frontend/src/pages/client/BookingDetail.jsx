import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Save } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatNumber, formatDate, formatDateTime,  uiText } from '../../i18n';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => bookingsAPI.detail(id).then(({ data }) => {
    setBooking(data);
    setForm({
      start_date: data.start_date,
      end_date: data.end_date,
      pickup_address: data.pickup_address || '',
      dropoff_address: data.dropoff_address || '',
      notes: data.notes || '',
      driver_type: data.driver_type || 'none',
    });
  }).catch(() => setError(uiText("pages.client.BookingDetail", "Impossible de charger cette réservation."))), [id]);
  useEffect(() => { load(); }, [load]);

  const walletPaid = booking?.payment_method === 'wallet';
  const canEdit = user?.role === 'CLIENT'
    && ['pending', 'confirmed'].includes(booking?.status)
    && booking?.start_date > new Date().toISOString().slice(0, 10);
  const setField = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await bookingsAPI.update(id, form);
      setNotice(uiText("pages.client.BookingDetail", "Les modifications ont été enregistrées."));
      await load();
    } catch (err) {
      setError(err.response?.data?.detail || Object.values(err.response?.data || {}).flat().join(' ') || uiText("pages.client.BookingDetail", "La modification a échoué."));
    } finally {
      setBusy(false);
    }
  };
  const downloadReceipt = async () => {
    const { data } = await bookingsAPI.receipt(id);
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recu-reservation-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const emailReceipt = async () => {
    await bookingsAPI.emailReceipt(id);
    setNotice(uiText("pages.client.BookingDetail", "Le reçu PDF a été envoyé par e-mail."));
  };

  return (
    <DashboardLayout title={uiText("pages.client.BookingDetail", "Détail de la réservation")}>
      <div className="max-w-4xl mx-auto space-y-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500"><ArrowLeft size={16} />{" " + uiText("pages.client.BookingDetail", "Retour")}</button>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 p-3 text-emerald-700">{notice}</p>}
        {!booking ? <div className="card">{uiText("pages.client.BookingDetail", "Chargement…")}</div> : <>
          <section className="card space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold">{booking.vehicle_name || uiText("pages.client.BookingDetail", "Véhicule")}{" " + uiText("pages.client.BookingDetail", "—") + " "}{booking.vehicle_plate || ''}</h2>
                <p className="text-sm text-slate-500">{uiText("pages.client.BookingDetail", "Réservation BK-")}{String(booking.id).padStart(4, '0')}{" " + uiText("pages.client.BookingDetail", "·") + " "}{booking.status}</p></div>
              <div className="flex gap-2">
                <button onClick={downloadReceipt} className="btn-outline flex items-center gap-2"><Download size={15} />{" " + uiText("pages.client.BookingDetail", "Reçu PDF")}</button>
                {user?.role === 'CLIENT' && <button onClick={emailReceipt} className="btn-outline flex items-center gap-2"><Mail size={15} />{" " + uiText("pages.client.BookingDetail", "Envoyer par e-mail")}</button>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <p>{uiText("pages.client.BookingDetail", "Client :") + " "}{booking.client_name || booking.client_email || uiText("pages.client.BookingDetail", "—")}</p>
              <p>{uiText("pages.client.BookingDetail", "Propriétaire :") + " "}{booking.owner_name || uiText("pages.client.BookingDetail", "—")}</p>
              <p>{uiText("pages.client.BookingDetail", "Dates :") + " "}{formatDate(booking.start_date)}{" " + uiText("pages.client.BookingDetail", "→") + " "}{formatDate(booking.end_date)}{" " + uiText("pages.client.BookingDetail", "(")}{booking.days}{" " + uiText("pages.client.BookingDetail", "jour(s))")}</p>
              <p>{uiText("pages.client.BookingDetail", "Chauffeur :") + " "}{booking.driver_name || booking.driver_type || uiText("pages.client.BookingDetail", "Sans chauffeur")}</p>
              <p>{uiText("pages.client.BookingDetail", "Paiement :") + " "}{booking.payment_method || uiText("pages.client.BookingDetail", "—")}{" " + uiText("pages.client.BookingDetail", "·") + " "}{booking.payment_status || uiText("pages.client.BookingDetail", "En attente")}</p>
              <p>{uiText("pages.client.BookingDetail", "Caution :") + " "}{formatNumber(Number(booking.deposit_amount || 0))}{" " + uiText("pages.client.BookingDetail", "FCFA ·") + " "}{booking.deposit_status || uiText("pages.client.BookingDetail", "—")}</p>
              <p>{uiText("pages.client.BookingDetail", "Tarif journalier :") + " "}{formatNumber(Number(booking.daily_rate || 0))}{" " + uiText("pages.client.BookingDetail", "FCFA")}</p>
              <p>{uiText("pages.client.BookingDetail", "Remise :") + " "}{booking.discount_percent || 0}{uiText("pages.client.BookingDetail", "% · Sous-total :") + " "}{formatNumber(Number(booking.subtotal || 0))}{" " + uiText("pages.client.BookingDetail", "FCFA")}</p>
            </div>
            <div className="border-t pt-3 text-sm text-slate-500">
              <strong>{uiText("pages.client.BookingDetail", "Suivi :")}</strong>{" " + uiText("pages.client.BookingDetail", "créée le") + " "}{booking.created_at ? formatDate(new Date(booking.created_at)) : uiText("pages.client.BookingDetail", "—")}{" " + uiText("pages.client.BookingDetail", "· statut") + " "}{booking.status}
            </div>
          </section>
          <section className="card space-y-4">
            <h3 className="font-bold">{uiText("pages.client.BookingDetail", "Inspections du véhicule")}</h3>
            {!booking.inspections?.length ? <p className="text-sm text-slate-500">{uiText("pages.client.BookingDetail", "Aucune inspection enregistrée pour cette réservation.")}</p> : booking.inspections.map(inspection => (
              <article key={inspection.id} className="border-t pt-4 space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-2 font-semibold">
                  <span>{inspection.inspection_type === 'entry' ? uiText("pages.client.BookingDetail", "Fiche d’entrée") : uiText("pages.client.BookingDetail", "Fiche de sortie")}</span>
                  <span>{inspection.inspection_date ? formatDateTime(new Date(inspection.inspection_date)) : uiText("pages.client.BookingDetail", "—")}</span>
                </div>
                <p>{uiText("pages.client.BookingDetail", "Inspecteur :") + " "}{inspection.controller_name || uiText("pages.client.BookingDetail", "—")}{" " + uiText("pages.client.BookingDetail", "· Score :") + " "}{inspection.condition_score ?? uiText("pages.client.BookingDetail", "—")}{uiText("pages.client.BookingDetail", "/100")}</p>
                {inspection.notes && <p className="whitespace-pre-wrap">{uiText("pages.client.BookingDetail", "Notes :") + " "}{inspection.notes}</p>}
                {inspection.photos?.length > 0 && <div className="flex flex-wrap gap-3">
                  {inspection.photos.map(photo => <figure key={photo.id} className="w-28">
                    <img src={photo.image} alt={photo.caption || uiText("pages.client.BookingDetail", "Photo d’inspection")} className="h-20 w-full rounded object-cover" />
                    {photo.caption && <figcaption className="mt-1 text-xs text-slate-500">{photo.caption}</figcaption>}
                  </figure>)}
                </div>}
              </article>
            ))}
          </section>
          {canEdit && <form onSubmit={save} className="card space-y-4">
            <h3 className="font-bold">{uiText("pages.client.BookingDetail", "Modifier la réservation")}</h3>
            {!walletPaid && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{uiText("pages.client.BookingDetail", "Le paiement n’a pas été effectué avec le portefeuille : pour changer les dates, annulez puis réservez à nouveau.")}</p>}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="label">{uiText("pages.client.BookingDetail", "Date de début")}<input className="input-field mt-1" type="date" name="start_date" value={form.start_date || ''} onChange={setField} disabled={!walletPaid} /></label>
              <label className="label">{uiText("pages.client.BookingDetail", "Date de fin")}<input className="input-field mt-1" type="date" name="end_date" value={form.end_date || ''} onChange={setField} disabled={!walletPaid} /></label>
              <label className="label">{uiText("pages.client.BookingDetail", "Lieu de prise en charge")}<input className="input-field mt-1" name="pickup_address" value={form.pickup_address || ''} onChange={setField} /></label>
              <label className="label">{uiText("pages.client.BookingDetail", "Lieu de retour")}<input className="input-field mt-1" name="dropoff_address" value={form.dropoff_address || ''} onChange={setField} /></label>
              <label className="label">{uiText("pages.client.BookingDetail", "Chauffeur")}<select className="input-field mt-1" name="driver_type" value={form.driver_type || uiText("pages.client.BookingDetail", "none")} onChange={setField} disabled={!walletPaid}><option value="none">{uiText("pages.client.BookingDetail", "Sans chauffeur")}</option><option value="internal">{uiText("pages.client.BookingDetail", "Chauffeur AutoLink")}</option><option value="owner">{uiText("pages.client.BookingDetail", "Chauffeur du propriétaire")}</option></select></label>
              <label className="label sm:col-span-2">{uiText("pages.client.BookingDetail", "Notes")}<textarea className="input-field mt-1" rows="3" name="notes" value={form.notes || ''} onChange={setField} /></label>
            </div>
            <button className="btn-primary flex items-center gap-2" disabled={busy}><Save size={15} />{" " + uiText("pages.client.BookingDetail", "Enregistrer")}</button>
          </form>}
        </>}
      </div>
    </DashboardLayout>
  );
}
