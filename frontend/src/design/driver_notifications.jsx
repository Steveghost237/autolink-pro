import React from 'react';
import DesignPage from './DesignPage';

const CARD = (cat, status, icon, iconCls, title, badge, badgeCls, time, body, dot) => `
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 ${status === 'unread' ? 'bg-surface-container-low' : 'bg-surface-container-lowest shadow-sm'} hover:bg-surface-container" data-category="${cat}" data-status="${status}">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl ${iconCls} flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-[24px]">${icon}</span></div>
${dot ? '<span class="unread-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-low"></span>' : ''}
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">${title}</h2>
${badge ? `<span class="px-2 py-0.5 rounded-full ${badgeCls} font-label-sm text-label-sm">${badge}</span>` : ''}
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">${time}</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">${body}</p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">${CARD_ACTIONS[cat] || ''}</div>
<div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
${dot ? '<button class="mark-read-toggle p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors" title="Marquer comme lu" type="button"><span class="material-symbols-outlined text-[18px]">done</span></button>' : ''}
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button"><span class="material-symbols-outlined text-[18px]">delete</span></button>
</div>
</div>
</div>
</div>
</article>`;

const CARD_ACTIONS = {
  courses: '<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button"><span class="material-symbols-outlined text-[16px]">visibility</span> Voir la course</button>',
  revenus: '<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all shadow-sm" type="button"><span class="material-symbols-outlined text-[16px]">receipt</span> Relevé de gains</button>',
  messages: '<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button"><span class="material-symbols-outlined text-[16px]">reply</span> Répondre via la messagerie</button>',
  securite: '<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-medium"><span class="material-symbols-outlined text-[15px]">verified_user</span> Session validée et sécurisée</span>',
};

const TF = (label, pill, pills, sub, cards) => `
<div class="space-y-space-sm timeframe-block">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">${label}</span>
${pill ? `<span class="px-2 py-0.5 rounded-full ${pills} font-label-sm text-label-sm font-semibold">${pill}</span>` : ''}
</div>
<span class="font-label-sm text-label-sm text-outline">${sub}</span>
</div>
<div class="space-y-space-sm">${cards}</div>
</div>`;

const HTML = `
<div class="max-w-[1180px] w-full mx-auto space-y-gutter p-space-md">
<div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-sm">
<div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="space-y-space-xs">
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm uppercase tracking-wide"><span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Courses en temps réel</span>
<span class="text-outline font-label-sm text-label-sm">• Hub Akwa / Douala</span>
</div>
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Notifications Chauffeur</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">Attributions de courses, confirmations de clients, paiements de vos prestations et alertes Hub.</p>
</div>
<div class="flex items-center gap-space-sm bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-sm rounded-xl shadow-sm self-start md:self-auto">
<div class="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold"><span class="material-symbols-outlined text-[20px]">notifications_active</span></div>
<div class="text-left">
<div class="flex items-center gap-1.5"><span class="font-headline-sm text-headline-sm text-on-surface font-extrabold" id="unread-counter">3</span><span class="font-label-sm text-label-sm text-primary font-semibold">non lues</span></div>
<span class="font-body-sm text-body-sm text-outline">sur 8 réceptions</span>
</div>
</div>
</div>
</div>
<div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
<div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="all" type="button">Toutes <span class="ml-1 px-1.5 py-0.2 rounded-full text-label-sm text-outline bg-surface-container-high font-semibold">8</span></button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all bg-primary text-on-primary font-semibold shadow-sm whitespace-nowrap" data-filter="unread" type="button">Non lues <span class="ml-1 px-1.5 py-0.2 rounded-full text-label-sm bg-primary-container text-on-primary-container font-bold">3</span></button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="courses" type="button">Courses</button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="revenus" type="button">Revenus</button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="securite" type="button">Sécurité</button>
</div>
<div class="flex items-center gap-space-xs sm:gap-space-sm justify-end">
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all font-label-md text-label-md" id="mark-all-read-btn" type="button"><span class="material-symbols-outlined text-[18px] text-primary">done_all</span><span>Tout marquer comme lu</span></button>
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md" type="button"><span class="material-symbols-outlined text-[18px]">tune</span><span class="hidden sm:inline">Paramètres</span></button>
</div>
</div>
<div class="space-y-space-lg" id="feed-container">
${TF("Aujourd'hui", '2 alertes récentes', 'bg-secondary-container text-on-secondary-container', 'GMT+1 (Douala)',
  CARD('courses', 'unread', 'directions_car', 'bg-primary-fixed text-on-primary-fixed-variant', 'Nouvelle course assignée #ALP-8930', 'À valider sous 30 min', 'bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold', 'Il y a 12 min', 'Le client <strong class="text-on-surface font-semibold">Sarah N.</strong> a réservé une course <strong class="text-on-surface">Bonanjo → Bastos Yaoundé</strong> le 31 Oct à 07h00 (Mercedes Classe C). Acceptez ou refusez la mission depuis votre tableau de bord.', true)
  + CARD('revenus', 'unread', 'payments', 'bg-secondary-fixed text-on-secondary-fixed', 'Paiement de course reçu', '+25 000 FCFA', 'bg-primary/15 text-primary font-bold', 'Il y a 1 heure', 'La course <strong class="text-on-surface">Kribi aller-retour (Prado TXL)</strong> a été clôturée sans incident. Vos gains de <strong class="text-on-surface font-semibold">25 000 FCFA</strong> sont crédités sur votre compte chauffeur.', true))}
${TF('Hier', '1 événement', 'bg-surface-container-high text-on-surface-variant', '28 Octobre',
  CARD('messages', 'unread', 'chat_bubble', 'bg-primary-fixed text-on-primary-fixed-variant', 'Message d\'Emmanuel K.', 'Client vérifié', 'bg-surface-container-high text-on-surface-variant', 'Hier à 20:15', '<em>"Bonjour Jean-Pierre, j\'aurai 2 valises demain, merci de prévoir le coffre arrière complet."</em>', true))}
${TF('Cette semaine', 'Historique lu', 'bg-surface-container text-outline', 'Semaine 43',
  CARD('securite', 'read', 'devices', 'bg-inverse-surface text-inverse-on-surface', 'Connexion depuis un nouvel appareil', 'Authentification 2FA', 'bg-surface-container text-outline', 'Il y a 2 jours', 'Nouvelle session authentifiée sur <strong class="text-on-surface">Android / Chrome</strong> à <strong class="text-on-surface">Douala</strong> après validation du code SMS.', false)
  + CARD('revenus', 'read', 'account_balance', 'bg-primary/10 text-primary', 'Retrait MTN MoMo confirmé', '-60 000 FCFA', 'bg-secondary-container text-on-secondary-container', 'Il y a 3 jours', 'Votre demande de retrait de <strong class="text-on-surface">60 000 FCFA</strong> vers <strong class="text-on-surface">+237 670 •• •• 90</strong> a été traitée en 4 minutes.', false)
  + CARD('courses', 'read', 'fact_check', 'bg-tertiary-fixed-dim text-on-tertiary-fixed', 'Inspection véhicule validée', '40 points conformes', 'bg-surface-container text-outline', 'Il y a 5 jours', 'Le contrôle technique de votre <strong class="text-on-surface">Toyota RAV4 (LT-890-JA)</strong> est validé. Prochaine inspection dans 30 jours.', false))}
</div>
<div class="hidden flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest text-center space-y-space-sm" id="empty-state">
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline"><span class="material-symbols-outlined text-[32px]">notifications_off</span></div>
<div class="space-y-1"><h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Aucune alerte trouvée</h3><p class="font-body-md text-body-md text-on-surface-variant max-w-sm">Toutes les notifications pour ce filtre ont été traitées.</p></div>
<button class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm" data-reset-filter="1" type="button">Afficher toutes les alertes</button>
</div>
</div>
`;

const LINKS = {
  'Voir la course': '/driver/dashboard',
  'Relevé de gains': '/driver/revenue',
  'Répondre via la messagerie': '/driver/messages',
  'Paramètres': '/driver/settings',
};

export default function DriverNotifications() {
  return <DesignPage html={HTML} links={LINKS} role="driver" />;
}
