import React from 'react';
import { Link } from 'react-router-dom';

const SCREENS = {
  'Espace Client': [
    ['Tableau de bord', '/design/client/dashboard'],
    ['Mes réservations', '/design/client/bookings'],
    ['Réservation — récapitulatif', '/design/client/booking/recap'],
    ['Paiement — solde suffisant', '/design/client/booking/paiement'],
    ['Paiement — solde insuffisant', '/design/client/booking/paiement-insuffisant'],
    ['Confirmation', '/design/client/booking/confirmation'],
    ['Détail réservation', '/design/client/bookings/1'],
    ['Favoris', '/design/client/favorites'],
    ['Portefeuille & Caution', '/design/client/wallet'],
    ['Parrainage', '/design/client/referrals'],
  ],
  'Espace Chauffeur': [
    ['Tableau de bord', '/design/driver/dashboard'],
    ['Revenus', '/design/driver/revenue'],
    ['Notifications', '/design/driver/notifications'],
    ['Messagerie', '/design/driver/messages'],
    ['Profil', '/design/driver/profile'],
    ['Paramètres', '/design/driver/settings'],
  ],
  'Commun': [
    ['Profil', '/design/profile'],
    ['Paramètres', '/design/settings'],
    ['Messagerie', '/design/messages'],
    ['Notifications', '/design/notifications'],
  ],
};

export default function DesignIndex() {
  return (
    <div className="min-h-screen bg-surface text-on-surface px-gutter py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline-xl text-headline-xl mb-2">Maquettes Design System</h1>
        <p className="text-sm text-on-surface-variant mb-8">Écrans prototypes Stitch (Yves-ANAGUE) — navigation directe, données factices.</p>
        {Object.entries(SCREENS).map(([group, items]) => (
          <section key={group} className="mb-8">
            <h2 className="font-headline-md text-headline-md mb-3 text-primary">{group}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(([label, path]) => (
                <Link key={path} to={path}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 font-label-md text-label-md hover:border-primary hover:text-primary transition-colors">
                  {label} →
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
