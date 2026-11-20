import { useState } from 'react';
export default function ChatComposer({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const send = () => { const text = value.trim(); if (!text || disabled) return; setValue(''); onSend(text); };
  return <div className="composer-wrap"><div className="composer"><textarea value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Écrivez à Pal…" rows={1} aria-label="Votre message" /><button onClick={send} disabled={disabled || !value.trim()} aria-label="Envoyer">↑</button></div><small>Pal peut faire des erreurs. Vérifiez les informations importantes.</small></div>;
}
