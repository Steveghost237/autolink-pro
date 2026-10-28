import React from 'react';
import { PublicNavbar, Footer } from '../components/landing';
import {
  PartnerHero, WhyPartner, IncomeCalculator, PartnerSteps,
  EligibilityCommission, PartnerFaq, PartnerApply,
} from '../components/partner';

/* Page « Devenir propriétaire » — recrutement partenaires :
   avantages, simulateur de revenus, étapes, éligibilité, FAQ, candidature. */
export default function BecomeOwner() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <PartnerHero />
      <WhyPartner />
      <IncomeCalculator />
      <PartnerSteps />
      <EligibilityCommission />
      <PartnerFaq />
      <PartnerApply />
      <Footer />
    </div>
  );
}
