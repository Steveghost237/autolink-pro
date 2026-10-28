import React, { useState } from 'react';
import { PublicNavbar, Footer } from '../components/landing';
import { HelpHero, HelpCategories, HelpContacts, HelpMessage } from '../components/help';

/* Page « Aide » — centre d'aide : recherche, FAQ thématique,
   assistance immédiate et formulaire de contact. */
export default function Help() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <HelpHero query={query} setQuery={setQuery} />
      <HelpCategories query={query} cat={cat} setCat={setCat} />
      <HelpContacts />
      <HelpMessage />
      <Footer />
    </div>
  );
}
