import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle, KeyRound, MailCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, otpVerify, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Connexion par code email (OTP) — ?otp=1 ou bouton "code par email"
  const [otpMode, setOtpMode] = useState(params.get('otp') === '1');
  const [otpStep, setOtpStep] = useState(1); // 1 = identité+email, 2 = code
  const [otp, setOtp] = useState({ firstName: '', lastName: '', email: '', code: '' });
  const [sent, setSent] = useState(false);

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

  const sendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.otpRequest({
        email: otp.email.trim(),
        first_name: otp.firstName.trim(),
        last_name: otp.lastName.trim(),
      });
      setSent(true);
      setOtpStep(2);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? (Object.values(d)[0]) : 'Envoi impossible — vérifiez votre connexion.');
    }
    setLoading(false);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await otpVerify(otp.email.trim(), otp.code.trim());
    setLoading(false);
    if (result.success) {
      navigate(getDashboardPath(result.user.role));
    } else {
      setError(result.error);
    }
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
          <h1 className="text-2xl font-bold text-white mb-2">Bon retour</h1>
          <p className="text-primary-300">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {otpMode ? (
            <form onSubmit={otpStep === 1 ? sendCode : verifyCode} className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-700 bg-primary-50 rounded-xl p-3">
                <KeyRound size={16} /> Connexion par code email — sans mot de passe
              </div>
              {otpStep === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" className="input-field" placeholder="Prénom"
                      value={otp.firstName} onChange={e => setOtp(o => ({ ...o, firstName: e.target.value }))} />
                    <input type="text" className="input-field" placeholder="Nom"
                      value={otp.lastName} onChange={e => setOtp(o => ({ ...o, lastName: e.target.value }))} />
                  </div>
                  <input type="email" required autoComplete="email" className="input-field"
                    placeholder="votre@gmail.com"
                    value={otp.email} onChange={e => setOtp(o => ({ ...o, email: e.target.value }))} />
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><MailCheck size={16} /> Recevoir mon code</>}
                  </button>
                  <p className="text-xs text-slate-400 text-center">Un code à 6 chiffres sera envoyé sur votre email.</p>
                </>
              ) : (
                <>
                  <div className="text-center text-sm text-slate-600">
                    Code envoyé à <strong>{otp.email}</strong>{' '}
                    <button type="button" onClick={() => { setOtpStep(1); setError(''); }} className="text-primary-600 font-semibold">modifier</button>
                  </div>
                  <input type="text" required inputMode="numeric" maxLength={6} autoFocus
                    className="input-field text-center text-2xl font-black tracking-[0.5em]"
                    placeholder="••••••"
                    value={otp.code} onChange={e => setOtp(o => ({ ...o, code: e.target.value.replace(/\D/g, '') }))} />
                  <button type="submit" disabled={loading || otp.code.length !== 6} className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Valider et me connecter'}
                  </button>
                  <button type="button" onClick={sendCode} disabled={loading} className="w-full text-xs text-primary-600 font-semibold">
                    Renvoyer le code
                  </button>
                </>
              )}
              <button type="button" onClick={() => { setOtpMode(false); setError(''); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
                ← Retour à la connexion classique
              </button>
            </form>
          ) : (
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
          )}

          {!otpMode && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OU</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <GoogleAuthButton />
            <button type="button" onClick={() => { setOtpMode(true); setError(''); }}
              className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary-200 hover:border-primary-400 text-primary-700 rounded-xl py-3 font-semibold text-sm transition">
              <KeyRound size={16} /> Recevoir un code par email
            </button>
          </>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">S'inscrire gratuitement</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
