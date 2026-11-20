const API_BASE = (import.meta.env.VITE_API_URL || 'https://aur-x-backend.vercel.app').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api/${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
  return data;
}

export const authApi = {
  me: () => request('auth/me'),
  guest: () => request('guest', { method: 'POST' }),
  login: (email, password) => request('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  logout: () => request('auth/logout', { method: 'POST' }),
  googleUrl: () => `${API_BASE}/api/auth/google`,
};

export const conversationApi = {
  history: () => request('history'),
  create: () => request('conversations', { method: 'POST' }),
  deleteAll: () => request('deleteAll', { method: 'POST' }),
  get: id => request(`conversations/${encodeURIComponent(id)}`),
  rename: (id, title) => request(`conversations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  remove: id => request(`conversations/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export async function streamChat({ message, convId, onContent, onStatus }) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, convId }),
  });
  if (!response.ok || !response.body) throw new Error('Le service de conversation est indisponible.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === '[DONE]') continue;
      try {
        const event = JSON.parse(raw);
        if (event.content) onContent(event.content);
        if (event.type?.startsWith('search_')) onStatus(event.status || 'Recherche web…');
        if (event.error) throw new Error(event.error);
      } catch (error) {
        if (error instanceof SyntaxError) continue;
        throw error;
      }
    }
  }
}

export const dashboardApi = { get: () => request('dashboard') };
export const resourcesApi = {
  list: name => request(name), get: (name,id) => request(`${name}/${encodeURIComponent(id)}`),
  create: (name,data) => request(name,{method:'POST',body:JSON.stringify(data)}),
  update: (name,id,data) => request(`${name}/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(data)}),
  download: (name,id) => request(`${name}/${encodeURIComponent(id)}/download`),
  remove: (name,id) => request(`${name}/${encodeURIComponent(id)}`,{method:'DELETE'}),
  settings: () => request('settings'), saveSettings: data => request('settings',{method:'PATCH',body:JSON.stringify(data)}),
  search: q => request(`search?q=${encodeURIComponent(q)}`)
};
