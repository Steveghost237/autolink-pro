import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

const VEHICLES = [
  { id: 1, name: 'Toyota RAV4 AWD Hybrid 2022', city: 'Douala — Akwa', cat: 'SUV', gamme: 'Premium', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', price: '45 000', score: '9.7', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', badge: 'Inspecté' },
  { id: 2, name: 'Porsche Panamera 2023', city: 'Douala — Bonanjo', cat: 'Berline', gamme: 'Super Luxe', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', price: '250 000', score: '9.8', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', badge: 'Inspecté' },
  { id: 3, name: 'Toyota Corolla 2021', city: 'Yaoundé — Bastos', cat: 'Berline', gamme: 'Économique', seats: 5, fuel: 'Essence', gearbox: 'Manuelle', price: '22 000', score: '9.2', img: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', badge: 'Inspecté' },
  { id: 4, name: 'Mercedes Classe S 500 2023', city: 'Douala — Bonapriso', cat: 'Berline', gamme: 'Luxe', seats: 5, fuel: 'Hybride', gearbox: 'Automatique', price: '151 200', score: '9.8', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', badge: 'Inspecté' },
  { id: 5, name: 'Toyota Land Cruiser Prado 2022', city: 'Douala — Bonabéri', cat: 'SUV', gamme: 'Premium', seats: 7, fuel: 'Diesel', gearbox: 'Automatique', price: '75 000', score: '9.6', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', badge: 'Inspecté' },
  { id: 6, name: 'BMW X7 2023', city: 'Yaoundé — Nkolbisson', cat: 'SUV', gamme: 'Luxe', seats: 7, fuel: 'Essence', gearbox: 'Automatique', price: '130 000', score: '9.6', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', badge: 'Inspecté' },
];
const GAMMES = ['Toutes les gammes', 'Économique', 'Intermédiaire', 'Premium', 'Luxe', 'Super Luxe'];
const CATS = ['Toutes', 'Berline', 'SUV', 'Pick-up', 'Van', 'Minibus'];

export default function CatalogueDesign() {
  const [gamme, setGamme] = useState(0);
  const [cat, setCat] = useState(0);
  const list = VEHICLES.filter(v => (gamme === 0 || v.gamme === GAMMES[gamme]) && (cat === 0 || v.cat === CATS[cat]));
  return (
    <DesignShell role="client">
      <div className="space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Catalogue de véhicules</h1>
            <p className="text-body-md text-on-surface-variant">Flotte inspectée 40 points — caution sous séquestre CEMAC.</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md"><Icon name="verified_user" size={16} />{list.length} véhicule(s)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {GAMMES.map((g, i) => <button key={g} onClick={() => setGamme(i)} className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${i === gamme ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}>{g}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c, i) => <button key={c} onClick={() => setCat(i)} className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all ${i === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}>{c}</button>)}
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map(v => (
            <article key={v.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-shadow border border-outline-variant/20">
              <div className="relative h-44">
                <img src={v.img} alt={v.name} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-on-primary text-[11px] font-label-sm backdrop-blur"><Icon name="verified" size={13} />{v.badge} {v.score}/10</span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-on-surface/80 text-surface text-[11px] font-label-sm">{v.gamme}</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm"><Icon name="location_on" size={14} />{v.city}<span className="ml-auto inline-flex items-center gap-1 text-primary"><Icon name="star" size={14} fill />Nouveau</span></div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{v.name}</h3>
                <div className="flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="inline-flex items-center gap-1"><Icon name="airline_seat_recline_normal" size={15} />{v.seats} pl.</span>
                  <span className="inline-flex items-center gap-1"><Icon name="local_gas_station" size={15} />{v.fuel}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="category" size={15} />{v.cat}</span>
                  <span className="inline-flex items-center gap-1"><Icon name="person" size={15} />Chauffeur</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
                  <div><p className="font-label-sm text-label-sm text-on-surface-variant">Total pour 24h</p><p className="font-headline-md text-headline-md text-primary font-bold">{v.price} <span className="text-body-sm font-normal">FCFA</span></p></div>
                  <Link to="/client/booking/recap" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md hover:shadow-lg transition-all">Réserver<Icon name="arrow_forward" size={16} /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </DesignShell>
  );
}
