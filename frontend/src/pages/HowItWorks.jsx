import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import PageHero from '../components/PageHero';
import Icon from '../components/Icon';
import { uiText } from '../i18n';

const t = (text, options) => uiText('pages.HowItWorks', text, options);

const STEPS = [
  { icon: 'travel_explore', title: 'Choisissez et réservez en ligne', text: 'Filtrez le catalogue par ville, gamme, formule et dates. Chaque fiche affiche photos, état mécanique, caution et kilométrage inclus.' },
  { icon: 'account_balance_wallet', title: 'Rechargez votre portefeuille & bloquez la réservation', text: 'Payez par portefeuille AutoLink, MTN MoMo, Orange Money ou carte. La location est débitée et la caution placée sous séquestre.' },
  { icon: 'fact_check', title: 'État des lieux contradictoire', text: 'À la prise en charge, le véhicule est inspecté avec photos horodatées. Le propriétaire confirme la remise des clés.' },
  { icon: 'directions_car', title: 'Roulez en toute liberté', text: 'Seul ou avec un chauffeur AutoLink. La messagerie intégrée vous relie au propriétaire, au chauffeur et au support.' },
  { icon: 'lock_open', title: 'Restitution et déblocage de la caution', text: 'À la fin de la location sans litige, la caution est automatiquement recréditée sur votre portefeuille.' },
];

const WALLET = [
  { icon: 'add_card', title: 'Dépôt instantané', text: 'Rechargez par MTN MoMo, Orange Money, carte ou PayPal, sans frais de rechargement.' },
  { icon: 'payments', title: 'Paiement de la prestation', text: 'Le montant de la location est débité à la réservation ; le propriétaire est payé à la fin.' },
  { icon: 'lock', title: 'Séquestre de la caution', text: 'La caution reste bloquée par AutoLink, jamais encaissée par le propriétaire.' },
  { icon: 'currency_exchange', title: 'Remboursement', text: 'Annulation avant le départ ou litige gagné : location et caution sont recréditées.' },
];

const DOCUMENTS = [
  { title: "1. Pièce d'identité valide", text: 'CNI camerounaise, passeport ou carte de séjour en cours de validité.' },
  { title: '2. Permis de conduire', text: 'Obligatoire si vous conduisez vous-même. Inutile avec un chauffeur AutoLink.' },
  { title: '3. Coordonnées vérifiées', text: 'Numéro de téléphone joignable pour la prise en charge et les paiements Mobile Money.' },
];

const INCIDENTS = [
  { icon: 'car_crash', title: 'Panne mécanique ou accident', text: 'Signalez le problème depuis votre réservation : un litige est ouvert, la caution est gelée et l’équipe AutoLink arbitre.' },
  { icon: 'schedule', title: 'Retard de restitution', text: 'Prévenez le propriétaire via la messagerie. Les jours supplémentaires sont facturés selon le tarif journalier.' },
  { icon: 'edit_calendar', title: 'Modification ou annulation', text: 'Avant le début, modifiez les dates ou annulez depuis « Mes réservations » : remboursement intégral sur le portefeuille.' },
];

export default function HowItWorks() {
  return (
    <PublicLayout>
      <PageHero badge={t('Guide de location')} title={t('Louer en toute sérénité à Douala et Yaoundé')}
        text={t('De la réservation à la restitution de la caution, chaque étape est tracée, sécurisée et transparente.')}
        image="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80">
        <div className="flex flex-wrap gap-3"><Link to="/catalog" className="btn-primary">{t('Voir le catalogue')}</Link><Link to="/register" className="btn-outline-white">{t('Créer mon compte')}</Link></div>
      </PageHero>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center">{t('Comment fonctionne votre location en 5 étapes simples')}</h2>
        <ol className="relative mt-10 flex flex-col gap-6 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-primary/30">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-5">
              <span className="relative z-10 w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-sm text-headline-sm shrink-0">{index + 1}</span>
              <div className="card flex-1 flex gap-4">
                <Icon name={step.icon} size={28} className="text-primary shrink-0" />
                <div><h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(step.title)}</h3><p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-400 mt-1">{t(step.text)}</p></div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center">{t('Le portefeuille AutoLink Pro : comment ça fonctionne ?')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
            {WALLET.map((item) => (
              <div key={item.title} className="card flex flex-col gap-3">
                <span className="w-11 h-11 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center"><Icon name={item.icon} /></span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(item.title)}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-slate-400">{t(item.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title text-center">{t('La garantie caution sécurisée : finies les cautions confisquées')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-xl p-6 bg-error-container/60 dark:bg-slate-900">
            <h3 className="font-headline-md text-headline-md text-on-error-container dark:text-white flex items-center gap-2"><Icon name="warning" />{t('Location informelle : risques élevés')}</h3>
            <ul className="mt-3 flex flex-col gap-2 font-body-md text-body-md text-on-error-container dark:text-slate-300">
              {['Caution remise en espèces au propriétaire', 'Aucune preuve de l’état du véhicule', 'Retenues arbitraires et conflits récurrents'].map((item) => <li key={item} className="flex gap-2"><Icon name="close" size={18} />{t(item)}</li>)}
            </ul>
          </div>
          <div className="rounded-xl p-6 bg-primary-fixed/30 dark:bg-slate-900">
            <h3 className="font-headline-md text-headline-md text-on-primary-fixed-variant dark:text-white flex items-center gap-2"><Icon name="verified_user" />{t('AutoLink Pro : séquestre & déblocage automatisé')}</h3>
            <ul className="mt-3 flex flex-col gap-2 font-body-md text-body-md text-on-primary-fixed-variant dark:text-slate-300">
              {['Caution bloquée par AutoLink, pas par le propriétaire', 'Inspection et photos horodatées', 'Restitution automatique en fin de location, arbitrage neutre en cas de litige'].map((item) => <li key={item} className="flex gap-2"><Icon name="check" size={18} />{t(item)}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low/60 dark:bg-slate-900/60 py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="section-title">{t('Documents requis pour valider votre dossier')}</h2>
            <div className="flex flex-col gap-3 mt-6">
              {DOCUMENTS.map((doc) => (
                <div key={doc.title} className="card flex gap-3"><Icon name="badge" className="text-primary shrink-0" /><div><h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(doc.title)}</h3><p className="font-body-md text-body-md text-on-surface-variant">{t(doc.text)}</p></div></div>
              ))}
            </div>
            <Link to="/profile" className="btn-secondary mt-4"><Icon name="upload_file" size={18} />{t('Déposer mes documents')}</Link>
          </div>
          <div>
            <h2 className="section-title">{t('Une réponse claire à chaque aléa')}</h2>
            <div className="flex flex-col gap-3 mt-6">
              {INCIDENTS.map((item) => (
                <div key={item.title} className="card flex gap-3"><Icon name={item.icon} className="text-tertiary shrink-0" /><div><h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-white">{t(item.title)}</h3><p className="font-body-md text-body-md text-on-surface-variant">{t(item.text)}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-xl bg-primary p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-on-primary max-w-2xl">{t('Prêt à réserver votre prochain véhicule à Douala ou Yaoundé ?')}</h2>
          <div className="flex flex-wrap gap-3"><Link to="/catalog" className="btn-outline-white">{t('Explorer le catalogue')}</Link><Link to="/help" className="btn-outline-white">{t('Une question ?')}</Link></div>
        </div>
      </section>
    </PublicLayout>
  );
}
