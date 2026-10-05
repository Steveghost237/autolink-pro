import React, { useState, useEffect } from 'react';
import { Settings2, Save, Percent, UserCheck, LifeBuoy } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { settingsAPI } from '../../services/api';

export default function PlatformSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settingsAPI.get()
      .then(({ data }) => setForm({
        commission_rate: (Number(data.commission_rate) * 100).toFixed(0),
        intermediary_default_rate: Number(data.intermediary_default_rate),
        driver_service_price: Number(data.driver_service_price),
        support_email: data.support_email || '',
        support_phone: data.support_phone || '',
      }))
      .catch(() => setError('Paramètres indisponibles.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false); setError('');
    try {
      await settingsAPI.update({
        commission_rate: (Number(form.commission_rate) / 100).toFixed(2),
        intermediary_default_rate: form.intermediary_default_rate,
        driver_service_price: form.driver_service_price,
        support_email: form.support_email,
        support_phone: form.support_phone,
      });
      setSaved(true);
    } catch (_) { setError('Enregistrement impossible.'); }
    setSaving(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <DashboardLayout title="Paramètres de la plateforme">
      <div className="max-w-3xl mx-auto">
        {loading && <p className="text-center text-slate-400 py-10">Chargement…</p>}
        {form && (
          <form onSubmit={submit} className="space-y-6">
            {/* Commissions */}
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Percent size={18} className="text-amber-500" /> Commissions & tarifs
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Commission AutoLink (%)</label>
                  <input type="number" min="0" max="90" step="0.5" className="input-field mt-1"
                    value={form.commission_rate} onChange={set('commission_rate')} />
                  <p className="text-xs text-slate-400 mt-1">Part prélevée sur chaque location.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Taux intermédiaire défaut (%)</label>
                  <input type="number" min="0" max="50" step="0.5" className="input-field mt-1"
                    value={form.intermediary_default_rate} onChange={set('intermediary_default_rate')} />
                  <p className="text-xs text-slate-400 mt-1">Appliqué aux nouveaux intermédiaires.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <UserCheck size={14} /> Service chauffeur (FCFA)
                  </label>
                  <input type="number" min="0" step="5000" className="input-field mt-1"
                    value={form.driver_service_price} onChange={set('driver_service_price')} />
                  <p className="text-xs text-slate-400 mt-1">Forfait par chauffeur recruté.</p>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LifeBuoy size={18} className="text-sky-500" /> Support & contact
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email support</label>
                  <input type="email" className="input-field mt-1" placeholder="support@autolink.cm"
                    value={form.support_email} onChange={set('support_email')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Téléphone support</label>
                  <input className="input-field mt-1" placeholder="+237 6 XX XX XX XX"
                    value={form.support_phone} onChange={set('support_phone')} />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-emerald-600 font-semibold">Paramètres enregistrés.</p>}
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 disabled:opacity-50 transition-colors">
              <Save size={16} /> {saving ? 'Enregistrement…' : 'Enregistrer les paramètres'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
