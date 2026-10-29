import React, { useState } from 'react';
import { contactAPI } from '../services/api';
import { uiText } from '../i18n';
import Icon from './Icon';

const t = (text, options) => uiText('components.ContactForm', text, options);

export const RENTAL_REQUEST_TYPES = [
  'Location Urbaine (3h à 24h)', 'Location Interurbaine', 'Location Longue Durée',
  'Transfert Aéroport', 'Location Événementielle', "Voyages d'Affaires", 'Devenir propriétaire partenaire', 'Autre question',
];

/** Formulaire de contact / demande de devis (envoi vers /api/contact/). */
export default function ContactForm({ defaultType = '' }) {
  const [form, setForm] = useState({ nom: '', prenom: '', tel: '', email: '', type: defaultType, message: '', policy: false });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true); setError('');
    try {
      await contactAPI.send({
        last_name: form.nom, first_name: form.prenom, phone: form.tel, email: form.email,
        rental_type: form.type, message: form.message,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || t('L’envoi a échoué. Vérifiez votre connexion puis réessayez.'));
    } finally { setSending(false); }
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <span className="w-16 h-16 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center mx-auto mb-4"><Icon name="check_circle" size={40} fill /></span>
        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">{t('Message envoyé')}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t('Notre équipe vous recontacte dans les 24h.')}</p>
        <button onClick={() => { setSent(false); setForm({ ...form, message: '' }); }} className="mt-6 font-label-lg text-label-lg text-primary underline">{t('Envoyer un autre message')}</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label><span className="label">{t('Nom *')}</span><input required value={form.nom} onChange={set('nom')} placeholder={t('Votre nom')} className="input-field" /></label>
        <label><span className="label">{t('Prénom *')}</span><input required value={form.prenom} onChange={set('prenom')} placeholder={t('Votre prénom')} className="input-field" /></label>
        <label><span className="label">{t('Téléphone *')}</span><input required value={form.tel} onChange={set('tel')} placeholder="+237 6XX XXX XXX" className="input-field" /></label>
        <label><span className="label">{t('Email (facultatif)')}</span><input type="email" value={form.email} onChange={set('email')} placeholder={t('vous@exemple.com')} className="input-field" /></label>
      </div>
      <label>
        <span className="label">{t('Objet de la demande')}</span>
        <select value={form.type} onChange={set('type')} className="input-field">
          <option value="">{t('Sélectionner')}</option>
          {RENTAL_REQUEST_TYPES.map((type) => <option key={type} value={type}>{t(type)}</option>)}
        </select>
      </label>
      <label>
        <span className="label">{t('Message *')}</span>
        <textarea required rows={5} value={form.message} onChange={set('message')} className="input-field resize-none"
          placeholder={t('Décrivez votre besoin : ville de départ, destination, date et heure, nombre de passagers...')} />
      </label>
      <label className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface-variant">
        <input type="checkbox" required checked={form.policy} onChange={set('policy')} className="mt-0.5 w-4 h-4 accent-primary" />
        <span>{t('J’accepte la')} <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline">{t('politique de confidentialité')}</a> {t('et les')} <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline">{t('conditions d’utilisation')}</a>.</span>
      </label>
      {error && <p role="alert" className="rounded-xl px-4 py-3 bg-error-container text-on-error-container font-body-md text-body-md">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary w-full"><Icon name="send" size={18} />{sending ? t('Envoi en cours…') : t('Envoyer ma demande')}</button>
    </form>
  );
}
