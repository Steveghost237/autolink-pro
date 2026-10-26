import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { vehiclesAPI } from '../../services/api';

export default function Favorites() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('daily_rate');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
  const confirm = useConfirm();
  const load = useCallback(async () => {
    const { data } = await vehiclesAPI.favorites();
    setVehicles(data);
  }, []);
  useEffect(() => { load().catch(() => setVehicles([])); }, [load]);
  const visible = useMemo(() => vehicles.filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1) * (sortOrder === 'desc' ? -1 : 1)), [vehicles, search, sortField, sortOrder]);
  const remove = async (vehicle) => {
    if (!(await confirm({ title: 'Retirer des favoris', message: `Retirer ${vehicle.brand} ${vehicle.model} de vos favoris ?`, confirmLabel: 'Retirer', danger: true }))) return;
    await vehiclesAPI.removeFavorite(vehicle.id);
    setVehicles(items => items.filter(item => item.id !== vehicle.id));
  };
  return <DashboardLayout title="Mes favoris">
    <div className="max-w-5xl mx-auto space-y-5">
      <ListToolbar search={search} onSearchChange={setSearch} sortField={sortField} onSortFieldChange={setSortField} sortOrder={sortOrder} onSortOrderChange={setSortOrder} sortOptions={[{ value: 'daily_rate', label: 'Prix' }, { value: 'year', label: 'Année' }, { value: 'rating', label: 'Note' }]} />
      {visible.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{visible.map(v => <article key={v.id} className="card p-0 overflow-hidden">
        <button className="w-full text-left" onClick={() => navigate(`/vehicles/${v.id}`)}><img className="w-full h-44 object-cover" src={v.image_url || v.photos?.[0]?.image} alt={`${v.brand} ${v.model}`} /><div className="p-4"><h2 className="font-bold">{v.brand} {v.model} {v.year}</h2><p className="text-primary-700 font-semibold">{Number(v.daily_rate).toLocaleString()} F / jour</p></div></button>
        <button className="m-4 mt-0 btn-outline flex gap-2 items-center" onClick={() => remove(v)}><Trash2 size={15} /> Retirer des favoris</button>
      </article>)}</div> : <p className="text-center py-16 text-slate-500"><Heart className="mx-auto mb-2" /> Aucun favori pour le moment.</p>}
    </div>
  </DashboardLayout>;
}
