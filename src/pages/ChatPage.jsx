import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import MessageList from '../components/MessageList.jsx';
import ChatComposer from '../components/ChatComposer.jsx';

export default function ChatPage({ user, conversations, setConversations, authenticated, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const createConversation = async () => {
    const { conversationApi } = await import('../services/api.js');
    const data = await conversationApi.create();
    const id = data.convId || crypto.randomUUID();
    const item = { id, title: 'Nouvelle conversation', messages: [], date: Date.now() };
    setConversations(prev => [item, ...prev.filter(c => String(c.id) !== String(id))]);
    setCurrentId(id); setMessages([]); setSidebarOpen(false); return id;
  };
  const send = async text => {
    setError(''); setBusy(true); setStatus('');
    let id = currentId;
    try {
      if (!id) id = await createConversation();
      const next = [...messages, { role: 'user', text }];
      setMessages([...next, { role: 'assistant', text: '' }]);
      const { streamChat } = await import('../services/api.js');
      let answer = '';
      await streamChat({ message: text, convId: id, onContent: chunk => { answer += chunk; setMessages([...next, { role: 'assistant', text: answer }]); }, onStatus: setStatus });
      const finalMessages = [...next, { role: 'assistant', text: answer }];
      setMessages(finalMessages);
      const old = conversations.find(c => String(c.id) === String(id));
      const item = { id, title: old?.title === 'Nouvelle conversation' || !old?.title ? text.slice(0, 42) : old.title, messages: finalMessages.map(m => ({ text: m.text, type: m.role === 'assistant' ? 'bot' : 'user', timestamp: Date.now() })), updatedAt: Date.now() };
      setConversations(prev => [item, ...prev.filter(c => String(c.id) !== String(id))]);
      if (!authenticated) localStorage.setItem('pal_guest_conversations', JSON.stringify([item, ...conversations.filter(c => String(c.id) !== String(id))].slice(0, 50)));
    } catch (e) { setError(e.message || 'La réponse n’a pas pu être générée.'); setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && !m.text))); }
    finally { setBusy(false); setStatus(''); }
  };
  const selectConversation = id => { const conversation = conversations.find(c => String(c.id) === String(id)); setCurrentId(id); setMessages((conversation?.messages || []).map(m => ({ role: m.type === 'bot' ? 'assistant' : m.role || 'user', text: m.text }))); setSidebarOpen(false); };
  return <div className="chat-layout">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} conversations={conversations} currentId={currentId} onSelect={selectConversation} onNew={createConversation} onSettings={() => setSettingsOpen(true)} user={user} />
    <header className="chat-header"><button className="icon-button menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">☰</button><span>Pal</span><button className="profile-trigger" onClick={() => setSettingsOpen(true)}>{user?.name?.[0]?.toUpperCase() || '◉'}</button></header>
    <main className="chat-main"><MessageList messages={messages} busy={busy} status={status} />{error && <p className="chat-error">{error}</p>}<ChatComposer onSend={send} disabled={busy} /></main>
    {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><section className="settings-panel" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setSettingsOpen(false)}>×</button><h2>Paramètres</h2><div className="settings-user"><span className="account-avatar">{user?.name?.[0]?.toUpperCase() || '◉'}</span><div><b>{user?.name || 'Compte invité'}</b><small>{user?.email || 'Vous utilisez Pal sans compte'}</small></div></div><button className="settings-option">Informations sur le créateur</button><button className="settings-option">Signaler un problème</button><button className="settings-option">Modifier le profil</button><button className="settings-option">Protocole de l’entreprise Pal</button>{authenticated && <button className="logout-button" onClick={onLogout}>Se déconnecter</button>}</section></div>}
  </div>;
}
