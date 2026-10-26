import React, { useCallback, useEffect, useState } from 'react';
import { Check, Edit3, Trash2, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { adminVehiclesAPI } from '../../services/api';

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date d’ajout' },
  { value: 'brand', label: 'Marque' },
  { value: 'model', label: 'Modèle' },
  { value: 'year', label: 'Année' },
  { value: 'daily_rate', label: 'Tarif' },
  { value: 'status', label: 'Statut' },
];
const STATUSES = [
  ['pending', 'À valider'], ['approved', 'Approuvé'], ['suspended', 'Suspendu'],
  ['rented', 'En location'], ['maintenance', 'Maintenance'],
];

function VehicleEditor({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState({
    brand: vehicle.brand, model: vehicle.model, year: vehicle.year, plate: vehicle.plate,
    category: vehicle.category, fuel: vehicle.fuel, seats: vehicle.seats,
    color: vehicle.color, daily_rate: vehicle.daily_rate, status: vehicle.status,
  });
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault();
    try {
      await adminVehiclesAPI.update(vehicle.id, form);
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La modification a échoué.');
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={save} className="card max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Modifier le véhicule</h2><button type="button" onClick={onClose}><X /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['brand', 'Marque'], ['model', 'Modèle'], ['year', 'Année'], ['plate', 'Immatriculation'],
            ['category', 'Catégorie'], ['fuel', 'Carburant'], ['seats', 'Places'], ['color', 'Couleur'],
            ['daily_rate', 'Tarif journalier (FCFA)'],
          ].map(([key, label]) => (
            <label key={key} className="text-sm">{label}
              <input required className="input-field mt-1" type={['year', 'seats', 'daily_rate'].includes(key) ? 'number' : 'text'}
                value={form[key] ?? ''} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} />
            </label>
          ))}
          <label className="text-sm">Statut
            <select className="input-field mt-1" value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value }))}>
              {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2"><button type="button" className="btn-outline flex-1" onClick={onClose}>Annuler</button><button className="btn-primary flex-1">Enregistrer</button></div>
      </form>
    </div>
  );
}

export default function CatalogManager() {
  const confirm = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await adminVehiclesAPI.list({
        page, page_size: 20, search: search.trim(), status: status || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      setVehicles(data.results || []);
      setCount(data.count ?? data.length ?? 0);
      setError('');
    } catch (_) {
      setError('Impossible de charger les véhicules.');
    }
  }, [page, search, status, sortField, sortOrder]);
  useEffect(() => { load(); }, [load]);

  const setVehicleStatus = async (vehicle, nextStatus) => {
    const label = nextStatus === 'approved' ? 'approuver' : vehicle.status === 'pending' ? 'rejeter' : 'suspendre';
    if (!(await confirm({
      title: `Voulez-vous ${label} ce véhicule ?`,
      message: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
      confirmLabel: nextStatus === 'approved' ? 'Approuver' : vehicle.status === 'pending' ? 'Rejeter' : 'Suspendre',
      danger: nextStatus !== 'approved',
    }))) return;
    try {
      await adminVehiclesAPI.update(vehicle.id, { status: nextStatus });
      await load();
    } catch (_) { setError('La mise à jour du statut a échoué.'); }
  };

  const deleteVehicle = async (vehicle) => {
    if (!(await confirm({
      title: 'Supprimer ce véhicule ?',
      message: 'Les véhicules liés à des réservations ne peuvent pas être supprimés.',
      confirmLabel: 'Supprimer', danger: true,
    }))) return;
    try {
      await adminVehiclesAPI.delete(vehicle.id);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'La suppression a échoué.');
    }
  };

  return (
    <DashboardLayout title="Gestion des véhicules">
      <div className="mx-auto max-w-7xl space-y-5">
        <p className="text-sm text-slate-500">{count} véhicule(s) dans le catalogue</p>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder="Rechercher marque, modèle, immatriculation" />
          <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>{['Véhicule', 'Propriétaire', 'Catégorie', 'Tarif/jour', 'Statut', 'Actions'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                    <div className="text-xs text-slate-500">{vehicle.plate}</div>
                  </td>
                  <td className="px-4 py-3">{vehicle.owner_name || vehicle.owner}</td>
                  <td className="px-4 py-3">{vehicle.category}</td>
                  <td className="px-4 py-3">{Number(vehicle.daily_rate).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3">{STATUSES.find(([value]) => value === vehicle.status)?.[1] || vehicle.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button title="Modifier" className="rounded-lg p-2 text-blue-600" onClick={() => setEditing(vehicle)}><Edit3 size={16} /></button>
                      {vehicle.status === 'pending' && <button title="Approuver" className="rounded-lg p-2 text-emerald-600" onClick={() => setVehicleStatus(vehicle, 'approved')}><Check size={16} /></button>}
                      {vehicle.status !== 'suspended' && <button title={vehicle.status === 'pending' ? 'Rejeter' : 'Suspendre'} className="rounded-lg p-2 text-amber-600" onClick={() => setVehicleStatus(vehicle, 'suspended')}>{vehicle.status === 'pending' ? 'Rejeter' : 'Suspendre'}</button>}
                      <button title="Supprimer" className="rounded-lg p-2 text-red-600" onClick={() => deleteVehicle(vehicle)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && <p className="p-10 text-center text-slate-500">Aucun véhicule trouvé.</p>}
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span>Page {page} / {Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>Suivant</button>
            </div>
          </div>
        </div>
        {editing && <VehicleEditor vehicle={editing} onClose={() => setEditing(null)} onSaved={load} />}
      </div>
    </DashboardLayout>
  );
}
