import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Copy, Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { affiliatesAPI } from '../../services/api';
import { formatNumber, formatDateTime,  uiText } from '../../i18n';

const AGENT_SORT = [
  { value: 'created_at', label: uiText("pages.admin.AgentsManager", "Date de création") },
  { value: 'code', label: uiText("pages.admin.AgentsManager", "Code") },
  { value: 'name', label: uiText("pages.admin.AgentsManager", "Nom") },
  { value: 'city', label: uiText("pages.admin.AgentsManager", "Ville") },
  { value: 'commission_rate', label: uiText("pages.admin.AgentsManager", "Taux") },
  { value: 'is_active', label: uiText("pages.admin.AgentsManager", "Statut") },
];
const PAYOUT_SORT = [
  { value: 'paid_at', label: uiText("pages.admin.AgentsManager", "Date") },
  { value: 'amount', label: uiText("pages.admin.AgentsManager", "Montant") },
  { value: 'agent__code', label: uiText("pages.admin.AgentsManager", "Code agent") },
];

export default function AgentsManager() {
  const confirm = useConfirm();
  const [tab, setTab] = useState('agents');
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '', agent_type: 'Commercial', phone: '', city: 'Douala', rate: 5,
  });
  const [payoutAgent, setPayoutAgent] = useState(null);
  const [payoutNote, setPayoutNote] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    try {
      const params = {
        page, page_size: 20, search: search.trim(),
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      };
      const { data } = tab === 'agents'
        ? await affiliatesAPI.agents(params)
        : await affiliatesAPI.payouts(params);
      setRows(data.results || []);
      setCount(data.count || 0);
      setError('');
    } catch (_) {
      setError(tab === 'agents' ? uiText("pages.admin.AgentsManager", "Impossible de charger les agents.") : uiText("pages.admin.AgentsManager", "Impossible de charger les versements enregistrés."));
    }
  }, [page, search, sortField, sortOrder, tab]);
  useEffect(() => { load(); }, [load]);

  const switchTab = value => {
    setTab(value);
    setPage(1);
    setSearch('');
    setSortField(value === 'agents' ? 'created_at' : 'paid_at');
  };

  const createAgent = async event => {
    event.preventDefault();
    setError('');
    try {
      const { rate, ...fields } = newAgent;
      await affiliatesAPI.createAgent({ ...fields, commission_rate: (Number(rate) / 100).toFixed(4) });
      setShowCreate(false);
      setNewAgent({ name: '', agent_type: 'Commercial', phone: '', city: 'Douala', rate: 5 });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || uiText("pages.admin.AgentsManager", "Impossible de créer le code agent."));
    }
  };

  const toggleAgent = async agent => {
    const nextActive = !agent.is_active;
    if (!nextActive && !(await confirm({
      title: uiText("pages.admin.AgentsManager", "Désactiver cet agent ?"),
      message: `Le code ${agent.code} ne pourra plus être utilisé.`,
      confirmLabel: uiText("pages.admin.AgentsManager", "Désactiver"),
      danger: true,
    }))) return;
    try {
      await affiliatesAPI.updateAgent(agent.id, { is_active: nextActive });
      await load();
    } catch (_) { setError(uiText("pages.admin.AgentsManager", "Impossible de modifier le statut de cet agent.")); }
  };

  const submitPayout = async event => {
    event.preventDefault();
    if (!(await confirm({
      title: uiText("pages.admin.AgentsManager", "Marquer ce montant comme versé ?"),
      message: uiText("pages.admin.AgentsManager", "Cette action enregistre le versement dans le registre et ne déplace pas de fonds."),
      confirmLabel: uiText("pages.admin.AgentsManager", "Marquer comme versé"),
    }))) return;
    try {
      await affiliatesAPI.createPayout({
        agent: payoutAgent.id, amount: payoutAgent.commission_due, note: payoutNote,
      });
      setPayoutAgent(null);
      setPayoutNote('');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.amount?.[0] || uiText("pages.admin.AgentsManager", "Impossible d’enregistrer le versement."));
    }
  };

  const copyCode = async code => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(''), 1500);
  };

  const sortOptions = tab === 'agents' ? AGENT_SORT : PAYOUT_SORT;
  return (
    <DashboardLayout title={uiText("pages.admin.AgentsManager", "Agents affiliés")}>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className={tab === 'agents' ? uiText("pages.admin.AgentsManager", "btn-primary") : uiText("pages.admin.AgentsManager", "btn-outline")} onClick={() => switchTab('agents')}>{uiText("pages.admin.AgentsManager", "Agents")}</button>
          <button className={tab === 'payouts' ? uiText("pages.admin.AgentsManager", "btn-primary") : uiText("pages.admin.AgentsManager", "btn-outline")} onClick={() => switchTab('payouts')}>{uiText("pages.admin.AgentsManager", "Versements enregistrés")}</button>
          {tab === 'agents' && <button className="btn-outline flex items-center gap-2" onClick={() => setShowCreate(true)}><Plus size={16} />{" " + uiText("pages.admin.AgentsManager", "Créer un code agent")}</button>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <div className="card">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={sortOptions} placeholder={tab === 'agents' ? uiText("pages.admin.AgentsManager", "Rechercher un agent ou un code") : uiText("pages.admin.AgentsManager", "Rechercher un versement ou un agent")} />
        </div>

        {tab === 'agents' ? (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[900px]">
              <thead><tr>{["Code", "Agent", "Conversions", "CA généré", "Commission acquise", "Versé", "Dû", "Taux", "Statut", "Actions"].map(label => <th key={label} className="px-4 py-3 text-left text-xs uppercase text-on-surface-variant">{uiText("pages.admin.AgentsManager", label)}</th>)}</tr></thead>
              <tbody className="divide-y">
                {rows.map(agent => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3"><code>{agent.code}</code><button className="ml-2 text-primary-600" title={uiText("pages.admin.AgentsManager", "Copier le code")} onClick={() => copyCode(agent.code)}>{copied === agent.code ? <CheckCircle size={14} /> : <Copy size={14} />}</button></td>
                    <td className="px-4 py-3"><div className="font-semibold">{agent.name}</div><div className="text-xs text-on-surface-variant">{agent.city}{" " + uiText("pages.admin.AgentsManager", "·") + " "}{agent.agent_type}{" " + uiText("pages.admin.AgentsManager", "·") + " "}{agent.phone}</div></td>
                    <td className="px-4 py-3">{agent.conversions}</td>
                    <td className="px-4 py-3">{formatNumber(Number(agent.generated_revenue))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</td>
                    <td className="px-4 py-3">{formatNumber(Number(agent.commission_earned))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</td>
                    <td className="px-4 py-3">{formatNumber(Number(agent.payouts_total))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</td>
                    <td className="px-4 py-3 font-semibold">{formatNumber(Number(agent.commission_due))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</td>
                    <td className="px-4 py-3">{formatNumber(Number(agent.commission_rate) * 100)}{" " + uiText("pages.admin.AgentsManager", "%")}</td>
                    <td className="px-4 py-3">{agent.is_active ? uiText("pages.admin.AgentsManager", "Actif") : uiText("pages.admin.AgentsManager", "Désactivé")}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button title={agent.is_active ? uiText("pages.admin.AgentsManager", "Désactiver") : uiText("pages.admin.AgentsManager", "Activer")} onClick={() => toggleAgent(agent)}>{agent.is_active ? <ToggleRight className="text-primary" /> : <ToggleLeft />}</button>
                      <button disabled={!agent.is_active || Number(agent.commission_due) <= 0} className="btn-primary px-2 py-1 text-xs disabled:opacity-40" onClick={() => setPayoutAgent(agent)}>{uiText("pages.admin.AgentsManager", "Marquer comme versé")}</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-12 text-center text-on-surface-variant">{uiText("pages.admin.AgentsManager", "Aucun agent à afficher.")}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(payout => (
              <article key={payout.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-semibold">{payout.agent_name}{" " + uiText("pages.admin.AgentsManager", "·") + " "}{payout.agent_code}</h2><p className="text-sm text-on-surface-variant">{payout.note || uiText("pages.admin.AgentsManager", "Aucune note")}{" " + uiText("pages.admin.AgentsManager", "· Par") + " "}{payout.paid_by_name || uiText("pages.admin.AgentsManager", "Administrateur")}{" " + uiText("pages.admin.AgentsManager", "·") + " "}{formatDateTime(new Date(payout.paid_at))}</p></div>
                <strong>{formatNumber(Number(payout.amount))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</strong>
              </article>
            ))}
            {rows.length === 0 && <div className="card py-12 text-center text-on-surface-variant">{uiText("pages.admin.AgentsManager", "Aucun versement enregistré.")}</div>}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span>{uiText("pages.admin.AgentsManager", "Page") + " "}{page}{" " + uiText("pages.admin.AgentsManager", "/") + " "}{Math.max(1, Math.ceil(count / 20))}{" " + uiText("pages.admin.AgentsManager", "·") + " "}{count}{" " + uiText("pages.admin.AgentsManager", "résultat(s)")}</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.AgentsManager", "Précédent")}</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.AgentsManager", "Suivant")}</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={createAgent} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Tag size={18} />{" " + uiText("pages.admin.AgentsManager", "Nouveau code agent")}</h2>
            <label className="label">{uiText("pages.admin.AgentsManager", "Nom complet")}<input required className="input-field mt-1" value={newAgent.name} onChange={event => setNewAgent(current => ({ ...current, name: event.target.value }))} /></label>
            <label className="label">{uiText("pages.admin.AgentsManager", "Ville")}<input required className="input-field mt-1" value={newAgent.city} onChange={event => setNewAgent(current => ({ ...current, city: event.target.value }))} /></label>
            <label className="label">{uiText("pages.admin.AgentsManager", "Type")}<input className="input-field mt-1" value={newAgent.agent_type} onChange={event => setNewAgent(current => ({ ...current, agent_type: event.target.value }))} /></label>
            <label className="label">{uiText("pages.admin.AgentsManager", "Téléphone")}<input className="input-field mt-1" value={newAgent.phone} onChange={event => setNewAgent(current => ({ ...current, phone: event.target.value }))} /></label>
            <label className="label">{uiText("pages.admin.AgentsManager", "Taux de commission (%)")}<input required type="number" min="0" max="100" step="0.1" className="input-field mt-1" value={newAgent.rate} onChange={event => setNewAgent(current => ({ ...current, rate: event.target.value }))} /></label>
            <div className="flex gap-3"><button type="button" className="btn-outline flex-1" onClick={() => setShowCreate(false)}>{uiText("pages.admin.AgentsManager", "Annuler")}</button><button className="btn-primary flex-1">{uiText("pages.admin.AgentsManager", "Créer le code")}</button></div>
          </form>
        </div>
      )}
      {payoutAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={submitPayout} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">{uiText("pages.admin.AgentsManager", "Marquer comme versé")}</h2>
            <p className="text-sm text-on-surface-variant">{payoutAgent.name}{" " + uiText("pages.admin.AgentsManager", "· solde dû") + " "}{formatNumber(Number(payoutAgent.commission_due))}{" " + uiText("pages.admin.AgentsManager", "FCFA")}</p>
            <p className="rounded-lg bg-tertiary-fixed/50 p-3 text-sm text-tertiary">{uiText("pages.admin.AgentsManager", "Enregistrement comptable uniquement : aucun transfert de fonds n’est effectué.")}</p>
            <label className="label">{uiText("pages.admin.AgentsManager", "Note")}<input className="input-field mt-1" value={payoutNote} onChange={event => setPayoutNote(event.target.value)} /></label>
            <div className="flex gap-3"><button type="button" className="btn-outline flex-1" onClick={() => setPayoutAgent(null)}>{uiText("pages.admin.AgentsManager", "Annuler")}</button><button className="btn-primary flex-1">{uiText("pages.admin.AgentsManager", "Continuer")}</button></div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
