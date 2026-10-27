import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import PublicLayout from '../../components/PublicLayout';
import Icon from '../../components/Icon';
import OtpInput from '../../components/OtpInput';
import { uiText } from '../../i18n';

const t = (text, options) => uiText('pages.auth.Login', text, options);

const RESEND_DELAY = 60;

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, otpVerify, getDashboardPath } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Connexion par code email (OTP) — ?otp=1 ou onglet « Code par email »
  const [otpMode, setOtpMode] = useState(params.get('otp') === '1');
  const [otpStep, setOtpStep] = useState(1); // 1 = identité + email, 2 = code
  const [otp, setOtp] = useState({ firstName: '', lastName: '', email: '', code: '' });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const next = params.get('next');
  const done = (user) => navigate(next || getDashboardPath(user.role));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (result.success) done(result.user); else setError(result.error);
  };

  const sendCode = async (e) => {
    e?.preventDefault();
    setError(''); setLoading(true);
    try {
      await authAPI.otpRequest({ email: otp.email.trim(), first_name: otp.firstName.trim(), last_name: otp.lastName.trim() });
      setOtpStep(2);
      setCooldown(RESEND_DELAY);
    } catch (err) {
      const d = err.response?.data;
      setError(d ? String(Object.values(d)[0]) : t('Envoi impossible — vérifiez votre connexion.'));
    }
    setLoading(false);
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const result = await otpVerify(otp.email.trim(), otp.code.trim());
    setLoading(false);
    if (result.success) done(result.user); else setError(result.error);
  };

  const switchMode = (value) => { setOtpMode(value); setError(''); };
  const spinner = <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />;

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-12 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 font-label-sm text-label-sm">
          <span className="flex items-center gap-1.5 text-primary"><Icon name="lock" size={16} />{t('Connexion sécurisée AutoLink Pro')}</span>
          <span className="text-on-surface-variant">{t('Vos choix sont sauvegardés')}</span>
        </div>

        <div className="card p-8 flex flex-col gap-5">
          {otpMode && otpStep === 2 ? (
            <form onSubmit={verifyCode} className="flex flex-col gap-5 text-center">
              <span className="w-14 h-14 mx-auto rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name="mark_email_read" size={30} /></span>
              <div>
                <h1 className="font-headline-xl text-headline-xl-mobile text-on-surface dark:text-white">{t('Vérifiez votre email')}</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t('Code à 6 chiffres envoyé à')} <strong className="text-on-surface dark:text-white">{otp.email}</strong>{' '}
                  <button type="button" onClick={() => { setOtpStep(1); setError(''); }} className="text-primary font-label-md text-label-md underline">{t('modifier')}</button>
                </p>
              </div>
              <OtpInput value={otp.code} onChange={(code) => setOtp((o) => ({ ...o, code }))} />
              {error && <p role="alert" className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-body-md text-body-md flex items-center gap-2"><Icon name="error" size={18} />{error}</p>}
              <button type="submit" disabled={loading || otp.code.length !== 6} className="btn-primary w-full">{loading ? spinner : <>{t('Valider et me connecter')}<Icon name="arrow_forward" size={18} /></>}</button>
              <button type="button" onClick={sendCode} disabled={loading || cooldown > 0} className="font-label-md text-label-md text-primary disabled:text-on-surface-variant">
                {cooldown > 0 ? t('Renvoyer le code dans {{s}} s', { s: cooldown }) : t('Renvoyer le code')}
              </button>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1"><Icon name="timer" size={16} />{t('Le code expire dans 10 minutes.')}</p>
            </form>
          ) : (
            <>
              <div className="text-center flex flex-col items-center gap-2">
                <span className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name="lock_open" /></span>
                <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-surface dark:text-white">{t('Bon retour')}</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">{t('Connectez-vous à votre espace personnel AutoLink Pro')}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container-low dark:bg-slate-900">
                <button type="button" onClick={() => switchMode(false)} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-label-md text-label-md ${!otpMode ? 'bg-surface-container-lowest text-primary shadow-sm dark:bg-slate-800' : 'text-on-surface-variant'}`}><Icon name="key" size={18} />{t('Mot de passe')}</button>
                <button type="button" onClick={() => switchMode(true)} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-label-md text-label-md ${otpMode ? 'bg-surface-container-lowest text-primary shadow-sm dark:bg-slate-800' : 'text-on-surface-variant'}`}><Icon name="sms" size={18} />{t('Code par email')}</button>
              </div>
              <GoogleAuthButton />
              <div className="flex items-center gap-3"><span className="flex-1 h-px bg-outline-variant/50" /><span className="font-body-sm text-body-sm text-on-surface-variant">{t('ou par identifiant')}</span><span className="flex-1 h-px bg-outline-variant/50" /></div>

              {error && <p role="alert" className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-body-md text-body-md flex items-center gap-2"><Icon name="error" size={18} />{error}</p>}

              {otpMode ? (
                <form onSubmit={sendCode} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label><span className="label">{t('Prénom')}</span><input className="input-field" value={otp.firstName} onChange={(e) => setOtp((o) => ({ ...o, firstName: e.target.value }))} /></label>
                    <label><span className="label">{t('Nom')}</span><input className="input-field" value={otp.lastName} onChange={(e) => setOtp((o) => ({ ...o, lastName: e.target.value }))} /></label>
                  </div>
                  <label><span className="label">{t('Adresse email')}</span>
                    <span className="relative block"><Icon name="alternate_email" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type="email" required autoComplete="email" className="input-field pl-10" placeholder={t('votre@email.com')} value={otp.email} onChange={(e) => setOtp((o) => ({ ...o, email: e.target.value }))} /></span>
                  </label>
                  <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? spinner : <><Icon name="mark_email_unread" size={18} />{t('Recevoir mon code')}</>}</button>
                  <p className="font-body-sm text-body-sm text-on-surface-variant text-center">{t('Un code à 6 chiffres sera envoyé sur votre email. Aucun mot de passe nécessaire.')}</p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <label><span className="label">{t('Adresse email')}</span>
                    <span className="relative block"><Icon name="alternate_email" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type="email" required autoComplete="email" className="input-field pl-10" placeholder={t('Votre adresse électronique')} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></span>
                  </label>
                  <label>
                    <span className="flex justify-between items-center"><span className="label">{t('Mot de passe')}</span>
                      <button type="button" onClick={() => { setOtp((o) => ({ ...o, email: form.email })); switchMode(true); }} className="font-label-md text-label-md text-primary mb-1.5">{t('Mot de passe oublié ?')}</button></span>
                    <span className="relative block"><Icon name="lock" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input type={showPw ? 'text' : 'password'} required autoComplete="current-password" className="input-field pl-10 pr-12" placeholder="••••••••" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-label={showPw ? t('Masquer le mot de passe') : t('Afficher le mot de passe')}><Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} /></button>
                    </span>
                  </label>
                  <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? spinner : <>{t('Se connecter')}<Icon name="arrow_forward" size={18} /></>}</button>
                </form>
              )}
            </>
          )}
          <p className="text-center font-body-md text-body-md text-on-surface-variant pt-4 border-t border-outline-variant/30">{t('Pas encore de compte ?')}{' '}
            <Link to={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-label-lg text-label-lg text-primary">{t("S'inscrire gratuitement")}</Link>
          </p>
        </div>
        <p className="flex items-center justify-center gap-1 font-body-sm text-body-sm text-on-surface-variant"><Icon name="verified_user" size={16} />{t('Connexion chiffrée · Données protégées')}</p>
      </div>
    </PublicLayout>
  );
}
