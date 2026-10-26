import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [position, setPosition] = useState('');

  useEffect(() => {
    vehiclesAPI.detail(id).then(({ data }) => setVehicle(data)).catch(() => setVehicle(null));
    if (isAuthenticated) vehiclesAPI.favorites().then(({ data }) => setFavorites(data.map(item => item.id))).catch(() => {});
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
    if (favorites.includes(vehicle.id)) {
      await vehiclesAPI.removeFavorite(vehicle.id);
      setFavorites(favorites.filter(item => item !== vehicle.id));
    } else {
      await vehiclesAPI.addFavorite(vehicle.id);
      setFavorites([...favorites, vehicle.id]);
    }
  };

  if (!vehicle) return <DashboardLayout title="Véhicule"><p className="text-center py-20">Chargement du véhicule…</p></DashboardLayout>;
  const media = (vehicle.photos || []).filter(item => !position || item.position === position);
  const selected = media[mediaIndex];
  return (
    <DashboardLayout title={`${vehicle.brand} ${vehicle.model}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <button className="btn-outline flex items-center gap-2" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Retour</button>
        <div className="grid md:grid-cols-2 gap-6">
          <section className="space-y-3">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100">
              {selected?.kind === 'video'
                ? <video className="w-full h-full object-cover" controls src={selected.image} />
                : <img className="w-full h-full object-cover" src={selected?.image || vehicle.image_url} alt={`${vehicle.brand} ${vehicle.model}`} />}
              <button onClick={toggleFavorite} className="absolute top-3 right-3 rounded-full bg-white p-3 shadow" aria-label="Ajouter aux favoris">
                <Heart className={favorites.includes(vehicle.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'} />
              </button>
            </div>
            <div className="flex gap-2">
              {[['', 'Tout'], ['exterior', 'Extérieur'], ['interior', 'Intérieur'], ['other', 'Autre']].map(([value, label]) => <button key={value} className={`px-3 py-1 rounded-full text-xs ${position === value ? 'bg-primary-600 text-white' : 'bg-slate-100'}`} onClick={() => { setPosition(value); setMediaIndex(0); }}>{label}</button>)}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {media.map((item, index) => <button key={item.id} onClick={() => setMediaIndex(index)} className="w-20 h-16 shrink-0 rounded overflow-hidden border">
                {item.kind === 'video' ? <video src={item.image} className="w-full h-full object-cover" /> : <img src={item.image} alt={item.caption || ''} className="w-full h-full object-cover" />}
              </button>)}
            </div>
          </section>
          <section className="card space-y-4">
            <div><h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model} ({vehicle.year})</h1><p className="text-slate-500 flex gap-1 items-center"><MapPin size={15} /> {vehicle.city}</p></div>
            <p className="text-xl font-bold text-primary-700">{Number(vehicle.daily_rate).toLocaleString()} F / jour</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">{[['Catégorie', vehicle.category], ['Carburant', vehicle.fuel], ['Places', vehicle.seats], ['Kilométrage', `${Number(vehicle.mileage || 0).toLocaleString()} km`], ['Caution', `${Number(vehicle.deposit_amount || 0).toLocaleString()} F`], ['Propriétaire', vehicle.owner_name], ['Note', vehicle.rating ? `${vehicle.rating}/5` : 'Nouveau']].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="font-semibold">{value || '—'}</dd></div>)}</dl>
            <p>{vehicle.description}</p>
            <button className="btn-primary w-full" onClick={() => isAuthenticated ? navigate(`/client/search?vehicle=${vehicle.id}`) : navigate(`/login?next=${encodeURIComponent(location.pathname)}`)}>Réserver</button>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
