import React, { useCallback, useEffect, useState } from 'react';
import { Check, Mail, Phone, Search, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useConfirm } from '../../contexts/ConfirmContext';
import { contactMessagesAPI } from '../../services/api';
import { formatDateTime,  uiText } from '../../i18n';

export default function ContactMessages() {
  const confirm = useConfirm();
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
      setError(uiText("pages.admin.ContactMessages", "Impossible de charger les messages de contact."));
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
      setError(uiText("pages.admin.ContactMessages", "Impossible de mettre à jour ce message."));
    }
  };

  const deleteMessage = async (message) => {
    const confirmed = await confirm({
      title: uiText("pages.admin.ContactMessages", "Supprimer ce message ?"),
      message: uiText("pages.admin.ContactMessages", "Le message de {{name}} sera supprimé définitivement.", { name: `${message.first_name} ${message.last_name}` }),
      confirmLabel: uiText("pages.admin.ContactMessages", "Supprimer"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await contactMessagesAPI.delete(message.id);
      setMessages(current => current.filter(item => item.id !== message.id));
    } catch (_) {
      setError(uiText("pages.admin.ContactMessages", "Impossible de supprimer ce message."));
    }
  };

  return (
    <DashboardLayout title={uiText("pages.admin.ContactMessages", "Messages de contact")}>
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">{uiText("pages.admin.ContactMessages", "Demandes reçues depuis le formulaire public.")}</p>
          <label className="flex min-w-64 items-center gap-2 rounded-xl border border-outline-variant/40 bg-white px-3 py-2">
            <Search size={16} className="text-on-surface-variant" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={uiText("pages.admin.ContactMessages", "Rechercher un message")}
              className="w-full text-sm outline-none"
            />
          </label>
          <select
            value={ordering}
            onChange={event => setOrdering(event.target.value)}
            className="rounded-xl border border-outline-variant/40 bg-white px-3 py-2 text-sm"
            aria-label={uiText("pages.admin.ContactMessages", "Trier les messages")}
          >
            <option value="-created_at">{uiText("pages.admin.ContactMessages", "Plus récents")}</option>
            <option value="created_at">{uiText("pages.admin.ContactMessages", "Plus anciens")}</option>
            <option value="last_name">{uiText("pages.admin.ContactMessages", "Nom A–Z")}</option>
            <option value="-last_name">{uiText("pages.admin.ContactMessages", "Nom Z–A")}</option>
          </select>
        </div>
        {error && <p className="rounded-lg bg-error-container/50 px-4 py-3 text-sm text-error">{error}</p>}
        {loading ? (
          <div className="card text-center text-sm text-on-surface-variant">{uiText("pages.admin.ContactMessages", "Chargement des messages…")}</div>
        ) : messages.length === 0 ? (
          <div className="card text-center text-sm text-on-surface-variant">{uiText("pages.admin.ContactMessages", "Aucun message trouvé.")}</div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <article key={message.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-on-surface dark:text-white">{message.first_name} {message.last_name}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.is_handled ? 'bg-primary-fixed/40 text-primary' : 'bg-tertiary-fixed-dim/60 text-tertiary'}`}>
                        {message.is_handled ? uiText("pages.admin.ContactMessages", "Traité") : uiText("pages.admin.ContactMessages", "À traiter")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-on-surface-variant">{formatDateTime(new Date(message.created_at))}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleHandled(message)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low dark:bg-slate-900"
                    >
                      <Check size={14} /> {message.is_handled ? uiText("pages.admin.ContactMessages", "Marquer à traiter") : uiText("pages.admin.ContactMessages", "Marquer traité")}
                    </button>
                    <button
                      onClick={() => deleteMessage(message)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-error/30 px-3 py-2 text-xs font-semibold text-error hover:bg-error-container/50"
                    >
                      <Trash2 size={14} />{" " + uiText("pages.admin.ContactMessages", "Supprimer") + " "}</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-variant">
                  <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                    <Phone size={14} /> {message.phone}
                  </a>
                  {message.email && (
                    <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                      <Mail size={14} /> {message.email}
                    </a>
                  )}
                  {message.rental_type && <span>{message.rental_type}</span>}
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-on-surface dark:text-white">{message.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
