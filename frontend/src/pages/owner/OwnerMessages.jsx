import React, { useState } from 'react';
import OwnerLayout from '../../components/ownerdash/OwnerLayout';
import Icon from '../../components/Icon';

const THREADS = [
  { id: 1, name: 'Nadia Fouda', tag: 'Locataire', time: '10:42', unread: 2, init: 'N', color: 'bg-emerald-100 text-emerald-700',
    msgs: [
      { from: 'client', text: 'Bonjour ! Concernant la réservation du SUV pour ce week-end, le point de remise à Bonanjo convient pour 14h ?', time: '10:38' },
      { from: 'me', text: 'Bonjour Nadia, oui parfait — je vous retrouve devant la station-service, carrefour Ndokoti à 14h.', time: '10:40' },
      { from: 'client', text: 'Super, merci ! Je prépare ma caution et mes documents.', time: '10:42' },
    ]},
  { id: 2, name: 'AutoLink Pro — Support', tag: 'Support plateforme', time: 'Hier', unread: 0, init: 'A', color: 'bg-sky-100 text-sky-700',
    msgs: [{ from: 'client', text: 'Votre inspection du 28/10 a été validée.', time: 'Hier' }] },
  { id: 3, name: 'Jules Mbappe', tag: 'Locataire', time: 'Mar', unread: 0, init: 'J', color: 'bg-amber-100 text-amber-700',
    msgs: [{ from: 'client', text: "Merci pour le véhicule, tout s'est bien passé.", time: 'Mar' }] },
];

export default function OwnerMessages() {
  const [active, setActive] = useState(THREADS[0]);
  const [text, setText] = useState('');
  return (
    <OwnerLayout>
      <div className="grid lg:grid-cols-[340px,1fr] gap-5 h-[calc(100vh-140px)]">
        <aside className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-3">Messagerie</h2>
            <div className="relative">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Rechercher…" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {THREADS.map(t => (
              <button key={t.id} onClick={() => setActive(t)} className={`w-full text-left p-4 flex gap-3 items-start transition-colors ${active.id === t.id ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}>
                <span className={`w-11 h-11 rounded-2xl ${t.color} flex items-center justify-center font-black text-base shrink-0`}>{t.init}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex justify-between items-center"><b className="text-sm text-slate-900 truncate">{t.name}</b><em className="not-italic text-[11px] text-slate-400">{t.time}</em></span>
                  <span className="text-[12px] text-slate-500 truncate block">{t.msgs[t.msgs.length - 1].text}</span>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">{t.tag}</span>
                </span>
                {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{t.unread}</span>}
              </button>
            ))}
          </div>
        </aside>
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <header className="p-4 border-b border-slate-100 flex items-center gap-3">
            <span className={`w-11 h-11 rounded-2xl ${active.color} flex items-center justify-center font-black`}>{active.init}</span>
            <div><b className="text-slate-900 text-sm">{active.name}</b><p className="text-[12px] text-slate-500">{active.tag} · canal sécurisé</p></div>
            <Icon name="shield" size={18} className="ml-auto text-emerald-500" />
          </header>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {active.msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-3xl text-sm shadow-sm ${m.from === 'me' ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-md'}`}>
                  {m.text}<span className={`block text-[10px] mt-1 ${m.from === 'me' ? 'text-emerald-100' : 'text-slate-400'}`}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>
          <footer className="p-4 border-t border-slate-100 flex gap-3 items-center">
            <button className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"><Icon name="attach_file" size={18} /></button>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Écrire votre message…" className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm outline-none focus:border-emerald-500" />
            <button className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 shadow"><Icon name="send" size={18} /></button>
          </footer>
        </section>
      </div>
    </OwnerLayout>
  );
}
