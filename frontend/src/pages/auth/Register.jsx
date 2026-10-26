import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Car, Eye, EyeOff, AlertCircle, CheckCircle, User, KeyRound, Briefcase, MailCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { uiText } from '../../i18n';

const ROLES = [
  { value: 'CLIENT', label: uiText("pages.auth.Register", "Client"), desc: uiText("pages.auth.Register", "Je veux louer un véhicule"), icon: User },
  { value: 'OWNER', label: uiText("pages.auth.Register", "Propriétaire"), desc: uiText("pages.auth.Register", "Je veux proposer mon véhicule"), icon: KeyRound },
  { value: 'DRIVER', label: uiText("pages.auth.Register", "Chauffeur"), desc: uiText("pages.auth.Register", "Je veux conduire pour AutoLink"), icon: Briefcase },
];

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, otpVerify, getDashboardPath } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.role) { setError(uiText("pages.auth.Register", "Veuillez choisir un rôle.")); return; }
    setError('');
    setStep(2);
  };

  const sendCode = async () => {
    try {
      await authAPI.otpRequest({ email: form.email.trim(), first_name: form.firstName, last_name: form.lastName });
      return true;
    } catch (_) { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError(uiText("pages.auth.Register", "Les mots de passe ne correspondent pas.")); return; }
    if (form.password.length < 6) { setError(uiText("pages.auth.Register", "Le mot de passe doit contenir au moins 6 caractères.")); return; }
    setError('');
    setLoading(true);
    const result = await register({ ...form, agentCode: params.get('ref') || '' });
    if (!result.success) { setLoading(false); setError(result.error); return; }
    // Compte créé → on envoie le code de validation par email (étape 3)
    setEmailSent(await sendCode());
    setLoading(false);
    setStep(3);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) { setError(uiText("pages.auth.Register", "Entrez le code à 6 chiffres reçu par email.")); return; }
    setError('');
    setLoading(true);
    const result = await otpVerify(form.email.trim(), code.trim());
    setLoading(false);
    if (result.success) navigate(params.get('next') || getDashboardPath(result.user.role));
    else setError(result.error);
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const ok = await sendCode();
    setLoading(false);
    setEmailSent(ok);
    if (!ok) setError(uiText("pages.auth.Register", "Le code n'a pas pu être renvoyé — réessayez dans une minute."));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="absolute right-4 top-4 z-10"><LanguageSwitcher /></div>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Car size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white">{uiText("pages.auth.Register", "Auto")}<span className="text-primary-400">{uiText("pages.auth.Register", "Link")}</span> <span className="text-accent-400 text-sm">{uiText("pages.auth.Register", "PRO")}</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">{uiText("pages.auth.Register", "Créer votre compte")}</h1>
          <p className="text-primary-300 text-sm">{uiText("pages.auth.Register", "Étape") + " "}{step}{uiText("pages.auth.Register", "/3 —") + " "}{step === 1 ? uiText("pages.auth.Register", "Choisissez votre rôle") : step === 2 ? uiText("pages.auth.Register", "Vos informations") : uiText("pages.auth.Register", "Vérification email")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(n => (
              <div key={n} className={`flex-1 h-1.5 rounded-full transition-colors ${n <= step ? 'bg-primary-600' : 'bg-slate-200'}`} />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 mb-5 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {params.get('ref') && step < 3 && (
            <p className="mb-4 rounded-lg bg-primary-50 p-3 text-sm text-primary-700">{uiText("pages.auth.Register", "Code de parrainage appliqué :") + " "}<strong>{params.get('ref')}</strong>
            </p>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              <p className="text-slate-600 font-medium mb-4">{uiText("pages.auth.Register", "Je suis :")}</p>
              <div className="space-y-3 mb-6">
                {ROLES.map(({ value, label, desc, icon: RoleIcon }) => (
                  <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="radio" name="role" value={value} className="sr-only" onChange={() => set('role', value)} />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${form.role === value ? 'bg-primary-600' : 'bg-slate-100'}`}>
                      <RoleIcon size={18} className={form.role === value ? uiText("pages.auth.Register", "text-white") : uiText("pages.auth.Register", "text-slate-500")} />
                    </div>
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
                  <strong>{uiText("pages.auth.Register", "Note :")}</strong>{" " + uiText("pages.auth.Register", "Les chauffeurs doivent passer par notre processus de recrutement strict. Votre demande sera examinée par notre équipe.") + " "}</div>
              )}
              <button type="submit" className="btn-primary w-full">{uiText("pages.auth.Register", "Continuer →")}</button>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">{uiText("pages.auth.Register", "OU")}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <GoogleAuthButton label={uiText("pages.auth.Register", "S'inscrire avec Google")} />
            </form>
          ) : step === 3 ? (
            <form onSubmit={handleVerify} className="text-center">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MailCheck size={26} className="text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">{uiText("pages.auth.Register", "Vérifiez votre email")}</h2>
              <p className="text-sm text-slate-500 mb-5">
                {emailSent
                  ? <>{uiText("pages.auth.Register", "Un code à 6 chiffres a été envoyé à") + " "}<span className="font-semibold text-slate-700">{form.email}</span>{uiText("pages.auth.Register", ". Copiez-le ici pour activer votre compte.")}</>
                  : <>{uiText("pages.auth.Register", "Votre compte est créé, mais l'email de validation n'a pas pu être envoyé. Vous pouvez réessayer ou vous connecter plus tard.")}</>}
              </p>
              <input
                type="text" inputMode="numeric" maxLength={6} required autoFocus
                className="input-field text-center text-2xl font-black tracking-[0.5em] mb-4"
                placeholder={uiText("pages.auth.Register", "••••••")} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : uiText("pages.auth.Register", "Valider mon compte")}
              </button>
              <button type="button" onClick={handleResend} disabled={loading} className="text-sm text-primary-600 font-semibold hover:underline mt-4">{uiText("pages.auth.Register", "Renvoyer le code") + " "}</button>
              <p className="text-xs text-slate-400 mt-3">{uiText("pages.auth.Register", "Le code expire dans 10 minutes.")}</p>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{uiText("pages.auth.Register", "Prénom")}</label>
                  <input type="text" required className="input-field" placeholder={uiText("pages.auth.Register", "Marie")} value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                </div>
                <div>
                  <label className="label">{uiText("pages.auth.Register", "Nom")}</label>
                  <input type="text" required className="input-field" placeholder={uiText("pages.auth.Register", "Konan")} value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">{uiText("pages.auth.Register", "Email")}</label>
                <input type="email" required className="input-field" placeholder={uiText("pages.auth.Register", "Votre adresse électronique")} value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">{uiText("pages.auth.Register", "Téléphone")}</label>
                <input type="tel" required className="input-field" placeholder={uiText("pages.auth.Register", "+237 6XX XX XX XX")} value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="label">{uiText("pages.auth.Register", "Mot de passe")}</label>
                <div className="relative">
                  <input type={showPw ? uiText("pages.auth.Register", "text") : uiText("pages.auth.Register", "password")} required className="input-field pr-12" placeholder={uiText("pages.auth.Register", "Minimum 6 caractères")} value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">{uiText("pages.auth.Register", "Confirmer le mot de passe")}</label>
                <input type="password" required className="input-field" placeholder={uiText("pages.auth.Register", "••••••••")} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" required id="terms" className="mt-1 w-4 h-4 accent-primary-600" />
                <label htmlFor="terms" className="text-sm text-slate-600">{uiText("pages.auth.Register", "J'accepte les") + " "}<a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{uiText("pages.auth.Register", "conditions d'utilisation")}</a>{" " + uiText("pages.auth.Register", "et la") + " "}<a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{uiText("pages.auth.Register", "politique de confidentialité")}</a>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 py-3">{uiText("pages.auth.Register", "← Retour")}</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : uiText("pages.auth.Register", "Créer mon compte")}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">{uiText("pages.auth.Register", "Déjà un compte ?")}{' '}
            <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="text-primary-600 font-semibold hover:underline">{uiText("pages.auth.Register", "Se connecter")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
