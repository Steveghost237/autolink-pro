import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Loader } from 'lucide-react';

// Logo Google officiel (SVG multicolore)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.7-.4-3.9z"/>
  </svg>
);

export default function GoogleAuthButton({ label = 'Continuer avec Google' }) {
  const { googleLogin, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.includes('@')) { setError('Entrez une adresse Gmail valide.'); return; }
    setLoading(true); setError('');
    const parts = name.trim().split(/\s+/);
    const res = await googleLogin({
      email,
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      google_id: '',
    });
    setLoading(false);
    if (res.success) { setOpen(false); navigate(getDashboardPath(res.user.role)); }
    else setError(res.error);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl py-3 font-semibold text-slate-700 transition-all">
        <GoogleIcon /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 font-bold text-slate-900"><GoogleIcon /> Compte Google</div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Adresse Gmail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" className="input-field pl-10" placeholder="prenom.nom@gmail.com"
                    value={email} onChange={e => setEmail(e.target.value)} autoFocus />
                </div>
              </div>
              <div>
                <label className="label">Nom complet <span className="text-slate-400">(première connexion)</span></label>
                <input type="text" className="input-field" placeholder="Prénom Nom"
                  value={name} onChange={e => setName(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button onClick={submit} disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <Loader size={16} className="animate-spin" />}
                {loading ? 'Connexion...' : 'Continuer'}
              </button>
              <p className="text-xs text-slate-400 text-center">
                Si le compte n'existe pas, il sera créé automatiquement avec le rôle Client.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
