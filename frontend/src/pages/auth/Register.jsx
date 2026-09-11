import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { value: 'CLIENT', label: 'Client', desc: 'Je veux louer un véhicule', emoji: '🧑' },
  { value: 'OWNER', label: 'Propriétaire', desc: 'Je veux proposer mon véhicule', emoji: '🔑' },
  { value: 'DRIVER', label: 'Chauffeur', desc: 'Je veux conduire pour AutoLink', emoji: '🚗' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, getDashboardPath } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.role) { setError('Veuillez choisir un rôle.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setError('');
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate(getDashboardPath(result.user.role));
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white">Auto<span className="text-primary-400">Link</span> <span className="text-accent-400 text-sm">PRO</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Créer votre compte</h1>
          <p className="text-primary-300 text-sm">Étape {step}/2 — {step === 1 ? 'Choisissez votre rôle' : 'Vos informations'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className={`flex-1 h-1.5 rounded-full transition-colors ${n <= step ? 'bg-primary-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <p className="text-slate-600 font-medium mb-4">Je suis :</p>
              <div className="space-y-3 mb-6">
                {ROLES.map(({ value, label, desc, emoji }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={value} className="sr-only" onChange={() => set('role', value)} />
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{label}</div>
                      <div className="text-sm text-slate-500">{desc}</div>
                    </div>
                    {form.role === value && <CheckCircle size={20} className="text-primary-600" />}
                  </label>
                ))}
              </div>
              {form.role === 'DRIVER' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
                  <strong>Note :</strong> Les chauffeurs doivent passer par notre processus de recrutement strict. Votre demande sera examinée par notre équipe.
                </div>
              )}
              <button type="submit" className="btn-primary w-full">Continuer →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom</label>
                  <input type="text" required className="input-field" placeholder="Marie" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input type="text" required className="input-field" placeholder="Konan" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" required className="input-field" placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input type="tel" required className="input-field" placeholder="+225 07 00 00 00" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required className="input-field pr-12" placeholder="Minimum 6 caractères" value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <input type="password" required className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" required id="terms" className="mt-1 w-4 h-4 accent-primary-600" />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  J'accepte les <a href="#" className="text-primary-600 hover:underline">conditions d'utilisation</a> et la <a href="#" className="text-primary-600 hover:underline">politique de confidentialité</a>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Retour</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Créer mon compte'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
