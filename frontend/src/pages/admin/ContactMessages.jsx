import React, { useCallback, useEffect, useState } from 'react';
import { Check, Mail, Phone, Search, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { contactMessagesAPI } from '../../services/api';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await contactMessagesAPI.list({ search, ordering, page_size: 100 });
      setMessages(data.results || data);
      setError('');
    } catch (_) {
      setError('Impossible de charger les messages de contact.');
    } finally {
      setLoading(false);
    }
  }, [ordering, search]);

  useEffect(() => {
    const timer = setTimeout(loadMessages, 250);
    return () => clearTimeout(timer);
  }, [loadMessages]);

  const toggleHandled = async (message) => {
    try {
      await contactMessagesAPI.update(message.id, { is_handled: !message.is_handled });
      setMessages(current => current.map(item => (
        item.id === message.id ? { ...item, is_handled: !item.is_handled } : item
      )));
    } catch (_) {
      setError('Impossible de mettre à jour ce message.');
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm(`Supprimer le message de ${message.first_name} ${message.last_name} ?`)) return;
    try {
      await contactMessagesAPI.delete(message.id);
      setMessages(current => current.filter(item => item.id !== message.id));
    } catch (_) {
      setError('Impossible de supprimer ce message.');
    }
  };

  return (
    <DashboardLayout title="Messages de contact">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">Demandes reçues depuis le formulaire public.</p>
          <label className="flex min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Rechercher un message"
              className="w-full text-sm outline-none"
            />
          </label>
          <select
            value={ordering}
            onChange={event => setOrdering(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            aria-label="Trier les messages"
          >
            <option value="-created_at">Plus récents</option>
            <option value="created_at">Plus anciens</option>
            <option value="last_name">Nom A–Z</option>
            <option value="-last_name">Nom Z–A</option>
          </select>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading ? (
          <div className="card text-center text-sm text-slate-500">Chargement des messages…</div>
        ) : messages.length === 0 ? (
          <div className="card text-center text-sm text-slate-500">Aucun message trouvé.</div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <article key={message.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">{message.first_name} {message.last_name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.is_handled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {message.is_handled ? 'Traité' : 'À traiter'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{new Date(message.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleHandled(message)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Check size={14} /> {message.is_handled ? 'Marquer à traiter' : 'Marquer traité'}
                    </button>
                    <button
                      onClick={() => deleteMessage(message)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                  <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1.5 hover:text-teal-700">
                    <Phone size={14} /> {message.phone}
                  </a>
                  {message.email && (
                    <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1.5 hover:text-teal-700">
                      <Mail size={14} /> {message.email}
                    </a>
                  )}
                  {message.rental_type && <span>{message.rental_type}</span>}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{message.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
