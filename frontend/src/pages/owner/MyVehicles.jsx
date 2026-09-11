import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Eye, AlertTriangle, CheckCircle, Calendar, Shield } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const VEHICLES = [
  { id: 1, name: 'Toyota Corolla 2022', emoji: '🚗', category: 'Berline', mode: 'platform', status: 'available', dailyRate: 25000, totalEarned: 875000, bookings: 35, lastInspection: '2025-08-10', nextInspection: '2025-09-10', insurance: '2026-03-15', conditionScore: 92, year: 2022, plate: 'AB 1234 CI', fuel: 'Essence', seats: 5 },
  { id: 2, name: 'Hyundai Tucson 2023', emoji: '🚙', category: 'SUV', mode: 'home', status: 'rented', dailyRate: 45000, totalEarned: 1350000, bookings: 30, lastInspection: '2025-08-05', nextInspection: '2025-09-05', insurance: '2026-01-20', conditionScore: 88, year: 2023, plate: 'CD 5678 CI', fuel: 'Essence', seats: 5 },
];

const MODE_INFO = {
  platform: { label: 'Confié à AutoLink', desc: 'Le véhicule est géré par AutoLink. Disponible 24h/24.', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  home: { label: 'Chez moi (à demande)', desc: 'Le véhicule reste chez vous. Vous le mettez à disposition sur demande.', color: 'bg-purple-50 border-purple-200 text-purple-800' },
};

export default function MyVehicles() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <DashboardLayout title="Mes véhicules">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-500">{VEHICLES.length} véhicule(s) enregistré(s)</p>
          <button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <PlusCircle size={16} /> Ajouter un véhicule
          </button>
        </div>

        <div className="space-y-6">
          {VEHICLES.map(v => (
            <div key={v.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  <div className="text-5xl">{v.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{v.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="badge-primary">{v.category}</span>
                          <span className={v.status === 'available' ? 'badge-success' : 'badge-info'}>
                            {v.status === 'available' ? '✅ Disponible' : '🔄 En location'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"><Eye size={16} /></button>
                        <button className="p-2 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors"><Edit size={16} /></button>
                        <button className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode badge */}
                <div className={`inline-flex items-start gap-2 border rounded-xl p-3 mb-4 text-sm ${MODE_INFO[v.mode].color}`}>
                  <span className="font-semibold">{MODE_INFO[v.mode].label}</span>
                  <span className="text-xs opacity-75">— {MODE_INFO[v.mode].desc}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center text-xs mb-4">
                  {[
                    { label: 'Immatriculation', value: v.plate },
                    { label: 'Année', value: v.year },
                    { label: 'Carburant', value: v.fuel },
                    { label: 'Places', value: v.seats },
                    { label: 'Tarif/jour', value: `${v.dailyRate.toLocaleString()} F` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                      <div className="font-bold text-slate-900">{value}</div>
                      <div className="text-slate-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="text-2xl font-black text-emerald-700">{Math.round(v.totalEarned * 0.75).toLocaleString()} F</div>
                    <div className="text-emerald-600 text-xs mt-1">Mes revenus nets (75%)</div>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="text-2xl font-black text-primary-700">{v.bookings}</div>
                    <div className="text-primary-600 text-xs mt-1">Locations totales</div>
                  </div>
                  <div className={`rounded-xl p-4 ${v.conditionScore >= 85 ? 'bg-green-50' : v.conditionScore >= 70 ? 'bg-amber-50' : 'bg-red-50'}`}>
                    <div className={`text-2xl font-black ${v.conditionScore >= 85 ? 'text-green-700' : v.conditionScore >= 70 ? 'text-amber-700' : 'text-red-700'}`}>{v.conditionScore}/100</div>
                    <div className="text-slate-500 text-xs mt-1">Score d'état</div>
                  </div>
                </div>
              </div>

              {/* Inspection & Insurance */}
              <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-primary-600" />
                  <span className="text-slate-600">Dernière inspection : <strong>{v.lastInspection}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-slate-500" />
                  <span className="text-slate-600">Prochaine inspection : <strong>{v.nextInspection}</strong></span>
                </div>
                <div className={`flex items-center gap-2 ${new Date(v.insurance) < new Date(Date.now() + 90 * 86400000) ? 'text-amber-600' : 'text-slate-600'}`}>
                  <Shield size={15} />
                  <span>Assurance expire : <strong>{v.insurance}</strong></span>
                  {new Date(v.insurance) < new Date(Date.now() + 90 * 86400000) && <AlertTriangle size={14} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
