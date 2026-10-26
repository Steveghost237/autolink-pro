import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { bookingsAPI } from '../../services/api';

const SORT_OPTIONS = [
  { value: 'dispute_opened_at', label: 'Date du litige' },
  { value: 'created_at', label: 'Date de réservation' },
  { value: 'status', label: 'Statut' },
  { value: 'subtotal', label: 'Montant' },
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
      setError('Impossible de charger les litiges.');
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
      title: refund ? 'Rembourser le client ?' : 'Payer le propriétaire ?',
      message: refund
        ? 'Le paiement applicable sera remboursé au client et le litige sera clôturé.'
        : 'Les fonds bloqués seront versés au propriétaire et le litige sera clôturé.',
      confirmLabel: refund ? 'Rembourser' : 'Payer le propriétaire',
      danger: refund,
    }))) return;
    setBusy(booking.id);
    try {
      await bookingsAPI.resolveDispute(booking.id, decision);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Le litige n’a pas pu être résolu.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="Litiges">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex gap-2">
          <button className={state === 'open' ? 'btn-primary' : 'btn-outline'} onClick={() => switchState('open')}>À arbitrer</button>
          <button className={state === 'resolved' ? 'btn-primary' : 'btn-outline'} onClick={() => switchState('resolved')}>Résolus</button>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <section className="card">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder="Rechercher client, véhicule, motif" />
        </section>
        <div className="space-y-3">
          {rows.map(booking => (
            <article key={booking.id} className="card space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">Réservation #{booking.id} · {booking.client_name}</h2>
                  <p className="text-sm text-slate-500">{booking.vehicle_name} · {booking.vehicle_plate} · {booking.start_date} — {booking.end_date}</p>
                  <p className="mt-1 text-sm">Ouvert le {booking.dispute_opened_at ? new Date(booking.dispute_opened_at).toLocaleString('fr-FR') : 'date non renseignée'}</p>
                </div>
                {state === 'open'
                  ? <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">À arbitrer</span>
                  : <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{booking.status === 'cancelled' ? 'Client remboursé' : 'Propriétaire payé'}</span>}
              </div>
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{booking.dispute_reason || 'Aucun motif précisé.'}</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <strong>{Number(booking.subtotal).toLocaleString('fr-FR')} FCFA</strong>
                <div className="flex gap-2">
                  <Link className="btn-outline px-3 py-2" to={`/admin/bookings/${booking.id}`}>Voir la réservation</Link>
                  {state === 'open' && <>
                    <button disabled={busy === booking.id} className="btn-outline text-red-700" onClick={() => resolve(booking, 'refund')}>Rembourser le client</button>
                    <button disabled={busy === booking.id} className="btn-primary" onClick={() => resolve(booking, 'release')}>Payer le propriétaire</button>
                  </>}
                </div>
              </div>
            </article>
          ))}
          {rows.length === 0 && <div className="card py-12 text-center text-slate-500"><AlertTriangle className="mx-auto mb-2" />{state === 'open' ? 'Aucun litige à arbitrer.' : 'Aucun litige résolu.'}</div>}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Page {page} / {Math.max(1, Math.ceil(count / 20))} · {count} litige(s)</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>Suivant</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
