import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AutoLinkLogo from '../components/AutoLinkLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import PromoPopup from '../components/PromoPopup';
import { useAuth } from '../contexts/AuthContext';
import { contactAPI, siteAPI, vehiclesAPI } from '../services/api';
import {
  siBentley, siBmw, siChevrolet, siCitroen, siDacia, siFerrari, siFiat,
  siFord, siHonda, siHyundai, siJeep, siKia, siLamborghini, siMaserati,
  siMazda, siMini, siMitsubishi, siNissan, siOpel, siPeugeot, siPorsche,
  siRenault, siRollsroyce, siSkoda, siSubaru, siSuzuki, siTesla, siToyota,
  siVolkswagen, siVolvo,
} from 'simple-icons';
import './Landing.css';
import { formatNumber,  uiText } from '../i18n';

/* ────────────────────────────────────────────────
   IMAGES — Unsplash (libres, haute résolution)
──────────────────────────────────────────────── */
const IMG = {
  hero1:      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=90',
  hero2:      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1920&q=90',
  hero3:      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=90',
  about:      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=85',
  svcUrban:   'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
  svcInter:   'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=600&q=80',
  svcLong:    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
  svcAirport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
  svcEvent:   'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
  svcBiz:     'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  fleet1:     'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80',
  fleet2:     'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80',
  fleet3:     'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=700&q=80',
  fleet4:     'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=700&q=80',
  fleet5:     'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=700&q=80',
  fleet6:     'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=700&q=80',
  fleet7:     'https://images.unsplash.com/photo-1567818735868-e71b99932e29?auto=format&fit=crop&w=700&q=80',
  fleet8:     'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=700&q=80',
};

const FALLBACK_SITE_CONFIG = {
  contact_email: 'wibchallenge@gmail.com',
  phones: ['+237 656 789 000', '+237 699 456 000'],
  addresses: ['Akwa, Rue Joss, Douala', 'Centre-ville, Yaoundé'],
  hours: {
    weekdays: '6h à 22h',
    saturday: '7h à 21h',
    sunday: 'Sur réservation',
  },
};

const EMPTY_SITE_CONFIG = {
  contact_email: '',
  phones: [],
  addresses: [],
  hours: {},
};

const CAR_BRANDS = [
  siToyota, siHonda, siNissan, siVolkswagen, siFord, siHyundai, siKia,
  siMazda, siMitsubishi, siSubaru, siPeugeot, siRenault, siVolvo, siBmw,
  siChevrolet, siCitroen, siDacia, siFiat, siJeep, siOpel, siPorsche,
  siFerrari, siLamborghini, siBentley, siMaserati, siMini, siRollsroyce,
  siSkoda, siSuzuki, siTesla,
].filter(Boolean);

const HERO_SLIDES = [
  {
    image: IMG.hero1,
    label: uiText("pages.Landing", "Location avec chauffeur — Douala & Yaoundé"),
    title: uiText("pages.Landing", "AutoLink Pro"),
    sub:   uiText("pages.Landing", "Votre mobilité, notre mission. Réservez un véhicule avec chauffeur certifié en quelques clics, payez via Orange Money ou MTN."),
    cta1:  uiText("pages.Landing", "Réserver maintenant"),
    cta2:  uiText("pages.Landing", "Voir la flotte"),
    cta2Href: '#flotte',
  },
  {
    image: IMG.hero2,
    label: uiText("pages.Landing", "Flotte premium certifiée"),
    title: uiText("pages.Landing", "Des véhicules d'exception"),
    sub:   uiText("pages.Landing", "Berlines, SUV, véhicules de luxe — une flotte rigoureusement inspectée pour chaque occasion, du transport urbain au voyage interurbain."),
    cta1:  uiText("pages.Landing", "Voir le catalogue"),
    cta2:  uiText("pages.Landing", "Nos services"),
    cta2Href: '#services',
  },
  {
    image: IMG.hero3,
    label: uiText("pages.Landing", "Premier au Cameroun"),
    title: uiText("pages.Landing", "Urbain, interurbain, national"),
    sub:   uiText("pages.Landing", "3h, 8h, journée complète ou voyage Douala-Yaoundé — AutoLink Pro s'adapte à chaque besoin de déplacement avec fiabilité et ponctualité."),
    cta1:  uiText("pages.Landing", "Commencer maintenant"),
    cta2:  uiText("pages.Landing", "En savoir plus"),
    cta2Href: '#apropos',
  },
];

const SERVICES = [
  {
    img:   IMG.svcUrban,
    title: uiText("pages.Landing", "Location Urbaine"),
    desc:  uiText("pages.Landing", "Déplacements en ville, courses, rendez-vous professionnels. Formules 3h, 4h, 8h, 12h et 24h avec chauffeur certifié inclus."),
    href:  '#contact',
  },
  {
    img:   IMG.svcInter,
    title: uiText("pages.Landing", "Location Interurbaine"),
    desc:  uiText("pages.Landing", "Trajets longue distance entre Douala, Yaoundé, Bafoussam, Kribi et plus. Confort et sécurité pour vos voyages en dehors de la ville."),
    href:  '#contact',
  },
  {
    img:   IMG.svcLong,
    title: uiText("pages.Landing", "Location Longue Durée"),
    desc:  uiText("pages.Landing", "Location sur plusieurs jours avec forfait kilométrique adapté. Dépôt de garantie et contrat transparent pour toute location supérieure à 3 jours."),
    href:  '#contact',
  },
  {
    img:   IMG.svcAirport,
    title: uiText("pages.Landing", "Transfert Aéroport"),
    desc:  uiText("pages.Landing", "Prise en charge ponctuelle à l'aéroport de Douala et Yaoundé. Chauffeur en attente, suivi du vol en temps réel."),
    href:  '#contact',
  },
  {
    img:   IMG.svcEvent,
    title: uiText("pages.Landing", "Location Événementielle"),
    desc:  uiText("pages.Landing", "Mariages, baptêmes, cérémonies d'entreprise. Véhicules décorés sur demande, chauffeurs en tenue de circonstance."),
    href:  '#contact',
  },
  {
    img:   IMG.svcBiz,
    title: uiText("pages.Landing", "Voyages d'Affaires"),
    desc:  uiText("pages.Landing", "Flotte externalisée pour les déplacements de vos collaborateurs. Facturation mensuelle, tableau de bord dédié pour les entreprises."),
    href:  '#contact',
  },
];

const STEPS = [
  { n: '01', title: uiText("pages.Landing", "Inscrivez-vous"),    desc: uiText("pages.Landing", "Créez votre compte en 2 minutes, choisissez votre rôle et complétez la vérification d'identité.") },
  { n: '02', title: uiText("pages.Landing", "Choisissez"),        desc: uiText("pages.Landing", "Parcourez la flotte certifiée, comparez les tarifs et sélectionnez votre véhicule selon vos besoins.") },
  { n: '03', title: uiText("pages.Landing", "Payez en mobile"),   desc: uiText("pages.Landing", "Réglez en toute sécurité via MTN Mobile Money ou Orange Money. Confirmation immédiate par SMS.") },
  { n: '04', title: uiText("pages.Landing", "Profitez du trajet"),desc: uiText("pages.Landing", "Votre chauffeur vous prend en charge à l'heure convenue. Notez votre expérience à la fin du trajet.") },
];

/* ────────────────────────────────────────────────
   COMPOSANT : Counter animé
──────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const inc = target / steps;
          let cur = 0;
          const timer = setInterval(() => {
            cur += inc;
            if (cur >= target) { clearInterval(timer); setCount(target); }
            else setCount(Math.floor(cur));
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{formatNumber(count)}{suffix}</span>;
}

/* ────────────────────────────────────────────────
   NAV LINKS constant
──────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: uiText("pages.Landing", "Accueil"),               href: '#accueil' },
  { label: uiText("pages.Landing", "À propos"),              href: '#apropos' },
  { label: uiText("pages.Landing", "Services"),              href: '#services' },
  { label: uiText("pages.Landing", "Flotte"),                href: '#flotte' },
  { label: uiText("pages.Landing", "Contact & Réservation"), href: '#contact' },
];

/* ────────────────────────────────────────────────
   HEADER FIXE (TopBar + Navbar en un seul bloc)
   Comportement identique à trireno-services.fr
──────────────────────────────────────────────── */
function Navbar({ navigate, isAuthenticated, dashboardPath, siteConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ─── TopBar (masqué si scrolled ou sur mobile) ─── */}
      <div className={`bg-slate-900 text-slate-300 text-xs transition-all duration-300 overflow-hidden hidden md:block ${scrolled ? 'max-h-0 py-0' : 'max-h-10 py-2.5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {siteConfig.phones[0] && <a href={`tel:${siteConfig.phones[0].replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              {siteConfig.phones[0]}
            </a>}
            {siteConfig.contact_email && <a href={`mailto:${siteConfig.contact_email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              {siteConfig.contact_email}
            </a>}
          </div>
          <span className="text-slate-500">{uiText("pages.Landing", "Lun–Ven :") + " "}{siteConfig.hours.weekdays || uiText("pages.Landing", "—")}{" " + uiText("pages.Landing", "· Sam :") + " "}{siteConfig.hours.saturday || uiText("pages.Landing", "—")}{" " + uiText("pages.Landing", "· Dim :") + " "}{siteConfig.hours.sunday || uiText("pages.Landing", "—")}
          </span>
        </div>
      </div>

      {/* ─── Navbar principale ─── */}
      <nav className={`transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#accueil" className="shrink-0">
              <AutoLinkLogo size="lg" />
            </a>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}
                  className={`text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-slate-700 hover:text-teal-600'
                      : 'text-white/90 hover:text-white'
                  }`}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSwitcher className={scrolled ? '' : uiText("pages.Landing", "border-white/30")} />
              {isAuthenticated ? (
                <button onClick={() => navigate(dashboardPath)}
                  className="text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded transition-colors shadow-md">{uiText("pages.Landing", "Tableau de bord") + " "}</button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}
                    className={`text-sm font-semibold px-4 py-2 rounded transition-colors ${
                      scrolled ? 'text-teal-700 hover:bg-teal-50' : 'text-white hover:bg-white/10'
                    }`}>{uiText("pages.Landing", "Connexion") + " "}</button>
                  <button onClick={() => navigate('/register')}
                    className="text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded transition-colors shadow-md">{uiText("pages.Landing", "S'inscrire") + " "}</button>
                </>
              )}
            </div>

            {/* Mobile burger */}
            <button onClick={() => setOpen(!open)}
              className={`lg:hidden p-2 ${scrolled ? 'text-slate-700' : 'text-white'}`}
              aria-label={uiText("pages.Landing", "Menu")}>
              {open ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg px-4 py-4">
            <div className="flex justify-end pb-3">
              <LanguageSwitcher />
            </div>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block py-3 px-2 text-slate-700 font-medium border-b border-slate-50 hover:text-teal-600 transition-colors text-sm">
                {l.label}
              </a>
            ))}
            <div className="flex gap-3 pt-4">
              {isAuthenticated ? (
                <button onClick={() => navigate(dashboardPath)}
                  className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded text-sm">{uiText("pages.Landing", "Tableau de bord") + " "}</button>
              ) : (
                <>
                  <button onClick={() => navigate('/login')}
                    className="flex-1 border border-teal-600 text-teal-700 font-semibold py-2.5 rounded text-sm">{uiText("pages.Landing", "Connexion") + " "}</button>
                  <button onClick={() => navigate('/register')}
                    className="flex-1 bg-teal-600 text-white font-bold py-2.5 rounded text-sm">{uiText("pages.Landing", "S'inscrire") + " "}</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ────────────────────────────────────────────────
   HERO SLIDER
──────────────────────────────────────────────── */
function HeroSlider({ onReserve }) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback((idx) => {
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 400);
  }, []);

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [current, go]);

  const slide = HERO_SLIDES[current];

  return (
    <section id="accueil" className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <img src={slide.image} alt={slide.title}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.background = '#0f172a'; e.target.style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 transition-all duration-500 ${fading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-3xl mt-20 md:mt-16">
          <span className="inline-block bg-teal-500/90 text-white text-xs font-bold px-4 py-1.5 rounded-sm mb-6 uppercase tracking-widest">
            {slide.label}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-snug mb-6">
            {slide.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
            {slide.sub}
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onReserve}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-4 px-8 rounded-sm transition-all shadow-2xl hover:-translate-y-0.5 text-sm tracking-wide uppercase">
              {slide.cta1}
            </button>
            <a href={slide.cta2Href}
              className="border-2 border-white/60 hover:border-white text-white font-semibold py-4 px-8 rounded-sm transition-all hover:bg-white/10 text-sm tracking-wide uppercase">
              {slide.cta2}
            </a>
          </div>
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/65">
            {[uiText("pages.Landing", "Paiement sécurisé"), uiText("pages.Landing", "Chauffeurs certifiés"), uiText("pages.Landing", "Disponible 24h/24")].map(t => (
              <span key={t} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            className={`rounded-sm transition-all ${i === current ? 'w-8 h-2 bg-teal-400' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>

      {/* Scroll indicator */}
      <a href="#apropos"
        className="absolute bottom-8 right-8 w-10 h-10 border border-white/30 flex items-center justify-center text-white/50 hover:text-white transition-colors animate-bounce">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </a>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : A PROPOS
──────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="apropos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Image */}
          <div className="relative">
            <img src={IMG.about} alt={uiText("pages.Landing", "AutoLink Pro — flotte de véhicules")}
              className="w-full h-80 lg:h-[440px] object-cover rounded-sm shadow-xl" />
            <div className="absolute -bottom-5 -right-5 w-36 h-36 bg-teal-600 rounded-sm hidden lg:flex flex-col items-center justify-center text-white shadow-lg">
              <span className="text-3xl font-black">{uiText("pages.Landing", "2024")}</span>
              <span className="text-xs text-teal-100 mt-1 text-center leading-snug px-2">{uiText("pages.Landing", "Premier au Cameroun")}</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-4">{uiText("pages.Landing", "AutoLink Pro, votre partenaire mobilité") + " "}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-snug">{uiText("pages.Landing", "Plateforme de location de véhicules à Douala et Yaoundé") + " "}</h2>
            <p className="text-slate-600 leading-relaxed mb-4">{uiText("pages.Landing", "AutoLink Pro est la première plateforme digitale de location de véhicules au Cameroun. Fondée pour répondre au vide laissé par l'absence de solutions numériques fiables, AutoLink Pro met en relation les gestionnaires de véhicules de qualité avec les clients désireux de se déplacer en toute sécurité et confort.") + " "}</p>
            <p className="text-slate-600 leading-relaxed mb-6">{uiText("pages.Landing", "Notre activité principale est la location de véhicules avec chauffeur certifié, disponibles pour des déplacements urbains, interurbains et longue distance. AutoLink Pro intervient à Douala, Yaoundé et les villes environnantes.") + " "}</p>
            <a href="#services"
              className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors text-sm uppercase tracking-wide">{uiText("pages.Landing", "Nos services") + " "}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Counters — style trireno */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-slate-100">
          {[
            { target: 85,   suffix: '+',  label: uiText("pages.Landing", "Véhicules au catalogue") },
            { target: 6,    suffix: '',   label: uiText("pages.Landing", "Moyens de paiement") },
            { target: 8,    suffix: '',   label: uiText("pages.Landing", "Villes couvertes") },
          ].map(({ target, suffix, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-teal-600 mb-2">
                <AnimatedCounter target={target} suffix={suffix} />
              </div>
              <div className="text-slate-500 font-medium text-sm md:text-base">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandMarquee() {
  const rows = [CAR_BRANDS.slice(0, 15), CAR_BRANDS.slice(15)];

  return (
    <section className="overflow-hidden border-y border-slate-100 bg-slate-50 py-9" aria-label={uiText("pages.Landing", "Marques de véhicules disponibles")}>
      <div className="mx-auto mb-5 max-w-7xl px-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{uiText("pages.Landing", "Des marques reconnues pour chaque trajet") + " "}</div>
      <div className="space-y-4">
        {rows.map((brands, rowIndex) => (
          <div key={rowIndex} className={`brand-marquee-row ${rowIndex === 1 ? 'brand-marquee-reverse' : ''}`}>
            <div className="brand-marquee-track">
              {[...brands, ...brands].map((brand, index) => (
                <div key={`${brand.slug}-${index}`} className="brand-marquee-item" aria-hidden={index >= brands.length}>
                  <svg viewBox="0 0 24 24" role="img" aria-label={brand.title}>
                    <path d={brand.path} />
                  </svg>
                  <span>{brand.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : SERVICES
──────────────────────────────────────────────── */
function ServiceCard({ svc, onReserve }) {
  return (
    <div className="group overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 bg-white">
      {/* Image avec titre superposé — exactement comme trireno */}
      <div className="relative h-52 overflow-hidden">
        <img src={svc.img} alt={svc.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.parentElement.style.background = '#134e4a'; e.target.style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-black text-lg leading-snug">{svc.title}</h3>
        </div>
      </div>
      {/* Content */}
      <div className="p-5">
        <h3 className="font-black text-slate-900 text-base mb-2">{svc.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{svc.desc}</p>
        <button onClick={onReserve}
          className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-sm hover:text-teal-700 transition-colors uppercase tracking-wide">{uiText("pages.Landing", "Découvrir") + " "}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ServicesSection({ onReserve }) {
  return (
    <section id="services" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">{uiText("pages.Landing", "Notre offre complète") + " "}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{uiText("pages.Landing", "Nos services de location") + " "}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{uiText("pages.Landing", "Six formules pensées pour répondre à chaque besoin de mobilité au Cameroun.") + " "}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map(svc => <ServiceCard key={svc.title} svc={svc} onReserve={onReserve} />)}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : FLOTTE (= Réalisations chez trireno)
──────────────────────────────────────────────── */
function FleetSection({ vehicles, loading, onReserve }) {
  return (
    <section id="flotte" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">{uiText("pages.Landing", "Flotte certifiée AutoLink Pro") + " "}</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">{uiText("pages.Landing", "Notre flotte de véhicules")}</h2>
          </div>
          <button onClick={onReserve}
            className="hidden md:inline-flex items-center gap-2 text-teal-600 font-bold text-sm hover:text-teal-700 uppercase tracking-wide">{uiText("pages.Landing", "Réserver un véhicule") + " "}<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicles.map(vehicle => {
              const name = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ');
              const image = vehicle.image_url || vehicle.photos?.[0]?.image || IMG.fleet8;
              const price = formatNumber(Number(vehicle.daily_rate || vehicle.computed_rate || 0));
              return (
                <div key={vehicle.id} className="group relative overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
                  <div className="h-48 overflow-hidden">
                    <img src={image} alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = IMG.fleet8; }} />
                  </div>
                  <div className="p-4 bg-white">
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">{vehicle.category || vehicle.tier_label || uiText("pages.Landing", "Véhicule")}</span>
                    <h4 className="font-black text-slate-900 text-sm mt-1 mb-2">{name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-700 font-black text-sm">{price}{" " + uiText("pages.Landing", "F/j")}</span>
                      <button onClick={onReserve}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide">{uiText("pages.Landing", "Réserver") + " "}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-slate-500">{uiText("pages.Landing", "Aucun véhicule approuvé n’est disponible pour le moment.")}</p>
        )}

        <div className="text-center mt-10">
          <button onClick={onReserve}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-sm transition-colors shadow-md text-sm uppercase tracking-wide">{uiText("pages.Landing", "Réserver un véhicule") + " "}</button>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : COMMENT CA MARCHE
──────────────────────────────────────────────── */
function HowItWorksSection() {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-3">{uiText("pages.Landing", "Simple et rapide") + " "}</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{uiText("pages.Landing", "Comment fonctionne AutoLink Pro ?") + " "}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">{uiText("pages.Landing", "Réservez votre véhicule avec chauffeur en 4 étapes, depuis votre téléphone.") + " "}</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 bg-teal-600/20 border-2 border-teal-600/40 rounded-sm mb-5 mx-auto">
                <span className="text-2xl font-black text-teal-400">{s.n}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px border-t border-dashed border-teal-700/50" />
              )}
              <h3 className="font-black text-white mb-3 text-base">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : PAIEMENTS
──────────────────────────────────────────────── */
function PaymentSection() {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{uiText("pages.Landing", "Moyens de paiement acceptés") + " "}</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {[
            { name: 'MTN Mobile Money', color: '#FACC15', text: uiText("pages.Landing", "#1c1917"), initials: 'MTN' },
            { name: 'Orange Money',     color: '#F97316', text: uiText("pages.Landing", "#ffffff"), initials: 'OM'  },
          ].map(p => (
            <div key={p.name} className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-sm flex items-center justify-center shadow-md"
                style={{ backgroundColor: p.color }}>
                <span className="text-sm font-black" style={{ color: p.text }}>{p.initials}</span>
              </div>
              <span className="text-sm text-slate-600 font-semibold">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-8 max-w-md mx-auto">{uiText("pages.Landing", "Tous les paiements sont sécurisés. AutoLink Pro conserve les fonds jusqu'à la confirmation du trajet.") + " "}</p>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : APPLICATION MOBILE
──────────────────────────────────────────────── */
function AppSection() {
  return (
    <section className="py-20 bg-teal-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-teal-200 uppercase tracking-widest block mb-4">{uiText("pages.Landing", "Application mobile Android") + " "}</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-snug">{uiText("pages.Landing", "Téléchargez l'application AutoLink Pro") + " "}</h2>
            <p className="text-teal-100 leading-relaxed mb-6">{uiText("pages.Landing", "Toutes les fonctionnalités de la plateforme dans votre poche. Réservez, suivez votre chauffeur, payez en mobile money et notez votre expérience — tout en un seul endroit.") + " "}</p>
            <ul className="space-y-3 mb-8 text-teal-100 text-sm">
              {[uiText("pages.Landing", "Disponible sur Android"), uiText("pages.Landing", "Interface intuitive en français"), uiText("pages.Landing", "Paiement Orange Money et MTN intégré"), uiText("pages.Landing", "Suivi en temps réel"), uiText("pages.Landing", "Historique complet des courses")].map(f => (
                <li key={f} className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-teal-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a href="https://github.com/Steveghost237/autolink-pro/releases/download/v1.0.0/autolink-pro.apk" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-teal-700 font-bold py-4 px-8 rounded-sm hover:bg-teal-50 transition-colors shadow-xl text-sm uppercase tracking-wide">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>{uiText("pages.Landing", "Télécharger l'APK Android") + " "}</a>
          </div>
          <div className="flex justify-center gap-8 text-center">
            {[
              { v: '85+',   l: uiText("pages.Landing", "Véhicules au catalogue") },
              { v: '6',     l: uiText("pages.Landing", 'Moyens de paiement') },
              { v: '5',     l: uiText("pages.Landing", 'Catégories de véhicules') },
            ].map(s => (
              <div key={s.l}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{s.v}</div>
                <div className="text-teal-200 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   SECTION : CONTACT & RÉSERVATION
──────────────────────────────────────────────── */
function ContactSection({ siteConfig }) {
  const [form, setForm] = useState({ nom: '', prenom: '', tel: '', email: '', type: '', message: '', policy: false });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await contactAPI.send({
        last_name: form.nom,
        first_name: form.prenom,
        phone: form.tel,
        email: form.email,
        rental_type: form.type,
        message: form.message,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || uiText("pages.Landing", "L’envoi a échoué. Vérifiez votre connexion puis réessayez."));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest block mb-3">{uiText("pages.Landing", "Nous contacter") + " "}</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{uiText("pages.Landing", "Contact & Réservation") + " "}</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">{uiText("pages.Landing", "Vous avez un projet de déplacement à Douala ou Yaoundé ? AutoLink Pro vous accompagne de la réservation à la destination. Pour obtenir un devis, indiquez votre type de trajet, les villes concernées et vos contraintes horaires.") + " "}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2 bg-white shadow-sm border border-slate-100 p-8">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{uiText("pages.Landing", "Message envoyé")}</h3>
                <p className="text-slate-500">{uiText("pages.Landing", "Notre équipe vous recontacte dans les 24h.")}</p>
                <button onClick={() => setSent(false)} className="mt-6 text-teal-600 font-semibold text-sm underline">{uiText("pages.Landing", "Envoyer un autre message") + " "}</button>
              </div>
            ) : (
              <form onSubmit={handle}>
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Nom *")}</label>
                    <input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                      placeholder={uiText("pages.Landing", "Votre nom")}
                      className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Prénom *")}</label>
                    <input required value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}
                      placeholder={uiText("pages.Landing", "Votre prénom")}
                      className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Téléphone *")}</label>
                    <input required value={form.tel} onChange={e => setForm({...form, tel: e.target.value})}
                      placeholder={uiText("pages.Landing", "+237 6XX XXX XXX")}
                      className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Email (facultatif)")}</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      placeholder={uiText("pages.Landing", "vous@exemple.com")}
                      className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Type de location")}</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors bg-white">
                    <option value="">{uiText("pages.Landing", "Sélectionner")}</option>
                    <option>{uiText("pages.Landing", "Location Urbaine (3h à 24h)")}</option>
                    <option>{uiText("pages.Landing", "Location Interurbaine")}</option>
                    <option>{uiText("pages.Landing", "Location Longue Durée")}</option>
                    <option>{uiText("pages.Landing", "Transfert Aéroport")}</option>
                    <option>{uiText("pages.Landing", "Location Événementielle")}</option>
                    <option>{uiText("pages.Landing", "Voyages d'Affaires")}</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{uiText("pages.Landing", "Message *")}</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder={uiText("pages.Landing", "Décrivez votre besoin : ville de départ, destination, date et heure, nombre de passagers...")}
                    className="w-full border border-slate-200 rounded-sm px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none" />
                </div>

                <div className="flex items-start gap-3 mb-6">
                  <input type="checkbox" id="policy" required checked={form.policy}
                    onChange={e => setForm({...form, policy: e.target.checked})}
                    className="mt-0.5 w-4 h-4 accent-teal-600 cursor-pointer" />
                  <label htmlFor="policy" className="text-sm text-slate-500 cursor-pointer">{uiText("pages.Landing", "J’accepte la")}{' '}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-700">{uiText("pages.Landing", "politique de confidentialité")}</a>
                    {' '}{uiText("pages.Landing", "et les")}{' '}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline hover:text-teal-700">{uiText("pages.Landing", "conditions d’utilisation")}</a>{uiText("pages.Landing", ".") + " "}</label>
                </div>

                {error && <p role="alert" className="mb-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={sending}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-sm transition-colors text-sm uppercase tracking-wide shadow-md disabled:opacity-60">
                  {sending ? uiText("pages.Landing", "Envoi en cours…") : uiText("pages.Landing", "Envoyer ma demande")}
                </button>
              </form>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-6">
            {[
              {
                title: uiText("pages.Landing", "Téléphone"),
                lines: siteConfig.phones,
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                ),
              },
              {
                title: uiText("pages.Landing", "Adresse"),
                lines: siteConfig.addresses,
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                ),
              },
              {
                title: uiText("pages.Landing", "Email"),
                lines: siteConfig.contact_email ? [siteConfig.contact_email] : [],
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                ),
              },
            ].map(info => (
              <div key={info.title} className="bg-white shadow-sm border border-slate-100 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {info.icon}
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm mb-1">{info.title}</h4>
                    {info.lines.map(l => <p key={l} className="text-slate-500 text-sm">{l}</p>)}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white shadow-sm border border-slate-100 p-5">
              <h4 className="font-black text-slate-900 text-sm mb-3">{uiText("pages.Landing", "Horaires")}</h4>
              <div className="space-y-1 text-sm text-slate-500">
                <div className="flex justify-between">
                  <span>{uiText("pages.Landing", "Lundi au Vendredi")}</span><span className="font-semibold text-slate-700">{siteConfig.hours.weekdays || uiText("pages.Landing", "—")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{uiText("pages.Landing", "Samedi")}</span><span className="font-semibold text-slate-700">{siteConfig.hours.saturday || uiText("pages.Landing", "—")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{uiText("pages.Landing", "Dimanche")}</span><span className="font-semibold text-teal-600">{siteConfig.hours.sunday || uiText("pages.Landing", "—")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────
   FOOTER
──────────────────────────────────────────────── */
function Footer({ navigate, isAuthenticated, dashboardPath, siteConfig }) {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Logo + description + colonnes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <AutoLinkLogo size="md" />
            </div>
            <p className="text-sm leading-relaxed mb-5 text-slate-400">{uiText("pages.Landing", "AutoLink Pro est la première plateforme numérique de location de véhicules avec chauffeur au Cameroun. Basée à Douala et Yaoundé.") + " "}</p>
            <div className="hidden">
              {/* Facebook */}
              <button type="button" aria-label={uiText("pages.Landing", "Facebook")}
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </button>
              {/* Instagram */}
              <button type="button" aria-label={uiText("pages.Landing", "Instagram")}
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.8}/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"/>
                </svg>
              </button>
              {/* WhatsApp */}
              <button type="button" aria-label={uiText("pages.Landing", "WhatsApp")}
                className="w-9 h-9 bg-slate-800 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">{uiText("pages.Landing", "Informations")}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>{siteConfig.phones[0] || uiText("pages.Landing", "—")}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{siteConfig.addresses[0] || uiText("pages.Landing", "Cameroun")}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>{siteConfig.contact_email || uiText("pages.Landing", "—")}</span>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">{uiText("pages.Landing", "Horaires")}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{uiText("pages.Landing", "Lundi au Vendredi")}</span>
              </div>
              <div className="text-teal-400 font-semibold">{siteConfig.hours.weekdays || uiText("pages.Landing", "—")}</div>
              <div className="flex justify-between mt-2">
                <span>{uiText("pages.Landing", "Samedi")}</span>
              </div>
              <div className="text-teal-400 font-semibold">{siteConfig.hours.saturday || uiText("pages.Landing", "—")}</div>
              <div className="flex justify-between mt-2">
                <span>{uiText("pages.Landing", "Dimanche")}</span>
              </div>
              <div className="text-teal-400 font-semibold">{siteConfig.hours.sunday || uiText("pages.Landing", "—")}</div>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">{uiText("pages.Landing", "Menu")}</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-teal-400 transition-colors">{l.label}</a>
                </li>
              ))}
              {isAuthenticated ? (
                <li><button onClick={() => navigate(dashboardPath)} className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "Tableau de bord")}</button></li>
              ) : (
                <>
                  <li><button onClick={() => navigate('/login')} className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "Connexion")}</button></li>
                  <li><button onClick={() => navigate('/register')} className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "S'inscrire")}</button></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>{uiText("pages.Landing", "© 2026 AutoLink Pro. Tous droits réservés — Douala & Yaoundé, Cameroun.")}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "Politique de confidentialité")}</Link>
            <Link to="/terms" className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "CGU")}</Link>
            <Link to="/cookies" className="hover:text-teal-400 transition-colors">{uiText("pages.Landing", "Cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────
   PAGE PRINCIPALE
──────────────────────────────────────────────── */
function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem('autolink_cookie_consent'));
    } catch (_) {
      setVisible(false);
    }
  }, []);

  const saveChoice = (choice) => {
    try { localStorage.setItem('autolink_cookie_consent', choice); } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[60] mx-auto flex max-w-4xl flex-col gap-4 border border-slate-200 bg-white p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-slate-600">{uiText("pages.Landing", "Ce site utilise le stockage local nécessaire à votre session et à la mémorisation de vos choix.")}{' '}
        <Link to="/cookies" className="font-semibold text-teal-700 underline">{uiText("pages.Landing", "En savoir plus")}</Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button onClick={() => saveChoice('rejected')} className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">{uiText("pages.Landing", "Refuser") + " "}</button>
        <button onClick={() => saveChoice('accepted')} className="bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">{uiText("pages.Landing", "Accepter") + " "}</button>
      </div>
    </aside>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, getDashboardPath } = useAuth();
  const [siteConfig, setSiteConfig] = useState(null);
  const [siteConfigLoading, setSiteConfigLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  useEffect(() => {
    siteAPI.config()
      .then(({ data }) => setSiteConfig(data))
      .catch(() => setSiteConfig(null))
      .finally(() => setSiteConfigLoading(false));
  }, []);

  useEffect(() => {
    vehiclesAPI.list({ status: 'approved', ordering: '-created_at', page_size: 8 })
      .then(({ data }) => setVehicles(data.results || data || []))
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoading(false));
  }, []);

  const contactConfig = siteConfig || (siteConfigLoading ? FALLBACK_SITE_CONFIG : EMPTY_SITE_CONFIG);
  const dashboardPath = isAuthenticated ? getDashboardPath(user?.role) : '/register';
  const rentalPath = isAuthenticated
    ? (user?.role === 'CLIENT' ? '/client/search' : getDashboardPath(user?.role))
    : '/register';
  const reserve = () => navigate(rentalPath);

  return (
    <div className="min-h-screen bg-white">
      <Navbar navigate={navigate} isAuthenticated={isAuthenticated} dashboardPath={dashboardPath} siteConfig={contactConfig} />
      <HeroSlider onReserve={reserve} />
      <AboutSection />
      <BrandMarquee />
      <ServicesSection onReserve={reserve} />
      <FleetSection vehicles={vehicles} loading={vehiclesLoading} onReserve={reserve} />
      <HowItWorksSection />
      <PaymentSection />
      <AppSection />
      <ContactSection siteConfig={contactConfig} />
      <Footer navigate={navigate} isAuthenticated={isAuthenticated} dashboardPath={dashboardPath} siteConfig={contactConfig} />
      <PromoPopup />
      <CookieConsent />
    </div>
  );
}
