import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleAuthButton from '../../components/GoogleAuthButton';

const DEMO_ACCOUNTS = [
  { role: 'CLIENT', email: 'client@autolink.com', label: 'Client' },
  { role: 'OWNER', email: 'owner@autolink.com', label: 'Propriétaire' },
  { role: 'DRIVER', email: 'driver@autolink.com', label: 'Chauffeur' },
  { role: 'ADMIN', email: 'admin@autolink.com', label: 'Admin' },
  { role: 'CONTROLLER', email: 'controller@autolink.com', label: 'Contrôleur' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) {
      navigate(getDashboardPath(result.user.role));
    } else {
      setError(result.error);
    }
  };

  const quickLogin = (email) => {
    setForm({ email, password: 'pass123' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white">Auto<span className="text-primary-400">Link</span> <span className="text-accent-400 text-sm">PRO</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Bon retour 👋</h1>
          <p className="text-primary-300">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Adresse email</label>
              <input
                type="email" required autoComplete="email"
                className="input-field"
                placeholder="votre@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="label mb-0">Mot de passe</label>
                <a href="#" className="text-xs text-primary-600 hover:underline">Mot de passe oublié ?</a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Se connecter'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OU</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <GoogleAuthButton />

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Comptes démo (mot de passe : pass123)</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(({ email, label }) => (
                <button key={email} onClick={() => quickLogin(email)} className="text-xs bg-slate-50 hover:bg-primary-50 hover:text-primary-700 border border-slate-200 rounded-lg px-2 py-1.5 transition-colors font-medium">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">S'inscrire gratuitement</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
