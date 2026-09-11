import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-8xl mb-6">🚗</div>
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-primary-200 mb-4">Page introuvable</h2>
        <p className="text-primary-300 mb-8 max-w-sm mx-auto">Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all">
            <ArrowLeft size={18} /> Retour
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg">
            <Home size={18} /> Accueil
          </button>
        </div>
      </div>
    </div>
  );
}
