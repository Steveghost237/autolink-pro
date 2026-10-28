import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsAPI, messagingAPI, walletAPI, platformAPI, bookingsAPI } from '../services/api';
import ListToolbar from './ListToolbar';
import LanguageSwitcher from './LanguageSwitcher';
import Icon from './Icon';
import { formatDate, formatNumber, uiText } from '../i18n';

const t = (text, options) => uiText('components.DashboardLayout', text, options);

// Navigation par rôle — chaque entrée pointe vers une route existante de l'application.
const NAV_ITEMS = {
  CLIENT: {
    space: 'Espace Client',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/client/dashboard' },
      { icon: 'directions_car', label: 'Mes Réservations', path: '/client/bookings' },
      { icon: 'account_balance_wallet', label: 'Portefeuille & Caution', path: '/client/wallet' },
      { icon: 'favorite', label: 'Favoris', path: '/client/favorites' },
      { icon: 'badge', label: 'Documents & Profil', path: '/profile' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'loyalty', label: 'Parrainage & Réductions', path: '/client/referrals' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
      { icon: 'directions_car', label: 'Catalogue', path: '/client/search' },
      { icon: 'help', label: 'Aide', path: '/help' },
    ],
  },
  OWNER: {
    space: 'Espace Propriétaire',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/owner/dashboard' },
      { icon: 'directions_car', label: 'Mes véhicules', path: '/owner/vehicles' },
      { icon: 'add_circle', label: 'Ajouter un véhicule', path: '/owner/add-vehicle' },
      { icon: 'fact_check', label: 'Demandes de location', path: '/owner/requests', badge: 'requests' },
      { icon: 'account_balance_wallet', label: 'Revenus & Finances', path: '/owner/revenue' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'manage_accounts', label: 'Profil & Documents', path: '/profile' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
  DRIVER: {
    space: 'Espace Chauffeur',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/driver/dashboard' },
      { icon: 'account_balance_wallet', label: 'Revenus & Retraits', path: '/driver/revenue' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'manage_accounts', label: 'Profil & Documents', path: '/profile' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
  ADMIN: {
    space: 'Admin Ops',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/admin/dashboard' },
      { icon: 'calendar_month', label: 'Réservations', path: '/admin/bookings' },
      { icon: 'directions_car', label: 'Véhicules', path: '/admin/catalog', badge: 'vehicles_pending' },
      { icon: 'key', label: 'Propriétaires & Retraits', path: '/admin/owners', badge: 'withdrawals_pending' },
      { icon: 'group', label: 'Clients & KYC', path: '/admin/users', badge: 'kyc_pending' },
      { icon: 'badge', label: 'Chauffeurs', path: '/admin/drivers' },
      { icon: 'payments', label: 'Finance', path: '/admin/finance' },
      { icon: 'gavel', label: 'Litiges', path: '/admin/disputes', badge: 'disputes_open' },
      { icon: 'build', label: 'Inspections', path: '/admin/inspections' },
      { icon: 'sell', label: 'Agents affiliés', path: '/admin/agents' },
      { icon: 'forum', label: 'Messagerie', path: '/messages', badge: 'messages' },
      { icon: 'contact_mail', label: 'Messages de contact', path: '/admin/messages', badge: 'contact_unhandled' },
      { icon: 'mail', label: 'Newsletter', path: '/admin/newsletter' },
      { icon: 'settings', label: 'Paramètres plateforme', path: '/admin/settings' },
    ],
  },
  CONTROLLER: {
    space: 'Espace Contrôleur',
    items: [
      { icon: 'dashboard', label: 'Tableau de bord', path: '/controller/dashboard' },
      { icon: 'fact_check', label: 'Inspections', path: '/admin/inspections' },
      { icon: 'chat', label: 'Messages', path: '/messages', badge: 'messages' },
      { icon: 'notifications', label: 'Notifications', path: '/notifications', badge: 'notifications' },
      { icon: 'settings', label: 'Paramètres', path: '/settings' },
    ],
  },
};

const ROLE_LABELS = { CLIENT: 'Client', OWNER: 'Propriétaire', DRIVER: 'Chauffeur', ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur' };

const initials = (user) => `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'AL';

// ─── Panneau de notifications (données réelles de l'API) ───────────────────────
function NotificationsBell({ onUnreadChange }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const panelRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortField}`;
      const { data } = await notificationsAPI.list({ search: search.trim(), ordering });
      setNotifs(data.results || []);
      setUnread(data.unread || 0);
      setOffline(false);
    } catch (_) { setOffline(true); }
  }, [search, sortField, sortOrder]);

  useEffect(() => {
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifs]);

  useEffect(() => { onUnreadChange?.(unread); }, [unread, onUnreadChange]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const markAllRead = async () => {
    try { await notificationsAPI.readAll(); } catch (_) {}
    setUnread(0);
    setNotifs((n) => n.map((x) => ({ ...x, is_read: true })));
  };

  const markRead = async (id) => {
    try { await notificationsAPI.read(id); } catch (_) {}
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const fmtDate = (d) => {
    try {
      const dt = new Date(d);
      const diff = (Date.now() - dt.getTime()) / 60000;
      if (diff < 60) return t('il y a {{count}} min', { count: Math.max(1, Math.round(diff)) });
      if (diff < 1440) return t('il y a {{count}} h', { count: Math.round(diff / 60) });
      return formatDate(dt, { day: 'numeric', month: 'short' });
    } catch (_) { return ''; }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => { setOpen((o) => !o); if (!open) fetchNotifs(); }}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors dark:text-slate-300 dark:hover:bg-slate-800"
        title={t('Notifications')}>
        <Icon name="notifications" size={22} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-on-error text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[92vw] bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-elevation-3 border border-outline-variant/30 dark:border-slate-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 dark:border-slate-700">
            <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t('Notifications')}</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="font-label-md text-label-md text-primary flex items-center gap-1 hover:underline">
                <Icon name="done_all" size={16} />{t('Tout marquer lu')}
              </button>
            )}
          </div>
          <div className="border-b border-outline-variant/30 p-3 dark:border-slate-700">
            <ListToolbar
              search={search} onSearchChange={setSearch}
              sortField={sortField} onSortFieldChange={setSortField}
              sortOrder={sortOrder} onSortOrderChange={setSortOrder}
              sortOptions={[
                { value: 'created_at', label: t('Date') },
                { value: 'title', label: t('Titre') },
                { value: 'is_read', label: t('Statut') },
              ]}
              placeholder={t('Rechercher une notification')}
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {offline && <p className="font-body-sm text-body-sm text-outline text-center py-6">{t('API injoignable — notifications indisponibles.')}</p>}
            {!offline && notifs.length === 0 && <p className="font-body-sm text-body-sm text-outline text-center py-6">{t('Aucune notification pour le moment.')}</p>}
            {notifs.map((n) => (
              <button key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-outline-variant/20 hover:bg-surface-container-low dark:hover:bg-slate-700/50 transition-colors ${n.is_read ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                  <div className={`min-w-0 ${n.is_read ? 'pl-4' : ''}`}>
                    <div className="font-label-lg text-label-lg text-on-surface dark:text-slate-100">{n.title}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-[10px] text-outline mt-1">{fmtDate(n.created_at)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)} className="block text-center py-2.5 font-label-md text-label-md text-primary hover:bg-surface-container-low">
            {t('Voir toutes les notifications')}
          </Link>
        </div>
      )}
    </div>
  );
}

function useLayoutCounters(role) {
  const [counters, setCounters] = useState({});
  const [balance, setBalance] = useState(null);

  const refresh = useCallback(async () => {
    if (!role) return;
    const next = {};
    const tasks = [
      messagingAPI.unread().then(({ data }) => { next.messages = data.unread; }),
    ];
    if (role === 'ADMIN') {
      tasks.push(platformAPI.activity().then(({ data }) => Object.assign(next, data.queue)));
    }
    if (role === 'OWNER') {
      tasks.push(bookingsAPI.ownerStats().then(({ data }) => { next.requests = data.pending_requests; }));
    }
    if (['CLIENT', 'OWNER', 'DRIVER'].includes(role)) {
      tasks.push(walletAPI.get().then(({ data }) => setBalance(data.balance)));
    }
    await Promise.allSettled(tasks);
    setCounters((current) => ({ ...current, ...next }));
  }, [role]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { counters, setCounters, balance };
}

export default function DashboardLayout({ children, title, subtitle, actions }) {
  const { user, logout, getDashboardPath } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const config = NAV_ITEMS[role] || { space: '', items: [] };
  const { counters, setCounters, balance } = useLayoutCounters(role);
  const onNotificationsUnread = useCallback((value) => setCounters((c) => ({ ...c, notifications: value })), [setCounters]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(`${path}/`));

  const sidebarTone = isAdmin
    ? {
      root: 'bg-inverse-surface text-inverse-on-surface',
      item: 'text-surface-container-high hover:bg-surface-variant/15 hover:text-surface-container-lowest',
      active: 'bg-primary-container text-on-primary-container font-semibold shadow-sm',
      badge: 'bg-error text-on-error',
      divider: 'border-on-surface-variant/20',
    }
    : {
      root: 'bg-surface-container-lowest text-on-surface dark:bg-slate-900 dark:text-slate-100',
      item: 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
      active: 'bg-primary-container text-on-primary-container font-semibold shadow-sm',
      badge: 'bg-error-container text-on-error-container',
      divider: 'border-outline-variant/30 dark:border-slate-800',
    };

  const Sidebar = () => (
    <div className={`flex flex-col h-full w-72 ${sidebarTone.root} shadow-[0_1px_8px_rgba(0,0,0,0.04)]`}>
      <div className="h-20 px-6 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
            <Icon name={isAdmin ? 'local_taxi' : 'directions_car'} size={22} />
          </span>
          <span className="leading-none">
            <span className={`block font-headline-md text-headline-md tracking-tight ${isAdmin ? 'text-surface-container-lowest' : 'text-on-surface dark:text-white'}`}>
              AutoLink <span className={isAdmin ? 'text-primary-fixed-dim' : 'text-primary'}>Pro</span>
            </span>
            <span className={`font-label-sm text-label-sm uppercase tracking-wider ${isAdmin ? 'text-secondary-fixed-dim' : 'text-primary font-bold'}`}>
              {isAdmin ? t('Cameroun Ops') : t('Pro Mobility')}
            </span>
          </span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 opacity-70 hover:opacity-100" aria-label={t('Fermer le menu')}>
          <Icon name="close" />
        </button>
      </div>

      <div className="px-6 pb-2 shrink-0">
        <div className={`py-1.5 px-3 rounded-lg flex items-center justify-between ${isAdmin ? 'bg-on-secondary-fixed-variant/60' : 'bg-surface-container-low dark:bg-slate-800'}`}>
          <span className={`font-label-sm text-label-sm font-bold uppercase tracking-wider ${isAdmin ? 'text-secondary-fixed' : 'text-on-surface-variant dark:text-slate-400'}`}>{t(config.space)}</span>
          <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse" />
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-2 flex flex-col gap-1">
        {config.items.map(({ icon, label, path, badge }) => {
          const active = isActive(path);
          const count = badge ? Number(counters[badge] || 0) : 0;
          return (
            <Link key={path + label} to={path} onClick={() => setSidebarOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${active ? sidebarTone.active : sidebarTone.item}`}>
              <span className="flex items-center gap-3 min-w-0">
                <Icon name={icon} size={20} fill={active} />
                <span className="font-label-lg text-label-lg truncate">{t(label)}</span>
              </span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${active ? 'bg-on-primary-container/20 text-on-primary-container' : sidebarTone.badge}`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${sidebarTone.divider} flex flex-col gap-2 shrink-0`}>
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shrink-0">{initials(user)}</div>
          <div className="min-w-0 flex-1">
            <div className={`font-label-md text-label-md truncate ${isAdmin ? 'text-surface-container-lowest' : 'text-on-surface dark:text-white'}`}>{user?.firstName} {user?.lastName}</div>
            <div className={`text-[11px] truncate ${isAdmin ? 'text-surface-variant' : 'text-on-surface-variant dark:text-slate-400'}`}>{t(ROLE_LABELS[role] || '')}</div>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-primary-fixed-dim shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />{t('En ligne')}
          </span>
        </div>
        <button onClick={handleLogout}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all ${isAdmin ? 'bg-surface-variant/10 text-surface-container-high hover:bg-error hover:text-on-error' : 'text-error hover:bg-error-container hover:text-on-error-container'}`}>
          <Icon name="logout" size={18} />{t('Déconnexion')}
        </button>
      </div>
    </div>
  );

  const walletAction = role === 'CLIENT'
    ? { icon: 'add', label: t('Recharger'), path: '/client/wallet' }
    : role === 'OWNER'
      ? { icon: 'arrow_upward', label: t('Retirer'), path: '/owner/revenue' }
      : role === 'DRIVER' ? { icon: 'arrow_upward', label: t('Retirer'), path: '/driver/revenue' } : null;

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 overflow-hidden transition-colors">
      <aside className="hidden lg:flex shrink-0 z-30"><Sidebar /></aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="shadow-2xl"><Sidebar /></div>
          <div className="flex-1 bg-inverse-surface/60" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 lg:h-20 shrink-0 bg-surface-container-lowest/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:text-slate-300" aria-label={t('Menu')}>
              <Icon name="menu" />
            </button>
            <h1 className="font-headline-sm text-headline-sm text-on-surface dark:text-white truncate">{title}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {walletAction && balance !== null && (
              <div className="hidden sm:flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-surface-container-low dark:bg-slate-800">
                <Icon name="account_balance_wallet" size={18} className="text-primary" />
                <span className="hidden xl:inline font-label-sm text-label-sm text-on-surface-variant dark:text-slate-400 uppercase">{t('Solde')}</span>
                <span className="font-label-lg text-label-lg font-bold text-on-surface dark:text-white whitespace-nowrap">{formatNumber(balance)} <span className="text-primary font-label-sm text-label-sm">FCFA</span></span>
                <button onClick={() => navigate(walletAction.path)} title={walletAction.label}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md shadow-sm transition-colors">
                  <Icon name={walletAction.icon} size={16} /><span className="hidden 2xl:inline">{walletAction.label}</span>
                </button>
              </div>
            )}
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:text-slate-300 dark:hover:bg-slate-800" title={isDark ? t('Mode clair') : t('Mode sombre')}>
              <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={22} />
            </button>
            <Link to="/messages" title={t('Messages')} className="relative w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high dark:text-slate-300 dark:hover:bg-slate-800">
              <Icon name="chat_bubble" size={22} />
              {counters.messages > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">{counters.messages > 9 ? '9+' : counters.messages}</span>
              )}
            </Link>
            <NotificationsBell onUnreadChange={onNotificationsUnread} />
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-surface-container-low hover:bg-surface-container dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">{initials(user)}</span>
                <span className="hidden md:block text-left leading-tight">
                  <span className="block font-label-md text-label-md text-on-surface dark:text-white">{user?.firstName} {user?.lastName?.charAt(0)}.</span>
                  <span className="block text-[11px] text-on-surface-variant dark:text-slate-400">{t(ROLE_LABELS[role] || '')}</span>
                </span>
                <Icon name="expand_more" size={18} className="text-on-surface-variant" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest dark:bg-slate-800 rounded-xl shadow-elevation-3 border border-outline-variant/30 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/30 dark:border-slate-700">
                    <div className="font-label-lg text-label-lg text-on-surface dark:text-white">{user?.firstName} {user?.lastName}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400 truncate">{user?.email}</div>
                  </div>
                  {[
                    { icon: 'dashboard', label: t('Tableau de bord'), action: () => navigate(getDashboardPath(role)) },
                    { icon: 'person', label: t('Mon profil'), action: () => navigate('/profile') },
                    { icon: 'settings', label: t('Paramètres'), action: () => navigate('/settings') },
                  ].map((item) => (
                    <button key={item.label} onClick={() => { setProfileOpen(false); item.action(); }}
                      className="flex items-center gap-2 px-4 py-2 font-body-md text-body-md text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-700 w-full">
                      <Icon name={item.icon} size={18} />{item.label}
                    </button>
                  ))}
                  <LanguageSwitcher className="sm:hidden mx-4 my-2" />
                  <div className="border-t border-outline-variant/30 dark:border-slate-700 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 font-body-md text-body-md text-error hover:bg-error-container/50 w-full">
                      <Icon name="logout" size={18} />{t('Déconnexion')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface dark:bg-slate-950">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {(subtitle || actions) && (
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="page-title">{title}</h2>
                  {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
