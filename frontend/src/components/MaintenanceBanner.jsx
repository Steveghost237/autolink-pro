import React, { useEffect, useState } from 'react';
import { siteAPI } from '../services/api';
import { uiText } from '../i18n';
import Icon from './Icon';

/** Bandeau global affiché quand l'admin active le mode maintenance (Paramètres plateforme). */
export default function MaintenanceBanner() {
  const [config, setConfig] = useState(null);

  useEffect(() => { siteAPI.config().then(({ data }) => setConfig(data)).catch(() => {}); }, []);

  if (!config || (!config.maintenance_mode && config.bookings_enabled !== false)) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] max-w-[94vw] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tertiary text-on-tertiary shadow-elevation-3 font-label-lg text-label-lg">
      <Icon name="construction" size={20} />
      {config.maintenance_mode
        ? uiText('components.MaintenanceBanner', 'Maintenance en cours — certaines fonctionnalités peuvent être momentanément indisponibles.')
        : uiText('components.MaintenanceBanner', 'Les nouvelles réservations sont temporairement suspendues.')}
    </div>
  );
}
