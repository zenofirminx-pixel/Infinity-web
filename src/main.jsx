import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './shell.css';

const TRIAL_LIMIT = 5;
const TRIAL_COUNT_KEY = 'infinity_site_trial_count_v1';
const TRIAL_STARTED_KEY = 'infinity_site_trial_started_v1';
const TRIAL_LOCK_KEY = 'infinity_site_trial_locked_v1';


function readTrialCount() {
  const value = Number.parseInt(localStorage.getItem(TRIAL_COUNT_KEY) || '0', 10);
  return Number.isFinite(value) ? Math.max(0, Math.min(TRIAL_LIMIT, value)) : 0;
}


function SiteBlockScreen({ locked, count, onStart }) {
  return <section className="site-block-screen" aria-label="Accès temporairement bloqué">
    <div className="block-glow block-glow-a" />
    <div className="block-glow block-glow-b" />
    <div className="block-card">
      <div className="block-symbol" aria-hidden="true">∞</div>
      <span className="block-label">INFINITY · ACCÈS LIMITÉ</span>
      <h1>Site temporairement bloqué</h1>
      <p className="block-explanation">
        Le créateur du site a donc décidé de bloquer ce site car ce site n’est pas encore en production et est en cours de création.
      </p>
      {locked ? <>
        <div className="block-status"><span className="status-dot" /> Essai terminé · Accès bloqué</div>
        <button className="trial-button trial-button-disabled" type="button" disabled aria-disabled="true">
          Essai terminé
        </button>
        <p className="block-footnote">La limite de 5 messages a été atteinte. Le bouton d’essai est désactivé.</p>
      </> : <>
        <div className="trial-info">
          <strong>Un essai est disponible</strong>
          <span>Tu peux envoyer jusqu’à 5 messages pour tester le chat.</span>
        </div>
        <button className="trial-button" type="button" onClick={onStart}>
          Lancer un essai <span aria-hidden="true">→</span>
        </button>
        {count > 0 && <p className="block-footnote">Essai en cours : {count}/{TRIAL_LIMIT} messages utilisés.</p>}
      </>}
      <div className="block-footer">Site en développement · Merci de votre compréhension</div>
    </div>
  </section>;
}


function App() {
  const iframeRef = useRef(null);
  const activeTrialRef = useRef(false);
  const countRef = useRef(0);
  const lockRef = useRef(false);
  const [trialStarted, setTrialStarted] = useState(localStorage.getItem(TRIAL_STARTED_KEY) === 'true');
  const [trialCount, setTrialCount] = useState(readTrialCount());
  const [locked, setLocked] = useState(localStorage.getItem(TRIAL_LOCK_KEY) === 'true' || readTrialCount() >= TRIAL_LIMIT);

  countRef.current = trialCount;
  lockRef.current = locked;
  activeTrialRef.current = trialStarted && !locked;

  const lockTrial = useCallback(() => {
    localStorage.setItem(TRIAL_COUNT_KEY, String(TRIAL_LIMIT));
    localStorage.setItem(TRIAL_LOCK_KEY, 'true');
    setTrialCount(TRIAL_LIMIT);
    setLocked(true);
    setTrialStarted(false);
    activeTrialRef.current = false;
    lockRef.current = true;
  }, []);

  const startTrial = useCallback(() => {
    if (lockRef.current) return;
    localStorage.setItem(TRIAL_STARTED_KEY, 'true');
    setTrialStarted(true);
    activeTrialRef.current = true;
    const frame = iframeRef.current;
    try {
      const frameDoc = frame?.contentDocument;
      if (frameDoc) {
        frameDoc.defaultView.localStorage.setItem('infinity_terms', 'true');
        frameDoc.getElementById('termsScreen')?.classList.add('hidden');
        frameDoc.getElementById('welcome')?.classList.add('hidden');
      }
    } catch (error) {
      console.warn('Unable to dismiss legacy onboarding screen:', error);
    }
  }, []);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    let observer;
    let pollTimer;
    let completionTimer;
    let disposed = false;
    let tenthMessageSent = false;

    const installTrialLimiter = () => {
      const frameDoc = frame.contentDocument;
      if (!frameDoc || disposed || lockRef.current) return;
      const input = frameDoc.getElementById('input');
      const sendButton = frameDoc.getElementById('sendBtn');
      const chat = frameDoc.getElementById('chat');
      if (!input || !sendButton || !chat) return;

      const saveCount = (next) => {
        const bounded = Math.max(0, Math.min(TRIAL_LIMIT, next));
        localStorage.setItem(TRIAL_COUNT_KEY, String(bounded));
        countRef.current = bounded;
        setTrialCount(bounded);
        return bounded;
      };

      const countSend = (event) => {
        if (!activeTrialRef.current || lockRef.current || countRef.current >= TRIAL_LIMIT) {
          if (countRef.current >= TRIAL_LIMIT) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
          }
          return;
        }
        if (!input.value.trim()) return;
        const next = saveCount(countRef.current + 1);
        if (next === TRIAL_LIMIT) {
          tenthMessageSent = true;
          // Let the tenth request complete; then return to the permanent block screen.
          let sawLoading = false;
          const waitForCompletion = () => {
            if (disposed || lockRef.current) return;
            const loading = sendButton.classList.contains('loading');
            sawLoading = sawLoading || loading;
            if (sawLoading && !loading) {
              lockTrial();
              return;
            }
            if (!sawLoading && Date.now() - completionStart > 60000) {
              lockTrial();
              return;
            }
            completionTimer = setTimeout(waitForCompletion, 120);
          };
          const completionStart = Date.now();
          completionTimer = setTimeout(waitForCompletion, 120);
        }
      };

      const onClickCapture = (event) => {
        if (event.target.closest('#sendBtn')) countSend(event);
      };
      const onKeyCapture = (event) => {
        if (event.target === input && event.key === 'Enter' && !event.shiftKey) countSend(event);
      };
      frameDoc.addEventListener('click', onClickCapture, true);
      frameDoc.addEventListener('keydown', onKeyCapture, true);

      observer = new MutationObserver(() => {
        // Locking is based on send attempts, not restored conversation history.
        if (tenthMessageSent && sendButton && !sendButton.classList.contains('loading') && countRef.current >= TRIAL_LIMIT) {
          lockTrial();
        }
      });
      observer.observe(sendButton, { attributes: true, attributeFilter: ['class'] });

      frame.__infinityTrialCleanup = () => {
        frameDoc.removeEventListener('click', onClickCapture, true);
        frameDoc.removeEventListener('keydown', onKeyCapture, true);
      };
    };


    const onFrameLoad = () => {
      installTrialLimiter();
      if (trialStarted && !locked) {
        try {
          const doc = frame.contentDocument;
          doc?.defaultView?.localStorage.setItem('infinity_terms', 'true');
          doc?.getElementById('termsScreen')?.classList.add('hidden');
        } catch (error) {
          console.warn('Unable to initialize trial iframe:', error);
        }
      }
    };

    frame.addEventListener('load', onFrameLoad);
    if (frame.contentDocument?.readyState === 'complete') onFrameLoad();

    return () => {
      disposed = true;
      frame.removeEventListener('load', onFrameLoad);
      frame.__infinityTrialCleanup?.();
      observer?.disconnect();
      clearTimeout(pollTimer);
      clearTimeout(completionTimer);
    };
  }, [trialStarted, locked, lockTrial]);

  return <main className="app-shell">
    <iframe ref={iframeRef} className="pal-app" src="/legacy.html" title="Infinity Chat" allow="clipboard-read; clipboard-write" />
    {!trialStarted || locked ? <SiteBlockScreen locked={locked} count={trialCount} onStart={startTrial} /> : null}
  </main>;
}


createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/SW.js').catch((error) => console.error('Service worker registration failed:', error)));
}
