import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { uiText } from '../i18n';

export default function ListToolbar({
  search = '',
  onSearchChange,
  sortField = '',
  onSortFieldChange,
  sortOrder = 'desc',
  onSortOrderChange,
  sortOptions = [],
  placeholder = 'Rechercher…',
  className = '',
}) {
  const [searchText, setSearchText] = useState(search);
  const timer = useRef(null);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const updateSearch = (value) => {
    setSearchText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearchChange?.(value), 250);
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <label className="flex min-w-52 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <Search size={16} className="shrink-0 text-slate-400" />
        <input
          type="search"
          value={searchText}
          onChange={event => updateSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={uiText("components.ListToolbar", "Rechercher dans la liste")}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        />
      </label>
      {sortOptions.length > 0 && (
        <>
          <select
            value={sortField}
            onChange={event => onSortFieldChange?.(event.target.value)}
            aria-label={uiText("components.ListToolbar", "Trier par")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSortOrderChange?.(sortOrder === 'asc' ? 'desc' : 'asc')}
            aria-label={sortOrder === 'asc' ? uiText("components.ListToolbar", "Ordre croissant") : uiText("components.ListToolbar", "Ordre décroissant")}
            title={sortOrder === 'asc' ? uiText("components.ListToolbar", "Ordre croissant") : uiText("components.ListToolbar", "Ordre décroissant")}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          </button>
        </>
      )}
    </div>
  );
}
