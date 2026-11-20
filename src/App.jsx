import { useEffect, useState } from 'react';
import WelcomePage from './pages/WelcomePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import { authApi, conversationApi } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [returning, setReturning] = useState(false);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [conversations, setConversations] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const account = await authApi.me();
        if (!alive) return;
        setUser(account); setAuthenticated(true); setReturning(true);
        const history = await conversationApi.history();
        if (alive) setConversations(Array.isArray(history.conversations) ? history.conversations : []);
      } catch {
        if (alive) {
          setAuthenticated(false);
          try { setConversations(JSON.parse(localStorage.getItem('pal_guest_conversations') || '[]')); } catch { setConversations([]); }
        }
      } finally { if (alive) setReady(true); }
    })();
    return () => { alive = false; };
  }, []);
  const authenticate = async (mode, credentials) => {
    if (mode === 'google') return authApi.googleUrl();
    const result = mode === 'register'
      ? await authApi.register(credentials.name, credentials.email, credentials.password)
      : await authApi.login(credentials.email, credentials.password);
    setUser(result.user); setAuthenticated(true); setReturning(true);
    const history = await conversationApi.history(); setConversations(history.conversations || []);
  };
  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null); setAuthenticated(false); setConversations([]); setReturning(false);
  };
  if (!ready) return <div className="loading-screen"><span className="loading-mark">Pal</span><p>Préparation de votre espace…</p></div>;
  if (!authenticated && user === null && !sessionStorage.getItem('pal_guest_mode')) return <WelcomePage returning={returning} onAuth={authenticate} onGuest={() => { sessionStorage.setItem('pal_guest_mode', '1'); setReady(true); setUser({ name: 'Invité' }); }} />;
  return <ChatPage user={user || { name: 'Invité' }} conversations={conversations} setConversations={setConversations} authenticated={authenticated} onLogout={logout} />;
}
