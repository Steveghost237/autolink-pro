import React, { useState } from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import { Send, Search, CheckCheck, ShieldCheck } from 'lucide-react';

const THREADS = [
  { id: 1, name: 'Nadia Fouda', role: 'Locataire', preview: "Bonjour, le point de remise convient pour 14h ?", time: '10:42', unread: 2, online: true },
  { id: 2, name: 'AutoLink Pro — Support', role: 'Support plateforme', preview: 'Votre inspection du 28/10 a été validée.', time: 'Hier', unread: 0, online: true },
  { id: 3, name: 'Jules Mbappe', role: 'Locataire', preview: 'Merci pour le véhicule, tout s\'est bien passé.', time: 'Mar', unread: 0, online: false },
];
const MESSAGES = [
  { me: false, text: 'Bonjour ! Concernant la réservation du SUV pour ce week-end, le point de remise à Bonanjo convient pour 14h ?', time: '10:38' },
  { me: true, text: 'Bonjour Nadia, oui parfait — je vous retrouve devant la station-service, carrefour Ndokoti à 14h.', time: '10:40' },
  { me: false, text: 'Super, merci ! Je prépare ma caution et mes documents.', time: '10:42' },
];
export default function OwnerMessages() {
  const [active, setActive] = useState(0);
  const t = THREADS[active];
  return (
    <OwnerLayout title="Messagerie" subtitle="Échanges avec vos locataires et le support">
      <div className="grid lg:grid-cols-[320px,1fr] gap-4 h-[calc(100vh-15rem)]">
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100"><div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2"><Search className="w-4 h-4 text-slate-400" /><input placeholder="Rechercher…" className="bg-transparent text-sm flex-1 outline-none" /></div></div>
          <div className="overflow-y-auto flex-1">{THREADS.map((x, i) => (
            <button key={x.id} onClick={() => setActive(i)} className={`w-full text-left px-4 py-3 flex gap-3 items-start border-b border-slate-50 hover:bg-slate-50 ${i === active ? 'bg-emerald-50/50 border-l-2 border-l-emerald-500' : ''}`}>
              <div className="relative"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{x.name[0]}</div>{x.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />}</div>
              <div className="flex-1 min-w-0"><div className="flex justify-between"><span className="text-sm font-semibold text-slate-800 truncate">{x.name}</span><span className="text-xs text-slate-400">{x.time}</span></div><div className="text-xs text-slate-500 truncate">{x.preview}</div><div className="text-[10px] text-emerald-600 font-medium">{x.role}</div></div>
              {x.unread > 0 && <span className="w-5 h-5 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{x.unread}</span>}
            </button>))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">{t.name[0]}</div><div><div className="font-semibold text-slate-800">{t.name}</div><div className="text-xs text-slate-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />{t.role} · canal sécurisé</div></div></div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">{MESSAGES.map((m, i) => (
            <div key={i} className={`flex ${m.me ? 'justify-end' : ''}`}><div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.me ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-white border border-slate-100 rounded-bl-md'}`}><p>{m.text}</p><p className={`text-[10px] mt-1 flex items-center gap-1 justify-end ${m.me ? 'text-emerald-100' : 'text-slate-400'}`}>{m.time}{m.me && <CheckCheck className="w-3 h-3" />}</p></div></div>))}
          </div>
          <div className="p-3 border-t border-slate-100 flex items-center gap-2"><input placeholder="Écrire votre message…" className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none" /><button className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><Send className="w-4 h-4" /></button></div>
        </div>
      </div>
    </OwnerLayout>
  );
}
