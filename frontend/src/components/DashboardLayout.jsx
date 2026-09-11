import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AutoLinkLogo from './AutoLinkLogo';
import {
  Car, LogOut, Menu, X, Bell, User, ChevronDown, Sun, Moon,
  LayoutDashboard, Search, FileText, Settings,
  Users, DollarSign, UserCheck, ClipboardList, PlusCircle, Image, Tag
} from 'lucide-react';

const NAV_ITEMS = {
  CLIENT: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/client/dashboard' },
    { icon: Search, label: 'Chercher un véhicule', path: '/client/search' },
    { icon: FileText, label: 'Mes réservations', path: '/client/bookings' },
  ],
  OWNER: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/owner/dashboard' },
    { icon: Car, label: 'Mes véhicules', path: '/owner/vehicles' },
    { icon: PlusCircle, label: 'Ajouter un véhicule', path: '/owner/add-vehicle' },
  ],
  DRIVER: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/driver/dashboard' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Car, label: 'Véhicules', path: '/admin/inspections' },
    { icon: UserCheck, label: 'Chauffeurs', path: '/admin/drivers' },
    { icon: DollarSign, label: 'Finance', path: '/admin/finance' },
    { icon: Tag, label: 'Agents affiliés', path: '/admin/agents' },
    { icon: ClipboardList, label: 'Inspections', path: '/admin/inspections' },
  ],
  CONTROLLER: [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/controller/dashboard' },
    { icon: ClipboardList, label: 'Inspections', path: '/admin/inspections' },
  ],
};

const ROLE_COLORS = {
  CLIENT: 'bg-blue-100 text-blue-700',
  OWNER: 'bg-primary-100 text-primary-700',
  DRIVER: 'bg-accent-100 text-accent-700',
  ADMIN: 'bg-red-100 text-red-700',
  CONTROLLER: 'bg-purple-100 text-purple-700',
};
const ROLE_LABELS = { CLIENT: 'Client', OWNER: 'Gestionnaire', DRIVER: 'Chauffeur', ADMIN: 'Administrateur', CONTROLLER: 'Contrôleur' };

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = NAV_ITEMS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 ${mobile ? 'w-full' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        <Link to="/">
          <AutoLinkLogo size="md" />
        </Link>
      </div>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path} to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all w-full">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <div className="hidden lg:flex flex-col w-64 shrink-0 shadow-xl">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-72 shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
              <span className="text-white font-bold">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title={isDark ? 'Mode clair' : 'Mode sombre'}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-10">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="font-semibold text-slate-800 dark:text-white text-sm">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">
                    <User size={15} /> Mon profil
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 w-full">
                    <Settings size={15} /> Paramètres
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
