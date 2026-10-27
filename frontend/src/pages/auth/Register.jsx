import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import PublicLayout from '../../components/PublicLayout';
import Icon from '../../components/Icon';
import OtpInput from '../../components/OtpInput';
import { uiText } from '../../i18n';

const t = (text, options) => uiText('pages.auth.Register', text, options);

const ROLES = [
  { value: 'CLIENT', label: 'Je veux louer', icon: 'directions_car' },
  { value: 'OWNER', label: 'Je veux proposer', icon: 'key' },
  { value: 'DRIVER', label: 'Je veux conduire', icon: 'badge' },
];

const strengthOf = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};
const STRENGTH = ['Trop faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
const STRENGTH_COLORS = ['bg-error', 'bg-error', 'bg-tertiary-container', 'bg-primary-container', 'bg-primary'];

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, otpVerify, getDashboardPath } = useAuth();
  const initialRole = ROLES.some((r) => r.value === params.get('role')) ? params.get('role') : 'CLIENT';
  const [step, setStep] = useState(1); // 1 = formulaire, 2 = vérification email
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: initialRole, agentCode: params.get('ref') || '' });
  const [showReferral, setShowReferral] = useState(Boolean(params.get('ref')));
  const [code, setCode] = useState('');
  const [emailSent, setEmailSent] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const next = params.get('next');
  const strength = strengthOf(form.password);

  const sendCode = async () => {
    try {
      await authAPI.otpRequest({ email: form.email.trim(), first_name: form.firstName, last_name: form.lastName });
      setCooldown(60);
      return true;
    } catch (_) { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError(t('Les mots de passe ne correspondent pas.')); return; }
    if (form.password.length < 6) { setError(t('Le mot de passe doit contenir au moins 6 caractères.')); return; }
    setError(''); setLoading(true);
    const result = await register({ ...form, agentCode: form.agentCode.trim() });
    if (!result.success) { setLoading(false); setError(result.error); return; }
    // Compte créé → envoi du code de validation par email
    setEmailSent(await sendCode());
    setLoading(false);
    setStep(2);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) { setError(t('Entrez le code à 6 chiffres reçu par email.')); return; }
    setError(''); setLoading(true);
    const result = await otpVerify(form.email.trim(), code.trim());
    setLoading(false);
    if (result.success) navigate(next || getDashboardPath(result.user.role)); else setError(result.error);
  };

  const handleResend = async () => {
    setError(''); setLoading(true);
    const ok = await sendCode();
    setLoading(false);
    setEmailSent(ok);
    if (!ok) setError(t("Le code n'a pas pu être renvoyé — réessayez dans une minute."));
  };

  const spinner = <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />;
  const errorBox = error && <p role="alert" className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-body-md text-body-md flex items-center gap-2"><Icon name="error" size={18} />{error}</p>;

  return (
    <PublicLayout>
      <div className="max-w-xl mx-auto px-4 py-12 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="badge-info"><Icon name="verified" size={14} />{t('Cameroun · Douala & Yaoundé')}</span>
          <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white">{step === 1 ? t('Créer un compte') : t('Vérifiez votre email')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{step === 1 ? t('Rejoignez AutoLink Pro en quelques instants') : t('Dernière étape avant d’accéder à votre espace')}</p>
        </div>

        {step === 1 ? (
          <>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30">
              {ROLES.map((role) => (
                <button key={role.value} type="button" onClick={() => set('role', role.value)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-label-md text-label-md ${form.role === role.value ? 'bg-surface-container-lowest text-primary shadow-sm dark:bg-slate-800' : 'text-on-surface-variant'}`}>
                  <Icon name={role.icon} size={18} />{t(role.label)}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-4">
              <GoogleAuthButton label={t("S'inscrire avec Google")} />
              <div className="flex items-center gap-3"><span className="flex-1 h-px bg-outline-variant/50" /><span className="font-body-sm text-body-sm text-on-surface-variant">{t('ou par e-mail et téléphone')}</span><span className="flex-1 h-px bg-outline-variant/50" /></div>
              {form.role === 'DRIVER' && (
                <p className="rounded-xl p-3 bg-tertiary-fixed text-on-tertiary-fixed-variant font-body-sm text-body-sm"><strong>{t('Note :')}</strong> {t('Les chauffeurs passent par notre processus de recrutement. Votre candidature sera examinée par notre équipe.')}</p>
              )}
              {form.role === 'OWNER' && (
                <p className="rounded-xl p-3 bg-primary-fixed/30 text-on-primary-fixed-variant font-body-sm text-body-sm">{t('Après inscription, ajoutez votre véhicule depuis votre espace propriétaire : il sera inspecté avant sa mise en ligne.')}</p>
              )}
              {errorBox}
              <div className="grid grid-cols-2 gap-3">
                <label><span className="label">{t('Prénom')} *</span><input required className="input-field" placeholder={t('Emmanuel')} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></label>
                <label><span className="label">{t('Nom')} *</span><input required className="input-field" placeholder={t('Ndedi')} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></label>
              </div>
              <label><span className="label">{t('Adresse e-mail')} *</span>
                <span className="relative block"><Icon name="mail" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type="email" required autoComplete="email" className="input-field pl-10" placeholder={t('vous@exemple.com')} value={form.email} onChange={(e) => set('email', e.target.value)} /></span>
              </label>
              <label>
                <span className="flex items-center justify-between"><span className="label">{t('Numéro de téléphone')} *</span>
                  <span className="flex gap-1 mb-1.5"><span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-900 text-[10px] font-bold">MTN MOMO</span><span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 text-[10px] font-bold">ORANGE MONEY</span></span>
                </span>
                <span className="flex gap-2"><span className="px-3 flex items-center rounded-xl bg-surface-container-low dark:bg-slate-900 font-label-md text-label-md">CM +237</span>
                  <input type="tel" required className="input-field" placeholder="6XX XX XX XX" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></span>
              </label>
              <label><span className="label">{t('Mot de passe')} *</span>
                <span className="relative block"><Icon name="lock" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input type={showPw ? 'text' : 'password'} required autoComplete="new-password" className="input-field pl-10 pr-12" placeholder={t('Au moins 8 caractères')} value={form.password} onChange={(e) => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-label={t('Afficher le mot de passe')}><Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} /></button>
                </span>
              </label>
              <div>
                <div className="grid grid-cols-4 gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 rounded-full ${form.password && i < Math.max(1, strength) ? STRENGTH_COLORS[strength] : 'bg-surface-container-high'}`} />)}</div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant mt-1"><span>{t('Force du mot de passe')}</span><span>{form.password ? t(STRENGTH[strength]) : '—'}</span></div>
              </div>
              <label><span className="label">{t('Confirmer le mot de passe')} *</span><input type="password" required autoComplete="new-password" className="input-field" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} /></label>
              <div>
                <button type="button" onClick={() => setShowReferral(!showReferral)} className="w-full flex items-center justify-between font-label-lg text-label-lg text-primary">
                  <span className="flex items-center gap-2"><Icon name="redeem" size={20} />{t('Vous avez un code de parrainage ?')}</span><Icon name="expand_more" className={showReferral ? 'rotate-180' : ''} />
                </button>
                {showReferral && <input className="input-field mt-2" placeholder={t('Ex. AGT-DOUALA-001')} value={form.agentCode} onChange={(e) => set('agentCode', e.target.value)} />}
              </div>
              <label className="flex items-start gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-primary" />
                <span>{t("J'accepte les")} <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('Conditions générales')}</a> {t('et la')} <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">{t('Politique de confidentialité')}</a>.</span>
              </label>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? spinner : <>{t('Créer mon compte')}<Icon name="arrow_forward" size={18} /></>}</button>
              <p className="text-center font-body-md text-body-md text-on-surface-variant">{t('Déjà inscrit ?')}{' '}
                <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-label-lg text-label-lg text-primary">{t('Se connecter')}</Link>
              </p>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerify} className="card p-8 flex flex-col gap-5 text-center">
            <span className="w-14 h-14 mx-auto rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name="mark_email_read" size={30} /></span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {emailSent
                ? <>{t('Un code à 6 chiffres a été envoyé à')} <strong className="text-on-surface dark:text-white">{form.email}</strong>. {t('Saisissez-le pour activer votre compte.')}</>
                : t("Votre compte est créé, mais l'email de validation n'a pas pu être envoyé. Vous pouvez réessayer ou vous connecter plus tard.")}
            </p>
            <OtpInput value={code} onChange={setCode} />
            {errorBox}
            <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full">{loading ? spinner : t('Valider mon compte')}</button>
            <button type="button" onClick={handleResend} disabled={loading || cooldown > 0} className="font-label-md text-label-md text-primary disabled:text-on-surface-variant">
              {cooldown > 0 ? t('Renvoyer le code dans {{s}} s', { s: cooldown }) : t('Renvoyer le code')}
            </button>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1"><Icon name="timer" size={16} />{t('Le code expire dans 10 minutes.')}</p>
            <Link to="/login" className="font-label-md text-label-md text-on-surface-variant underline">{t('Me connecter plus tard')}</Link>
          </form>
        )}
        <div className="flex justify-center gap-6 font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><Icon name="lock" size={16} />{t('Données sécurisées')}</span>
          <span className="flex items-center gap-1"><Icon name="verified_user" size={16} />{t('Paiements certifiés')}</span>
        </div>
      </div>
    </PublicLayout>
  );
}
