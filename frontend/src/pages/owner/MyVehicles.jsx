import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Car, AlertTriangle, CheckCircle, Calendar, Shield, Clock, Wrench, Ban, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { vehiclesAPI } from '../../services/api';

const TIER_LABEL = { basic: 'Économique', standard: 'Intermédiaire', premium: 'Premium', gold: 'Luxe', collection: 'Super Luxe' };
const TIER_CLS = {
  basic: 'bg-slate-100 text-slate-700',
  standard: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  gold: 'bg-amber-100 text-amber-700',
  collection: 'bg-rose-100 text-rose-700',
};
const STATUS = {
  pending: { label: 'En vérification AutoLink', cls: 'badge-warning', icon: Clock },
  approved: { label: 'Disponible', cls: 'badge-success', icon: CheckCircle },
  rented: { label: 'En location', cls: 'badge-info', icon: RefreshCw },
  maintenance: { label: 'Maintenance', cls: 'badge-warning', icon: Wrench },
  suspended: { label: 'Suspendu', cls: 'badge-error', icon: Ban },
};

export default function MyVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await vehiclesAPI.list({ mine: 1, page_size: 100 });
      setVehicles(data.results || data);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout title="Mes véhicules">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500">{vehicles.length} véhicule(s) enregistré(s)</p>
            {!online && <p className="text-xs text-red-500 mt-1">API injoignable — actualisez.</p>}
          </div>
          <button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <PlusCircle size={16} /> Ajouter un véhicule
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <strong>Rémunération :</strong> vous percevez 50% de chaque location. Votre part est bloquée
          en caution pendant la location puis versée automatiquement sur votre solde au retour du véhicule.
          Les véhicules doivent être validés par AutoLink avant d'apparaître au catalogue.
        </div>

        {vehicles.length === 0 && (
          <div className="card text-center py-16 text-slate-400">
            <Car size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-slate-500">Aucun véhicule enregistré</p>
            <p className="text-sm mt-1">Ajoutez votre premier véhicule pour commencer à gagner.</p>
          </div>
        )}

        <div className="space-y-6">
          {vehicles.map(v => {
            const st = STATUS[v.status] || STATUS.pending;
            const StIcon = st.icon;
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Car size={30} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{v.brand} {v.model} {v.year}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`badge ${TIER_CLS[v.tier] || TIER_CLS.basic}`}>{TIER_LABEL[v.tier] || v.category}</span>
                            <span className={st.cls}><StIcon size={12} className="inline mr-1" />{st.label}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-primary-600">{Number(v.daily_rate).toLocaleString()} F</div>
                          <div className="text-xs text-slate-400">/ jour</div>
                          {v.computed_rate && Number(v.computed_rate) !== Number(v.daily_rate) && (
                            <div className="text-xs text-slate-400 mt-0.5">indicatif {Number(v.computed_rate).toLocaleString()} F</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {v.status === 'pending' && (
                    <div className="inline-flex items-start gap-2 border rounded-xl p-3 mb-4 text-sm bg-amber-50 border-amber-200 text-amber-800">
                      <Clock size={15} className="mt-0.5 shrink-0" />
                      <span><strong>En attente de validation.</strong> Un contrôleur AutoLink inspectera votre véhicule avant sa mise en ligne.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-xs mb-4">
                    {[
                      { label: 'Immatriculation', value: v.plate },
                      { label: 'Ville', value: v.city || '—' },
                      { label: 'Caution client', value: `${Number(v.deposit_amount || 0).toLocaleString()} F` },
                      { label: 'Km inclus/j', value: `${v.km_included_per_day || '—'} km` },
                      { label: 'Km supp.', value: `${v.extra_km_rate || '—'} F/km` },
                      { label: 'Votre part/jour', value: `${Math.round(v.daily_rate * 0.5).toLocaleString()} F` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                        <div className="font-bold text-slate-900 truncate">{value}</div>
                        <div className="text-slate-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-2xl font-black text-emerald-700">{Math.round(v.total_earned || 0).toLocaleString()} F</div>
                      <div className="text-emerald-600 text-xs mt-1">Gains cumulés (50%)</div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="text-2xl font-black text-primary-700">{v.total_bookings || 0}</div>
                      <div className="text-primary-600 text-xs mt-1">Locations totales</div>
                    </div>
                    <div className={`rounded-xl p-4 ${(v.condition_score || 0) >= 85 ? 'bg-green-50' : (v.condition_score || 0) >= 70 ? 'bg-amber-50' : 'bg-red-50'}`}>
                      <div className={`text-2xl font-black ${(v.condition_score || 0) >= 85 ? 'text-green-700' : (v.condition_score || 0) >= 70 ? 'text-amber-700' : 'text-red-700'}`}>{v.condition_score || '—'}/100</div>
                      <div className="text-slate-500 text-xs mt-1">Score d'état</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-primary-600" />
                    <span className="text-slate-600">Dernière inspection : <strong>{v.last_inspection || '—'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-slate-500" />
                    <span className="text-slate-600">Contrôle technique : <strong>{v.technical_control_date || '—'}</strong></span>
                  </div>
                  <div className={`flex items-center gap-2 ${v.insurance_expiry && new Date(v.insurance_expiry) < new Date(Date.now() + 90 * 86400000) ? 'text-amber-600' : 'text-slate-600'}`}>
                    <Shield size={15} />
                    <span>Assurance expire : <strong>{v.insurance_expiry || '—'}</strong></span>
                    {v.insurance_expiry && new Date(v.insurance_expiry) < new Date(Date.now() + 90 * 86400000) && <AlertTriangle size={14} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
