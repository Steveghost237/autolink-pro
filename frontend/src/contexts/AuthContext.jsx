import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const MOCK_USERS = [
  { id: 1, email: 'client@autolink.com',     password: 'pass123', role: 'CLIENT',     firstName: 'Marie',   lastName: 'Mballa',   phone: '+237 6 75 12 34 56', verified: true, avatar: null, city: 'Douala' },
  { id: 2, email: 'owner@autolink.com',      password: 'pass123', role: 'OWNER',      firstName: 'Jean',    lastName: 'Kouassi',  phone: '+237 6 55 22 33 44', verified: true, avatar: null, city: 'Douala', vehicles: 2, totalEarned: 1856000 },
  { id: 3, email: 'driver@autolink.com',     password: 'pass123', role: 'DRIVER',     firstName: 'Armand',  lastName: 'Nkounga',  phone: '+237 6 99 88 77 00', verified: true, avatar: null, rating: 4.8, totalTrips: 312, acceptance: 96, onTime: 98 },
  { id: 4, email: 'admin@autolink.com',      password: 'pass123', role: 'ADMIN',      firstName: 'Admin',   lastName: 'AutoLink', phone: '+237 2 22 20 00 01', verified: true, avatar: null },
  { id: 5, email: 'controller@autolink.com', password: 'pass123', role: 'CONTROLLER', firstName: 'Paul',    lastName: 'Diallo',   phone: '+237 6 54 44 55 66', verified: true, avatar: null, inspections: 247 },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('autolink_user');
      const storedToken = localStorage.getItem('autolink_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (_) {}
    setIsLoading(false);
  }, []);

  const normalizeUser = (u) => ({
    ...u,
    firstName: u.firstName || u.first_name || '',
    lastName: u.lastName || u.last_name || '',
  });

  const login = async ({ email, password }) => {
    // 1) Tentative API réelle (backend Django)
    try {
      const { data } = await authAPI.login(email, password);
      const safeUser = normalizeUser(data.user);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      localStorage.setItem('autolink_access', data.access);
      localStorage.setItem('autolink_refresh', data.refresh);
      localStorage.setItem('autolink_token', data.access);
      setUser(safeUser);
      setIsAuthenticated(true);
      return { success: true, user: safeUser };
    } catch (err) {
      // Identifiants invalides confirmés par l'API → erreur directe
      if (err.response?.status === 400 || err.response?.status === 401) {
        return { success: false, error: 'Email ou mot de passe incorrect.' };
      }
      // API injoignable → repli sur les comptes démo locaux
    }

    // 2) Fallback démo hors-ligne
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'API injoignable — compte démo non trouvé.' };
    const { password: _, ...safeUser } = found;
    localStorage.setItem('autolink_user', JSON.stringify(safeUser));
    localStorage.setItem('autolink_token', 'al_tok_' + Date.now());
    setUser(safeUser);
    setIsAuthenticated(true);
    return { success: true, user: safeUser, offline: true };
  };

  const logout = () => {
    localStorage.removeItem('autolink_user');
    localStorage.removeItem('autolink_token');
    localStorage.removeItem('autolink_access');
    localStorage.removeItem('autolink_refresh');
    setUser(null);
    setIsAuthenticated(false);
  };

  const googleLogin = async (profile) => {
    // profile = { email, first_name, last_name, google_id }
    try {
      const { data } = await authAPI.google(profile);
      const safeUser = normalizeUser(data.user);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      localStorage.setItem('autolink_access', data.access);
      localStorage.setItem('autolink_refresh', data.refresh);
      localStorage.setItem('autolink_token', data.access);
      setUser(safeUser);
      setIsAuthenticated(true);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      return { success: false, error: 'Connexion Google impossible — API injoignable.' };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authAPI.register({
        username: userData.email.split('@')[0] + Date.now() % 1000,
        email: userData.email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        phone: userData.phone || '',
        role: 'CLIENT',
        password: userData.password,
        password2: userData.password,
      });
      const safeUser = normalizeUser(data.user);
      localStorage.setItem('autolink_user', JSON.stringify(safeUser));
      localStorage.setItem('autolink_access', data.access);
      localStorage.setItem('autolink_refresh', data.refresh);
      setUser(safeUser);
      setIsAuthenticated(true);
      return { success: true, user: safeUser };
    } catch (err) {
      if (err.response?.data) {
        const first = Object.values(err.response.data)[0];
        return { success: false, error: Array.isArray(first) ? first[0] : String(first) };
      }
      return { success: false, error: 'API injoignable — réessayez plus tard.' };
    }
  };

  const getDashboardPath = (role) => {
    const paths = {
      CLIENT: '/client/dashboard',
      OWNER: '/owner/dashboard',
      DRIVER: '/driver/dashboard',
      ADMIN: '/admin/dashboard',
      CONTROLLER: '/controller/dashboard',
    };
    return paths[role] || '/';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, register, googleLogin, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};
