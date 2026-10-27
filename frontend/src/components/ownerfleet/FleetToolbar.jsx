import React from 'react';
import { Search, ChevronDown, LayoutGrid, List } from 'lucide-react';

export const TABS = [
  { id: 'all',         label: 'Tous les véhicules' },
  { id: 'approved',    label: 'En ligne / Actifs' },
  { id: 'rented',      label: 'En location en ce moment' },
  { id: 'pending',     label: 'En attente de validation' },
  { id: 'maintenance', label: 'En maintenance' },
];

const matchTab = (v, tab) =>
  tab === 'all' ? true
  : tab === 'maintenance' ? ['maintenance', 'suspended'].includes(v.status)
  : v.status === tab;
export const filterByTab = (vehicles, tab) => vehicles.filter(v => matchTab(v, tab));

/* Onglets de filtre + barre de recherche / tri de la page flotte. */
export default function FleetToolbar({ vehicles, tab, setTab, search, setSearch, city, setCity, cities, sort, setSort, grid, setGrid }) {
  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => {
          const count = filterByTab(vehicles, t.id).length;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-700'}`}>
              {t.label}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Recherche + filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par modèle, marque, immatric…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
        </div>
        <div className="relative">
          <select value={city} onChange={e => setCity(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
            <option value="">Toutes les villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30">
            <option value="revenue">Tri : Revenus générés</option>
            <option value="rate">Tri : Tarif journalier</option>
            <option value="score">Tri : Score qualité</option>
            <option value="recent">Tri : Plus récents</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button onClick={() => setGrid(false)} title="Vue liste"
            className={`p-2.5 ${!grid ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={15} /></button>
          <button onClick={() => setGrid(true)} title="Vue grille"
            className={`p-2.5 ${grid ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={15} /></button>
        </div>
      </div>
    </div>
  );
}
