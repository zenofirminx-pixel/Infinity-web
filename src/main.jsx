import React from 'react';
import { createRoot } from 'react-dom/client';
import './shell.css';

/**
 * React/Vite application shell.
 * The existing Infinity client is mounted as a same-origin legacy surface so
 * its authentication, conversation storage, streaming API, settings, history,
 * feedback and PWA behavior remain intact during the UI migration.
 */
function App() {
  return (
    <main className="app-shell">
      <iframe
        className="infinity-app"
        src="/legacy.html"
        title="Infinity assistant"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/SW.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}
