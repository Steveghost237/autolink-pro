import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Camera, Car, ClipboardList, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { inspectionsAPI } from '../../services/api';
import { formatDateTime, formatNumber,  uiText } from '../../i18n';

const INSPECTION_ITEMS = {
  exterior: {
    label: uiText("pages.admin.VehicleInspection", "Extérieur"),
    items: ["Carrosserie avant", "Carrosserie arrière", "Côté gauche", "Côté droit", "Toit", "Pare-brise avant", "Pare-brise arrière", "Jantes et pneus", "Rétroviseurs", "Feux avant", "Feux arrière", "Plaque immatriculation"].map(item => uiText("pages.admin.VehicleInspection", item)),
  },
  interior: {
    label: uiText("pages.admin.VehicleInspection", "Intérieur"),
    items: ["Tableau de bord", "Sièges avant", "Sièges arrière", "Tapis de sol", "Volant", "Ceintures de sécurité", "Climatisation", "Autoradio / GPS", "Rétroviseur intérieur", "Coffre"].map(item => uiText("pages.admin.VehicleInspection", item)),
  },
  mechanical: {
    label: uiText("pages.admin.VehicleInspection", "Mécanique"),
    items: ["Niveau huile moteur", "Liquide refroidissement", "Liquide frein", "Batterie", "Freins avant", "Freins arrière", "Suspension", "Direction", "Boîte de vitesses", "Pot d’échappement"].map(item => uiText("pages.admin.VehicleInspection", item)),
  },
  documents: {
    label: uiText("pages.admin.VehicleInspection", "Documents"),
    items: ["Carte grise", "Assurance à jour", "Visite technique", "Kit sécurité", "Extincteur", "Roue de secours"].map(item => uiText("pages.admin.VehicleInspection", item)),
  },
};

const QUEUE_SORT = [
  { value: 'start_date', label: uiText("pages.admin.VehicleInspection", "Début de réservation") },
  { value: 'end_date', label: uiText("pages.admin.VehicleInspection", "Fin de réservation") },
  { value: 'vehicle__brand', label: uiText("pages.admin.VehicleInspection", "Véhicule") },
];
const INSPECTION_SORT = [
  { value: 'inspection_date', label: uiText("pages.admin.VehicleInspection", "Date") },
  { value: 'condition_score', label: uiText("pages.admin.VehicleInspection", "Score") },
  { value: 'mileage_at_inspection', label: uiText("pages.admin.VehicleInspection", "Kilométrage") },
];

function InspectionForm({ booking, onClose, onSaved }) {
  const items = useMemo(() => Object.values(INSPECTION_ITEMS).flatMap(category => category.items), []);
  const [checks, setChecks] = useState({});
  const [fuel, setFuel] = useState(Number(booking.fuel_level || 0));
  const [mileage, setMileage] = useState(String(booking.mileage || 0));
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const passed = Object.values(checks).filter(value => value === 'ok').length;
  const score = items.length ? Math.round(passed / items.length * 100) : 0;

  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const values = {
      booking: booking.id,
      vehicle: booking.vehicle_id,
      inspection_type: booking.inspection_type,
      mileage_at_inspection: Number(mileage),
      fuel_level: fuel,
      condition_score: score,
      checklist: checks,
      issues: Object.entries(checks).filter(([, value]) => value === 'nok').map(([item]) => item),
      notes,
    };
    try {
      if (photos.length) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        photos.forEach(photo => formData.append('uploaded_photos', photo));
        await inspectionsAPI.create(formData);
      } else {
        await inspectionsAPI.create(values);
      }
      onSaved();
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.VehicleInspection", "Impossible d’enregistrer la fiche. Vérifiez les champs."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <form onSubmit={submit} className="mx-auto my-6 max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between rounded-t-2xl border-b bg-white p-5">
          <div>
            <h2 className="font-bold">{uiText("pages.admin.VehicleInspection", "Fiche d’inspection —") + " "}{booking.inspection_type === 'entry' ? uiText("pages.admin.VehicleInspection", "entrée") : uiText("pages.admin.VehicleInspection", "sortie")}</h2>
            <p className="text-sm text-on-surface-variant">{booking.vehicle}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{booking.plate}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{booking.client}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{booking.booking_reference}</p>
          </div>
          <button type="button" aria-label={uiText("pages.admin.VehicleInspection", "Fermer")} onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="label">{uiText("pages.admin.VehicleInspection", "Kilométrage") + " "}<input required min="0" type="number" className="input-field mt-1" value={mileage} onChange={event => setMileage(event.target.value)} />
            </label>
            <label className="label">{uiText("pages.admin.VehicleInspection", "Carburant (")}{fuel}{uiText("pages.admin.VehicleInspection", "%)") + " "}<input type="range" min="0" max="100" className="mt-3 w-full" value={fuel} onChange={event => setFuel(Number(event.target.value))} />
            </label>
          </div>
          <div className="rounded-xl bg-surface-container-low dark:bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{uiText("pages.admin.VehicleInspection", "État général")}</h3><strong>{score}{uiText("pages.admin.VehicleInspection", "/100")}</strong></div>
            <div className="space-y-5">
              {Object.entries(INSPECTION_ITEMS).map(([key, category]) => (
                <section key={key}>
                  <h4 className="mb-2 text-sm font-semibold">{category.label}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {category.items.map(item => (
                      <label key={item} className="flex items-center justify-between gap-2 rounded-lg bg-white p-2 text-sm">
                        <span>{item}</span>
                        <select className="input-field w-28 py-1" value={checks[item] || ''} required onChange={event => setChecks(current => ({ ...current, [item]: event.target.value }))}>
                          <option value="" disabled>{uiText("pages.admin.VehicleInspection", "État")}</option><option value="ok">{uiText("pages.admin.VehicleInspection", "Bon")}</option><option value="nok">{uiText("pages.admin.VehicleInspection", "À signaler")}</option>
                        </select>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
          <label className="label">{uiText("pages.admin.VehicleInspection", "Photos de l’inspection") + " "}<input type="file" accept="image/*" multiple className="input-field mt-1" onChange={event => setPhotos(Array.from(event.target.files || []))} />
          </label>
          <label className="label">{uiText("pages.admin.VehicleInspection", "Notes") + " "}<textarea className="input-field mt-1" rows="3" value={notes} onChange={event => setNotes(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-lg bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        </div>
        <div className="flex gap-3 border-t p-5">
          <button type="button" onClick={onClose} className="btn-outline flex-1">{uiText("pages.admin.VehicleInspection", "Annuler")}</button>
          <button disabled={saving} className="btn-primary flex-1">{saving ? uiText("pages.admin.VehicleInspection", "Enregistrement…") : uiText("pages.admin.VehicleInspection", "Enregistrer la fiche")}</button>
        </div>
      </form>
    </div>
  );
}

function Pagination({ page, count, onPageChange }) {
  const pages = Math.max(1, Math.ceil(count / 20));
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{uiText("pages.admin.VehicleInspection", "Page") + " "}{page}{" " + uiText("pages.admin.VehicleInspection", "/") + " "}{pages}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{count}{" " + uiText("pages.admin.VehicleInspection", "résultat(s)")}</span>
      <div className="flex gap-2">
        <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>{uiText("pages.admin.VehicleInspection", "Précédent")}</button>
        <button className="btn-outline px-3 py-1" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>{uiText("pages.admin.VehicleInspection", "Suivant")}</button>
      </div>
    </div>
  );
}

export default function VehicleInspection() {
  const [tab, setTab] = useState('entry');
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('start_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const params = {
        page, page_size: 20, search: search.trim(),
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      };
      const { data } = tab === 'completed'
        ? await inspectionsAPI.list(params)
        : await inspectionsAPI.queue({ ...params, type: tab });
      setItems(data.results || []);
      setCount(data.count || 0);
      setError('');
    } catch (_) {
      setError(uiText("pages.admin.VehicleInspection", "Impossible de charger les inspections."));
    }
  }, [page, search, sortField, sortOrder, tab]);
  useEffect(() => { load(); }, [load]);

  const changeTab = value => {
    setTab(value);
    setPage(1);
    setSearch('');
    setSortField(value === 'completed' ? 'inspection_date' : 'start_date');
  };

  return (
    <DashboardLayout title={uiText("pages.admin.VehicleInspection", "Inspections véhicules")}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="card flex flex-wrap gap-2">
          {[
            ['entry', uiText("pages.admin.VehicleInspection", "Fiches d’entrée")],
            ['exit', uiText("pages.admin.VehicleInspection", "Fiches de sortie")],
            ['completed', uiText("pages.admin.VehicleInspection", "Inspections enregistrées")],
          ].map(([value, label]) => (
            <button key={value} onClick={() => changeTab(value)} className={tab === value ? uiText("pages.admin.VehicleInspection", "btn-primary") : uiText("pages.admin.VehicleInspection", "btn-outline")}>{label}</button>
          ))}
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <div className="card">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={tab === 'completed' ? INSPECTION_SORT : QUEUE_SORT}
            placeholder={uiText("pages.admin.VehicleInspection", "Rechercher véhicule, client, plaque")} />
        </div>
        <div className="space-y-3">
          {tab !== 'completed' ? items.map(booking => (
            <article key={booking.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold"><Car size={16} className="mr-2 inline" />{booking.vehicle}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{booking.plate}</h2>
                <p className="text-sm text-on-surface-variant">{booking.client}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{booking.booking_reference}</p>
                <p className="text-xs text-on-surface-variant">{formatDateTime(booking.start_date)}{" " + uiText("pages.admin.VehicleInspection", "—") + " "}{formatDateTime(booking.end_date)}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{formatNumber(booking.mileage)}{" " + uiText("pages.admin.VehicleInspection", "km · Carburant") + " "}{booking.fuel_level}{uiText("pages.admin.VehicleInspection", "%")}</p>
              </div>
              <button className="btn-primary flex items-center gap-2" onClick={() => setSelected(booking)}><ClipboardList size={16} />{" " + uiText("pages.admin.VehicleInspection", "Inspecter")}</button>
            </article>
          )) : items.map(inspection => (
            <article key={inspection.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{inspection.inspection_type === 'entry' ? uiText("pages.admin.VehicleInspection", "Entrée") : uiText("pages.admin.VehicleInspection", "Sortie")}{" " + uiText("pages.admin.VehicleInspection", "·") + " "}{inspection.vehicle_name}{" " + uiText("pages.admin.VehicleInspection", "(")}{inspection.vehicle_plate}{uiText("pages.admin.VehicleInspection", ")")}</h2>
                  <p className="text-sm text-on-surface-variant">{formatDateTime(new Date(inspection.inspection_date))}{" " + uiText("pages.admin.VehicleInspection", "· Contrôleur :") + " "}{inspection.controller_name || uiText("pages.admin.VehicleInspection", "—")}</p>
                  <p className="text-sm text-on-surface-variant">{inspection.mileage_at_inspection}{" " + uiText("pages.admin.VehicleInspection", "km · Carburant") + " "}{inspection.fuel_level}{uiText("pages.admin.VehicleInspection", "% ·") + " "}{inspection.issues?.length || 0}{" " + uiText("pages.admin.VehicleInspection", "remarque(s)")}</p>
                </div>
                <strong>{inspection.condition_score}{uiText("pages.admin.VehicleInspection", "/100")}</strong>
              </div>
              {inspection.notes && <p className="mt-3 text-sm">{inspection.notes}</p>}
              {inspection.photos?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{inspection.photos.map(photo => <a key={photo.id} href={photo.image} target="_blank" rel="noreferrer" className="text-sm text-primary-700"><Camera size={14} className="mr-1 inline" />{photo.caption}</a>)}</div>}
            </article>
          ))}
          {items.length === 0 && <div className="card py-12 text-center text-on-surface-variant">{uiText("pages.admin.VehicleInspection", "Aucune inspection à afficher.")}</div>}
        </div>
        <Pagination page={page} count={count} onPageChange={setPage} />
      </div>
      {selected && <InspectionForm booking={selected} onClose={() => setSelected(null)} onSaved={load} />}
    </DashboardLayout>
  );
}
