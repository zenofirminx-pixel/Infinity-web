import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './shell.css';

const BACKEND_URL = 'https://aur-x-backend.vercel.app';

function PalMark() {
  return <div className="pal-mark" aria-label="Pal">
    <span>Pal</span><i aria-hidden="true" />
  </div>;
}

function WelcomeScreen({ onContinue }) {
  const [mode, setMode] = useState('welcome');
  const [notice, setNotice] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (active && data) setUser(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const googleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const submitEmail = (event) => {
    event.preventDefault();
    setNotice("La connexion par e-mail sera activée lors du raccordement de l'authentification côté serveur.");
  };

  return <section className="pal-welcome" aria-label="Accueil Pal">
    <div className="smoke smoke-pink" /><div className="smoke smoke-blue" /><div className="smoke smoke-white" />
    <div className="welcome-card">
      <PalMark />
      <p className="welcome-eyebrow">Votre espace intelligent</p>
      <h1>{user ? 'Bon retour chez Pal' : 'Bienvenue chez Pal'}</h1>
      <p className="welcome-copy">Un espace pour réfléchir, créer et avancer.</p>

      {mode === 'welcome' && <>
        <button className="auth-button google-button" onClick={googleLogin} type="button">
          <span className="google-g" aria-hidden="true">G</span> Continuer avec Google
        </button>
        <button className="auth-button primary-button" onClick={() => setMode('email')} type="button">Continuer avec e-mail</button>
        <button className="text-button" onClick={() => setMode('register')} type="button">Créer un compte</button>
      </>}

      {mode === 'email' && <form className="email-form" onSubmit={submitEmail}>
        <label htmlFor="pal-email">Adresse e-mail</label>
        <input id="pal-email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
        <label htmlFor="pal-password">Mot de passe</label>
        <input id="pal-password" type="password" autoComplete="current-password" placeholder="Votre mot de passe" required />
        <button className="auth-button primary-button" type="submit">Se connecter</button>
        <button className="text-button" type="button" onClick={() => setMode('welcome')}>Retour</button>
      </form>}

      {mode === 'register' && <form className="email-form" onSubmit={submitEmail}>
        <label htmlFor="pal-register-email">Adresse e-mail</label>
        <input id="pal-register-email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
        <label htmlFor="pal-register-password">Créer un mot de passe</label>
        <input id="pal-register-password" type="password" autoComplete="new-password" minLength="8" placeholder="8 caractères minimum" required />
        <button className="auth-button primary-button" type="submit">Créer mon compte</button>
        <button className="text-button" type="button" onClick={() => setMode('welcome')}>Retour</button>
      </form>}

      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <div className="welcome-divider"><span>ou</span></div>
      <button className="guest-button" type="button" onClick={onContinue}>Continuer sans compte</button>
      <p className="welcome-footnote">En continuant, vous pourrez découvrir Pal en mode invité.</p>
    </div>
  </section>;
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  return <main className="app-shell">
    <iframe className="pal-app" src="/legacy.html" title="Application Pal" allow="clipboard-read; clipboard-write" />
    {showWelcome && <WelcomeScreen onContinue={() => setShowWelcome(false)} />}
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/SW.js').catch((error) => console.error('Service worker registration failed:', error)));
}
