import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Car, ThumbsUp, Zap } from 'lucide-react';

/* CTA partenaire — « Votre voiture dort au garage ? » */
export default function PartnerCta() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl px-8 py-14 lg:px-16 grid lg:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-teal-600/20 rounded-full blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-teal-600/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Votre voiture dort au garage ?<br />
              <span className="text-teal-400">Faites-la travailler en toute sécurité.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-lg">
              Rejoignez AutoLink Pro en tant que partenaire : nous vérifions votre
              véhicule, trouvons les clients et sécurisons chaque paiement.
              Vous êtes payé après chaque course.
            </p>
            <ul className="space-y-2.5 mb-8">
              {['Revenus jusqu\'à 400 000 FCFA/mois', 'Véhicule assuré pendant les locations', 'Paiement sous 24h après chaque course'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-teal-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/register?role=owner')}
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-lg text-sm">
              Devenir partenaire <ArrowRight size={16} />
            </button>
          </div>
          <div className="relative hidden lg:flex flex-col gap-4">
            {[
              { icon: Car,      t: 'Véhicule inspecté en 50 points', s: 'Gratuit et sans engagement' },
              { icon: ThumbsUp, t: 'Clients vérifiés et notés',      s: 'Zéro mauvaise surprise' },
              { icon: Zap,      t: 'Mise en location en 48h',        s: 'Activation rapide du catalogue' },
            ].map((c, i) => (
              <div key={c.t}
                className={`bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 backdrop-blur ${i === 1 ? 'lg:ml-10' : ''}`}>
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <c.icon size={18} className="text-teal-400" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{c.t}</div>
                  <div className="text-slate-400 text-xs">{c.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
