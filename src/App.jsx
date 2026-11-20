import React, { useEffect, useRef, useState } from 'react';

/**
 * React/Vite compatibility shell.
 * The original Infinity DOM IDs and legacy event-driven engine are intentionally
 * retained so authentication, conversations, API calls, quotas and settings keep working.
 */
export default function App() {
  const legacyRoot = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadScript = (src) => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
      document.body.appendChild(script);
    });

    (async () => {
      try {
        const response = await fetch('/legacy.html');
        if (!response.ok) throw new Error('Impossible de charger l’interface Infinity.');
        const markup = await response.text();
        if (cancelled || !legacyRoot.current) return;
        legacyRoot.current.innerHTML = markup;
        // The supplied archive does not contain config.js; the original engine has its own fallback config.
        await loadScript('/legacy.js');
        await loadScript('/legacy-inline.js');
        if (cancelled) return;
        // legacy.js registers initApp on DOMContentLoaded. Trigger it after its DOM is mounted.
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true }));
        setReady(true);
      } catch (error) {
        console.error(error);
        if (legacyRoot.current) legacyRoot.current.innerHTML = `<div class="boot-error">${error.message}</div>`;
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return <div className="infinity-react-shell" data-react-ready={ready}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <div ref={legacyRoot} className="legacy-app-root" aria-live="off" />
    {!ready && <div className="boot-screen"><div className="boot-mark">∞</div><strong>INFINITY</strong><span>Initialisation de votre espace...</span></div>}
  </div>;
}
