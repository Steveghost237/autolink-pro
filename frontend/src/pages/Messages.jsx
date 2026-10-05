import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Send, Plus, LifeBuoy, ArrowLeft, Inbox } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../services/api';

const fmtTime = (d) => {
  try {
    const dt = new Date(d);
    const diff = (Date.now() - dt.getTime()) / 60000;
    if (diff < 60) return `il y a ${Math.max(1, Math.round(diff))} min`;
    if (diff < 1440) return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch (_) { return ''; }
};

const ROLE_BADGE = {
  CLIENT: 'bg-sky-100 text-sky-700',
  OWNER: 'bg-emerald-100 text-emerald-700',
  ADMIN: 'bg-amber-100 text-amber-700',
  INTERMEDIARY: 'bg-violet-100 text-violet-700',
  CONTROLLER: 'bg-purple-100 text-purple-700',
};
const ROLE_LABEL = { CLIENT: 'Client', OWNER: 'Propriétaire', ADMIN: 'Admin', INTERMEDIARY: 'Intermédiaire', CONTROLLER: 'Contrôleur' };

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [peer, setPeer] = useState(null); // 'support' | user id
  const [peerInfo, setPeerInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [composing, setComposing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showThreads, setShowThreads] = useState(true); // mobile : liste ↔ conversation
  const endRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadThreads = useCallback(async () => {
    try {
      const { data } = await messagesAPI.threads();
      setThreads(data.results || []);
      setOffline(false);
    } catch (_) { setOffline(true); }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadThreads();
    messagesAPI.contacts().then(({ data }) => setContacts(data.results || [])).catch(() => {});
    const t = setInterval(loadThreads, 15000);
    return () => clearInterval(t);
  }, [loadThreads]);

  const openThread = useCallback(async (peerKey, info) => {
    setPeer(peerKey);
    setPeerInfo(info || null);
    setShowThreads(false);
    try {
      const { data } = await messagesAPI.list(peerKey);
      setMessages(data.results || data || []);
      await messagesAPI.markRead(peerKey);
      loadThreads();
    } catch (_) { setMessages([]); }
  }, [loadThreads]);

  useEffect(() => {
    if (!peer) return;
    const t = setInterval(async () => {
      try {
        const { data } = await messagesAPI.list(peer);
        setMessages(data.results || data || []);
      } catch (_) {}
    }, 8000);
    return () => clearInterval(t);
  }, [peer]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const recipient = peer === 'support' || peer == null ? null : peer;
      await messagesAPI.send(text, recipient);
      setBody('');
      const { data } = await messagesAPI.list(peer);
      setMessages(data.results || data || []);
      loadThreads();
    } catch (_) {}
    setSending(false);
  };

  const peerLabel = peer === 'support'
    ? 'Support AutoLink'
    : (peerInfo?.peer_name || peerInfo?.name || 'Conversation');

  return (
    <DashboardLayout title="Messages">
      <div className="max-w-6xl mx-auto h-[calc(100vh-10rem)] flex gap-4">
        {/* Liste des conversations */}
        <div className={`${showThreads ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 shrink-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Inbox size={18} /> Conversations
            </h2>
            <button onClick={() => setComposing(c => !c)}
              className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors" title="Nouveau message">
              <Plus size={16} />
            </button>
          </div>

          {composing && (
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 space-y-2 bg-slate-50 dark:bg-slate-700/30">
              {!isAdmin && (
                <button onClick={() => { setComposing(false); openThread('support'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><LifeBuoy size={16} /></div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">Support AutoLink</div>
                    <div className="text-xs text-slate-400">Écrire à l'équipe</div>
                  </div>
                </button>
              )}
              {contacts.map(c => (
                <button key={c.id}
                  onClick={() => { setComposing(false); openThread(c.id, { peer_name: c.name, peer_role: c.role }); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-xs">
                    {(c.name || c.email || '?').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-white truncate">{c.name || c.email}</div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_BADGE[c.role] || 'bg-slate-100 text-slate-500'}`}>{ROLE_LABEL[c.role] || c.role}</span>
                  </div>
                </button>
              ))}
              {contacts.length === 0 && isAdmin && (
                <p className="text-xs text-slate-400 px-2">Aucun contact — les utilisateurs apparaîtront après leurs premiers échanges.</p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading && <p className="text-center text-slate-400 text-sm py-8">Chargement…</p>}
            {!loading && offline && <p className="text-center text-slate-400 text-sm py-8">API injoignable.</p>}
            {!loading && !offline && threads.length === 0 && !isAdmin && (
              <div className="text-center py-10 px-4">
                <MessageSquare size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Aucune conversation.<br />Écrivez au support ou à un contact via <strong>+</strong>.</p>
              </div>
            )}
            {!loading && !offline && threads.length === 0 && isAdmin && (
              <div className="text-center py-10 px-4">
                <MessageSquare size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Boîte support vide — les messages des utilisateurs arriveront ici.</p>
              </div>
            )}
            {threads.map(t => (
              <button key={t.key} onClick={() => openThread(t.peer_id, t)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors text-left ${peer === t.peer_id ? 'bg-slate-50 dark:bg-slate-700/40' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${t.key === 'support' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200'}`}>
                  {t.key === 'support' ? <LifeBuoy size={16} /> : (t.peer_name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{t.peer_name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(t.last_at)}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{t.last_body}</div>
                </div>
                {t.unread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-primary-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{t.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className={`${showThreads ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden`}>
          {!peer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={44} className="mb-3 text-slate-300" />
              <p className="text-sm">Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <button onClick={() => setShowThreads(true)} className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <ArrowLeft size={18} />
                </button>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${peer === 'support' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200'}`}>
                  {peer === 'support' ? <LifeBuoy size={15} /> : peerLabel.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{peerLabel}</div>
                  {peerInfo?.peer_role && peer !== 'support' && (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ROLE_BADGE[peerInfo.peer_role] || ''}`}>{ROLE_LABEL[peerInfo.peer_role] || peerInfo.peer_role}</span>
                  )}
                  {peer === 'support' && <div className="text-xs text-slate-400">Réponse sous 24 h ouvrées</div>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">Démarrez la conversation — votre message apparaîtra ici.</p>
                )}
                {messages.map(m => {
                  const mine = m.sender === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${mine
                        ? 'bg-primary-600 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md'}`}>
                        {!mine && m.sender_role === 'ADMIN' && (
                          <div className="text-[10px] font-bold text-amber-600 mb-0.5">Support AutoLink</div>
                        )}
                        <div className="whitespace-pre-wrap break-words">{m.body}</div>
                        <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-slate-400'}`}>{fmtTime(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Votre message…"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                />
                <button onClick={send} disabled={!body.trim() || sending}
                  className="p-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
