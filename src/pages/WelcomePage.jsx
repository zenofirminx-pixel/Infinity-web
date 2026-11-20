import { useState } from 'react';
import PalLogo from '../components/PalLogo.jsx';
import AnimatedBackground from '../components/AnimatedBackground.jsx';

export default function WelcomePage({ onGuest, onAuth, returning }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await onAuth(mode, { name, email, password }); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  return <main className="welcome-page"><AnimatedBackground /><section className="welcome-card">
    <PalLogo />
    <p className="eyebrow">VOTRE ESPACE INTELLIGENT</p>
    <h1>{returning ? 'Bon retour chez Pal' : 'Bienvenue chez Pal'}</h1>
    <p className="welcome-copy">Une nouvelle façon de réfléchir, créer et avancer.</p>
    <button className="google-button" onClick={async () => { const target = await onAuth('google'); if (target) window.location.href = target; }}><span className="google-g">G</span> Continuer avec Google</button>
    <div className="divider"><span>ou avec votre e-mail</span></div>
    <form onSubmit={submit} className="auth-form">
      {mode === 'register' && <label>Nom<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={80} /></label>}
      <label>Adresse e-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
      <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 10 : 1} required /></label>
      {mode === 'register' && <small>10 caractères minimum.</small>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy}>{busy ? 'Patientez…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}</button>
    </form>
    <button className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Créer un compte' : 'J’ai déjà un compte'}</button>
    <button className="guest-button" onClick={onGuest}>Continuer sans compte</button>
  </section></main>;
}
