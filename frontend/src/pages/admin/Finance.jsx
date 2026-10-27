import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, CreditCard, DollarSign, Download, TrendingUp } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { financeAPI, payoutsAPI } from '../../services/api';
import { formatNumber, formatDate,  uiText } from '../../i18n';

const SORT_OPTIONS = [
  { value: 'created_at', label: uiText("pages.admin.Finance", "Date de création") },
  { value: 'paid_at', label: uiText("pages.admin.Finance", "Date de paiement") },
  { value: 'amount', label: uiText("pages.admin.Finance", "Montant") },
  { value: 'commission', label: uiText("pages.admin.Finance", "Commission") },
  { value: 'status', label: uiText("pages.admin.Finance", "Statut") },
  { value: 'method', label: uiText("pages.admin.Finance", "Méthode") },
];
const METHODS = [
  ['mtn', 'MTN Money'], ['orange', 'Orange Money'], ['paypal', 'PayPal'],
  ['stripe', 'Carte bancaire'], ['wallet', 'Portefeuille'],
];
const METHOD_COLORS = { mtn: '#EAB308', orange: '#F97316', paypal: '#3B82F6', stripe: '#8B5CF6', wallet: '#0D9488' };
const STATUS_LABELS = {
  pending: uiText("pages.admin.Finance", "En attente"),
  completed: uiText("pages.admin.Finance", "Confirmé"),
  failed: uiText("pages.admin.Finance", "Échoué"),
  refunded: uiText("pages.admin.Finance", "Remboursé"),
};
const amount = value => formatNumber(Number(value || 0));

export default function Finance() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [payoutCount, setPayoutCount] = useState(0);
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatus, setPayoutStatus] = useState('');
  const [payoutSortField, setPayoutSortField] = useState('created_at');
  const [payoutSortOrder, setPayoutSortOrder] = useState('desc');

  const filters = useMemo(() => ({
    page, page_size: 20, search: search.trim(), status: status || undefined,
    method: method || undefined, ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
  }), [page, search, status, method, sortOrder, sortField]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, transactionResponse] = await Promise.all([
        financeAPI.stats(), financeAPI.transactions(filters),
      ]);
      setStats(statsResponse.data);
      setTransactions(transactionResponse.data.results || []);
      setCount(transactionResponse.data.count ?? 0);
      setError('');
    } catch (_) {
      setError(uiText("pages.admin.Finance", "Impossible de charger les données financières."));
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const loadPayouts = useCallback(async () => {
    try {
      const { data } = await payoutsAPI.list({
        page: payoutPage, page_size: 20, search: payoutSearch.trim(),
        status: payoutStatus || undefined,
        ordering: `${payoutSortOrder === 'desc' ? '-' : ''}${payoutSortField}`,
      });
      setPayouts(data.results || []);
      setPayoutCount(data.count ?? 0);
    } catch (_) {
      setError(uiText("pages.admin.Finance", "Impossible de charger les versements propriétaires."));
    }
  }, [payoutPage, payoutSearch, payoutStatus, payoutSortOrder, payoutSortField]);
  useEffect(() => { loadPayouts(); }, [loadPayouts]);

  const exportCsv = async () => {
    try {
      const { data } = await financeAPI.exportTransactions({
        search: search.trim(), status: status || undefined, method: method || undefined,
        ordering: `${sortOrder === 'desc' ? '-' : ''}${sortField}`,
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (_) {
      setError(uiText("pages.admin.Finance", "L’export des transactions a échoué."));
    }
  };

  const methods = (stats?.payment_methods || []).map(item => ({
    ...item,
    name: METHODS.find(([key]) => key === item.method)?.[1] || item.method,
    value: Number(item.amount),
  }));
  const series = (stats?.monthly_series || []).map(item => ({
    ...item, revenue: Number(item.revenue), commission: Number(item.commission),
    driver_earnings: Number(item.driver_earnings), platform_net: Number(item.platform_net),
    owner_payouts: Number(item.owner_payouts),
    label: formatDate(new Date(`${item.month}-01T00:00:00`), { month: 'short', year: '2-digit' }),
  }));

  return (
    <DashboardLayout title={uiText("pages.admin.Finance", "Finance & commissions")}>
      <div className="mx-auto max-w-7xl space-y-6">
        {error && <p role="alert" className="rounded-xl bg-error-container/50 p-3 text-sm text-error">{error}</p>}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
          {[
            { label: uiText("pages.admin.Finance", "Chiffre d’affaires du mois"), value: stats?.revenue, icon: TrendingUp, style: 'bg-secondary-fixed/50 text-secondary' },
            { label: uiText("pages.admin.Finance", "Commission brute AutoLink"), value: stats?.commission, icon: DollarSign, style: 'bg-primary-fixed/30 text-primary' },
            { label: uiText("pages.admin.Finance", "Gains des chauffeurs"), value: stats?.driver_earnings, icon: CreditCard, style: 'bg-tertiary-fixed/50 text-tertiary' },
            { label: uiText("pages.admin.Finance", "Net plateforme"), value: stats?.platform_net, icon: TrendingUp, style: 'bg-primary-fixed/30 text-primary' },
            { label: uiText("pages.admin.Finance", "Versements propriétaires"), value: stats?.owner_payouts, icon: CreditCard, style: 'bg-secondary-fixed/50 text-secondary' },
            { label: uiText("pages.admin.Finance", "Transactions du mois"), value: stats?.transaction_count, icon: Calendar, style: 'bg-tertiary-fixed/50 text-tertiary', currency: false },
          ].map(({ label, value, icon: Icon, style, currency = true }) => (
            <div key={label} className="card">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${style}`}><Icon size={20} /></div>
              <div className="text-xl font-black text-on-surface dark:text-white">{value === undefined ? uiText("pages.admin.Finance", "—") : `${currency ? `${amount(value)} FCFA` : amount(value)}`}</div>
              <div className="mt-1 text-sm text-on-surface-variant">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card lg:col-span-2">
            <h2 className="mb-4 font-bold">{uiText("pages.admin.Finance", "Revenus et versements — 12 mois")}</h2>
            {series.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={series}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={value => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={value => `${amount(value)} FCFA`} />
                  <Bar dataKey="revenue" name="Chiffre d’affaires" fill="#0d9488" />
                  <Bar dataKey="commission" name="Commission brute" fill="#f97316" />
                  <Bar dataKey="driver_earnings" name="Gains chauffeurs" fill="#eab308" />
                  <Bar dataKey="platform_net" name="Net plateforme" fill="#14b8a6" />
                  <Bar dataKey="owner_payouts" name="Versements" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-20 text-center text-on-surface-variant">{uiText("pages.admin.Finance", "Aucune donnée financière disponible.")}</p>}
          </section>
          <section className="card">
            <h2 className="mb-4 font-bold">{uiText("pages.admin.Finance", "Moyens de paiement")}</h2>
            {methods.length ? (
              <>
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart><Pie data={methods} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                    {methods.map(item => <Cell key={item.method} fill={METHOD_COLORS[item.method] || uiText("pages.admin.Finance", "#64748b")} />)}
                  </Pie><Tooltip formatter={value => `${amount(value)} FCFA`} /></PieChart>
                </ResponsiveContainer>
                <ul className="space-y-2 text-sm">{methods.map(item => (
                  <li key={item.method} className="flex justify-between">
                    <span>{item.name}{" " + uiText("pages.admin.Finance", "·") + " "}{item.transactions}{" " + uiText("pages.admin.Finance", "transaction(s)")}</span><strong>{amount(item.amount)}{" " + uiText("pages.admin.Finance", "F")}</strong>
                  </li>
                ))}</ul>
              </>
            ) : <p className="py-16 text-center text-on-surface-variant">{uiText("pages.admin.Finance", "Aucun paiement ce mois.")}</p>}
          </section>
        </div>

        <section className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-bold">{uiText("pages.admin.Finance", "Transactions")}</h2><p className="text-sm text-on-surface-variant">{count}{" " + uiText("pages.admin.Finance", "transaction(s)")}</p></div>
            <button onClick={exportCsv} className="btn-outline flex items-center gap-2"><Download size={16} />{" " + uiText("pages.admin.Finance", "Exporter CSV")}</button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ListToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }}
              sortField={sortField} onSortFieldChange={value => { setSortField(value); setPage(1); }}
              sortOrder={sortOrder} onSortOrderChange={value => { setSortOrder(value); setPage(1); }}
              sortOptions={SORT_OPTIONS} placeholder={uiText("pages.admin.Finance", "Rechercher client, référence, véhicule")} />
            <select className="input-field w-auto" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
              <option value="">{uiText("pages.admin.Finance", "Tous les statuts")}</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="input-field w-auto" value={method} onChange={event => { setMethod(event.target.value); setPage(1); }}>
              <option value="">{uiText("pages.admin.Finance", "Toutes les méthodes")}</option>
              {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-surface-container-low dark:bg-slate-900 text-left text-xs uppercase text-on-surface-variant">
                <tr>{["Référence", "Client", "Véhicule", "Montant", "Commission", "Part propriétaire", "Méthode", "Date", "Statut"].map(label => <th key={label} className="px-3 py-3">{uiText("pages.admin.Finance", label)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-3 py-3 font-mono text-xs">{transaction.reference}</td>
                    <td className="px-3 py-3">{transaction.client_name}<div className="text-xs text-on-surface-variant">{transaction.client_email}</div></td>
                    <td className="px-3 py-3">{transaction.vehicle}</td>
                    <td className="px-3 py-3 font-semibold">{amount(transaction.amount)} FCFA</td>
                    <td className="px-3 py-3">{amount(transaction.commission)} FCFA</td>
                    <td className="px-3 py-3">{amount(transaction.owner_payout)}{" " + uiText("pages.admin.Finance", "F")}</td>
                    <td className="px-3 py-3">{METHODS.find(([key]) => key === transaction.method)?.[1] || transaction.method}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{formatDate(new Date(transaction.paid_at || transaction.created_at))}</td>
                    <td className="px-3 py-3">{STATUS_LABELS[transaction.status] || transaction.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && transactions.length === 0 && <p className="py-10 text-center text-on-surface-variant">{uiText("pages.admin.Finance", "Aucune transaction trouvée.")}</p>}
            {loading && <p className="py-8 text-center text-on-surface-variant">{uiText("pages.admin.Finance", "Chargement…")}</p>}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span>{uiText("pages.admin.Finance", "Page") + " "}{page}{" " + uiText("pages.admin.Finance", "/") + " "}{Math.max(1, Math.ceil(count / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>{uiText("pages.admin.Finance", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={page * 20 >= count} onClick={() => setPage(value => value + 1)}>{uiText("pages.admin.Finance", "Suivant")}</button>
            </div>
          </div>
        </section>

        <section className="card space-y-4">
          <div><h2 className="font-bold">{uiText("pages.admin.Finance", "Versements propriétaires")}</h2><p className="text-sm text-on-surface-variant">{payoutCount}{" " + uiText("pages.admin.Finance", "versement(s)")}</p></div>
          <div className="flex flex-wrap items-center gap-3">
            <ListToolbar search={payoutSearch} onSearchChange={value => { setPayoutSearch(value); setPayoutPage(1); }}
              sortField={payoutSortField} onSortFieldChange={value => { setPayoutSortField(value); setPayoutPage(1); }}
              sortOrder={payoutSortOrder} onSortOrderChange={value => { setPayoutSortOrder(value); setPayoutPage(1); }}
              sortOptions={[
                { value: 'created_at', label: uiText("pages.admin.Finance", "Date de création") },
                { value: 'processed_at', label: uiText("pages.admin.Finance", "Date de traitement") },
                { value: 'amount', label: uiText("pages.admin.Finance", "Montant") }, { value: 'status', label: uiText("pages.admin.Finance", "Statut") },
              ]} placeholder={uiText("pages.admin.Finance", "Rechercher bénéficiaire ou référence")} />
            <select className="input-field w-auto" value={payoutStatus} onChange={event => { setPayoutStatus(event.target.value); setPayoutPage(1); }}>
              <option value="">{uiText("pages.admin.Finance", "Tous les statuts")}</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-surface-container-low dark:bg-slate-900 text-left text-xs uppercase text-on-surface-variant">
                <tr>{['Référence', 'Bénéficiaire', 'Montant', 'Méthode', 'Statut', 'Date'].map(label => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {payouts.map(payout => (
                  <tr key={payout.id}>
                    <td className="px-3 py-3">{payout.transaction_ref || `VERSEMENT-${payout.id}`}</td>
                    <td className="px-3 py-3">{payout.recipient_name}<div className="text-xs text-on-surface-variant">{payout.recipient_email}</div></td>
                    <td className="px-3 py-3 font-semibold">{amount(payout.amount)}{" " + uiText("pages.admin.Finance", "F")}</td>
                    <td className="px-3 py-3">{METHODS.find(([key]) => key === payout.method)?.[1] || payout.method}</td>
                    <td className="px-3 py-3">{STATUS_LABELS[payout.status] || payout.status}</td>
                    <td className="px-3 py-3">{formatDate(new Date(payout.processed_at || payout.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && <p className="py-8 text-center text-on-surface-variant">{uiText("pages.admin.Finance", "Aucun versement trouvé.")}</p>}
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span>{uiText("pages.admin.Finance", "Page") + " "}{payoutPage}{" " + uiText("pages.admin.Finance", "/") + " "}{Math.max(1, Math.ceil(payoutCount / 20))}</span>
            <div className="flex gap-2">
              <button className="btn-outline px-3 py-1" disabled={payoutPage <= 1} onClick={() => setPayoutPage(value => value - 1)}>{uiText("pages.admin.Finance", "Précédent")}</button>
              <button className="btn-outline px-3 py-1" disabled={payoutPage * 20 >= payoutCount} onClick={() => setPayoutPage(value => value + 1)}>{uiText("pages.admin.Finance", "Suivant")}</button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
