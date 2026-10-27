import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, User, LogOut, Shield, Globe, CheckCircle2 } from 'lucide-react';
import RoleLayout from '../components/RoleLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PREF_KEY = 'autolink_notif_prefs';
const card = 'bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6';

const loadPrefs = () => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (_) { return {}; }
};

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() => ({
    bookingUpdates: loadPrefs().bookingUpdates ?? true,
    promotions: loadPrefs().promotions ?? false,
    sound: loadPrefs().sound ?? true,
  }));
  const [saved, setSaved] = useState(false);
  const [newsletterSaving, setNewsletterSaving] = useState(false);

  const toggleNewsletter = async () => {
    if (newsletterSaving || !updateUser) return;
    setNewsletterSaving(true);
    await updateUser({ newsletter_opt_in: !(user?.newsletter_opt_in ?? true) });
    setNewsletterSaving(false);
  };

  const setPref = (k, v) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${on ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  const Row = ({ icon: Icon, title, sub, right }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 bg-teal-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0"><Icon size={15} className="text-teal-600" /></span>
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{title}</div>
          <div className="text-[10px] text-slate-400">{sub}</div>
        </div>
      </div>
      {right}
    </div>
  );

  return (
    <RoleLayout title="Paramètres">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Paramètres &amp; <span className="text-teal-600">Préférences</span></h1>
          <p className="text-sm text-slate-500 mt-1">Apparence, notifications et sécurité de votre compte.</p>
        </div>

        {/* Apparence */}
        <div className={card}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            {isDark ? <Moon size={15} className="text-teal-600" /> : <Sun size={15} className="text-teal-600" />} Apparence
          </h3>
          <Row icon={Moon} title="Mode sombre" sub="Interface sombre pour un confort nocturne"
            right={<Toggle on={isDark} onClick={toggleTheme} />} />
        </div>

        {/* Notifications */}
        <div className={card}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <Bell size={15} className="text-teal-600" /> Notifications
            {saved && <span className="text-[10px] text-teal-600 font-black flex items-center gap-1"><CheckCircle2 size={11} /> Enregistré</span>}
          </h3>
          <div className="space-y-4">
            {[
              { key: 'bookingUpdates', label: 'Réservations et locations', desc: 'Confirmations, débuts et fins de course' },
              { key: 'promotions', label: 'Offres et promotions', desc: 'Réductions et nouveautés AutoLink' },
              { key: 'sound', label: 'Sons de notification', desc: 'Alerte sonore à chaque nouvelle notification' },
            ].map(({ key, label, desc }) => (
              <Row key={key} icon={Bell} title={label} sub={desc}
                right={<Toggle on={prefs[key]} onClick={() => setPref(key, !prefs[key])} />} />
            ))}
            <Row icon={Bell} title="Newsletter AutoLink" sub="Campagnes et actualités par email (préférence serveur)"
              right={<Toggle on={user?.newsletter_opt_in ?? true} onClick={toggleNewsletter} />} />
          </div>
        </div>

        {/* Langue */}
        <div className={card}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <Globe size={15} className="text-teal-600" /> Langue
          </h3>
          <Row icon={Globe} title="Français (Cameroun)" sub="La version anglaise arrive prochainement"
            right={<span className="text-[10px] font-black bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">FR</span>} />
        </div>

        {/* Compte */}
        <div className={card}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-4">
            <User size={15} className="text-teal-600" /> Compte
          </h3>
          <div className="space-y-2.5 text-xs mb-4">
            <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-bold text-slate-800 dark:text-slate-200">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Rôle</span><span className="font-bold text-slate-800 dark:text-slate-200">{user?.role}</span></div>
          </div>
          <button onClick={() => navigate('/profile')}
            className="w-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-700 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <User size={13} /> Modifier mon profil
          </button>
        </div>

        {/* Sécurité */}
        <div className={`${card} !border-red-100 dark:!border-red-900/40`}>
          <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 mb-3">
            <Shield size={15} className="text-red-500" /> Sécurité
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Pour changer votre mot de passe ou fermer votre compte, contactez le support AutoLink.
          </p>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
            <LogOut size={13} /> Se déconnecter
          </button>
        </div>
      </div>
    </RoleLayout>
  );
}
