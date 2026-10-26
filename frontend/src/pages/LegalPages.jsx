import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PAGES = {
  '/privacy': {
    title: 'Politique de confidentialité',
    intro: 'AutoLink Pro protège les données confiées par ses utilisateurs et les traite uniquement pour fournir et sécuriser ses services de mobilité.',
    sections: [
      {
        title: 'Responsable et cadre légal',
        text: 'Le responsable du traitement est AutoLink Pro, plateforme de location de véhicules opérant au Cameroun. Cette politique tient compte de la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité ainsi que de la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel.',
      },
      {
        title: 'Données collectées et utilisations',
        text: 'Selon votre rôle et les fonctionnalités utilisées, nous traitons notamment vos nom, adresse e-mail, téléphone, informations de compte, pièces justificatives de vérification, réservations, paiements et échanges avec notre équipe. Ces données servent à gérer les comptes, vérifier les profils, organiser les locations, traiter les paiements et litiges, prévenir la fraude et répondre aux demandes.',
      },
      {
        title: 'Partage et conservation',
        text: 'Les informations nécessaires à une réservation sont communiquées au client, au propriétaire ou au chauffeur concerné. Les données peuvent aussi être accessibles aux prestataires qui hébergent ou sécurisent la plateforme, dans la limite de leurs missions. Elles sont conservées pendant la durée nécessaire aux services, au traitement des réclamations et au respect des obligations légales applicables.',
      },
      {
        title: 'Vos droits et sécurité',
        text: 'Vous pouvez demander l’accès, la rectification ou la suppression des données vous concernant, sous réserve des obligations de conservation applicables, en utilisant le formulaire de contact ou l’adresse indiquée sur la page d’accueil. AutoLink Pro applique des mesures raisonnables pour limiter les accès non autorisés et protéger les données ; aucun échange sur Internet ne peut toutefois être garanti comme absolument sûr.',
      },
      {
        title: 'Mises à jour',
        text: 'Cette politique peut évoluer pour refléter les changements de service ou de réglementation. La version publiée sur cette page indique les règles en vigueur.',
      },
    ],
  },
  '/terms': {
    title: 'Conditions générales d’utilisation',
    intro: 'Les présentes conditions encadrent l’accès à AutoLink Pro et l’utilisation de ses services de mise en relation et de location de véhicules au Cameroun.',
    sections: [
      {
        title: 'Rôle de la plateforme',
        text: 'AutoLink Pro permet aux clients, propriétaires de véhicules et chauffeurs de gérer des demandes de location. Sauf indication contraire dans une offre, la plateforme facilite la mise en relation et le suivi de la réservation ; les conditions précises du trajet et du véhicule sont présentées avant confirmation.',
      },
      {
        title: 'Compte et exactitude des informations',
        text: 'Chaque utilisateur doit fournir des informations exactes, protéger ses identifiants et utiliser un compte personnel. Les documents demandés pour la vérification doivent être valides et appartenir à la personne concernée. AutoLink Pro peut suspendre un compte en cas d’informations frauduleuses ou d’usage contraire à ces conditions.',
      },
      {
        title: 'Réservations, paiement et annulation',
        text: 'Une réservation est soumise à la disponibilité du véhicule et à la confirmation affichée dans l’application. Le prix, les frais, la caution éventuelle, les modalités de paiement et les règles d’annulation sont présentés avant validation. Les remboursements suivent les conditions indiquées lors de la réservation et les règles applicables au moyen de paiement utilisé.',
      },
      {
        title: 'Obligations des parties',
        text: 'Le propriétaire doit proposer un véhicule conforme à sa description et aux documents requis. Le client doit respecter les horaires, le véhicule et les règles de sécurité. Le chauffeur et les autres intervenants doivent respecter les lois et règles de circulation en vigueur au Cameroun. Tout incident doit être signalé rapidement via les outils de la plateforme.',
      },
      {
        title: 'Responsabilité et droit applicable',
        text: 'Les utilisateurs restent responsables de leurs obligations légales et contractuelles liées à la location. AutoLink Pro ne limite aucune responsabilité qui ne peut être exclue par la loi. Les présentes conditions sont régies par le droit camerounais, notamment les règles applicables au commerce électronique et à la cybersécurité.',
      },
      {
        title: 'Contact et évolution',
        text: 'Pour toute question relative à ces conditions, utilisez le formulaire de contact. Les conditions peuvent être mises à jour ; la version publiée s’applique à compter de sa mise en ligne.',
      },
    ],
  },
  '/cookies': {
    title: 'Politique relative aux cookies',
    intro: 'AutoLink Pro utilise des technologies de stockage nécessaires au fonctionnement de la plateforme et au respect de vos choix.',
    sections: [
      {
        title: 'Stockage nécessaire',
        text: 'La plateforme utilise le stockage local du navigateur pour conserver les informations de session nécessaires à la connexion et votre choix relatif au bandeau de consentement. Ces éléments permettent de sécuriser votre compte et d’éviter de réafficher le bandeau après votre choix.',
      },
      {
        title: 'Mesure d’audience et publicité',
        text: 'Cette version du site n’active pas de cookies publicitaires ou de mesure d’audience tiers. Si de nouvelles technologies non nécessaires sont ajoutées, AutoLink Pro vous informera et recueillera votre choix lorsque la réglementation l’exige.',
      },
      {
        title: 'Gérer vos choix',
        text: 'Vous pouvez supprimer les données locales du site dans les réglages de votre navigateur. Cela peut vous déconnecter et réinitialiser votre choix de consentement. Pour toute question, utilisez le formulaire de contact.',
      },
    ],
  },
};

export default function LegalPages() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES['/privacy'];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <Link to="/" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          ← Retour à l’accueil
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-600">AutoLink Pro · Cameroun</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{page.title}</h1>
        <p className="mt-5 text-slate-600 leading-relaxed">{page.intro}</p>
        <div className="mt-8 space-y-7">
          {page.sections.map(section => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-600">{section.text}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-slate-100 pt-5 text-sm text-slate-400">
          La version en vigueur est celle publiée sur cette page.
        </p>
      </article>
    </main>
  );
}
