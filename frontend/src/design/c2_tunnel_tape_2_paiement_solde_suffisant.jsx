import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full">
<!-- Progress Stepper Header -->
<section class="w-full bg-surface-container-low py-space-lg shadow-sm">
<div class="max-w-7xl mx-auto px-margin">
<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
<!-- Progress Steps -->
<div class="flex items-center gap-space-sm sm:gap-space-md w-full md:w-auto">
<!-- Step 1: Completed -->
<div class="flex items-center gap-space-xs text-primary">
<span class="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">
<span class="material-symbols-outlined text-[16px]">check</span>
</span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-outline">Étape 1</span>
<span class="font-label-md text-label-md font-semibold text-on-surface">Documents vérifiés</span>
</div>
</div>
<div class="w-8 sm:w-12 h-0.5 bg-primary/40"></div>
<!-- Step 2: Active -->
<div class="flex items-center gap-space-xs">
<span class="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md font-bold ring-4 ring-primary-fixed/50">
              2
            </span>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-primary font-semibold">Étape en cours</span>
<span class="font-label-md text-label-md font-bold text-primary">Paiement Portefeuille</span>
</div>
</div>
<div class="w-8 sm:w-12 h-0.5 bg-surface-container-highest"></div>
<!-- Step 3: Upcoming -->
<div class="flex items-center gap-space-xs text-outline opacity-60">
<span class="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md text-label-md">
              3
            </span>
<div class="hidden sm:flex flex-col">
<span class="font-label-sm text-label-sm">Étape 3</span>
<span class="font-label-md text-label-md">Confirmation & Bon</span>
</div>
</div>
</div>
<!-- Trust Mini Pill -->
<div class="inline-flex items-center gap-space-xs self-start md:self-auto bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm text-primary font-label-md text-label-md">
<span class="material-symbols-outlined text-[18px]">verified_user</span>
<span class="text-on-surface font-medium">Opération garantie Banque CEMAC</span>
</div>
</div>
</div>
</section>
<!-- Main Booking Funnel Content -->
<section class="w-full max-w-7xl mx-auto px-margin py-space-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
<!-- LEFT COLUMN: Wallet Debit & Escrow (8 cols) -->
<div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-space-lg">
<!-- Payment Header -->
<div class="flex flex-col gap-space-xs">
<div class="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
<span>Règlement Direct Portefeuille</span>
</div>
<h1 class="font-headline-xl text-headline-xl text-on-surface">Paiement sécurisé par Portefeuille AutoLink</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Toutes les réservations sont réglées directement depuis votre solde numérique sécurisé et audité.</p>
</div>
<!-- Balance Status Card (Solde Suffisant) -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<!-- Positive Eligibility Indicator -->
<div class="flex items-center justify-between flex-wrap gap-space-sm bg-primary/10 p-space-md rounded-lg">
<div class="flex items-center gap-space-sm">
<span class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[18px]">check_circle</span>
</span>
<div>
<p class="font-label-lg text-label-lg text-primary font-bold">Solde suffisant pour régler cette réservation</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Transaction immédiate, sans frais de change ni commission bancaire.</p>
</div>
</div>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-primary text-on-primary font-semibold">
<span class="w-2 h-2 rounded-full bg-primary-fixed animate-ping"></span>
              Prêt au débit
            </span>
</div>
<!-- Financial Flow Breakdown -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
<div class="bg-surface-container-low p-space-md rounded-lg flex flex-col justify-between">
<span class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                Solde actuel disponible
              </span>
<span class="font-headline-md text-headline-md text-on-surface font-extrabold mt-space-xs">100 000 <span class="font-label-sm text-label-sm font-semibold">FCFA</span></span>
</div>
<div class="bg-surface-container-low p-space-md rounded-lg flex flex-col justify-between">
<span class="font-label-sm text-label-sm text-error flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">remove_circle_outline</span>
                Montant à débiter
              </span>
<span class="font-headline-md text-headline-md text-error font-extrabold mt-space-xs">- 73 500 <span class="font-label-sm text-label-sm font-semibold">FCFA</span></span>
</div>
<div class="bg-primary/10 p-space-md rounded-lg flex flex-col justify-between">
<span class="font-label-sm text-label-sm text-primary flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">savings</span>
                Solde restant projeté
              </span>
<span class="font-headline-md text-headline-md text-primary font-extrabold mt-space-xs">26 500 <span class="font-label-sm text-label-sm font-semibold">FCFA</span></span>
</div>
</div>
</div>
<!-- Escrow / Deposit Management -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div class="flex items-center justify-between flex-wrap gap-space-sm">
<div class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[24px]">gavel</span>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Gestion de la Caution sous Séquestre</h2>
</div>
<span class="px-space-sm py-space-xs bg-surface-container-high text-on-secondary-container font-label-md text-label-md rounded-full font-bold">
              Séquestre garanti : 150 000 FCFA
            </span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">
            La caution ne constitue pas un prélèvement effectif. Il s'agit d'une pré-autorisation conservée sur un compte tiers régulé. Aucune retenue unilatérale n'est permise.
          </p>
<div class="bg-surface-container-low p-space-md rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
<div class="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">timer</span>
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface font-semibold">Restitution automatique en 15 minutes chrono</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Dès signature contradictoire du bon de restitution numérique avec le transporteur partenaire à Douala.</span>
</div>
</div>
<!-- Escrow Method Selector -->
<div class="flex flex-col gap-space-xs pt-space-xs">
<label class="font-label-sm text-label-sm text-outline uppercase font-semibold">Mode de provisionnement du séquestre</label>
<label class="flex items-center justify-between p-space-md rounded-lg bg-surface-container-lowest shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-space-md">
<input checked="" class="w-5 h-5 text-primary focus:ring-0" name="escrow_source" type="radio"/>
<div class="flex flex-col">
<span class="font-label-lg text-label-lg text-on-surface font-semibold">Séquestre Mobile Money / Portefeuille lié</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Numéro certifié : MTN MoMo Cameroon (+237 699 •• •• 42)</span>
</div>
</div>
<span class="material-symbols-outlined text-primary text-[20px]">lock</span>
</label>
</div>
</div>
<!-- Legal & Contract Acceptance -->
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs">
<span class="material-symbols-outlined text-primary text-[20px]">verified</span>
            Engagements Contractuels
          </h3>
<div class="flex flex-col gap-space-sm">
<!-- Checkbox 1 -->
<label class="flex items-start gap-space-sm cursor-pointer">
<input checked="" class="mt-1 w-5 h-5 rounded text-primary focus:ring-0" type="checkbox"/>
<span class="font-body-md text-body-md text-on-surface">
                J'accepte sans réserve les <a class="text-primary font-semibold underline" href="#">Conditions Générales de Location</a> AutoLink Pro et le contrat type de transport agréé CEMAC.
              </span>
</label>
<!-- Checkbox 2 -->
<label class="flex items-start gap-space-sm cursor-pointer">
<input checked="" class="mt-1 w-5 h-5 rounded text-primary focus:ring-0" type="checkbox"/>
<span class="font-body-md text-body-md text-on-surface">
                J'autorise formellement le débit de <strong>73 500 FCFA</strong> de mon solde portefeuille et le blocage de la caution sous séquestre de <strong>150 000 FCFA</strong>.
              </span>
</label>
</div>
</div>
<!-- Main Action CTA -->
<div class="flex flex-col gap-space-sm pt-space-xs">
<button class="w-full h-14 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-xl flex items-center justify-center gap-space-sm shadow-md transition-all active:scale-[0.99] font-bold" type="button">
<span class="material-symbols-outlined text-[20px]">lock</span>
<span>Confirmer et Payer 73 500 FCFA</span>
</button>
<div class="flex items-center justify-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm text-center">
<span class="material-symbols-outlined text-[16px] text-primary">bolt</span>
<span>Validation instantanée. Votre véhicule sera immédiatement réservé et votre bon de prise en charge généré.</span>
</div>
</div>
<!-- Return / Back link -->
<div class="pt-space-xs pb-space-lg">
<a class="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#">
<span class="material-symbols-outlined text-[18px]">arrow_back</span>
<span>Revenir à l'étape 1 (Modifier les options de location)</span>
</a>
</div>
</div>
<!-- RIGHT COLUMN: Sticky Summary Card (4 cols) -->
<div class="lg:col-span-5 xl:col-span-4 sticky top-20 flex flex-col gap-space-md">
<div class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<!-- Card Header & Badge -->
<div class="flex items-center justify-between">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Récapitulatif financier</h2>
<span class="px-space-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold uppercase">
              Premium
            </span>
</div>
<!-- Vehicle Thumbnail Card -->
<div class="relative w-full h-40 rounded-lg overflow-hidden bg-surface-container shadow-inner">
<div class="w-full h-full bg-cover bg-center" data-alt="A clean modern metallic silver Toyota RAV4 AWD Hybrid SUV 2022 model, parked under palm trees in an upscale neighborhood of Douala Cameroon, sharp sunlight, professional vehicle rental photography, photorealistic, pristine automotive detail." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuANLMDkurqOvGmqM3UYRMcS0C4I9XpRfR6HSv0fJCSON8XpTQAA4L8I9m6YFg-UlEIhRbnDMIvayDJP5sOOtXVPpNG3RRnBpFDcXmaveFjKglScWTI9_sJ4IQMI6oc5AvrpVf2aeayC41hQYcVRo6yMr3ABd0CL6khifJplwm2aCmQg8LBVDEQqMmxlfi4GvdmLhEkuqDIbZGdBBtNOas8KJfl-dJUZ-aEd56MFmdAmfZ87a9ho2JaKEQ')"></div>
<div class="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent flex items-end p-space-md">
<div class="text-on-primary">
<p class="font-headline-sm text-headline-sm font-bold leading-tight">Toyota RAV4 AWD Hybrid</p>
<p class="font-body-sm text-body-sm text-on-primary/80">Modèle 2022 • Climatisation intégrale • Boîte Auto</p>
</div>
</div>
</div>
<!-- Rental Window Details -->
<div class="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-xs">
<div class="flex items-center justify-between text-on-surface font-label-md text-label-md">
<span class="flex items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">calendar_today</span> Prise en charge
              </span>
<span class="font-bold">29 Oct, 08:30</span>
</div>
<div class="flex items-center justify-between text-on-surface font-label-md text-label-md">
<span class="flex items-center gap-1 text-on-surface-variant">
<span class="material-symbols-outlined text-[16px]">event_repeat</span> Restitution
              </span>
<span class="font-bold">30 Oct, 08:30</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm pt-space-xs">
<span class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">location_on</span> Douala International (DLA)
              </span>
<span class="font-semibold text-primary">Durée : 24 heures</span>
</div>
</div>
<!-- Itemized Breakdown -->
<div class="flex flex-col gap-space-sm pt-space-xs text-body-md">
<div class="flex items-center justify-between">
<span class="text-on-surface-variant">Location Toyota RAV4 (24h)</span>
<span class="font-semibold text-on-surface">55 000 FCFA</span>
</div>
<div class="flex items-center justify-between">
<span class="text-on-surface-variant">Option Chauffeur bilingue (24h)</span>
<span class="font-semibold text-on-surface">10 000 FCFA</span>
</div>
<div class="flex items-center justify-between">
<span class="text-on-surface-variant">Livraison Aéroport Douala</span>
<span class="font-semibold text-on-surface">5 000 FCFA</span>
</div>
<div class="flex items-center justify-between">
<span class="text-on-surface-variant">Assurance Activa & Frais de service</span>
<span class="font-semibold text-on-surface">3 500 FCFA</span>
</div>
<!-- Divider via bg container -->
<div class="h-px bg-surface-container-high my-space-xs"></div>
<!-- Subtotal -->
<div class="flex items-baseline justify-between">
<span class="font-label-lg text-label-lg font-bold text-on-surface uppercase">Sous-total à débiter</span>
<span class="font-headline-md text-headline-md font-extrabold text-primary">73 500 FCFA</span>
</div>
<!-- Caution Escrow Reminder -->
<div class="flex items-center justify-between bg-surface-container-high/60 p-space-sm rounded-lg text-body-sm">
<span class="text-on-secondary-container font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">shield</span> Caution séquestrée (bloquée)
              </span>
<span class="font-bold text-on-secondary-container">150 000 FCFA</span>
</div>
</div>
<!-- Trust Badges & Help -->
<div class="flex flex-col gap-space-xs pt-space-xs bg-surface-container-low p-space-md rounded-lg">
<div class="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[18px]">lock</span>
<span>Chiffrement bancaire SSL 256-bit</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Reçu officiel et contrat électronique d'assurance édités instantanément par email et SMS.
            </p>
<div class="pt-space-xs flex items-center justify-between">
<span class="font-label-sm text-label-sm text-outline">Assistance prioritaire</span>
<a class="inline-flex items-center gap-1 text-primary font-label-md text-label-md font-semibold hover:underline" href="https://wa.me/237600000000" target="_blank">
<span class="material-symbols-outlined text-[16px]">chat</span>
                WhatsApp Direct 24/7
              </a>
</div>
</div>
</div>
</div>
</div>
</section>
`;
const LINKS = {
  'Confirmer et Payer': '/client/booking/confirmation',
  "Revenir à l'étape 1 (Modifier les options de location)": '/client/booking/recap',
  'Retour au véhicule': '/client/search',
  'Assistance 24/7': '/help',
};

export default function c2tunneltape2paiementsoldesuffisant() {
  return <DesignPage html={HTML} links={LINKS} />;
}
