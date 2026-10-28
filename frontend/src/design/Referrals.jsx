import React from 'react';
import DesignShell from './DesignShell';
import Icon from '../components/Icon';

// Page Parrainage & Réductions — maquette statique (données d'exemple).
const REFS = [
  { name: 'Nadia Fouda', date: '12 oct. 2026', status: 'Bonus crédité', amount: '+5 000 FCFA', ok: true },
  { name: 'Jules Mbappe', date: '28 sept. 2026', status: 'Bonus crédité', amount: '+5 000 FCFA', ok: true },
  { name: 'Carine Etoa', date: '15 sept. 2026', status: 'En attente — première location', amount: '—', ok: false },
];
const OFFERS = [
  { title: '-10 % week-end', desc: 'Locations de vendredi à dimanche sur la gamme Économique.', tag: 'WEEKEND10' },
  { title: '1 jour offert', desc: 'Dès 7 jours de location consécutifs sur la gamme Premium.', tag: 'LONG7' },
];

export default function Referrals({ role = 'client' }) {
  return (
    <DesignShell role={role}>
      <div className="w-full px-gutter py-space-lg flex flex-col gap-space-xl">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Parrainage & Réductions</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Parrainez vos proches et cumulez des réductions sur vos locations.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-lg flex flex-col gap-space-md relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col gap-2">
              <span className="font-label-lg text-label-lg uppercase tracking-wide text-surface-variant">Votre code parrainage</span>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-highest/20 px-4 py-3">
                <span className="font-display-lg text-display-lg-mobile tracking-wider text-primary-fixed">EMMA-2026</span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md">
                  <Icon name="content_copy" size={16} />Copier
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-surface-variant/80">Vous gagnez 5 000 FCFA quand votre filleul termine sa première location.</p>
              <button className="w-fit flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold">
                <Icon name="share" size={18} />Partager mon lien
              </button>
            </div>
          </div>
          <div className="card flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Offres actives</h2>
            {OFFERS.map((o) => (
              <div key={o.tag} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-4">
                <div>
                  <div className="font-label-lg text-label-lg font-bold text-on-surface">{o.title}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{o.desc}</div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md font-bold">{o.tag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Vos filleuls ({REFS.length})</h2>
          <div className="flex flex-col divide-y divide-outline-variant/30">
            {REFS.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-label-lg text-label-lg font-semibold text-on-surface">{r.name}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{r.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-label-lg text-label-lg font-bold ${r.ok ? 'text-primary' : 'text-on-surface-variant'}`}>{r.amount}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesignShell>
  );
}
