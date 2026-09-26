import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, User, LogOut, Shield, Globe, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PREF_KEY = 'autolink_notif_prefs';

const loadPrefs = () => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (_) { return {}; }
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => ({
    bookingUpdates: loadPrefs().bookingUpdates ?? true,
    promotions: loadPrefs().promotions ?? false,
    sound: loadPrefs().sound ?? true,
  }));
  const [saved, setSaved] = useState(false);

  const setPref = (k, v) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${on ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <DashboardLayout title="Paramètres">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Apparence */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            {isDark ? <Moon size={17} /> : <Sun size={17} />} Apparence
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">Mode sombre</div>
              <div className="text-xs text-slate-400">Interface sombre pour un confort nocturne</div>
            </div>
            <Toggle on={isDark} onClick={toggleTheme} />
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Bell size={17} /> Notifications
            {saved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle size={12} /> Enregistré</span>}
          </h3>
          <div className="space-y-4">
            {[
              { key: 'bookingUpdates', label: 'Réservations et locations', desc: 'Confirmations, débuts et fins de course' },
              { key: 'promotions', label: 'Offres et promotions', desc: 'Réductions et nouveautés AutoLink' },
              { key: 'sound', label: 'Sons de notification', desc: 'Alerte sonore à chaque nouvelle notification' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
                <Toggle on={prefs[key]} onClick={() => setPref(key, !prefs[key])} />
              </div>
            ))}
          </div>
        </div>

        {/* Langue */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Globe size={17} /> Langue
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">Français (Cameroun)</div>
              <div className="text-xs text-slate-400">La version anglaise arrive prochainement</div>
            </div>
            <span className="badge badge-info">FR</span>
          </div>
        </div>

        {/* Compte */}
        <div className="card">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <User size={17} /> Compte
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Rôle</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{user?.role}</span>
            </div>
            <button onClick={() => navigate('/profile')}
              className="btn-outline w-full py-2.5 text-sm mt-2 flex items-center justify-center gap-2">
              <User size={15} /> Modifier mon profil
            </button>
          </div>
        </div>

        {/* Sécurité */}
        <div className="card border-red-100 dark:border-red-900/40">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Shield size={17} /> Sécurité
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Pour changer votre mot de passe ou fermer votre compte, contactez le support AutoLink.
          </p>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
            <LogOut size={15} /> Se déconnecter
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
