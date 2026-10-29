import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';

/** Favoris de l'utilisateur connecté ; redirige vers la connexion sinon. */
export default function useFavorites() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState([]);
  const enabled = isAuthenticated && user?.role === 'CLIENT';

  useEffect(() => {
    if (enabled) vehiclesAPI.favorites().then(({ data }) => setIds(data.map((item) => item.id))).catch(() => {});
  }, [enabled]);

  const toggle = useCallback(async (id) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    if (ids.includes(id)) {
      await vehiclesAPI.removeFavorite(id);
      setIds((list) => list.filter((item) => item !== id));
    } else {
      await vehiclesAPI.addFavorite(id);
      setIds((list) => [...list, id]);
    }
  }, [ids, isAuthenticated, navigate, location]);

  return { ids, toggle, enabled: enabled || !isAuthenticated };
}
