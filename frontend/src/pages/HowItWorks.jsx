import React from 'react';
import { PublicNavbar, Footer } from '../components/landing';
import {
  HowHero, StepsFive, WalletSection, CautionSection,
  DocumentsSection, AnswersSection, HowCta,
} from '../components/howitworks';

/* Page « Comment ça marche » — parcours de location en 5 étapes,
   portefeuille, caution sécurisée, documents et réassurance. */
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <HowHero />
      <StepsFive />
      <WalletSection />
      <CautionSection />
      <DocumentsSection />
      <AnswersSection />
      <HowCta />
      <Footer />
    </div>
  );
}
