import React from 'react';
import DesignPage from './DesignPage';

const HTML = `
<div class="max-w-[1180px] w-full mx-auto space-y-gutter">
<!-- Top Summary Banner & Page Header -->
<div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-sm">
<div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
<div class="absolute right-32 -bottom-20 w-48 h-48 rounded-full bg-tertiary/10 blur-xl pointer-events-none"></div>
<div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div class="space-y-space-xs">
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-label-sm uppercase tracking-wide">
<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Flux sécurisé en temps réel
            </span>
<span class="text-outline font-label-sm text-label-sm">• Zone Cemac / Douala</span>
</div>
<h1 class="font-headline-xl text-headline-xl text-on-surface tracking-tight">Centre de Notifications</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Toutes les alertes certifiées relatives à vos réservations, restitutions de cautions Mobile Money et messages hôtes.
          </p>
</div>
<!-- Quick Metrics Pill -->
<div class="flex items-center gap-space-sm bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-sm rounded-xl shadow-sm self-start md:self-auto">
<div class="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
<span class="material-symbols-outlined text-[20px]">notifications_active</span>
</div>
<div class="text-left">
<div class="flex items-center gap-1.5">
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold" id="unread-counter">4</span>
<span class="font-label-sm text-label-sm text-primary font-semibold">non lues</span>
</div>
<span class="font-body-sm text-body-sm text-outline">sur 14 réceptions</span>
</div>
</div>
</div>
</div>
<!-- Interactive Filter & Action Bar -->
<div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
<!-- Category Tabs -->
<div class="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="all" type="button">
          Toutes <span class="ml-1 px-1.5 py-0.2 rounded-full text-label-sm text-outline bg-surface-container-high font-semibold">14</span>
</button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all bg-primary text-on-primary font-semibold shadow-sm whitespace-nowrap" data-filter="unread" type="button">
          Non lues <span class="ml-1 px-1.5 py-0.2 rounded-full text-label-sm bg-primary-container text-on-primary-container font-bold">4</span>
</button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="reservations" type="button">
          Réservations
        </button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="finances" type="button">
          Paiements &amp; Caution
        </button>
<button class="filter-tab px-3.5 py-2 rounded-lg font-label-lg text-label-lg transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface whitespace-nowrap" data-filter="securite" type="button">
          Sécurité
        </button>
</div>
<!-- Action Buttons -->
<div class="flex items-center gap-space-xs sm:gap-space-sm justify-end">
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all font-label-md text-label-md" id="mark-all-read-btn" type="button">
<span class="material-symbols-outlined text-[18px] text-primary">done_all</span>
<span>Tout marquer comme lu</span>
</button>
<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md" title="Préférences de notification SMS/WhatsApp" type="button">
<span class="material-symbols-outlined text-[18px]">tune</span>
<span class="hidden sm:inline">Paramètres</span>
</button>
</div>
</div>
<!-- Notification Feed -->
<div class="space-y-space-lg" id="feed-container">
<!-- TIMEFRAME: AUJOURD'HUI -->
<div class="space-y-space-sm timeframe-block" data-timeframe="today">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Aujourd'hui</span>
<span class="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">2 alertes récentes</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Fuseau horaire : GMT+1 (Douala)</span>
</div>
<div class="space-y-space-sm">
<!-- Item 1: Caution Débloquée (Unread - Finance/Urgent) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-low shadow-[0_2px_8px_rgba(0,104,92,0.06)] hover:bg-surface-container" data-category="finances" data-status="unread">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-tertiary-fixed to-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">lock_open</span>
</div>
<span class="unread-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-low"></span>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">Caution débloquée #ALP-8812</h2>
<span class="px-2 py-0.5 rounded font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed-variant font-bold">150 000 FCFA Libérés</span>
<span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">Inspecté conforme</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Il y a 25 min</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
                  Votre caution de <strong class="text-on-surface font-semibold">150 000 FCFA</strong> pour la location du <strong class="text-on-surface">Toyota RAV4 (LT 892 AB)</strong> a été intégralement libérée suite à l'état des lieux de retour validé sans dommage. Votre plafond carte / solde mobile a été restauré.
                </p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px]">receipt_long</span>
                      Voir le reçu officiel
                    </button>
<span class="font-label-sm text-label-sm text-outline hidden sm:inline">Réf Banque: CM-XAF-902810</span>
</div>
<div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
<button class="mark-read-toggle p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors" title="Marquer comme lu" type="button">
<span class="material-symbols-outlined text-[18px]">done</span>
</button>
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
<!-- Item 2: Réservation Confirmée (Unread - Reservation) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-low shadow-[0_2px_8px_rgba(70,97,125,0.06)] hover:bg-surface-container" data-category="reservations" data-status="unread">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">key</span>
</div>
<span class="unread-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-low"></span>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">Réservation confirmée #ALP-8924</h2>
<span class="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm">Prise en charge validée</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Il y a 2 heures</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
                  Le propriétaire partenaire <strong class="text-on-surface font-semibold">Marc T.</strong> a validé votre demande. Rendez-vous confirmé pour le départ de demain à <strong class="text-on-surface">08h30</strong> au <strong class="text-on-surface">Hub AutoLink d'Akwa (Douala)</strong>. Votre contrat numérique est prêt pour émargement.
                </p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px] text-secondary">visibility</span>
                      Détail de la réservation
                    </button>
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px]">location_on</span>
                      Itinéraire vers le Hub
                    </button>
</div>
<div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
<button class="mark-read-toggle p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors" title="Marquer comme lu" type="button">
<span class="material-symbols-outlined text-[18px]">done</span>
</button>
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
</div>
</div>
<!-- TIMEFRAME: HIER -->
<div class="space-y-space-sm timeframe-block" data-timeframe="yesterday">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Hier</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">2 événements</span>
</div>
<span class="font-label-sm text-label-sm text-outline">18 Mars 2025</span>
</div>
<div class="space-y-space-sm">
<!-- Item 3: Message Propriétaire (Unread - Message) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-low shadow-[0_2px_8px_rgba(0,104,92,0.06)] hover:bg-surface-container" data-category="messages" data-status="unread">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">chat_bubble</span>
</div>
<span class="unread-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-low"></span>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">Nouveau message de Samuel Transport</h2>
<span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">Équipe Hôte</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Hier à 18:30</time>
</div>
<div class="p-3 rounded-lg bg-surface-container-lowest/80 text-on-surface font-body-md text-body-md italic shadow-inner">
                  "Bonjour Emmanuel, le véhicule a été nettoyé, désinfecté et le plein de gasoil est fait. Je vous attends demain avec la fiche d'inspection prête."
                </div>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<button class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px]">reply</span>
                      Répondre via la messagerie
                    </button>
</div>
<div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
<button class="mark-read-toggle p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors" title="Marquer comme lu" type="button">
<span class="material-symbols-outlined text-[18px]">done</span>
</button>
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
<!-- Item 4: Rappel Inspection (Unread - Rappel) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-low shadow-[0_2px_8px_rgba(161,104,0,0.06)] hover:bg-surface-container" data-category="reservations" data-status="unread">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-tertiary-fixed-dim text-on-tertiary-fixed flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">event_available</span>
</div>
<span class="unread-dot absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-low"></span>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">Inspection de départ programmée</h2>
<span class="px-2 py-0.5 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-label-sm font-semibold">Protocole Check-in</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Hier à 14:10</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
                  Rendez-vous fixé pour demain à <strong class="text-on-surface">08h00 précises</strong> au <strong class="text-on-surface font-semibold">Hub AutoLink Douala Akwa (face Direction MTN)</strong> pour la signature biométrique et la remise sécurisée des clés de bord.
                </p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all shadow-sm" type="button">
<span class="material-symbols-outlined text-[16px] text-tertiary">fact_check</span>
                      Consulter le guide de check-in
                    </button>
</div>
<div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
<button class="mark-read-toggle p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-high transition-colors" title="Marquer comme lu" type="button">
<span class="material-symbols-outlined text-[18px]">done</span>
</button>
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
</div>
</div>
<!-- TIMEFRAME: CETTE SEMAINE -->
<div class="space-y-space-sm timeframe-block" data-timeframe="this-week">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Cette semaine</span>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm">Historique lu</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Semaine 12</span>
</div>
<div class="space-y-space-sm">
<!-- Item 5: Sécurité (Read - Purple/Safety) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-lowest shadow-sm hover:bg-surface-container-low" data-category="securite" data-status="read">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-inverse-surface text-inverse-on-surface flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">devices</span>
</div>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Connexion depuis un nouvel appareil</h2>
<span class="px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm">Authentification 2FA</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Il y a 3 jours</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
                  Nouvelle session authentifiée détectée sur <strong class="text-on-surface">Chrome / macOS</strong> à <strong class="text-on-surface">Douala (Cameroun)</strong> suite à la validation réussie du code SMS OTP envoyé sur votre numéro Orange.
                </p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary font-medium">
<span class="material-symbols-outlined text-[15px]">verified_user</span>
                      Session validée et sécurisée
                    </span>
<button class="text-outline hover:text-error font-label-md text-label-md transition-colors" type="button">
                      Ce n'était pas vous ?
                    </button>
</div>
<div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
</div>
</div>
<!-- TIMEFRAME: PLUS ANCIEN -->
<div class="space-y-space-sm timeframe-block" data-timeframe="older">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-2">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Plus ancien</span>
</div>
<span class="font-label-sm text-label-sm text-outline">Archives financières</span>
</div>
<div class="space-y-space-sm">
<!-- Item 6: Recharge Portefeuille (Read - Finance) -->
<article class="notification-card group relative p-space-md rounded-xl transition-all duration-200 bg-surface-container-lowest shadow-sm hover:bg-surface-container-low" data-category="finances" data-status="read">
<div class="flex items-start gap-space-md">
<div class="relative shrink-0">
<div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[24px]">account_balance_wallet</span>
</div>
</div>
<div class="flex-1 min-w-0 space-y-space-xs">
<div class="flex flex-wrap items-center justify-between gap-space-xs">
<div class="flex items-center gap-2 flex-wrap">
<h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Recharge portefeuille réussie</h2>
<span class="px-2 py-0.5 rounded font-label-sm text-label-sm bg-primary/15 text-primary font-bold">+ 50 000 FCFA</span>
</div>
<time class="font-label-sm text-label-sm text-outline shrink-0">Il y a 4 jours</time>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
                  Crédit immédiat de <strong class="text-on-surface font-semibold">50 000 FCFA</strong> ajouté à votre portefeuille AutoLink via <strong class="text-on-surface">MTN Mobile Money</strong> (Réf transaction #MTN-8930129). Solde actualisé disponible pour réservations et dépôts.
                </p>
<div class="pt-space-xs flex flex-wrap items-center justify-between gap-space-sm">
<div class="flex items-center gap-space-sm">
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-all" type="button">
<span class="material-symbols-outlined text-[16px]">receipt</span>
                      Télécharger reçu XAF
                    </button>
</div>
<div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
<button class="archive-btn p-1.5 rounded-lg text-outline hover:text-error hover:bg-error-container/30 transition-colors" title="Supprimer de l'affichage" type="button">
<span class="material-symbols-outlined text-[18px]">delete</span>
</button>
</div>
</div>
</div>
</div>
</article>
</div>
</div>
</div>
<!-- Empty State Fallback -->
<div class="hidden flex-col items-center justify-center p-space-xl rounded-xl bg-surface-container-lowest text-center space-y-space-sm" id="empty-state">
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
<span class="material-symbols-outlined text-[32px]">notifications_off</span>
</div>
<div class="space-y-1">
<h3 class="font-headline-sm text-headline-sm text-on-surface font-bold">Aucune alerte trouvée</h3>
<p class="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Vous êtes parfaitement à jour ! Toutes les alertes pour ce filtre ont été traitées ou archivées.
        </p>
</div>
<button class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm" data-reset-filter="1" type="button">
        Afficher toutes les alertes
      </button>
</div>
<!-- Trust & Verification Footer Strip -->
<div class="p-space-md rounded-xl bg-gradient-to-r from-surface-container-low to-surface-container-lowest flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm">
<div class="flex items-center gap-space-sm">
<div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">shield_with_heart</span>
</div>
<div class="text-left">
<p class="font-label-lg text-label-lg font-bold text-on-surface">Protocole de Traçabilité AutoLink Assurance</p>
<p class="font-body-sm text-body-sm text-outline">Chaque déblocage de caution fait l'objet d'un rapport certifié horodaté opposable aux tiers et banques agréées COBAC.</p>
</div>
</div>
<div class="flex items-center gap-space-md shrink-0">
<div class="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-primary"></span>
          MTN MoMo API v2
        </div>
<div class="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
<span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
          Orange Money Webhook
        </div>
</div>
</div>
</div>
`;

const LINKS = {
  'Détail de la réservation': '/client/bookings/1',
  'Répondre via la messagerie': '/messages',
  'Consulter le guide de check-in': '/client/bookings/1',
  'Voir le reçu officiel': '/client/wallet',
  'Paramètres': '/settings',
};

export default function c8notifications() {
  return <DesignPage html={HTML} links={LINKS} />;
}
