import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI } from '../../services/api';
import { formatDateTime, formatNumber,  uiText } from '../../i18n';

const SORT_OPTIONS = [
  { value: 'dispute_opened_at', label: uiText("pages.admin.Disputes", "Date du litige") },
  { value: 'created_at', label: uiText("pages.admin.Disputes", "Date de réservation") },
  { value: 'status', label: uiText("pages.admin.Disputes", "Statut") },
  { value: 'subtotal', label: uiText("pages.admin.Disputes", "Montant") },
];

export default function Disputes() {
  const confirm = useConfirm();
  const [state, setState] = useState('open');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('dispute_opened_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await bookingsAPI.disputes({
        state, page, page_size: 20, search: search.trim(),
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      setRows(data.results || []);
      setCount(data.count || 0);
      setError('');
    } catch (_) {
      setError(uiText("pages.admin.Disputes", "Impossible de charger les litiges."));
    }
  }, [page, search, sortField, sortOrder, state]);
  useEffect(() => { load(); }, [load]);

  const switchState = value => {
    setState(value);
    setPage(1);
    setSearch('');
  };

  const resolve = async (booking, decision) => {
    const refund = decision === 'refund';
    if (!(await confirm({
      title: refund ? uiText("pages.admin.Disputes", "Rembourser le client ?") : uiText("pages.admin.Disputes", "Payer le propriétaire ?"),
      message: refund
        ? uiText("pages.admin.Disputes", "Le paiement applicable sera remboursé au client et le litige sera clôturé.")
        : uiText("pages.admin.Disputes", "Les fonds bloqués seront versés au propriétaire et le litige sera clôturé."),
      confirmLabel: refund ? uiText("pages.admin.Disputes", "Rembourser") : uiText("pages.admin.Disputes", "Payer le propriétaire"),
      danger: refund,
    }))) return;
    setBusy(booking.id);
    try {
      await bookingsAPI.resolveDispute(booking.id, decision);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.Disputes", "Le litige n’a pas pu être résolu."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title={uiText("pages.admin.Disputes", "Litiges")}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex gap-2">
          <button className={state === 'open' ? uiText("pages.admin.Disputes", "btn-primary") : uiText("pages.admin.Disputes", "btn-outline")} onClick={() => switchState('open')}>{uiText("pages.admin.Disputes", "À arbitrer")}</button>
          <button className={state === 'resolved' ? uiText("pages.admin.Disputes", "btn-primary") : uiText("pages.admin.Disputes", "btn-outline")} onClick={() => switchState('resolved')}>{uiText("pages.admin.Disputes", "Résolus")}</button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <section className="card">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder={uiText("pages.admin.Disputes", "Rechercher client, véhicule, motif")} />
        </section>
        <div className="space-y-3">
          {rows.map(booking => (
            <article key={booking.id} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{uiText("pages.admin.Disputes", "Réservation #")}{booking.id}{" " + uiText("pages.admin.Disputes", "·") + " "}{booking.client_name}</h2>
                  <p className="text-sm text-on-surface-variant">{booking.vehicle_name}{" " + uiText("pages.admin.Disputes", "·") + " "}{booking.vehicle_plate}{" " + uiText("pages.admin.Disputes", "·") + " "}{booking.start_date}{" " + uiText("pages.admin.Disputes", "—") + " "}{booking.end_date}</p>
                  <p className="mt-1 text-sm">{uiText("pages.admin.Disputes", "Ouvert le") + " "}{booking.dispute_opened_at ? formatDateTime(new Date(booking.dispute_opened_at)) : uiText("pages.admin.Disputes", "date non renseignée")}</p>
                </div>
                {state === 'open'
                  ? <span className="rounded-full bg-error-container px-3 py-1 text-sm font-semibold text-error">{uiText("pages.admin.Disputes", "À arbitrer")}</span>
                  : <span className="rounded-full bg-primary-fixed/40 px-3 py-1 text-sm font-semibold text-primary">{booking.status === 'cancelled' ? uiText("pages.admin.Disputes", "Client remboursé") : uiText("pages.admin.Disputes", "Propriétaire payé")}</span>}
              </div>
              <p className="rounded-lg bg-surface-container-low dark:bg-slate-900 p-3 text-sm text-on-surface dark:text-white">{booking.dispute_reason || uiText("pages.admin.Disputes", "Aucun motif précisé.")}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong>{formatNumber(Number(booking.subtotal))}{" " + uiText("pages.admin.Disputes", "FCFA")}</strong>
                <div className="flex gap-2">
                  <Link className="btn-outline px-3 py-2" to={`/admin/bookings/${booking.id}`}>{uiText("pages.admin.Disputes", "Voir la réservation")}</Link>
                  {state === 'open' && <>
                    <button disabled={busy === booking.id} className="btn-outline text-error" onClick={() => resolve(booking, 'refund')}>{uiText("pages.admin.Disputes", "Rembourser le client")}</button>
                    <button disabled={busy === booking.id} className="btn-primary" onClick={() => resolve(booking, 'release')}>{uiText("pages.admin.Disputes", "Payer le propriétaire")}</button>
                  </>}
                </div>
              </div>
            </article>
          ))}
          {rows.length === 0 && <div className="card py-12 text-center text-on-surface-variant"><AlertTriangle className="mx-auto mb-2" />{state === 'open' ? uiText("pages.admin.Disputes", "Aucun litige à arbitrer.") : uiText("pages.admin.Disputes", "Aucun litige résolu.")}</div>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>{uiText("pages.admin.Disputes", "Page") + " "}{page}{" " + uiText("pages.admin.Disputes", "/") + " "}{Math.max(1, Math.ceil(count / 20))}{" " + uiText("pages.admin.Disputes", "·") + " "}{count}{" " + uiText("pages.admin.Disputes", "litige(s)")}</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.Disputes", "Précédent")}</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.Disputes", "Suivant")}</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
