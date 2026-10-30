import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full pb-16">
<!-- Top Trust & Status Banner -->
<div class="w-full bg-surface-container-low rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
<div class="flex items-center gap-3.5">
<div class="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[22px]">verified_user</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface">Séquestre Sécurisé & Cautions Actives</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Vos fonds de garantie sont protégés via séquestre bancaire & MoMo/Orange Money jusqu'au constat contradictoire de retour.</p>
</div>
</div>
<div class="flex items-center gap-6 shrink-0">
<div class="text-right">
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Caution totale immobilisée</span>
<span class="font-currency-display text-currency-display text-primary">150 000 FCFA</span>
</div>
<a class="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1.5" href="#">
<span class="material-symbols-outlined text-[18px]">receipt_long</span>
        Relevé financier
      </a>
</div>
</div>
<!-- Page Header -->
<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
<div class="space-y-1">
<div class="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
<span class="">Mobilité Cameroun</span>
<span class="">•</span>
<span class="">Douala & Yaoundé</span>
</div>
<h1 class="font-headline-xl text-headline-xl text-on-surface">Mes Réservations</h1>
<p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
        Consultez, gérez et suivez l'historique de vos locations de véhicules à Douala et Yaoundé.
      </p>
</div>
<div class="flex items-center gap-3">
<a class="px-5 py-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg transition-colors flex items-center gap-2 shadow-sm" href="#">
<span class="material-symbols-outlined text-[20px]">help</span>
        Support Direct
      </a>
<a class="px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95" href="#">
<span class="material-symbols-outlined text-[20px]">add_circle</span>
        Nouvelle réservation
      </a>
</div>
</div>
<!-- Tabs Navigation -->
<div class="flex flex-wrap items-center gap-2 bg-surface-container-low p-1.5 rounded-xl mb-6 shadow-sm" id="reservation-tabs" role="tablist">
<button class="tab-btn px-5 py-2.5 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-2 bg-surface-container-lowest text-primary shadow-sm" data-tab="a-venir" type="button">
<span class="">À venir</span>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-primary/10 text-primary">1</span>
</button>
<button class="tab-btn px-5 py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2" data-tab="en-cours" type="button">
<span class="">En cours</span>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface">1</span>
</button>
<button class="tab-btn px-5 py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2" data-tab="terminees" type="button">
<span class="">Terminées</span>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface">4</span>
</button>
<button class="tab-btn px-5 py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all flex items-center gap-2" data-tab="annulees" type="button">
<span class="">Annulées</span>
<span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-high text-on-surface">1</span>
</button>
</div>
<!-- Search & Filter Bar -->
<div class="bg-surface-container-lowest rounded-2xl p-4 mb-8 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
<div class="w-full xl:w-2/5 relative">
<span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
<input class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-colors" placeholder="Rechercher par véhicule, ville, n° de dossier..." type="text">
</div>
<div class="w-full xl:w-3/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
<div class="relative bg-surface-container-low rounded-lg px-3 py-2">
<label class="block font-label-sm text-label-sm text-on-surface-variant">Période</label>
<select class="w-full bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
<option>Toutes les dates</option>
<option>30 derniers jours</option>
<option selected="">Année 2025</option>
</select>
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-2">
<label class="block font-label-sm text-label-sm text-on-surface-variant">Ville</label>
<select class="w-full bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
<option selected="">Toutes les villes</option>
<option>Douala (Littoral)</option>
<option>Yaoundé (Centre)</option>
</select>
</div>
<div class="relative bg-surface-container-low rounded-lg px-3 py-2">
<label class="block font-label-sm text-label-sm text-on-surface-variant">Trier par</label>
<select class="w-full bg-transparent font-label-md text-label-md text-on-surface outline-none cursor-pointer">
<option selected="">Date de départ la plus proche</option>
<option>Réservations récentes</option>
<option>Montant décroissant</option>
</select>
</div>
</div>
</div>
<!-- Reservation Cards Feed -->
<div class="space-y-6">
<!-- Card 1: À Venir (Active Focus) -->
<article class="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
<!-- Dossier Header -->
<div class="px-6 py-4 bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
<div class="flex items-center gap-3">
<span class="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Réf. #ALP-2025-DLA-8924</span>
<span class="text-outline-variant">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Date de réservation : 27 Octobre 2025</span>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px]">lock</span>
            Confirmée & Caution séquestrée
          </span>
</div>
</div>
<!-- Content Body -->
<div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
<!-- Photo and badges -->
<div class="lg:col-span-4 relative rounded-xl overflow-hidden shadow-sm group">
<img class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Modern dark metallic gray Toyota RAV4 AWD Hybrid 2022 parked under natural clear tropical daylight in front of lush equatorial vegetation in Douala, Cameroon. High resolution automotive studio lighting style, pristine paint, clean reflections." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC64AlM-HYTNrUKSQXBUyK0rlmVm0bMt08X72X1A2J1vkJ90iS9cmbNqrnD7TPaizJ_kogVe4ywgzQWf8k3xOVTzS9rEcWt3_lrnGtxEKWMBhy01bJgl_hAvCVQ6hkk1dplBSNvphnuR0bGq9UaUQSB40nc8mjJfKMFpCPtlSqJPTbERaomo7QC7gCmY9Gx0lVW2ihoCtZq6fIMxR9LbLtJAk9VjFw9iszXva4u4FkN0J5xVto5wFUVoA">
<div class="absolute top-3 left-3 flex gap-2">
<span class="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm">Gamme Premium</span>
</div>
<div class="absolute bottom-3 left-3 bg-inverse-surface/80 backdrop-blur-sm text-inverse-on-surface px-2.5 py-1 rounded-md font-label-sm text-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-tertiary-fixed text-[14px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="">9.8 / 10 (Véhicule vérifié)</span>
</div>
</div>
<!-- Vehicle & Trajet Specs -->
<div class="lg:col-span-5 space-y-4">
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Toyota RAV4 AWD Hybrid 2022</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
<span class="material-symbols-outlined text-[16px] text-primary">local_gas_station</span> Hybride Essence
              <span class="">•</span>
<span class="material-symbols-outlined text-[16px] text-primary">settings</span> Boîte Auto
              <span class="">•</span>
<span class="material-symbols-outlined text-[16px] text-primary">ac_unit</span> Climatisation intégrale
            </p>
</div>
<!-- Schedule and Route Details -->
<div class="bg-surface-container-low rounded-xl p-3.5 space-y-2">
<div class="flex items-start gap-2.5">
<span class="material-symbols-outlined text-primary text-[20px] mt-0.5">calendar_month</span>
<div class="flex-1 text-on-surface">
<span class="font-label-md text-label-md block font-semibold">29 Oct 08:30 → 30 Oct 08:30 (24h)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Prise en charge ponctuelle garantie</span>
</div>
</div>
<div class="flex items-start gap-2.5">
<span class="material-symbols-outlined text-primary text-[20px] mt-0.5">pin_drop</span>
<div class="flex-1 text-on-surface">
<span class="font-label-md text-label-md block font-semibold">Douala - Hub Akwa / Livraison Aéroport DLA</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Terminal Arrivées Internationales</span>
</div>
</div>
</div>
<!-- Options -->
<div class="flex flex-wrap gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-on-secondary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-primary">sports_motorsports</span>
              Avec chauffeur pro bilingue
            </span>
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-on-secondary-container font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-primary">shield</span>
              Assurance Tous Risques Activa
            </span>
</div>
</div>
<!-- Financial Breakdown & Actions -->
<div class="lg:col-span-3 flex flex-col justify-between h-full bg-surface-container-low/50 rounded-xl p-4 lg:p-5">
<div class="space-y-2 mb-4">
<div>
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Total Réglé (TTC)</span>
<span class="font-currency-display text-currency-display text-on-surface">73 500 FCFA</span>
</div>
<div class="pt-2">
<div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span class="">Caution séquestrée :</span>
<span class="font-semibold text-on-surface">150 000 FCFA</span>
</div>
<p class="font-body-sm text-[11px] text-primary mt-0.5 flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">info</span>
                Remboursable 2h après restitution
              </p>
</div>
</div>
<div class="space-y-2">
<a class="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-colors text-center" href="#">
<span class="">Feuille de route & Détails</span>
<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a class="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors text-center" href="tel:+237690000000">
<span class="material-symbols-outlined text-[18px] text-primary">call</span>
              Contacter le chauffeur (+237)
            </a>
<button class="w-full pt-1 text-center font-label-sm text-label-sm text-error hover:underline transition-all" type="button">
              Modifier / Annuler la réservation
            </button>
</div>
</div>
</div>
</article>
<!-- Card 2: En cours (Active Booking with Pulse Indicator) -->
<article class="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
<!-- Dossier Header -->
<div class="px-6 py-4 bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
<div class="flex items-center gap-3">
<span class="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Réf. #ALP-2025-DLA-8740</span>
<span class="text-outline-variant">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">En cours de location</span>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px] text-secondary">timer</span>
            En cours - Restitution aujourd'hui 18:00
          </span>
</div>
</div>
<!-- Content Body -->
<div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
<!-- Photo and badges -->
<div class="lg:col-span-4 relative rounded-xl overflow-hidden shadow-sm group">
<img class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" data-alt="Pristine white Hyundai Tucson 2023 SUV parked alongside the palm-lined paved boulevards of Bastos residential district in Yaoundé, Cameroon. Modern crisp design, high contrast shadows under tropical sun." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhIjFqbCArgIk1O-g_dETJhvLPjDeg74-FsKUMvJSmSW5RjLVKE6XI-ExgkZaS2Lb-A8ByzJTcv2tEbNLUo8TNSAprcHP45yQ5mnU4l6fFuKm4gJa6Ur6dskCTgYvuvzhISkD7fbgbatf2-Ik86Tku7QZb7HWAqUgwJuPLE-_xIarYhYTr7ZhwqViRQHO8GSY3Bz5F-HBEWRxVcIsvosFM_n3e-oIGTMGLssGdJoESvskrAgMzeRw7PQ">
<div class="absolute top-3 left-3 flex gap-2">
<span class="px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm shadow-sm">Gamme Premium</span>
</div>
<div class="absolute bottom-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-2.5 py-1 rounded-md font-label-sm text-label-sm flex items-center gap-1">
<span class="material-symbols-outlined text-primary text-[14px]">speed</span>
<span class="">Kilométrage illimité inclus</span>
</div>
</div>
<!-- Vehicle Details -->
<div class="lg:col-span-5 space-y-4">
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Hyundai Tucson 2023</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
<span class="material-symbols-outlined text-[16px] text-primary">local_gas_station</span> Diesel
              <span class="">•</span>
<span class="material-symbols-outlined text-[16px] text-primary">settings</span> Boîte Auto
              <span class="">•</span>
<span class="material-symbols-outlined text-[16px] text-primary">airline_seat_recline_normal</span> 5 Places spacieuses
            </p>
</div>
<div class="bg-surface-container-low rounded-xl p-3.5 space-y-2">
<div class="flex items-start gap-2.5">
<span class="material-symbols-outlined text-secondary text-[20px] mt-0.5">schedule</span>
<div class="flex-1 text-on-surface">
<span class="font-label-md text-label-md block font-semibold">27 Oct 09:00 → 28 Oct 18:00</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Temps restant estimé : 5 heures 40 minutes</span>
</div>
</div>
<div class="flex items-start gap-2.5">
<span class="material-symbols-outlined text-secondary text-[20px] mt-0.5">location_on</span>
<div class="flex-1 text-on-surface">
<span class="font-label-md text-label-md block font-semibold">Yaoundé (Bastos - Ambassades)</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Restitution agence AutoLink Bastos</span>
</div>
</div>
</div>
<div class="flex items-center gap-3">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              Inspection de départ validée (12 photos)
            </span>
</div>
</div>
<!-- Financial & Checkout Actions -->
<div class="lg:col-span-3 flex flex-col justify-between h-full bg-surface-container-low/50 rounded-xl p-4 lg:p-5">
<div class="space-y-2 mb-4">
<div>
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Montant Facturé</span>
<span class="font-currency-display text-currency-display text-on-surface">60 000 FCFA</span>
</div>
<div class="pt-2">
<div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span class="">Caution séquestre :</span>
<span class="font-semibold text-on-surface">150 000 FCFA</span>
</div>
</div>
</div>
<div class="space-y-2">
<button class="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">fact_check</span>
<span class="">Check-out & État des lieux</span>
</button>
<button class="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" type="button">
<span class="material-symbols-outlined text-[18px] text-secondary">update</span>
<span class="">Prolonger la durée</span>
</button>
<a class="w-full py-2 px-3 rounded-lg text-tertiary font-label-sm text-label-sm flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors" href="tel:237699999999">
<span class="material-symbols-outlined text-[16px]">support_agent</span>
              Assistance 24/7 disponible
            </a>
</div>
</div>
</div>
</article>
<!-- Card 3: Terminée (Completed) -->
<article class="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden opacity-95">
<!-- Dossier Header -->
<div class="px-6 py-4 bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
<div class="flex items-center gap-3">
<span class="w-2.5 h-2.5 rounded-full bg-outline"></span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Réf. #ALP-2024-YDE-7201</span>
<span class="text-outline-variant">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Clôturée le 15 Octobre 2024</span>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px] text-primary">task_alt</span>
            Terminée & Caution restituée
          </span>
</div>
</div>
<!-- Content Body -->
<div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
<!-- Photo and badges -->
<div class="lg:col-span-4 relative rounded-xl overflow-hidden shadow-sm">
<img class="w-full h-44 object-cover" data-alt="Classic silver metallic Toyota Corolla 2021 sedan parked neatly in front of an upscale office building in Yaounde city center, Cameroon. Clear midday sunlight, sharp shadows, realistic commercial car photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_wrLtGic9aNbisTE2MhZA9QxCGfYHvXuTHcZHRYtykIdB88-EmrfioPw10GIABj9tMcAtkb8HkN8IMMMoPCNDH3BGPjfHFpWMvxTOP-I0UcTud_Yz7UQyaKE7nAD_vaiTrrP-wAxm3PoeyuftlqmbLkB5jBV3kdluUGn02wouhhXXtiwMQDsWOtjU-WhksHuQv2-FYcQLpFDLnCA48wWIztB_uMeT9Jn-NFrJHsZJ05ik4zwlL80GZg">
<div class="absolute top-3 left-3">
<span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm shadow-sm">Gamme Standard</span>
</div>
</div>
<!-- Vehicle Details -->
<div class="lg:col-span-5 space-y-3">
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Toyota Corolla 2021</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Essence • Boîte Automatique • 5 Portes</p>
</div>
<div class="bg-surface-container-low rounded-xl p-3 space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
<p class=""><span class="font-semibold text-on-surface">Période :</span> 12 Oct 10:00 → 15 Oct 10:00 (3 jours)</p>
<p class=""><span class="font-semibold text-on-surface">Trajet :</span> Yaoundé Bastos → Yaoundé Centre-Ville</p>
</div>
<!-- Rating assigned -->
<div class="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg w-fit">
<span class="font-label-sm text-label-sm text-on-surface">Note attribuée :</span>
<div class="flex text-tertiary-fixed-dim">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">(5.0)</span>
</div>
</div>
<!-- Financial & Actions -->
<div class="lg:col-span-3 flex flex-col justify-between h-full bg-surface-container-low/50 rounded-xl p-4 lg:p-5">
<div class="space-y-1 mb-4">
<div>
<span class="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Total Réglé</span>
<span class="font-currency-display text-currency-display text-on-surface">35 000 FCFA</span>
</div>
<div class="pt-2 text-[12px] text-primary flex items-center gap-1 font-label-sm">
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
<span class="">+100 000 FCFA recrédités</span>
</div>
</div>
<div class="space-y-2">
<a class="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" href="#">
<span class="material-symbols-outlined text-[18px]">download</span>
              Télécharger la facture
            </a>
<a class="w-full py-2.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" href="#">
<span class="material-symbols-outlined text-[18px]">replay</span>
              Réserver à nouveau
            </a>
</div>
</div>
</div>
</article>
<!-- Card 4: Annulée (Cancelled with Full Refund) -->
<article class="bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden opacity-90">
<!-- Dossier Header -->
<div class="px-6 py-4 bg-surface-container-low flex flex-wrap items-center justify-between gap-3">
<div class="flex items-center gap-3">
<span class="w-2.5 h-2.5 rounded-full bg-error"></span>
<span class="font-label-lg text-label-lg font-bold text-on-surface">Réf. #ALP-2024-DLA-6512</span>
<span class="text-outline-variant">•</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Annulée le 02 Septembre 2024</span>
</div>
<div class="flex items-center gap-2">
<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[16px]">cancel</span>
            Annulée sans frais (Remboursement 100%)
          </span>
</div>
</div>
<!-- Content Body -->
<div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
<!-- Photo and badges -->
<div class="lg:col-span-4 relative rounded-xl overflow-hidden shadow-sm">
<img class="w-full h-44 object-cover" data-alt="Compact vivid blue Kia Picanto 2022 city car parked near the Akwa commercial district center in Douala, Cameroon. High key sunny ambient illumination, sharp details." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1_hB9WJpLirmw0vx8c3Z9EdODah5Y9xZAR7qrpewqi8Y40N4swCi7lXiHeTExg-SSUs5pWE-khNoma2JJlqlm_39CezfgwZ7ETwYMY-eLnUhIH1E4tzH1jM5DCEc4huJFQ40Wuf6JoUvMb3PgTIsBllYhx6H3HIjx_1XcFXFVE4I76dGMhv13u3GGMUOBzzpgipfXL-m3qaP37UbauD6US7TYuUdpeCR9U87mTIesI9oNpTMMPX0RCw">
<div class="absolute top-3 left-3">
<span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm shadow-sm">Gamme Économique</span>
</div>
</div>
<!-- Vehicle Details -->
<div class="lg:col-span-5 space-y-3">
<div>
<h2 class="font-headline-md text-headline-md text-on-surface">Kia Picanto 2022</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Essence • Boîte Manuelle • Idéal Trafic Urbain</p>
</div>
<div class="bg-surface-container-low rounded-xl p-3.5 space-y-1 font-body-sm text-body-sm">
<p class="text-on-surface-variant"><span class="font-semibold text-on-surface">Motif :</span> Modification imprévue de vol international</p>
<p class="text-primary font-semibold flex items-center gap-1 pt-1">
<span class="material-symbols-outlined text-[16px]">check_circle</span>
              25 000 FCFA re-crédités instantanément sur portefeuille AutoLink
            </p>
</div>
</div>
<!-- Actions -->
<div class="lg:col-span-3 flex flex-col justify-end h-full bg-surface-container-low/50 rounded-xl p-4 lg:p-5">
<div class="space-y-2">
<button class="w-full py-2.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 transition-colors" type="button">
<span class="material-symbols-outlined text-[18px]">info</span>
              Voir motif d'annulation
            </button>
<a class="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 transition-colors text-center" href="#">
<span class="material-symbols-outlined text-[18px]">search</span>
              Trouver un véhicule
            </a>
</div>
</div>
</div>
</article>
</div>
<!-- Pagination / Footer Info -->
<div class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface-variant">
<p class="font-body-sm text-body-sm">
      Affichage de <span class="font-semibold text-on-surface">4 réservations</span> sur un total de 7 dossiers enregistrés.
    </p>
<div class="flex items-center gap-2">
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant cursor-not-allowed font-label-sm text-label-sm" disabled="" type="button">
        Précédent
      </button>
<button class="w-8 h-8 rounded-lg bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">
        1
      </button>
<button class="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
        2
      </button>
<button class="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm transition-colors" type="button">
        Suivant
      </button>
</div>
</div>
</div>
<script>
  // Simple micro-interaction for tab filtering
  document.querySelectorAll('#reservation-tabs .tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#reservation-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        btn.classList.add('text-on-surface-variant');
      });
      button.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
      button.classList.remove('text-on-surface-variant');
    });
  });
</script>`;
const LINKS = {
  'Nouvelle réservation': '/client/search',
  'Trouver un véhicule': '/client/search',
  'Réserver à nouveau': '/client/search',
    'Feuille de route & Détails': '/client/bookings/1',
  'Feuille de route & Check-in': '/client/bookings/1',
  'Check-out & État des lieux': '/client/bookings/1',
  "Voir motif d'annulation": '/client/bookings/1',
  'Modifier / Annuler la réservation': '/client/bookings/1',
  'Modifier / Annuler': '/client/bookings/1',
  'Prolonger la durée': '/client/bookings/1',
  'Relevé financier': '/client/wallet',
  'Contacter le chauffeur': '/messages',
  'Support Direct': '/help',
  'Assistance 24/7 disponible': '/help',
};

export default function c3mesrservations() {
  return <DesignPage html={HTML} links={LINKS} />;
}
