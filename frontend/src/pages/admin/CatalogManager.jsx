import React, { useCallback, useEffect, useState } from 'react';
import { Check, Edit3, Trash2, X, Download } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { adminVehiclesAPI } from '../../services/api';
import { formatNumber, uiText, vehicleLabel } from '../../i18n';

const SORT_OPTIONS = [
  { value: 'created_at', label: uiText("pages.admin.CatalogManager", "Date d’ajout") },
  { value: 'brand', label: uiText("pages.admin.CatalogManager", "Marque") },
  { value: 'model', label: uiText("pages.admin.CatalogManager", "Modèle") },
  { value: 'year', label: uiText("pages.admin.CatalogManager", "Année") },
  { value: 'daily_rate', label: uiText("pages.admin.CatalogManager", "Tarif") },
  { value: 'status', label: uiText("pages.admin.CatalogManager", "Statut") },
];
const STATUSES = [
  ['pending'], ['approved'], ['suspended'], ['rented'], ['maintenance'],
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
      setError(requestError.response?.data?.detail || uiText("pages.admin.CatalogManager", "La modification a échoué."));
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={save} className="card max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{uiText("pages.admin.CatalogManager", "Modifier le véhicule")}</h2><button type="button" onClick={onClose}><X /></button></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['brand', uiText("pages.admin.CatalogManager", "Marque")], ['model', uiText("pages.admin.CatalogManager", "Modèle")], ['year', uiText("pages.admin.CatalogManager", "Année")], ['plate', uiText("pages.admin.CatalogManager", "Immatriculation")],
            ['category', uiText("pages.admin.CatalogManager", "Catégorie")], ['fuel', uiText("pages.admin.CatalogManager", "Carburant")], ['seats', uiText("pages.admin.CatalogManager", "Places")], ['color', uiText("pages.admin.CatalogManager", "Couleur")],
            ['daily_rate', uiText("pages.admin.CatalogManager", "Tarif journalier (FCFA)")],
          ].map(([key, label]) => (
            <label key={key} className="text-sm">{label}
              <input required className="input-field mt-1" type={['year', 'seats', 'daily_rate'].includes(key) ? uiText("pages.admin.CatalogManager", "number") : uiText("pages.admin.CatalogManager", "text")}
                value={form[key] ?? ''} onChange={event => setForm(value => ({ ...value, [key]: event.target.value }))} />
            </label>
          ))}
          <label className="text-sm">{uiText("pages.admin.CatalogManager", "Statut") + " "}<select className="input-field mt-1" value={form.status} onChange={event => setForm(value => ({ ...value, status: event.target.value }))}>
              {STATUSES.map(([value]) => <option key={value} value={value}>{vehicleLabel(value, 'status')}</option>)}
            </select>
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2"><button type="button" className="btn-outline flex-1" onClick={onClose}>{uiText("pages.admin.CatalogManager", "Annuler")}</button><button className="btn-primary flex-1">{uiText("pages.admin.CatalogManager", "Enregistrer")}</button></div>
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
      setError(uiText("pages.admin.CatalogManager", "Impossible de charger les véhicules."));
    }
  }, [page, search, status, sortField, sortOrder]);
  useEffect(() => { load(); }, [load]);

  const exportToExcel = async () => {
    try {
      const { data } = await adminVehiclesAPI.list({
        page_size: 1000, search: search.trim(), status: status || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      const rows = data.results || [];
      const headers = ['Marque', 'Modèle', 'Année', 'Immatriculation', 'Catégorie', 'Carburant', 'Places', 'Couleur', 'Tarif', 'Statut', 'Propriétaire', 'Ville'];
      const csvContent = [
        headers.join(','),
        ...rows.map(v => [
          v.brand || '',
          v.model || '',
          v.year || '',
          v.plate || '',
          v.category || '',
          v.fuel || '',
          v.seats || '',
          v.color || '',
          v.daily_rate || '',
          v.status || '',
          v.owner_name || '',
          v.city || '',
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `vehicules_autolink_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setError(uiText("pages.admin.CatalogManager", "L'export a échoué."));
    }
  };

  const setVehicleStatus = async (vehicle, nextStatus) => {
    const label = nextStatus === 'approved' ? uiText("pages.admin.CatalogManager", "approuver") : vehicle.status === 'pending' ? uiText("pages.admin.CatalogManager", "rejeter") : uiText("pages.admin.CatalogManager", "suspendre");
    if (!(await confirm({
      title: uiText("pages.admin.CatalogManager", "Voulez-vous {{action}} ce véhicule ?", { action: label }),
      message: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
      confirmLabel: nextStatus === 'approved' ? uiText("pages.admin.CatalogManager", "Approuver") : vehicle.status === 'pending' ? uiText("pages.admin.CatalogManager", "Rejeter") : uiText("pages.admin.CatalogManager", "Suspendre"),
      danger: nextStatus !== 'approved',
    }))) return;
    try {
      await adminVehiclesAPI.update(vehicle.id, { status: nextStatus });
      await load();
    } catch (_) { setError(uiText("pages.admin.CatalogManager", "La mise à jour du statut a échoué.")); }
  };

  const deleteVehicle = async (vehicle) => {
    if (!(await confirm({
      title: uiText("pages.admin.CatalogManager", "Supprimer ce véhicule ?"),
      message: uiText("pages.admin.CatalogManager", "Les véhicules liés à des réservations ne peuvent pas être supprimés."),
      confirmLabel: uiText("pages.admin.CatalogManager", "Supprimer"), danger: true,
    }))) return;
    try {
      await adminVehiclesAPI.delete(vehicle.id);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.CatalogManager", "La suppression a échoué."));
    }
  };

  return (
    <DashboardLayout title={uiText("pages.admin.CatalogManager", "Gestion des véhicules")}>
      <div className="mx-auto max-w-7xl space-y-5">
        <p className="text-sm text-slate-500">{count}{" " + uiText("pages.admin.CatalogManager", "véhicule(s) dans le catalogue")}</p>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="card flex flex-wrap items-center gap-3">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={SORT_OPTIONS} placeholder={uiText("pages.admin.CatalogManager", "Rechercher marque, modèle, immatriculation")} />
          <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
            <option value="">{uiText("pages.admin.CatalogManager", "Tous les statuts")}</option>
            {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button onClick={exportToExcel} className="btn-outline flex items-center gap-2 text-sm">
            <Download size={16} />{uiText("pages.admin.CatalogManager", "Exporter Excel")}
          </button>
        </div>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>{["Véhicule", "Propriétaire", "Catégorie", "Tarif/jour", "Statut", "Actions"].map(label => <th key={label} className="px-4 py-3">{uiText("pages.admin.CatalogManager", label)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{vehicle.brand} {vehicle.model}{" " + uiText("pages.admin.CatalogManager", "(")}{vehicle.year}{uiText("pages.admin.CatalogManager", ")")}</div>
                    <div className="text-xs text-slate-500">{vehicle.plate}</div>
                  </td>
                  <td className="px-4 py-3">{vehicle.owner_name || vehicle.owner}</td>
                  <td className="px-4 py-3">{vehicleLabel(vehicle.category, 'category')}</td>
                  <td className="px-4 py-3">{formatNumber(Number(vehicle.daily_rate))}{" " + uiText("pages.admin.CatalogManager", "FCFA")}</td>
                  <td className="px-4 py-3">{vehicleLabel(vehicle.status, 'status')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button title={uiText("pages.admin.CatalogManager", "Modifier")} className="rounded-lg p-2 text-blue-600" onClick={() => setEditing(vehicle)}><Edit3 size={16} /></button>
                      {vehicle.status === 'pending' && <button title={uiText("pages.admin.CatalogManager", "Approuver")} className="rounded-lg p-2 text-emerald-600" onClick={() => setVehicleStatus(vehicle, 'approved')}><Check size={16} /></button>}
                      {vehicle.status !== 'suspended' && <button title={vehicle.status === 'pending' ? uiText("pages.admin.CatalogManager", "Rejeter") : uiText("pages.admin.CatalogManager", "Suspendre")} className="rounded-lg p-2 text-amber-600" onClick={() => setVehicleStatus(vehicle, 'suspended')}>{vehicle.status === 'pending' ? uiText("pages.admin.CatalogManager", "Rejeter") : uiText("pages.admin.CatalogManager", "Suspendre")}</button>}
                      <button title={uiText("pages.admin.CatalogManager", "Supprimer")} className="rounded-lg p-2 text-red-600" onClick={() => deleteVehicle(vehicle)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && <p className="p-10 text-center text-slate-500">{uiText("pages.admin.CatalogManager", "Aucun véhicule trouvé.")}</p>}
          <div className="flex items-center justify-between border-t p-4 text-sm">
            <span>{uiText("pages.admin.CatalogManager", "Page") + " "}{page}{" " + uiText("pages.admin.CatalogManager", "/") + " "}{Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.CatalogManager", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.CatalogManager", "Suivant")}</button>
            </div>
          </div>
        </div>
        {editing && <VehicleEditor vehicle={editing} onClose={() => setEditing(null)} onSaved={load} />}
      </div>
    </DashboardLayout>
  );
}
