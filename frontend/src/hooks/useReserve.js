import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Point d'entrée unique du flux de réservation (landing, catalogue…).
 *
 * - Connecté avec rôle CLIENT → /client/search?vehicle=<id> (la modale de
 *   réservation s'ouvre automatiquement).
 * - Connecté avec un autre rôle → renvoyé vers son dashboard.
 * - Non connecté → /login?next=<url> (ou /register) ; après authentification
 *   l'utilisateur revient terminer sa réservation.
 *
 * Le véhicule choisi est conservé en sessionStorage : SearchVehicles le
 * récupère même si l'API ne le connaît pas (catalogue local de secours).
 */
export default function useReserve() {
  const navigate = useNavigate();
  const { isAuthenticated, user, getDashboardPath } = useAuth();

  return useCallback((vehicle) => {
    const target = `/client/search?vehicle=${vehicle.id}`;
    try { sessionStorage.setItem('autolink_pending_vehicle', JSON.stringify(vehicle)); } catch (_) {}

    if (isAuthenticated) {
      if (user?.role === 'CLIENT') navigate(target, { state: { vehicle } });
      else navigate(getDashboardPath(user?.role));
    } else {
      navigate(`/register?next=${encodeURIComponent(target)}&role=client`);
    }
  }, [isAuthenticated, user, navigate, getDashboardPath]);
}
