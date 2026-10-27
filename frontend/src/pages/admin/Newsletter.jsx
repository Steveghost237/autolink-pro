import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Eye, Send, Edit2, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ListToolbar from '../../components/ListToolbar';
import { useConfirm } from '../../contexts/ConfirmContext';
import { newsletterAPI } from '../../services/api';
import { formatDateTime,  uiText } from '../../i18n';

const SORT_OPTIONS = [
  { value: 'sent_at', label: uiText("pages.admin.Newsletter", "Date d’envoi") },
  { value: 'subject', label: uiText("pages.admin.Newsletter", "Objet") },
  { value: 'recipients_count', label: uiText("pages.admin.Newsletter", "Destinataires") },
];

const escapeHtml = (value) => value.replace(/[&<>"]/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}[character]));

export default function Newsletter() {
  const confirm = useConfirm();
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [textBody, setTextBody] = useState('');
  const [preview, setPreview] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('sent_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCampaign, setEditingCampaign] = useState(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const ordering = `${sortOrder === 'desc' ? '-' : ''}${sortField}`;
      const { data } = await newsletterAPI.campaigns({
        search: search.trim(),
        ordering,
        page_size: 50,
      });
      setCampaigns(data.results || data);
      setError('');
    } catch (_) {
      setError(uiText("pages.admin.Newsletter", "Impossible de charger l’historique des campagnes."));
    } finally {
      setLoading(false);
    }
  }, [search, sortField, sortOrder]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const sendCampaign = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!subject.trim() || (!htmlBody.trim() && !textBody.trim())) {
      setError(uiText("pages.admin.Newsletter", "Renseignez un objet et au moins une version du message."));
      return;
    }

    const confirmed = await confirm({
      title: uiText("pages.admin.Newsletter", "Envoyer cette newsletter ?"),
      message: uiText("pages.admin.Newsletter", "Le message sera envoyé à tous les utilisateurs actifs ayant accepté de recevoir la newsletter."),
      confirmLabel: uiText("pages.admin.Newsletter", "Envoyer"),
    });
    if (!confirmed) return;

    setSending(true);
    try {
      const { data } = await newsletterAPI.send({
        subject: subject.trim(),
        html_body: htmlBody,
        text_body: textBody,
      });
      setSuccess(`Newsletter envoyée à ${data.recipients_count} destinataire(s).`);
      setSubject('');
      setHtmlBody('');
      setTextBody('');
      setPreview(false);
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || uiText("pages.admin.Newsletter", "Impossible d’envoyer la newsletter."));
    } finally {
      setSending(false);
    }
  };

  const previewDocument = htmlBody || `<pre style="font:14px/1.6 sans-serif;white-space:pre-wrap">${escapeHtml(textBody)}</pre>`;

  const editCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setSubject(campaign.subject);
    if (campaign.body.includes('<')) {
      setHtmlBody(campaign.body);
      setTextBody('');
    } else {
      setHtmlBody('');
      setTextBody(campaign.body);
    }
    setPreview(false);
  };

  const cancelEdit = () => {
    setEditingCampaign(null);
    setSubject('');
    setHtmlBody('');
    setTextBody('');
    setPreview(false);
  };

  const resendCampaign = async (campaign) => {
    const confirmed = await confirm({
      title: uiText("pages.admin.Newsletter", "Renvoyer cette campagne ?"),
      message: uiText("pages.admin.Newsletter", "Le message sera envoyé à nouveau à tous les utilisateurs actifs."),
      confirmLabel: uiText("pages.admin.Newsletter", "Renvoyer"),
    });
    if (!confirmed) return;

    setSending(true);
    try {
      await newsletterAPI.resend(campaign.id);
      setSuccess('Campagne renvoyée avec succès.');
      await loadCampaigns();
    } catch (err) {
      setError(err.response?.data?.detail || uiText("pages.admin.Newsletter", "Impossible de renvoyer."));
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout title={uiText("pages.admin.Newsletter", "Newsletter")}>
      <div className="mx-auto max-w-6xl space-y-6">
        <form onSubmit={sendCampaign} className="card space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{uiText("pages.admin.Newsletter", "Composer une campagne")}</h2>
            <p className="mt-1 text-sm text-slate-500">{uiText("pages.admin.Newsletter", "L’envoi est réservé aux utilisateurs actifs qui ont accepté la newsletter.") + " "}</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">{uiText("pages.admin.Newsletter", "Objet")}</span>
            <input
              value={subject}
              onChange={event => setSubject(event.target.value)}
              maxLength={200}
              required
              className="input-field"
              placeholder={uiText("pages.admin.Newsletter", "Actualités AutoLink Pro")}
            />
          </label>
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">{uiText("pages.admin.Newsletter", "Message HTML")}</span>
              <textarea
                value={htmlBody}
                onChange={event => setHtmlBody(event.target.value)}
                rows={12}
                className="input-field resize-y font-mono text-xs"
                placeholder={uiText("pages.admin.Newsletter", "<h1>Bonjour !</h1><p>Les nouveautés AutoLink…</p>")}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">{uiText("pages.admin.Newsletter", "Version texte")}</span>
              <textarea
                value={textBody}
                onChange={event => setTextBody(event.target.value)}
                rows={12}
                className="input-field resize-y"
                placeholder={uiText("pages.admin.Newsletter", "Bonjour ! Découvrez les nouveautés AutoLink…")}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPreview(value => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={16} /> {preview ? uiText("pages.admin.Newsletter", "Masquer l’aperçu") : uiText("pages.admin.Newsletter", "Aperçu")}
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary inline-flex items-center gap-2 py-2.5 disabled:opacity-60"
            >
              <Send size={16} /> {sending ? uiText("pages.admin.Newsletter", "Envoi…") : uiText("pages.admin.Newsletter", "Envoyer la newsletter")}
            </button>
          </div>
          {preview && (
            <iframe
              title={uiText("pages.admin.Newsletter", "Aperçu de la newsletter")}
              sandbox=""
              srcDoc={previewDocument}
              className="h-72 w-full rounded-xl border border-slate-200 bg-white"
            />
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && (
            <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle size={16} /> {success}
            </p>
          )}
        </form>

        <section className="card space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{uiText("pages.admin.Newsletter", "Campagnes envoyées")}</h2>
            <p className="mt-1 text-sm text-slate-500">{uiText("pages.admin.Newsletter", "Historique des envois et nombre de destinataires.")}</p>
          </div>
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            sortField={sortField}
            onSortFieldChange={setSortField}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            sortOptions={SORT_OPTIONS}
            placeholder={uiText("pages.admin.Newsletter", "Rechercher une campagne")}
          />
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">{uiText("pages.admin.Newsletter", "Chargement des campagnes…")}</p>
          ) : campaigns.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">{uiText("pages.admin.Newsletter", "Aucune campagne trouvée.")}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {campaigns.map(campaign => (
                <article key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{campaign.subject}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(new Date(campaign.sent_at))}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
                    {campaign.recipients_count}{" " + uiText("pages.admin.Newsletter", "destinataire(s)") + " "}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
