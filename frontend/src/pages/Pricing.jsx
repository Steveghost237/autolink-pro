import React from 'react';
import { PublicNavbar, Footer } from '../components/landing';
import { PricingHero, GammesGrid, OptionsGrid, InvoiceExample, PricingFaq } from '../components/pricing';

/* Page « Tarifs » — gammes, options, exemple de facturation et FAQ prix. */
export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <PricingHero />
      <GammesGrid />
      <OptionsGrid />
      <InvoiceExample />
      <PricingFaq />
      <Footer />
    </div>
  );
}
