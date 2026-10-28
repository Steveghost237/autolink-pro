import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

const COURSES_INIT = [
  { id: 'ALP-2025-DLA-8924', client: 'Emmanuel K.', tel: '+237 670 42 18 90', car: 'Toyota RAV4 AWD 2022', from: 'Aéroport DLA', to: 'Hub Akwa', dates: '29 Oct 08:30 → 30 Oct 08:30', price: '10 000 FCFA', status: 'pending' },
  { id: 'ALP-2025-DLA-8930', client: 'Sarah N.', tel: '+237 699 88 77 66', car: 'Mercedes Classe C 2023', from: 'Bonanjo', to: 'Bastos Yaoundé', dates: '31 Oct 07:00 → 01 Nov 19:00', price: '18 000 FCFA', status: 'pending' },
  { id: 'ALP-2025-DLA-8740', client: 'Marc T.', tel: '+237 655 12 34 56', car: 'Toyota Prado TXL', from: 'Hub Akwa', to: 'Kribi aller-retour', dates: '27 Oct 09:00 → 28 Oct 18:00', price: '25 000 FCFA', status: 'accepted' },
];

const MONTHS = [
  ['Août 2025', 12, '180 000'], ['Septembre 2025', 9, '135 000'], ['Octobre 2025', 6, '85 000'],
];
const GAINS = [
  ['25 Oct 2025', '+25 000 FCFA', 'Course Kribi — Prado TXL'],
  ['21 Oct 2025', '+12 000 FCFA', 'Course Aéroport — RAV4'],
  ['15 Oct 2025', '+8 500 FCFA', 'Demi-journée Douala'],
  ['09 Oct 2025', '+15 000 FCFA', 'Trajet Douala → Bafoussam'],
];

export default function DriverDesignDashboard() {
  const [online, setOnline] = useState(true);
  const [courses, setCourses] = useState(COURSES_INIT);
  const navigate = useNavigate();

  const setStatus = (id, status) => setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));

  return (
    <DesignShell role="driver">
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto flex flex-col gap-space-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Espace Chauffeur Certifié</span>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Bonjour, Jean-Pierre</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Gérez votre disponibilité et les courses qui vous sont attribuées.</p>
          </div>
          <button onClick={() => setOnline(!online)} className={`self-start flex items-center gap-2 px-4 py-2 rounded-full font-label-lg text-label-lg font-semibold shadow-sm transition-all ${online ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-primary-fixed animate-pulse' : 'bg-outline'}`} />
            {online ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[
            ['star', 'Note moyenne', '4,98 / 5', '142 avis vérifiés'],
            ['check_circle', 'Courses terminées', '142', 'dont 6 ce mois-ci'],
            ['account_balance_wallet', 'Gains octobre', '85 000 FCFA', '+24% vs septembre'],
            ['directions_car', 'Véhicule attribué', 'Toyota RAV4', 'LT-890-JA · Flotte Akwa'],
          ].map(([icon, label, val, sub]) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-1">
              <span className="flex items-center justify-between"><span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">{label}</span><Icon name={icon} size={20} className="text-primary" /></span>
              <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">{val}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span>
            </div>
          ))}
        </div>

        {/* Courses */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Mes courses <span className="text-on-surface-variant font-normal">({courses.filter(c => c.status !== 'refused').length})</span></h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Mise à jour en temps réel</span>
          </div>
          <div className="flex flex-col gap-3">
            {courses.map((c) => (
              <div key={c.id} className={`rounded-xl p-4 bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-opacity ${c.status === 'refused' ? 'opacity-40' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0"><Icon name="person" size={22} /></div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">{c.client} · {c.car}</span>
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${c.status === 'pending' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : c.status === 'accepted' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                        {c.status === 'pending' ? 'À valider' : c.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{c.dates} · {c.from} → {c.to}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{c.id} · <a className="text-primary font-semibold" href={'tel:' + c.tel.replace(/ /g, '')}>{c.tel}</a></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">{c.price}</span>
                  {c.status === 'pending' ? (
                    <>
                      <button onClick={() => setStatus(c.id, 'accepted')} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-colors">Accepter</button>
                      <button onClick={() => setStatus(c.id, 'refused')} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface font-label-md text-label-md font-semibold transition-colors">Refuser</button>
                    </>
                  ) : c.status === 'accepted' ? (
                    <button onClick={() => navigate('/driver/messages')} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center gap-1"><Icon name="chat" size={16} />Message client</button>
                  ) : (
                    <button onClick={() => setStatus(c.id, 'pending')} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors">Annuler le refus</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gains */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Gains mensuels</h2>
              <button onClick={() => navigate('/driver/revenue')} className="text-primary font-label-md text-label-md font-semibold hover:underline flex items-center gap-1">Voir détail<Icon name="arrow_forward" size={16} /></button>
            </div>
            {MONTHS.map(([m, n, amt]) => (
              <div key={m} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col"><span className="font-label-md text-label-md font-semibold text-on-surface capitalize">{m}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{n} course(s)</span></div>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{amt} <span className="font-label-sm text-primary">FCFA</span></span>
              </div>
            ))}
          </section>
          <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col gap-3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Historique des gains</h2>
            {GAINS.map(([d, amt, lbl]) => (
              <div key={d + lbl} className="flex items-center justify-between py-2 border-b border-surface-container last:border-0">
                <div className="flex flex-col"><span className="font-label-md text-label-md text-on-surface">{lbl}</span><span className="font-body-sm text-body-sm text-on-surface-variant">{d}</span></div>
                <span className="font-label-md text-label-md font-bold text-primary">{amt}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </DesignShell>
  );
}
