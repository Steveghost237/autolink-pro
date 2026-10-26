import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Car, AlertTriangle, CheckCircle, Calendar, Shield, Clock, Wrench, Ban, RefreshCw, Eye, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { vehiclesAPI } from '../../services/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { formatNumber,  uiText } from '../../i18n';

const TIER_LABEL = {
  basic: uiText("pages.owner.MyVehicles", "Économique"),
  standard: uiText("pages.owner.MyVehicles", "Intermédiaire"),
  premium: uiText("pages.owner.MyVehicles", "Premium"),
  gold: uiText("pages.owner.MyVehicles", "Luxe"),
  collection: uiText("pages.owner.MyVehicles", "Super Luxe"),
};
const TIER_CLS = {
  basic: 'bg-slate-100 text-slate-700',
  standard: 'bg-blue-100 text-blue-700',
  premium: 'bg-purple-100 text-purple-700',
  gold: 'bg-amber-100 text-amber-700',
  collection: 'bg-rose-100 text-rose-700',
};
const STATUS = {
  pending: { label: uiText("pages.owner.MyVehicles", "En vérification AutoLink"), cls: 'badge-warning', icon: Clock },
  approved: { label: uiText("pages.owner.MyVehicles", "Disponible"), cls: 'badge-success', icon: CheckCircle },
  rented: { label: uiText("pages.owner.MyVehicles", "En location"), cls: 'badge-info', icon: RefreshCw },
  maintenance: { label: uiText("pages.owner.MyVehicles", "Maintenance"), cls: 'badge-warning', icon: Wrench },
  suspended: { label: uiText("pages.owner.MyVehicles", "Suspendu"), cls: 'badge-error', icon: Ban },
};

export default function MyVehicles() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [vehicles, setVehicles] = useState([]);
  const [online, setOnline] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const load = useCallback(async () => {
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortField}`;
      const { data } = await vehiclesAPI.list({
        mine: 1,
        page_size: 100,
        search: search.trim(),
        ordering,
      });
      setVehicles(data.results || data);
      setOnline(true);
    } catch (_) { setOnline(false); }
  }, [search, sortField, sortOrder]);

  useEffect(() => { load(); }, [load]);

  const remove = async (vehicle) => {
    if (!(await confirm({ title: uiText("pages.owner.MyVehicles", "Supprimer le véhicule"), message: `Supprimer ${vehicle.brand} ${vehicle.model} ?`, confirmLabel: uiText("pages.owner.MyVehicles", "Supprimer"), danger: true }))) return;
    try {
      await vehiclesAPI.delete(vehicle.id);
      load();
    } catch (error) {
      if (error.response?.status !== 400) return;
      const retire = await confirm({
        title: uiText("pages.owner.MyVehicles", "Véhicule avec réservations"),
        message: uiText("pages.owner.MyVehicles", "Ce véhicule possède des réservations et ne peut pas être supprimé. Le retirer du catalogue ?"),
        confirmLabel: uiText("pages.owner.MyVehicles", "Retirer du catalogue"),
        danger: true,
      });
      if (retire) {
        await vehiclesAPI.update(vehicle.id, { status: 'suspended' });
        load();
      }
    }
  };

  return (
    <DashboardLayout title={uiText("pages.owner.MyVehicles", "Mes véhicules")}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500">{vehicles.length}{" " + uiText("pages.owner.MyVehicles", "véhicule(s) enregistré(s)")}</p>
            {!online && <p className="text-xs text-red-500 mt-1">{uiText("pages.owner.MyVehicles", "API injoignable — actualisez.")}</p>}
          </div>
          <button onClick={() => navigate('/owner/add-vehicle')} className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm">
            <PlusCircle size={16} />{" " + uiText("pages.owner.MyVehicles", "Ajouter un véhicule") + " "}</button>
        </div>

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          sortOptions={[
            { value: 'created_at', label: uiText("pages.owner.MyVehicles", "Date d’ajout") },
            { value: 'year', label: uiText("pages.owner.MyVehicles", "Année") },
            { value: 'computed_rate', label: uiText("pages.owner.MyVehicles", "Tarif indicatif") },
            { value: 'rating', label: uiText("pages.owner.MyVehicles", "Note") },
          ]}
          placeholder={uiText("pages.owner.MyVehicles", "Rechercher un véhicule")}
        />

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <strong>{uiText("pages.owner.MyVehicles", "Rémunération :")}</strong>{" " + uiText("pages.owner.MyVehicles", "vous percevez 50% de chaque location. Votre part est bloquée en caution pendant la location puis versée automatiquement sur votre solde au retour du véhicule. Les véhicules doivent être validés par AutoLink avant d'apparaître au catalogue.") + " "}</div>

        {vehicles.length === 0 && (
          <div className="card text-center py-16 text-slate-400">
            <Car size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-semibold text-slate-500">{uiText("pages.owner.MyVehicles", "Aucun véhicule enregistré")}</p>
            <p className="text-sm mt-1">{uiText("pages.owner.MyVehicles", "Ajoutez votre premier véhicule pour commencer à gagner.")}</p>
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
                          <div className="text-xl font-black text-primary-600">{formatNumber(Number(v.daily_rate))}{" " + uiText("pages.owner.MyVehicles", "F")}</div>
                          <div className="text-xs text-slate-400">{uiText("pages.owner.MyVehicles", "/ jour")}</div>
                          {v.computed_rate && Number(v.computed_rate) !== Number(v.daily_rate) && (
                            <div className="text-xs text-slate-400 mt-0.5">{uiText("pages.owner.MyVehicles", "indicatif") + " "}{formatNumber(Number(v.computed_rate))}{" " + uiText("pages.owner.MyVehicles", "F")}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {v.status === 'pending' && (
                    <div className="inline-flex items-start gap-2 border rounded-xl p-3 mb-4 text-sm bg-amber-50 border-amber-200 text-amber-800">
                      <Clock size={15} className="mt-0.5 shrink-0" />
                      <span><strong>{uiText("pages.owner.MyVehicles", "En attente de validation.")}</strong>{" " + uiText("pages.owner.MyVehicles", "Un contrôleur AutoLink inspectera votre véhicule avant sa mise en ligne.")}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-xs mb-4">
                    {[
                      { label: uiText("pages.owner.MyVehicles", "Immatriculation"), value: v.plate },
                      { label: uiText("pages.owner.MyVehicles", "Ville"), value: v.city || '—' },
                      { label: uiText("pages.owner.MyVehicles", "Caution client"), value: `${formatNumber(Number(v.deposit_amount || 0))} FCFA` },
                      { label: uiText("pages.owner.MyVehicles", "Km inclus/j"), value: `${v.km_included_per_day || '—'} km` },
                      { label: uiText("pages.owner.MyVehicles", "Km supp."), value: `${v.extra_km_rate ? formatNumber(v.extra_km_rate) : '—'} FCFA/km` },
                      { label: uiText("pages.owner.MyVehicles", "Votre part/jour"), value: `${formatNumber(Math.round(v.daily_rate * 0.5))} FCFA` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                        <div className="font-bold text-slate-900 truncate">{value}</div>
                        <div className="text-slate-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-center text-sm">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-2xl font-black text-emerald-700">{formatNumber(Math.round(v.total_earned || 0))}{" " + uiText("pages.owner.MyVehicles", "F")}</div>
                      <div className="text-emerald-600 text-xs mt-1">{uiText("pages.owner.MyVehicles", "Gains cumulés (50%)")}</div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="text-2xl font-black text-primary-700">{v.total_bookings || 0}</div>
                      <div className="text-primary-600 text-xs mt-1">{uiText("pages.owner.MyVehicles", "Locations totales")}</div>
                    </div>
                    <div className={`rounded-xl p-4 ${(v.condition_score || 0) >= 85 ? 'bg-green-50' : (v.condition_score || 0) >= 70 ? 'bg-amber-50' : 'bg-red-50'}`}>
                      <div className={`text-2xl font-black ${(v.condition_score || 0) >= 85 ? 'text-green-700' : (v.condition_score || 0) >= 70 ? 'text-amber-700' : 'text-red-700'}`}>{v.condition_score || uiText("pages.owner.MyVehicles", "—")}{uiText("pages.owner.MyVehicles", "/100")}</div>
                      <div className="text-slate-500 text-xs mt-1">{uiText("pages.owner.MyVehicles", "Score d'état")}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-outline flex items-center gap-2" onClick={() => navigate(`/vehicles/${v.id}`)}><Eye size={15} />{" " + uiText("pages.owner.MyVehicles", "Voir le détail")}</button>
                    <button className="btn-outline flex items-center gap-2" onClick={() => navigate(`/owner/vehicles/${v.id}/edit`)}><Pencil size={15} />{" " + uiText("pages.owner.MyVehicles", "Modifier")}</button>
                    <button className="btn-outline flex items-center gap-2 text-red-600" onClick={() => remove(v)}><Trash2 size={15} />{" " + uiText("pages.owner.MyVehicles", "Supprimer")}</button>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-primary-600" />
                    <span className="text-slate-600">{uiText("pages.owner.MyVehicles", "Dernière inspection :") + " "}<strong>{v.last_inspection || uiText("pages.owner.MyVehicles", "—")}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-slate-500" />
                    <span className="text-slate-600">{uiText("pages.owner.MyVehicles", "Contrôle technique :") + " "}<strong>{v.technical_control_date || uiText("pages.owner.MyVehicles", "—")}</strong></span>
                  </div>
                  <div className={`flex items-center gap-2 ${v.insurance_expiry && new Date(v.insurance_expiry) < new Date(Date.now() + 90 * 86400000) ? 'text-amber-600' : 'text-slate-600'}`}>
                    <Shield size={15} />
                    <span>{uiText("pages.owner.MyVehicles", "Assurance expire :") + " "}<strong>{v.insurance_expiry || uiText("pages.owner.MyVehicles", "—")}</strong></span>
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
