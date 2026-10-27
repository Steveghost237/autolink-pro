import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Clock, AlertTriangle, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { controllerVehiclesAPI, inspectionsAPI } from '../../services/api';
import { formatNumber,  uiText } from '../../i18n';

export default function ControllerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleSort, setVehicleSort] = useState('created_at');
  const [vehicleOrder, setVehicleOrder] = useState('desc');

  const load = useCallback(async () => {
    try {
      const [dashboard, entry, exit] = await Promise.all([
        inspectionsAPI.dashboard(),
        inspectionsAPI.queue({ type: 'entry', page_size: 5, ordering: 'start_date' }),
        inspectionsAPI.queue({ type: 'exit', page_size: 5, ordering: 'start_date' }),
      ]);
      setStats(dashboard.data);
      setTasks([
        ...(entry.data.results || []).map(item => ({ ...item, type: 'Entrée' })),
        ...(exit.data.results || []).map(item => ({ ...item, type: 'Sortie' })),
      ]);
      setError('');
    } catch (_) {
      setError(uiText("pages.controller.ControllerDashboard", "Impossible de charger le tableau de bord."));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const loadVehicles = useCallback(async () => {
    try {
      const { data } = await controllerVehiclesAPI.list({
        page: vehiclePage, page_size: 20, search: vehicleSearch.trim(),
        ordering: `${vehicleOrder === 'desc' ? '-' : ''}${vehicleSort}`,
      });
      setVehicles(data.results || []);
      setVehicleCount(data.count || 0);
    } catch (_) {
      setError(uiText("pages.controller.ControllerDashboard", "Impossible de charger les véhicules à valider."));
    }
  }, [vehiclePage, vehicleSearch, vehicleSort, vehicleOrder]);
  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const decideVehicle = async (vehicle, status) => {
    const approved = status === 'approved';
    if (!(await confirm({
      title: approved ? uiText("pages.controller.ControllerDashboard", "Approuver le véhicule ?") : uiText("pages.controller.ControllerDashboard", "Mettre le véhicule en suspension ?"),
      message: `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`,
      confirmLabel: approved ? uiText("pages.controller.ControllerDashboard", "Approuver") : uiText("pages.controller.ControllerDashboard", "Mettre en suspension"),
      danger: !approved,
    }))) return;
    try {
      await controllerVehiclesAPI.decide(vehicle.id, status);
      await loadVehicles();
    } catch (_) {
      setError(uiText("pages.controller.ControllerDashboard", "Impossible de mettre à jour le statut du véhicule."));
    }
  };

  const cards = [
    { label: uiText("pages.controller.ControllerDashboard", "Fiches d’entrée à traiter"), value: stats?.entry_pending ?? '—', icon: ClipboardList },
    { label: uiText("pages.controller.ControllerDashboard", "Fiches de sortie à traiter"), value: stats?.exit_pending ?? '—', icon: Clock },
    { label: uiText("pages.controller.ControllerDashboard", "Inspections cette semaine"), value: stats?.completed_week ?? '—', icon: Car },
    { label: uiText("pages.controller.ControllerDashboard", "Problèmes signalés cette semaine"), value: stats?.issues_week ?? '—', icon: AlertTriangle },
  ];

  return (
    <DashboardLayout title={uiText("pages.controller.ControllerDashboard", "Tableau de bord contrôleur")}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl bg-gradient-to-br from-slate-900 to-primary-900 p-6 text-white">
          <h2 className="mb-1 text-2xl font-bold">{uiText("pages.controller.ControllerDashboard", "Bonjour,") + " "}{user?.firstName || user?.email}</h2>
          <p className="mb-5 text-primary-200">{uiText("pages.controller.ControllerDashboard", "Activité réelle des inspections de la plateforme.")}</p>
          <button onClick={() => navigate('/admin/inspections')} className="rounded-xl bg-white px-5 py-2.5 font-semibold text-primary-700">
            <ClipboardList size={18} className="mr-2 inline" />{" " + uiText("pages.controller.ControllerDashboard", "Voir les inspections") + " "}</button>
        </header>
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, icon: Icon }) => (
            <div className="card" key={label}>
              <Icon size={20} className="mb-3 text-primary-600" />
              <div className="text-xl font-bold">{value}</div>
              <div className="text-sm text-on-surface-variant">{label}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">{uiText("pages.controller.ControllerDashboard", "Réservations à inspecter")}</h3>
            <span className="text-sm text-on-surface-variant">{uiText("pages.controller.ControllerDashboard", "Score moyen récent :") + " "}{stats ? `${Number(stats.average_score_week).toFixed(0)}/100` : uiText("pages.controller.ControllerDashboard", "—")}</span>
          </div>
          <div className="space-y-3">
            {tasks.map(task => (
              <article key={`${task.type}-${task.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{task.type}{" " + uiText("pages.controller.ControllerDashboard", "·") + " "}{task.vehicle}{" " + uiText("pages.controller.ControllerDashboard", "(")}{task.plate}{uiText("pages.controller.ControllerDashboard", ")")}</p>
                  <p className="text-sm text-on-surface-variant">{task.client}{" " + uiText("pages.controller.ControllerDashboard", "·") + " "}{task.booking_reference}{" " + uiText("pages.controller.ControllerDashboard", "·") + " "}{task.start_date}{" " + uiText("pages.controller.ControllerDashboard", "—") + " "}{task.end_date}</p>
                </div>
                <button className="btn-outline" onClick={() => navigate('/admin/inspections')}>{uiText("pages.controller.ControllerDashboard", "Ouvrir la file")}</button>
              </article>
            ))}
            {tasks.length === 0 && <p className="py-8 text-center text-on-surface-variant">{uiText("pages.controller.ControllerDashboard", "Aucune inspection en attente.")}</p>}
          </div>
        </div>
        <section className="space-y-4">
          <h3 className="text-lg font-bold">{uiText("pages.controller.ControllerDashboard", "Véhicules à valider ·") + " "}{vehicleCount}</h3>
          <div className="card">
            <ListToolbar search={vehicleSearch} onSearchChange={value => { setVehicleSearch(value); setVehiclePage(1); }}
              sortField={vehicleSort} onSortFieldChange={setVehicleSort}
              sortOrder={vehicleOrder} onSortOrderChange={setVehicleOrder}
              sortOptions={[
                { value: 'created_at', label: uiText("pages.controller.ControllerDashboard", "Date de demande") },
                { value: 'brand', label: uiText("pages.controller.ControllerDashboard", "Marque") },
                { value: 'year', label: uiText("pages.controller.ControllerDashboard", "Année") },
                { value: 'daily_rate', label: uiText("pages.controller.ControllerDashboard", "Tarif journalier") },
              ]} placeholder={uiText("pages.controller.ControllerDashboard", "Rechercher véhicule ou propriétaire")} />
          </div>
          {vehicles.map(vehicle => (
            <article key={vehicle.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{vehicle.brand} {vehicle.model}{" " + uiText("pages.controller.ControllerDashboard", "(")}{vehicle.plate}{uiText("pages.controller.ControllerDashboard", ")")}</p><p className="text-sm text-on-surface-variant">{vehicle.owner_name}{" " + uiText("pages.controller.ControllerDashboard", "·") + " "}{vehicle.year}{" " + uiText("pages.controller.ControllerDashboard", "·") + " "}{formatNumber(Number(vehicle.daily_rate))}{" " + uiText("pages.controller.ControllerDashboard", "FCFA/jour")}</p></div>
              <div className="flex gap-2"><button className="btn-primary" onClick={() => decideVehicle(vehicle, 'approved')}>{uiText("pages.controller.ControllerDashboard", "Approuver")}</button><button className="btn-outline text-error" onClick={() => decideVehicle(vehicle, 'suspended')}>{uiText("pages.controller.ControllerDashboard", "Mettre en suspension")}</button></div>
            </article>
          ))}
          {vehicles.length === 0 && <div className="card py-8 text-center text-on-surface-variant">{uiText("pages.controller.ControllerDashboard", "Aucun véhicule en attente de validation.")}</div>}
          <div className="flex items-center justify-between text-sm"><span>{uiText("pages.controller.ControllerDashboard", "Page") + " "}{vehiclePage}{" " + uiText("pages.controller.ControllerDashboard", "/") + " "}{Math.max(1, Math.ceil(vehicleCount / 20))}</span><div className="flex gap-2"><button className="btn-outline" disabled={vehiclePage <= 1} onClick={() => setVehiclePage(value => value - 1)}>{uiText("pages.controller.ControllerDashboard", "Précédent")}</button><button className="btn-outline" disabled={vehiclePage * 20 >= vehicleCount} onClick={() => setVehiclePage(value => value + 1)}>{uiText("pages.controller.ControllerDashboard", "Suivant")}</button></div></div>
        </section>
      </div>
    </DashboardLayout>
  );
}
