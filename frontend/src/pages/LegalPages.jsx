import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { uiText } from '../i18n';

const PAGES = {
  '/privacy': {
    title: uiText("pages.LegalPages", "Politique de confidentialité"),
    intro: 'AutoLink Pro protège les données confiées par ses utilisateurs et les traite uniquement pour fournir et sécuriser ses services de mobilité.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Responsable et cadre légal"),
        text: uiText("pages.LegalPages", "Le responsable du traitement est AutoLink Pro, plateforme de location de véhicules opérant au Cameroun. Cette politique tient compte de la loi n° 2010/012 du 21 décembre 2010 relative à la cybersécurité et à la cybercriminalité ainsi que de la loi n° 2024/017 du 23 décembre 2024 relative à la protection des données à caractère personnel."),
      },
      {
        title: uiText("pages.LegalPages", "Données collectées et utilisations"),
        text: uiText("pages.LegalPages", "Selon votre rôle et les fonctionnalités utilisées, nous traitons notamment vos nom, adresse e-mail, téléphone, informations de compte, pièces justificatives de vérification, réservations, paiements et échanges avec notre équipe. Ces données servent à gérer les comptes, vérifier les profils, organiser les locations, traiter les paiements et litiges, prévenir la fraude et répondre aux demandes."),
      },
      {
        title: uiText("pages.LegalPages", "Partage et conservation"),
        text: uiText("pages.LegalPages", "Les informations nécessaires à une réservation sont communiquées au client, au propriétaire ou au chauffeur concerné. Les données peuvent aussi être accessibles aux prestataires qui hébergent ou sécurisent la plateforme, dans la limite de leurs missions. Elles sont conservées pendant la durée nécessaire aux services, au traitement des réclamations et au respect des obligations légales applicables."),
      },
      {
        title: uiText("pages.LegalPages", "Vos droits et sécurité"),
        text: uiText("pages.LegalPages", "Vous pouvez demander l’accès, la rectification ou la suppression des données vous concernant, sous réserve des obligations de conservation applicables, en utilisant le formulaire de contact ou l’adresse indiquée sur la page d’accueil. AutoLink Pro applique des mesures raisonnables pour limiter les accès non autorisés et protéger les données ; aucun échange sur Internet ne peut toutefois être garanti comme absolument sûr."),
      },
      {
        title: uiText("pages.LegalPages", "Mises à jour"),
        text: uiText("pages.LegalPages", "Cette politique peut évoluer pour refléter les changements de service ou de réglementation. La version publiée sur cette page indique les règles en vigueur."),
      },
    ],
  },
  '/terms': {
    title: uiText("pages.LegalPages", "Conditions générales d’utilisation"),
    intro: 'Les présentes conditions encadrent l’accès à AutoLink Pro et l’utilisation de ses services de mise en relation et de location de véhicules au Cameroun.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Rôle de la plateforme"),
        text: uiText("pages.LegalPages", "AutoLink Pro permet aux clients, propriétaires de véhicules et chauffeurs de gérer des demandes de location. Sauf indication contraire dans une offre, la plateforme facilite la mise en relation et le suivi de la réservation ; les conditions précises du trajet et du véhicule sont présentées avant confirmation."),
      },
      {
        title: uiText("pages.LegalPages", "Compte et exactitude des informations"),
        text: uiText("pages.LegalPages", "Chaque utilisateur doit fournir des informations exactes, protéger ses identifiants et utiliser un compte personnel. Les documents demandés pour la vérification doivent être valides et appartenir à la personne concernée. AutoLink Pro peut suspendre un compte en cas d’informations frauduleuses ou d’usage contraire à ces conditions."),
      },
      {
        title: uiText("pages.LegalPages", "Réservations, paiement et annulation"),
        text: uiText("pages.LegalPages", "Une réservation est soumise à la disponibilité du véhicule et à la confirmation affichée dans l’application. Le prix, les frais, la caution éventuelle, les modalités de paiement et les règles d’annulation sont présentés avant validation. Les remboursements suivent les conditions indiquées lors de la réservation et les règles applicables au moyen de paiement utilisé."),
      },
      {
        title: uiText("pages.LegalPages", "Obligations des parties"),
        text: uiText("pages.LegalPages", "Le propriétaire doit proposer un véhicule conforme à sa description et aux documents requis. Le client doit respecter les horaires, le véhicule et les règles de sécurité. Le chauffeur et les autres intervenants doivent respecter les lois et règles de circulation en vigueur au Cameroun. Tout incident doit être signalé rapidement via les outils de la plateforme."),
      },
      {
        title: uiText("pages.LegalPages", "Responsabilité et droit applicable"),
        text: uiText("pages.LegalPages", "Les utilisateurs restent responsables de leurs obligations légales et contractuelles liées à la location. AutoLink Pro ne limite aucune responsabilité qui ne peut être exclue par la loi. Les présentes conditions sont régies par le droit camerounais, notamment les règles applicables au commerce électronique et à la cybersécurité."),
      },
      {
        title: uiText("pages.LegalPages", "Contact et évolution"),
        text: uiText("pages.LegalPages", "Pour toute question relative à ces conditions, utilisez le formulaire de contact. Les conditions peuvent être mises à jour ; la version publiée s’applique à compter de sa mise en ligne."),
      },
    ],
  },
  '/cookies': {
    title: uiText("pages.LegalPages", "Politique relative aux cookies"),
    intro: 'AutoLink Pro utilise des technologies de stockage nécessaires au fonctionnement de la plateforme et au respect de vos choix.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Stockage nécessaire"),
        text: uiText("pages.LegalPages", "La plateforme utilise le stockage local du navigateur pour conserver les informations de session nécessaires à la connexion et votre choix relatif au bandeau de consentement. Ces éléments permettent de sécuriser votre compte et d’éviter de réafficher le bandeau après votre choix."),
      },
      {
        title: uiText("pages.LegalPages", "Mesure d’audience et publicité"),
        text: uiText("pages.LegalPages", "Cette version du site n’active pas de cookies publicitaires ou de mesure d’audience tiers. Si de nouvelles technologies non nécessaires sont ajoutées, AutoLink Pro vous informera et recueillera votre choix lorsque la réglementation l’exige."),
      },
      {
        title: uiText("pages.LegalPages", "Gérer vos choix"),
        text: uiText("pages.LegalPages", "Vous pouvez supprimer les données locales du site dans les réglages de votre navigateur. Cela peut vous déconnecter et réinitialiser votre choix de consentement. Pour toute question, utilisez le formulaire de contact."),
      },
    ],
  },
};

const EN_PAGES = {
  '/privacy': {
    title: uiText("pages.LegalPages", "Privacy policy"),
    intro: 'AutoLink Pro protects the information entrusted to us by users and processes it only to provide and secure our mobility services.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Data controller and legal framework"),
        text: uiText("pages.LegalPages", "AutoLink Pro is the data controller for this vehicle-rental platform operating in Cameroon. This policy takes into account Cameroon’s Law No. 2010/012 of 21 December 2010 on cybersecurity and cybercrime and Law No. 2024/017 of 23 December 2024 on the protection of personal data."),
      },
      {
        title: uiText("pages.LegalPages", "Information we collect and how we use it"),
        text: uiText("pages.LegalPages", "Depending on your role and the features you use, we may process your name, email address, phone number, account details, identity-verification documents, bookings, payments and communications with our team. We use this information to manage accounts, verify profiles, arrange rentals, process payments and disputes, prevent fraud and respond to requests."),
      },
      {
        title: uiText("pages.LegalPages", "Sharing and retention"),
        text: uiText("pages.LegalPages", "Information needed for a booking is shared with the relevant client, vehicle owner or driver. Information may also be accessible to service providers that host or secure the platform, only to the extent required for their work. We retain information for as long as needed to provide our services, handle claims and meet applicable legal obligations."),
      },
      {
        title: uiText("pages.LegalPages", "Your rights and security"),
        text: uiText("pages.LegalPages", "Subject to applicable retention obligations, you may request access to, correction of or deletion of your personal information using the contact form or the address shown on our home page. AutoLink Pro takes reasonable measures to prevent unauthorised access and protect information; however, no transmission over the Internet can be guaranteed to be completely secure."),
      },
      {
        title: uiText("pages.LegalPages", "Updates"),
        text: uiText("pages.LegalPages", "We may update this policy to reflect changes to our services or applicable regulations. The version published on this page describes the rules currently in force."),
      },
    ],
  },
  '/terms': {
    title: uiText("pages.LegalPages", "Terms of service"),
    intro: 'These terms govern access to AutoLink Pro and the use of its vehicle-rental and matching services in Cameroon.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Role of the platform"),
        text: uiText("pages.LegalPages", "AutoLink Pro helps clients, vehicle owners and drivers manage rental requests. Unless an offer states otherwise, the platform facilitates connections and booking management; the specific vehicle and trip conditions are shown before a booking is confirmed."),
      },
      {
        title: uiText("pages.LegalPages", "Accounts and accurate information"),
        text: uiText("pages.LegalPages", "Each user must provide accurate information, protect their sign-in credentials and use a personal account. Documents requested for verification must be valid and belong to the person concerned. AutoLink Pro may suspend an account if information is fraudulent or the account is used in breach of these terms."),
      },
      {
        title: uiText("pages.LegalPages", "Bookings, payment and cancellation"),
        text: uiText("pages.LegalPages", "A booking is subject to vehicle availability and the confirmation shown in the application. The price, fees, any deposit, payment methods and cancellation rules are displayed before confirmation. Refunds follow the conditions shown at booking and the rules of the payment method used."),
      },
      {
        title: uiText("pages.LegalPages", "Responsibilities of the parties"),
        text: uiText("pages.LegalPages", "The owner must provide a vehicle that matches its description and required documentation. The client must respect the agreed times, vehicle and safety rules. Drivers and other participants must comply with the laws and traffic rules in force in Cameroon. Incidents should be reported promptly using the platform."),
      },
      {
        title: uiText("pages.LegalPages", "Liability and governing law"),
        text: uiText("pages.LegalPages", "Users remain responsible for their legal and contractual obligations related to a rental. AutoLink Pro does not exclude liability that cannot be excluded by law. These terms are governed by the laws of Cameroon, including the rules applicable to electronic commerce and cybersecurity."),
      },
      {
        title: uiText("pages.LegalPages", "Contact and changes"),
        text: uiText("pages.LegalPages", "For questions about these terms, please use the contact form. We may update these terms; the version published on this page applies from the date it is posted."),
      },
    ],
  },
  '/cookies': {
    title: uiText("pages.LegalPages", "Cookie policy"),
    intro: 'AutoLink Pro uses storage technologies required to operate the platform and remember your choices.',
    sections: [
      {
        title: uiText("pages.LegalPages", "Essential storage"),
        text: uiText("pages.LegalPages", "The platform uses your browser’s local storage to retain session information needed to sign in and your choice about the consent banner. These items help secure your account and prevent the banner from reappearing after you make a choice."),
      },
      {
        title: uiText("pages.LegalPages", "Analytics and advertising"),
        text: uiText("pages.LegalPages", "This version of the site does not enable third-party advertising or audience-measurement cookies. If we add non-essential technologies, AutoLink Pro will inform you and request your choice where required by law."),
      },
      {
        title: uiText("pages.LegalPages", "Managing your choices"),
        text: uiText("pages.LegalPages", "You can delete this site’s local data in your browser settings. This may sign you out and reset your consent choice. For questions, please use the contact form."),
      },
    ],
  },
};

export default function LegalPages() {
  useTranslation();
  const { pathname } = useLocation();
  const pages = i18n.language === 'en' ? EN_PAGES : PAGES;
  const page = pages[pathname] || pages['/privacy'];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <Link to="/" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          {i18n.language === 'en' ? uiText("pages.LegalPages", "← Back to home") : uiText("pages.LegalPages", "← Retour à l’accueil")}
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-teal-600">{uiText("pages.LegalPages", "AutoLink Pro · Cameroun")}</p>
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
          {i18n.language === 'en'
            ? uiText("pages.LegalPages", "The version currently in force is the one published on this page.")
            : uiText("pages.LegalPages", "La version en vigueur est celle publiée sur cette page.")}
        </p>
      </article>
    </main>
  );
}
