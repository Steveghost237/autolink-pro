import React from 'react';
import DesignPage from './DesignPage';

const HTML = `<div class="flex flex-col w-full">
<!-- Stepper Navigation -->
<section class="w-full bg-surface-container-low py-space-md shadow-sm">
<div class="max-w-7xl mx-auto px-margin">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<!-- Progress Pills -->
<div class="flex items-center gap-space-xs sm:gap-space-sm overflow-x-auto pb-space-xs md:pb-0">
<!-- Step 1: Completed -->
<div class="flex items-center gap-space-xs text-on-surface-variant shrink-0">
<div class="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined text-[16px]">check</span>
</div>
<span class="font-label-md text-label-md text-on-surface">1. Documents & Options</span>
<span class="material-symbols-outlined text-[16px] text-outline-variant ml-space-xs">chevron_right</span>
</div>
<!-- Step 2: Current (Alerted) -->
<div class="flex items-center gap-space-xs shrink-0 bg-error-container text-on-error-container px-space-md py-space-xs rounded-full shadow-sm">
<div class="w-7 h-7 rounded-full bg-error flex items-center justify-center text-on-error font-headline-sm text-headline-sm leading-none">
<span>2</span>
</div>
<span class="font-label-md text-label-md font-bold">2. Paiement Portefeuille</span>
<span class="material-symbols-outlined text-[16px] text-error ml-space-xs">warning</span>
</div>
<!-- Step 3: Upcoming -->
<div class="flex items-center gap-space-xs text-outline shrink-0 opacity-70">
<span class="material-symbols-outlined text-[16px] text-outline-variant">chevron_right</span>
<div class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline font-label-md text-label-md">
<span>3</span>
</div>
<span class="font-label-md text-label-md">3. Confirmation Immédiate</span>
</div>
</div>
<!-- Security & Status indicator -->
<div class="hidden lg:flex items-center gap-space-sm text-outline font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[18px] text-primary">encrypted</span>
<span>Protocole bancaire GIMAC & Switch National BEAC</span>
</div>
</div>
</div>
</section>
<!-- Funnel Content Grid -->
<main class="w-full max-w-7xl mx-auto px-margin py-space-xl">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
<!-- LEFT COLUMN: Main Deficit Alert & Top-Up Engine (7 cols on large desktop) -->
<div class="lg:col-span-7 flex flex-col gap-space-lg">
<!-- Header Notice -->
<div class="flex flex-col gap-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">Étape 2 sur 3 • Règlement du solde</span>
<h1 class="font-headline-xl text-headline-xl text-on-surface">Paiement sécurisé par Portefeuille AutoLink</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Réglez votre location en toute simplicité depuis votre portefeuille numérique approvisionné.</p>
</div>
<!-- ALERT BANNER: Solde Insuffisant -->
<section class="rounded-xl p-space-lg bg-error-container text-on-error-container shadow-md flex flex-col gap-space-md">
<div class="flex items-start gap-space-md">
<div class="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
<span class="material-symbols-outlined text-[24px]">account_balance_wallet</span>
</div>
<div class="flex flex-col gap-space-xs">
<div class="flex items-center gap-space-xs flex-wrap">
<span class="font-headline-sm text-headline-sm text-error font-bold">Solde insuffisant pour confirmer la réservation</span>
<span class="px-space-xs py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm uppercase">Recharge requise</span>
</div>
<p class="font-body-md text-body-md text-on-surface">
                Votre solde disponible actuel est de <strong class="font-semibold text-on-surface">45 000 FCFA</strong>. Le montant de cette réservation est de <strong class="font-semibold text-on-surface">73 500 FCFA</strong>.
              </p>
</div>
</div>
<!-- Highlight Math Box -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm bg-surface-container-lowest p-space-md rounded-lg text-on-surface">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Solde Actuel</span>
<span class="font-headline-sm text-headline-sm font-semibold text-on-surface">45 000 FCFA</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Total Réservation</span>
<span class="font-headline-sm text-headline-sm font-semibold text-on-surface">73 500 FCFA</span>
</div>
<div class="flex flex-col p-space-xs rounded bg-error-container">
<span class="font-label-sm text-label-sm font-bold text-error">Manquant Immédiat</span>
<span class="font-currency-display text-currency-display font-bold text-error leading-none">28 500 FCFA</span>
</div>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-tertiary">info</span>
<span>Option Acompte partiel : solde manquant réduit à <strong>12 500 FCFA</strong>.</span>
</span>
<button class="underline hover:text-on-surface text-primary font-semibold transition-colors" type="button">Activer formule acompte</button>
</div>
</section>
<!-- INSTANT RECHARGE SECTION -->
<section class="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg">
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Rechargez votre portefeuille instantanément</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Zéro frais d'opération. Validation par notification USSD push immédiate.</p>
</div>
<span class="inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold w-fit">
<span class="material-symbols-outlined text-[14px]">bolt</span> Sans frais (0%)
            </span>
</div>
<!-- Featured Exact Amount Top-Up Button -->
<div class="flex flex-col gap-space-xs">
<span class="font-label-md text-label-md text-on-surface font-semibold">Montant suggéré pour finalisation automatique :</span>
<button class="w-full p-space-md rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all flex items-center justify-between text-left" id="btn-exact-recharge" type="button">
<div class="flex items-center gap-space-md">
<div class="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">bolt</span>
</div>
<div>
<div class="font-label-lg text-label-lg font-bold">Recharger exactement le montant manquant</div>
<div class="font-body-sm text-body-sm opacity-90">Comble le déficit sans solde dormant restant</div>
</div>
</div>
<div class="font-headline-sm text-headline-sm font-bold text-right tracking-tight">+ 28 500 FCFA</div>
</button>
</div>
<!-- Tier Selection Pills -->
<div class="flex flex-col gap-space-sm">
<span class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Ou sélectionnez un montant forfaitaire pour de futurs trajets :</span>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
<button class="amount-pill py-space-sm px-space-xs text-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors" type="button">
                + 30 000 FCFA
              </button>
<button class="amount-pill py-space-sm px-space-xs text-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors" type="button">
                + 50 000 FCFA
              </button>
<button class="amount-pill py-space-sm px-space-xs text-center rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors" type="button">
                + 100 000 FCFA
              </button>
<button class="amount-pill py-space-sm px-space-xs text-center rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-space-xs" type="button">
<span class="material-symbols-outlined text-[16px]">edit</span> Autre
              </button>
</div>
</div>
<!-- 1-Click Cameroon Payment Gateways List -->
<div class="flex flex-col gap-space-sm">
<span class="font-label-md text-label-md text-on-surface font-semibold">Choisissez le compte de débit express :</span>
<div class="space-y-space-sm">
<!-- MTN MoMo -->
<label class="payment-method-card flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<div class="flex items-center gap-space-md">
<input checked="" class="w-5 h-5 text-primary accent-primary" name="recharge_method" type="radio" value="mtn"/>
<div class="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-[11px] text-on-surface shadow-xs">
                    MOMO
                  </div>
<div>
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg font-bold text-on-surface">MTN Mobile Money</span>
<span class="px-space-xs rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Enregistré</span>
</div>
<div class="font-body-sm text-body-sm text-on-surface-variant">+237 670 •• •• 89 • Emmanuel K.</div>
</div>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-primary font-semibold">Frais 0%</span>
<div class="font-label-sm text-label-sm text-outline">Push USSD *126#</div>
</div>
</label>
<!-- Orange Money -->
<label class="payment-method-card flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<div class="flex items-center gap-space-md">
<input class="w-5 h-5 text-primary accent-primary" name="recharge_method" type="radio" value="orange"/>
<div class="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-[11px] text-tertiary-container shadow-xs">
                    OM
                  </div>
<div>
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg font-bold text-on-surface">Orange Money Cameroun</span>
<span class="px-space-xs rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Enregistré</span>
</div>
<div class="font-body-sm text-body-sm text-on-surface-variant">+237 699 •• •• 42 • Emmanuel K.</div>
</div>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-primary font-semibold">Frais 0%</span>
<div class="font-label-sm text-label-sm text-outline">Push #150#</div>
</div>
</label>
<!-- Carte Bancaire GIMAC / Visa / Mastercard -->
<label class="payment-method-card flex items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<div class="flex items-center gap-space-md">
<input class="w-5 h-5 text-primary accent-primary" name="recharge_method" type="radio" value="card"/>
<div class="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shadow-xs">
<span class="material-symbols-outlined text-[20px]">credit_card</span>
</div>
<div>
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg font-bold text-on-surface">Carte Visa / UBA / Ecobank</span>
<span class="px-space-xs rounded bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">GIMAC</span>
</div>
<div class="font-body-sm text-body-sm text-on-surface-variant">•••• •••• •••• 4129 • Exp 08/27</div>
</div>
</div>
<div class="text-right">
<span class="font-label-sm text-label-sm text-on-surface font-semibold">3D-Secure</span>
<div class="font-label-sm text-label-sm text-outline">SMS OTP</div>
</div>
</label>
</div>
</div>
<!-- Execute Single-Step Recharge & Settle CTA -->
<div class="flex flex-col gap-space-xs pt-space-xs">
<button class="w-full h-12 md:h-[52px] rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-space-sm" id="btn-submit-flow" type="button">
<span class="material-symbols-outlined text-[20px]">sync</span>
<span>Recharger 28 500 FCFA et valider la réservation</span>
<span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
<p class="font-body-sm text-body-sm text-center text-outline">
              Une requête USSD sécurisée apparaîtra immédiatement sur votre smartphone pour valider le débit de votre code secret.
            </p>
</div>
</section>
<!-- ALTERNATIVE ESCAPE HATCHES -->
<div class="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-xl bg-surface-container-low">
<div class="flex items-center gap-space-sm">
<span class="material-symbols-outlined text-secondary text-[22px]">tune</span>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface font-bold">Ajuster vos options pour réduire le prix ?</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Désactiver le chauffeur ou réduire les heures de location.</span>
</div>
</div>
<button class="shrink-0 px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold" type="button">
            Modifier ma réservation
          </button>
</div>
<div class="flex items-center justify-between">
<a class="inline-flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors" href="#">
<span class="material-symbols-outlined text-[18px]">arrow_back</span>
<span>Revenir au catalogue sans perdre ma sélection</span>
</a>
<span class="font-label-sm text-label-sm text-outline">Ref dossier : #AL-DLA-8924</span>
</div>
<!-- 24/7 WHATSAPP CAMEROON ASSISTANCE BANNER -->
<div class="rounded-xl p-space-md bg-surface-container-lowest flex items-center justify-between gap-space-md shadow-xs">
<div class="flex items-center gap-space-md">
<div class="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">support_agent</span>
</div>
<div>
<div class="font-label-md text-label-md font-bold text-on-surface">Besoin d'aide pour approvisionner ?</div>
<div class="font-body-sm text-body-sm text-on-surface-variant">Nos conseillers à Douala et Yaoundé vous assistent en direct via WhatsApp.</div>
</div>
</div>
<a class="shrink-0 inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm font-bold hover:bg-surface-container-high transition-colors" href="https://wa.me/237655000000" rel="noopener noreferrer" target="_blank">
<span class="material-symbols-outlined text-[16px] text-primary">chat</span>
<span>+237 655 00 00 00</span>
</a>
</div>
</div>
<!-- RIGHT COLUMN: Sticky Financial Summary Card (5 cols on large desktop) -->
<aside class="lg:col-span-5 sticky top-20 flex flex-col gap-space-md">
<div class="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
<!-- Card Header / Vehicle Summary Preview -->
<div class="p-space-lg flex flex-col gap-space-md">
<div class="flex items-center justify-between">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Récapitulatif financier</h3>
<span class="px-space-sm py-space-xs rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm font-semibold">
                Contrat vérifié
              </span>
</div>
<!-- Vehicle Visual Snapshot -->
<div class="flex gap-space-md items-center bg-surface-container-low p-space-sm rounded-xl">
<img class="w-24 h-20 rounded-lg object-cover shadow-xs shrink-0" data-alt="A modern metallic charcoal Toyota RAV4 Hybrid 2022 parked under natural Douala daylight with sleek aerodynamic lines, clean high-gloss finish, African urban palm tree reflections, and professional automotive commercial studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Hr3I87NO7uRMa-flOufho1BPodAwndgpter_iAK7ovhCfHBotg7csPEBYIYNykugfOgQGC7twSq_JKNa5o-yyJT06ETW2IquvNfKREQj788LNG_ycVtZdNrqWq_5_R2Lx5Z1-gh49XCiflEMf3vcdCsvXEx4G4cRwY_YLKd_0E26UFWkdbeJqqp7I9l8YrWto7jcpMzivmyeToqXc5uybJr-3SpvwOa5RRzp6T2Oce4VUjk543uiHg"/>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-space-xs">
<span class="px-space-xs rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold uppercase">SUV Premium</span>
<span class="flex items-center text-tertiary-container font-label-sm text-label-sm font-semibold">
<span class="material-symbols-outlined text-[14px]">star</span> 4.9
                  </span>
</div>
<h4 class="font-headline-sm text-headline-sm text-on-surface truncate">Toyota RAV4 AWD Hybrid</h4>
<div class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[14px]">schedule</span>
<span>24h • 29 Oct 08:30 → 30 Oct 08:30</span>
</div>
</div>
</div>
<!-- Detailed Breakdown -->
<div class="flex flex-col gap-space-sm pt-space-xs">
<div class="flex items-center justify-between text-body-md font-body-md text-on-surface-variant">
<span>Location Toyota RAV4 (24h)</span>
<span class="text-on-surface font-semibold">55 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-body-md font-body-md text-on-surface-variant">
<span class="flex items-center gap-space-xs">
                  Chauffeur pro bilingue (24h)
                  <span class="material-symbols-outlined text-[14px] text-primary" title="Accompagnateur certifié AutoLink">verified_user</span>
</span>
<span class="text-on-surface font-semibold">10 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-body-md font-body-md text-on-surface-variant">
<span>Livraison Aéroport International Douala</span>
<span class="text-on-surface font-semibold">5 000 FCFA</span>
</div>
<div class="flex items-center justify-between text-body-md font-body-md text-on-surface-variant">
<span>Assurance Tous Risques Activa + Frais GIMAC</span>
<span class="text-on-surface font-semibold">3 500 FCFA</span>
</div>
</div>
<!-- Sous-total Divider Section -->
<div class="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs">
<div class="flex items-center justify-between text-on-surface">
<span class="font-label-lg text-label-lg font-bold">SOUS-TOTAL À DÉBITER</span>
<span class="font-currency-display text-currency-display font-bold text-on-surface">73 500 FCFA</span>
</div>
<div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-space-xs">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[14px]">shield</span> Caution sous séquestre
                </span>
<span class="font-semibold text-on-surface">150 000 FCFA (pré-autorisée)</span>
</div>
</div>
<!-- Solde vs Débit Diagnostic Card -->
<div class="rounded-xl p-space-md bg-surface-container flex flex-col gap-space-xs">
<div class="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
<span>Solde actuel de votre portefeuille</span>
<span class="font-bold text-on-surface">45 000 FCFA</span>
</div>
<div class="flex justify-between items-center text-body-sm font-body-sm text-on-surface-variant">
<span>Montant à débiter</span>
<span class="font-bold text-on-surface">73 500 FCFA</span>
</div>
<div class="flex justify-between items-center pt-space-xs text-error font-headline-sm text-headline-sm font-bold">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[18px]">error</span>
                  Déficit à combler
                </span>
<span>- 28 500 FCFA</span>
</div>
</div>
<!-- Guarantee Badges -->
<div class="flex flex-col gap-space-xs pt-space-xs">
<div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-primary">lock_clock</span>
<span>Votre sélection est réservée temporairement pour 14 min 30 s.</span>
</div>
<div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
<span class="material-symbols-outlined text-[18px] text-primary">policy</span>
<span>Remboursement sans frais jusqu'à 3h avant le départ.</span>
</div>
</div>
</div>
<!-- Bottom Micro Assurance Footer -->
<div class="p-space-md bg-surface-container-high text-on-surface flex items-center justify-between font-label-sm text-label-sm">
<span class="flex items-center gap-space-xs">
<span class="material-symbols-outlined text-[16px] text-primary">verified</span>
              Paiement audité par l'ANIF Cameroun
            </span>
<span class="font-bold text-secondary">AutoLink Pro Pay</span>
</div>
</div>
<!-- Trust Mini Card with Local Coverage -->
<div class="p-space-md rounded-xl bg-surface-container-low flex items-center gap-space-md">
<div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[20px]">local_shipping</span>
</div>
<div class="text-body-sm text-on-surface-variant">
            Prise en charge ponctuelle assurée à <strong class="text-on-surface">Douala (Akwa, Bonapriso, Aéroport)</strong> avec réservoir plein et contrôle technique à jour.
          </div>
</div>
</aside>
</div>
</main>
<script>
    // Lightweight interaction for dynamic amount selection
    document.addEventListener('DOMContentLoaded', () => {
      const amountPills = document.querySelectorAll('.amount-pill');
      const submitBtn = document.getElementById('btn-submit-flow');
      const exactBtn = document.getElementById('btn-exact-recharge');

      amountPills.forEach(pill => {
        pill.addEventListener('click', () => {
          amountPills.forEach(p => p.classList.remove('bg-primary', 'text-on-primary'));
          pill.classList.add('bg-primary', 'text-on-primary');
          const value = pill.textContent.trim().replace('+ ', '').replace(' FCFA', '');
          if (value !== 'Autre') {
            submitBtn.querySelector('span:nth-child(2)').textContent = \`Recharger \${value} FCFA et valider la réservation\`;
          }
        });
      });

      if (exactBtn && submitBtn) {
        exactBtn.addEventListener('click', () => {
          amountPills.forEach(p => p.classList.remove('bg-primary', 'text-on-primary'));
          submitBtn.querySelector('span:nth-child(2)').textContent = 'Recharger 28 500 FCFA et valider la réservation';
        });
      }
    });
  </script>
`;
const LINKS = {
  'Recharger 28 500 FCFA et valider la réservation': '/client/wallet?recharge=1',
  'Modifier ma réservation': '/client/booking/recap',
  'Revenir au catalogue sans perdre ma sélection': '/client/search',
  'Retour au véhicule': '/client/booking/recap',
};

export default function c2tunneltape2paiementsoldeinsuffisant() {
  return <DesignPage html={HTML} links={LINKS} />;
}
