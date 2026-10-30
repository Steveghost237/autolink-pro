import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { messagingAPI } from '../services/api';
import { formatDate, formatTime, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Messaging', text, options);

const FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'CLIENT', label: 'Clients' },
  { value: 'DRIVER', label: 'Chauffeurs' },
  { value: 'OWNER', label: 'Propriétaires' },
  { value: 'support', label: 'Support' },
];

const QUICK_REPLIES = ["Je serai là à l'heure", 'Pouvez-vous m’appeler ?', 'Préciser le point de rendez-vous', 'Merci beaucoup !'];

const ROLE_LABELS = { CLIENT: 'Client', OWNER: 'Propriétaire', DRIVER: 'Chauffeur', ADMIN: 'Support AutoLink', CONTROLLER: 'Contrôleur AutoLink' };

const BOOKING_STATUS = { pending: 'En attente', confirmed: 'Confirmée', active: 'En cours', completed: 'Terminée', cancelled: 'Annulée', disputed: 'Litige' };

const BOOKING_PATHS = { CLIENT: '/client/bookings/', OWNER: '/owner/bookings/', DRIVER: '/driver/bookings/', ADMIN: '/admin/bookings/' };

const initialsOf = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'AL';

const conversationTitle = (conversation) => {
  if (conversation.kind === 'support') return t('Support AutoLink');
  const names = conversation.participants.map((p) => p.name).join(', ');
  return names || conversation.subject || t('Conversation');
};

const shortTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return formatTime(date);
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return t('Hier');
  return formatDate(date, { day: 'numeric', month: 'short' });
};

export default function Messaging() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await messagingAPI.conversations({ page_size: 100 });
      setConversations(data.results || data || []);
      setError('');
    } catch (_) {
      setError(t('API injoignable — messagerie indisponible.'));
    }
    setLoaded(true);
  }, []);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await messagingAPI.messages(id);
      setMessages(data);
      setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c)));
    } catch (_) {}
  }, []);

  // Ouverture directe depuis une réservation (?booking=ID) ou le support (?support=1)
  useEffect(() => {
    const booking = searchParams.get('booking');
    const support = searchParams.get('support');
    const open = async () => {
      if (booking || support) {
        try {
          const { data } = await messagingAPI.open(booking ? { booking } : { support: true });
          setActiveId(data.id);
          setSearchParams({}, { replace: true });
        } catch (e) {
          setError(e.response?.data?.detail || t('Impossible d’ouvrir cette conversation.'));
        }
      }
      loadConversations();
    };
    open();
  }, [searchParams, setSearchParams, loadConversations]);

  useEffect(() => {
    if (!activeId && conversations.length && window.innerWidth >= 1024) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  useEffect(() => {
    loadMessages(activeId);
    const timer = setInterval(() => { loadMessages(activeId); loadConversations(); }, 15000);
    return () => clearInterval(timer);
  }, [activeId, loadMessages, loadConversations]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'support' && c.kind !== 'support') return false;
      if (filter && filter !== 'support' && !c.participants?.some((p) => p.role === filter)) return false;
      if (!query) return true;
      return [
        conversationTitle(c), c.subject, c.booking_label, c.last_message?.content,
      ].some((v) => String(v || '').toLowerCase().includes(query));
    });
  }, [conversations, filter, search]);

  const active = conversations.find((c) => c.id === activeId);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  const counterpart = active?.participants?.[0];

  const send = async (text = draft) => {
    if (!active || (!text.trim() && !attachment)) return;
    setSending(true);
    try {
      let payload = { content: text.trim() };
      if (attachment) {
        payload = new FormData();
        payload.append('content', text.trim());
        payload.append('attachment', attachment);
      }
      const { data } = await messagingAPI.send(active.id, payload);
      setMessages((list) => [...list, data]);
      setDraft(''); setAttachment(null);
      loadConversations();
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.non_field_errors?.[0] || t('Message non envoyé.'));
    }
    setSending(false);
  };

  const openSupport = async () => {
    try {
      const { data } = await messagingAPI.open({ support: true });
      setActiveId(data.id);
      loadConversations();
    } catch (e) { setError(e.response?.data?.detail || t('Impossible d’ouvrir le support.')); }
  };

  const groups = [];
  messages.forEach((message) => {
    const day = new Date(message.created_at).toDateString();
    const last = groups[groups.length - 1];
    if (!last || last.day !== day) groups.push({ day, date: message.created_at, items: [message] });
    else last.items.push(message);
  });

  return (
    <DashboardLayout title={t('Messagerie & Échanges')}>
      {error && <div className="mb-4 rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] rounded-xl overflow-hidden bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-outline-variant/30 dark:border-slate-800 h-[calc(100vh-12rem)] min-h-[560px]">
        <aside className={`flex flex-col border-r border-outline-variant/30 dark:border-slate-800 min-h-0 ${active ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Messages')}</h3>
                {totalUnread > 0 && <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">{t('{{count}} non lu(s)', { count: totalUnread })}</span>}
              </div>
              {user?.role !== 'ADMIN' && (
                <button onClick={openSupport} title={t('Contacter le support')} className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary flex items-center justify-center">
                  <Icon name="edit_square" size={20} />
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 px-3 rounded-xl bg-surface-container-low dark:bg-slate-800">
              <Icon name="search" size={20} className="text-outline" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Rechercher un échange…')}
                className="w-full bg-transparent py-2.5 font-body-md text-body-md focus:outline-none dark:text-white" />
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low dark:bg-slate-800">
              {FILTERS.map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`py-1.5 rounded-lg font-label-md text-label-md transition-colors ${filter === f.value ? 'bg-surface-container-lowest text-on-surface shadow-sm dark:bg-slate-700 dark:text-white' : 'text-on-surface-variant'}`}>
                  {t(f.label)}
                </button>
              ))}
            </div>

          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {loaded && !visible.length && (
              <div className="text-center px-6 py-10">
                <Icon name="forum" size={40} className="text-outline" />
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">{t('Aucune conversation. Ouvrez-en une depuis une réservation ou contactez le support.')}</p>
              </div>
            )}
            {visible.map((conversation) => {
              const title = conversationTitle(conversation);
              const selected = conversation.id === activeId;
              return (
                <button key={conversation.id} onClick={() => setActiveId(conversation.id)}
                  className={`w-full text-left flex gap-3 p-3 rounded-xl transition-colors ${selected ? 'bg-secondary-fixed/60 dark:bg-slate-800' : 'hover:bg-surface-container-low dark:hover:bg-slate-800/60'}`}>
                  <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-label-lg text-label-lg ${conversation.kind === 'support' ? 'bg-secondary-fixed text-secondary' : 'bg-primary text-on-primary'}`}>
                    {conversation.kind === 'support' ? <Icon name="support_agent" /> : initialsOf(title)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`font-label-lg text-label-lg truncate ${conversation.unread_count ? 'text-on-surface dark:text-white' : 'text-on-surface-variant dark:text-slate-300'}`}>{title}</span>
                      <span className={`text-[11px] shrink-0 ${conversation.unread_count ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{shortTime(conversation.last_message?.created_at || conversation.updated_at)}</span>
                    </span>
                    {(conversation.booking_label || conversation.kind === 'support') && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-surface-container dark:bg-slate-700 text-[11px] text-on-surface-variant dark:text-slate-300 max-w-full truncate">
                        <Icon name={conversation.kind === 'support' ? 'shield' : 'directions_car'} size={12} />
                        {conversation.kind === 'support' ? t('Support') : conversation.booking_label}
                      </span>
                    )}
                    <span className="flex items-center justify-between gap-2 mt-1">
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{conversation.last_message?.content || t('Nouvelle conversation')}</span>
                      {conversation.unread_count > 0 && <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">{conversation.unread_count}</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="m-3 p-3 rounded-xl bg-surface-container-low dark:bg-slate-800 flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="lock" size={18} />{t('Communications tracées pour votre sécurité et en cas de litige.')}
          </div>
        </aside>

        <section className={`flex flex-col min-h-0 ${active ? 'flex' : 'hidden lg:flex'}`}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <Icon name="chat" size={48} className="text-outline" />
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">{t('Sélectionnez une conversation pour afficher les échanges.')}</p>
            </div>
          ) : (
            <>
              <header className="p-4 border-b border-outline-variant/30 dark:border-slate-800 bg-surface-container-low/50 dark:bg-slate-900 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setActiveId(null)} className="lg:hidden w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center"><Icon name="arrow_back" /></button>
                    <span className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-lg text-label-lg shrink-0">
                      {active.kind === 'support' ? <Icon name="support_agent" /> : initialsOf(conversationTitle(active))}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white truncate">{conversationTitle(active)}</span>
                        {counterpart && <span className="badge-success"><Icon name="verified" size={14} />{t(ROLE_LABELS[counterpart.role] || counterpart.role)}</span>}
                      </div>
                      {counterpart?.phone && <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="call" size={14} />{counterpart.phone}</span>}
                    </div>
                  </div>
                  {counterpart?.phone && (
                    <a href={`tel:${counterpart.phone}`} className="btn-secondary py-2 px-4"><Icon name="call" size={18} />{t('Appeler')}</a>
                  )}
                </div>
                {active.related_booking && (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-sm">
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0"><Icon name="calendar_month" /></span>
                      <span className="min-w-0">
                        <span className="block font-label-lg text-label-lg text-on-surface dark:text-white truncate">{active.booking_label}</span>
                        {active.booking_status && <span className="badge-success mt-0.5">{t(BOOKING_STATUS[active.booking_status] || active.booking_status)}</span>}
                      </span>
                    </span>
                    {BOOKING_PATHS[user?.role] && (
                      <Link to={`${BOOKING_PATHS[user.role]}${active.related_booking}`} className="font-label-md text-label-md text-primary flex items-center gap-1 shrink-0">
                        {t('Voir le dossier')}<Icon name="arrow_forward" size={16} />
                      </Link>
                    )}
                  </div>
                )}
              </header>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
                {!messages.length && <p className="text-center font-body-md text-body-md text-on-surface-variant py-10">{t('Aucun message. Écrivez le premier !')}</p>}
                {groups.map((group) => (
                  <React.Fragment key={group.day}>
                    <div className="self-center px-4 py-1 rounded-full bg-secondary-fixed/60 dark:bg-slate-800 font-label-sm text-label-sm uppercase tracking-wider text-on-secondary-fixed-variant dark:text-slate-300">
                      {formatDate(group.date, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    {group.items.map((message) => (
                      <div key={message.id} className={`flex items-end gap-2 max-w-[85%] ${message.is_mine ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        {!message.is_mine && <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[11px] font-bold shrink-0">{initialsOf(message.sender_name)}</span>}
                        <div className={`flex flex-col gap-1 ${message.is_mine ? 'items-end' : 'items-start'}`}>
                          {!message.is_mine && active.participants.length > 1 && <span className="text-[11px] text-on-surface-variant">{message.sender_name}</span>}
                          <div className={`px-4 py-3 rounded-xl font-body-lg text-body-lg whitespace-pre-wrap break-words ${message.is_mine ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 rounded-bl-sm'}`}>
                            {message.content}
                            {message.attachment && (
                              /\.(png|jpe?g|webp|gif)$/i.test(message.attachment)
                                ? <a href={message.attachment} target="_blank" rel="noreferrer"><img src={message.attachment} alt="" className="mt-2 rounded-lg max-h-64 object-cover" /></a>
                                : <a href={message.attachment} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 underline"><Icon name="attach_file" size={16} />{t('Pièce jointe')}</a>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                            {formatTime(message.created_at)}
                            {message.is_mine && <Icon name={message.is_read ? 'done_all' : 'done'} size={14} className={message.is_read ? 'text-primary' : ''} />}
                          </span>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="px-4 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_REPLIES.map((reply) => (
                  <button key={reply} onClick={() => send(t(reply))} disabled={sending}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-secondary-fixed/60 hover:bg-secondary-fixed dark:bg-slate-800 font-label-md text-label-md text-on-secondary-fixed-variant dark:text-slate-200">
                    {t(reply)}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="m-4 flex items-center gap-2 p-2 rounded-xl bg-surface-container-low dark:bg-slate-800">
                <input ref={fileRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                <button type="button" onClick={() => fileRef.current?.click()} title={t('Joindre un fichier')} className={`w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container ${attachment ? 'text-primary' : 'text-on-surface-variant'}`}>
                  <Icon name="attach_file" />
                </button>
                <input value={draft} onChange={(e) => setDraft(e.target.value)}
                  placeholder={attachment ? t('Fichier joint : {{name}}', { name: attachment.name }) : t('Écrivez votre message…')}
                  className="flex-1 bg-transparent px-2 py-2 font-body-lg text-body-lg focus:outline-none dark:text-white" />
                <button type="submit" disabled={sending || (!draft.trim() && !attachment)} className="btn-primary py-2.5 px-5">
                  {t('Envoyer')}<Icon name="send" size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
