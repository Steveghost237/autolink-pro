import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Icon from '../components/Icon';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import { formatDate, formatTime, uiText } from '../i18n';

const t = (text, options) => uiText('pages.Notifications', text, options);

const BOOKINGS = { CLIENT: '/client/bookings', OWNER: '/owner/requests', DRIVER: '/driver/dashboard', ADMIN: '/admin/bookings', CONTROLLER: '/controller/dashboard' };
const MONEY = { CLIENT: '/client/wallet', OWNER: '/owner/revenue', DRIVER: '/driver/revenue', ADMIN: '/admin/finance' };

// Catégorisation à partir du titre — les notifications backend n'ont pas de type explicite.
const CATEGORIES = {
  message: { label: 'Messages', icon: 'chat', tile: 'bg-primary-fixed text-on-primary-fixed', test: /message/i },
  payment: { label: 'Paiements & Caution', icon: 'lock_open', tile: 'bg-tertiary-fixed-dim text-on-tertiary-fixed', test: /paiement|caution|retrait|recharge|rembours|versement|solde/i },
  security: { label: 'Sécurité', icon: 'shield', tile: 'bg-error-container text-on-error-container', test: /connexion|document|kyc|sécurité|compte|mot de passe/i },
  booking: { label: 'Réservations', icon: 'key', tile: 'bg-secondary-fixed text-secondary', test: /réserv|location|course|litige|inspection|véhicule/i },
};

const categoryOf = (notification) => {
  const text = `${notification.title} ${notification.message}`;
  return Object.keys(CATEGORIES).find((key) => CATEGORIES[key].test.test(notification.title))
    || Object.keys(CATEGORIES).find((key) => CATEGORIES[key].test.test(text))
    || 'booking';
};

const relative = (value) => {
  const diff = (Date.now() - new Date(value).getTime()) / 60000;
  if (diff < 60) return t('Il y a {{count}} min', { count: Math.max(1, Math.round(diff)) });
  if (diff < 1440) return t('Il y a {{count}} h', { count: Math.round(diff / 60) });
  return `${formatDate(value, { day: 'numeric', month: 'short' })} · ${formatTime(value)}`;
};

const dayLabel = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return t("Aujourd'hui");
  if (date.toDateString() === yesterday.toDateString()) return t('Hier');
  return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [tab, setTab] = useState('all');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.list({ ordering: '-created_at' });
      setItems(data.results || []);
      setUnread(data.unread || 0);
      setError('');
    } catch (_) { setError(t('API injoignable — notifications indisponibles.')); }
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await notificationsAPI.read(id).catch(() => {});
    setItems((list) => list.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const remove = async (notification) => {
    await notificationsAPI.remove(notification.id).catch(() => {});
    setItems((list) => list.filter((n) => n.id !== notification.id));
    if (!notification.is_read) setUnread((u) => Math.max(0, u - 1));
  };

  const markAll = async () => {
    await notificationsAPI.readAll().catch(() => {});
    setItems((list) => list.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const filtered = useMemo(() => items.filter((n) => (
    tab === 'all' || (tab === 'unread' ? !n.is_read : categoryOf(n) === tab)
  )), [items, tab]);

  const groups = [];
  filtered.forEach((n) => {
    const label = dayLabel(n.created_at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(n); else groups.push({ label, date: n.created_at, items: [n] });
  });

  const tabs = [
    { value: 'all', label: 'Toutes', count: items.length },
    { value: 'unread', label: 'Non lues', count: unread },
    ...['booking', 'payment', 'message', 'security'].map((key) => ({ value: key, label: CATEGORIES[key].label })),
  ];

  const actionFor = (category) => {
    if (category === 'message') return { to: '/messages', icon: 'reply', label: 'Répondre via la messagerie', primary: true };
    if (category === 'payment' && MONEY[user?.role]) return { to: MONEY[user.role], icon: 'receipt_long', label: 'Voir le portefeuille', primary: true };
    if (category === 'security') return { to: '/profile', icon: 'verified_user', label: 'Mes documents' };
    if (BOOKINGS[user?.role]) return { to: BOOKINGS[user.role], icon: 'visibility', label: 'Détail des réservations' };
    return null;
  };

  return (
    <DashboardLayout title={t('Centre de Notifications')}>
      <div className="flex flex-col gap-6">
        <section className="rounded-xl p-6 sm:p-8 bg-gradient-to-r from-secondary-fixed/70 via-surface-container to-surface-container-low dark:from-slate-900 dark:to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="badge-success"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t('Flux en temps réel')}</span>
            <h2 className="page-title mt-3">{t('Centre de Notifications')}</h2>
            <p className="page-subtitle mt-1 max-w-2xl">{t('Toutes les alertes relatives à vos réservations, paiements, cautions et messages.')}</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest dark:bg-slate-800 shadow-sm shrink-0">
            <span className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center"><Icon name="notifications_active" /></span>
            <div>
              <div className="font-headline-lg text-headline-lg text-on-surface dark:text-white">{unread} <span className="font-label-md text-label-md text-primary">{t('non lues')}</span></div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('sur {{count}} réceptions', { count: items.length })}</div>
            </div>
          </div>
        </section>

        <div className="card p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((item) => (
              <button key={item.value} onClick={() => setTab(item.value)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${tab === item.value ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low dark:text-slate-300'}`}>
                {t(item.label)}
                {item.count !== undefined && <span className={`px-1.5 rounded-full text-[11px] ${tab === item.value ? 'bg-on-primary/20' : 'bg-surface-container-high'}`}>{item.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={markAll} disabled={!unread} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary-fixed/60 text-on-secondary-fixed-variant font-label-lg text-label-lg disabled:opacity-50">
              <Icon name="done_all" size={18} />{t('Tout marquer comme lu')}
            </button>
            <Link to="/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low font-label-lg text-label-lg">
              <Icon name="tune" size={18} />{t('Paramètres')}
            </Link>
          </div>
        </div>

        {error && <div className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-label-lg text-label-lg">{error}</div>}
        {loaded && !filtered.length && !error && (
          <div className="card text-center py-14">
            <Icon name="notifications_off" size={44} className="text-outline" />
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">{t('Aucune notification dans cette catégorie.')}</p>
          </div>
        )}

        {groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white capitalize">{group.label}</h3>
                <span className="badge-info">{t('{{count}} événement(s)', { count: group.items.length })}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(group.date)}</span>
            </div>
            {group.items.map((notification) => {
              const category = categoryOf(notification);
              const meta = CATEGORIES[category];
              const action = actionFor(category);
              return (
                <article key={notification.id} className={`card flex gap-4 ${notification.is_read ? 'opacity-75' : 'shadow-elevation-1'}`}>
                  <span className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.tile}`}>
                    <Icon name={meta.icon} />
                    {!notification.is_read && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-lowest" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{notification.title}</h4>
                        <span className="badge-neutral">{t(meta.label)}</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant shrink-0">{relative(notification.created_at)}</span>
                    </div>
                    {category === 'message'
                      ? <blockquote className="mt-2 p-3 rounded-lg bg-surface-container-low dark:bg-slate-900 italic font-body-lg text-body-lg text-on-surface dark:text-slate-200">« {notification.message} »</blockquote>
                      : <p className="mt-1 font-body-lg text-body-lg text-on-surface-variant dark:text-slate-300">{notification.message}</p>}
                    <div className="flex items-center justify-between gap-2 mt-3">
                      {action ? (
                        <Link to={action.to} onClick={() => !notification.is_read && markRead(notification.id)}
                          className={action.primary ? 'btn-primary py-2 px-4' : 'btn-secondary py-2 px-4'}>
                          <Icon name={action.icon} size={18} />{t(action.label)}
                        </Link>
                      ) : <span />}
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button onClick={() => markRead(notification.id)} title={t('Marquer comme lu')} className="w-9 h-9 rounded-lg hover:bg-surface-container-low flex items-center justify-center text-on-surface-variant"><Icon name="check" /></button>
                        )}
                        <button onClick={() => remove(notification)} title={t('Supprimer')} className="w-9 h-9 rounded-lg hover:bg-error-container hover:text-on-error-container flex items-center justify-center text-on-surface-variant"><Icon name="delete" /></button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </DashboardLayout>
  );
}
