import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Car, Shield, Zap, KeyRound, ChevronRight } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';

// Popup d'accueil — campagne de conversion : pousse à la réservation.
// Affiché une fois par session, ~1,2 s après le chargement de la page.
export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('autolink_promo_seen')) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem('autolink_promo_seen', '1');
    setShow(false);
  };

  const go = (path) => { close(); navigate(path); };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={close}>
      <div className="relative w-full max-w-md bg-gradient-to-b from-primary-950 to-slate-900 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Bandeau visuel */}
        <div className="relative h-40 bg-gradient-to-br from-primary-600 via-primary-800 to-slate-900">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, #fff 0%, transparent 40%)' }} />
          <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-primary-950 to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
            <Car size={34} className="text-white" />
          </div>
          <span className="absolute top-4 left-4 bg-accent-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Offre de lancement
          </span>
          <button onClick={close} aria-label="Fermer"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-7 pb-7 mt-1">
          <h2 className="text-2xl font-black text-white leading-normal">
            Votre véhicule vous attend.<br />
            <span className="text-accent-400">Réservation en 2 minutes.</span>
          </h2>
          <p className="text-primary-200 text-sm mt-2">
            Berlines, 4×4, vans — avec ou sans chauffeur, partout au Cameroun.
          </p>

          <div className="flex gap-2 mt-4">
            {[{ icon: Zap, l: 'Confirmation immédiate' }, { icon: Shield, l: 'Caution sécurisée' }, { icon: KeyRound, l: 'Sans mot de passe' }].map(f => (
              <div key={f.l} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 text-center">
                <f.icon size={16} className="text-accent-400 mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-primary-100 leading-snug block">{f.l}</span>
              </div>
            ))}
          </div>

          {/* Connexion express */}
          <div className="mt-5 space-y-2.5">
            <GoogleAuthButton label="Continuer avec Google" />
            <button onClick={() => go('/login?otp=1')}
              className="w-full flex items-center justify-center gap-2 border border-primary-400/40 hover:border-primary-300 bg-primary-500/10 hover:bg-primary-500/20 text-primary-100 rounded-xl py-3 font-semibold text-sm transition">
              <KeyRound size={16} /> Recevoir un code par email
            </button>
            <button onClick={() => go('/register')}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-1 font-bold">
              Réserver mon véhicule <ChevronRight size={18} />
            </button>
            <button onClick={close} className="w-full text-center text-xs text-primary-300 hover:text-white py-1 transition">
              Continuer sans compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
