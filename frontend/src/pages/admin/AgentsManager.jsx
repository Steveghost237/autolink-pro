import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Copy, Plus, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { affiliatesAPI } from '../../services/api';

const AGENT_SORT = [
  { value: 'created_at', label: 'Date de création' },
  { value: 'code', label: 'Code' },
  { value: 'name', label: 'Nom' },
  { value: 'city', label: 'Ville' },
  { value: 'commission_rate', label: 'Taux' },
  { value: 'is_active', label: 'Statut' },
];
const PAYOUT_SORT = [
  { value: 'paid_at', label: 'Date' },
  { value: 'amount', label: 'Montant' },
  { value: 'agent__code', label: 'Code agent' },
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
      setError(tab === 'agents' ? 'Impossible de charger les agents.' : 'Impossible de charger les versements enregistrés.');
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
      setError(requestError.response?.data?.detail || 'Impossible de créer le code agent.');
    }
  };

  const toggleAgent = async agent => {
    const nextActive = !agent.is_active;
    if (!nextActive && !(await confirm({
      title: 'Désactiver cet agent ?',
      message: `Le code ${agent.code} ne pourra plus être utilisé.`,
      confirmLabel: 'Désactiver',
      danger: true,
    }))) return;
    try {
      await affiliatesAPI.updateAgent(agent.id, { is_active: nextActive });
      await load();
    } catch (_) { setError('Impossible de modifier le statut de cet agent.'); }
  };

  const submitPayout = async event => {
    event.preventDefault();
    if (!(await confirm({
      title: 'Marquer ce montant comme versé ?',
      message: 'Cette action enregistre le versement dans le registre et ne déplace pas de fonds.',
      confirmLabel: 'Marquer comme versé',
    }))) return;
    try {
      await affiliatesAPI.createPayout({
        agent: payoutAgent.id, amount: payoutAgent.commission_due, note: payoutNote,
      });
      setPayoutAgent(null);
      setPayoutNote('');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.amount?.[0] || 'Impossible d’enregistrer le versement.');
    }
  };

  const copyCode = async code => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(''), 1500);
  };

  const sortOptions = tab === 'agents' ? AGENT_SORT : PAYOUT_SORT;
  return (
    <DashboardLayout title="Agents affiliés">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap gap-2">
          <button className={tab === 'agents' ? 'btn-primary' : 'btn-outline'} onClick={() => switchTab('agents')}>Agents</button>
          <button className={tab === 'payouts' ? 'btn-primary' : 'btn-outline'} onClick={() => switchTab('payouts')}>Versements enregistrés</button>
          {tab === 'agents' && <button className="btn-outline flex items-center gap-2" onClick={() => setShowCreate(true)}><Plus size={16} /> Créer un code agent</button>}
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="card">
          <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
            sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
            sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
            sortOptions={sortOptions} placeholder={tab === 'agents' ? 'Rechercher un agent ou un code' : 'Rechercher un versement ou un agent'} />
        </div>

        {tab === 'agents' ? (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[900px]">
              <thead><tr>{['Code', 'Agent', 'Conversions', 'CA généré', 'Commission acquise', 'Versé', 'Dû', 'Taux', 'Statut', 'Actions'].map(label => <th key={label} className="px-4 py-3 text-left text-xs uppercase text-slate-500">{label}</th>)}</tr></thead>
              <tbody className="divide-y">
                {rows.map(agent => (
                  <tr key={agent.id}>
                    <td className="px-4 py-3"><code>{agent.code}</code><button className="ml-2 text-primary-600" title="Copier le code" onClick={() => copyCode(agent.code)}>{copied === agent.code ? <CheckCircle size={14} /> : <Copy size={14} />}</button></td>
                    <td className="px-4 py-3"><div className="font-semibold">{agent.name}</div><div className="text-xs text-slate-500">{agent.city} · {agent.agent_type} · {agent.phone}</div></td>
                    <td className="px-4 py-3">{agent.conversions}</td>
                    <td className="px-4 py-3">{Number(agent.generated_revenue).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3">{Number(agent.commission_earned).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3">{Number(agent.payouts_total).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3 font-semibold">{Number(agent.commission_due).toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-3">{(Number(agent.commission_rate) * 100).toLocaleString('fr-FR')} %</td>
                    <td className="px-4 py-3">{agent.is_active ? 'Actif' : 'Désactivé'}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button title={agent.is_active ? 'Désactiver' : 'Activer'} onClick={() => toggleAgent(agent)}>{agent.is_active ? <ToggleRight className="text-emerald-600" /> : <ToggleLeft />}</button>
                      <button disabled={!agent.is_active || Number(agent.commission_due) <= 0} className="btn-primary px-2 py-1 text-xs disabled:opacity-40" onClick={() => setPayoutAgent(agent)}>Marquer comme versé</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <p className="py-12 text-center text-slate-500">Aucun agent à afficher.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map(payout => (
              <article key={payout.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-semibold">{payout.agent_name} · {payout.agent_code}</h2><p className="text-sm text-slate-500">{payout.note || 'Aucune note'} · Par {payout.paid_by_name || 'Administrateur'} · {new Date(payout.paid_at).toLocaleString('fr-FR')}</p></div>
                <strong>{Number(payout.amount).toLocaleString('fr-FR')} FCFA</strong>
              </article>
            ))}
            {rows.length === 0 && <div className="card py-12 text-center text-slate-500">Aucun versement enregistré.</div>}
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span>Page {page} / {Math.max(1, Math.ceil(count / 20))} · {count} résultat(s)</span>
          <div className="flex gap-2">
            <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button>
            <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>Suivant</button>
          </div>
        </div>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={createAgent} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Tag size={18} /> Nouveau code agent</h2>
            <label className="label">Nom complet<input required className="input-field mt-1" value={newAgent.name} onChange={event => setNewAgent(current => ({ ...current, name: event.target.value }))} /></label>
            <label className="label">Ville<input required className="input-field mt-1" value={newAgent.city} onChange={event => setNewAgent(current => ({ ...current, city: event.target.value }))} /></label>
            <label className="label">Type<input className="input-field mt-1" value={newAgent.agent_type} onChange={event => setNewAgent(current => ({ ...current, agent_type: event.target.value }))} /></label>
            <label className="label">Téléphone<input className="input-field mt-1" value={newAgent.phone} onChange={event => setNewAgent(current => ({ ...current, phone: event.target.value }))} /></label>
            <label className="label">Taux de commission (%)<input required type="number" min="0" max="100" step="0.1" className="input-field mt-1" value={newAgent.rate} onChange={event => setNewAgent(current => ({ ...current, rate: event.target.value }))} /></label>
            <div className="flex gap-3"><button type="button" className="btn-outline flex-1" onClick={() => setShowCreate(false)}>Annuler</button><button className="btn-primary flex-1">Créer le code</button></div>
          </form>
        </div>
      )}
      {payoutAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={submitPayout} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">Marquer comme versé</h2>
            <p className="text-sm text-slate-600">{payoutAgent.name} · solde dû {Number(payoutAgent.commission_due).toLocaleString('fr-FR')} FCFA</p>
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Enregistrement comptable uniquement : aucun transfert de fonds n’est effectué.</p>
            <label className="label">Note<input className="input-field mt-1" value={payoutNote} onChange={event => setPayoutNote(event.target.value)} /></label>
            <div className="flex gap-3"><button type="button" className="btn-outline flex-1" onClick={() => setPayoutAgent(null)}>Annuler</button><button className="btn-primary flex-1">Continuer</button></div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
