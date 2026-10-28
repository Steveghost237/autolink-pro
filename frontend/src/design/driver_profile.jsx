import React from 'react';
import DesignPage from './DesignPage';
import { HTML as C9HTML, LINKS as C9LINKS } from './c9_profil_et_param_tres';

// Même design que la page Profil & Documents client (C9), données d'exemple chauffeur.
const HTML = C9HTML
  .replace(/Emmanuel Kouam/g, 'Jean-Pierre Mbida')
  .replace(/emmanuel\.k@gmail\.com/g, 'jp.mbida@autolink.cm')
  .replace(/Locataire Certifié Or/g, 'Chauffeur Certifié Pro')
  .replace(/\bEK\b/g, 'JM')
  .replace(/Espace Locataire/g, 'Espace Chauffeur')
  .replace(/locataire/gi, 'chauffeur');

const LINKS = { ...C9LINKS };

export default function DriverProfile() {
  return <DesignPage html={HTML} links={LINKS} role="driver" />;
}
