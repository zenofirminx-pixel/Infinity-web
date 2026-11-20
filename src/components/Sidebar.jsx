import PalLogo from './PalLogo.jsx';
export default function Sidebar({ open, onClose, conversations, currentId, onSelect, onNew, onSettings, user }) {
  return <><button className={`sidebar-scrim${open ? ' is-visible' : ''}`} onClick={onClose} aria-label="Fermer le menu" />
    <aside className={`sidebar${open ? ' is-open' : ''}`}>
      <div className="sidebar-top"><PalLogo compact /><button className="icon-button" onClick={onClose} aria-label="Fermer">×</button></div>
      <button className="new-chat-button" onClick={onNew}>＋ <span>Nouvelle conversation</span></button>
      <p className="sidebar-label">RÉCENT</p>
      <div className="conversation-list">{conversations.map(item => <button key={item.id} className={`conversation-item${String(item.id) === String(currentId) ? ' active' : ''}`} onClick={() => onSelect(item.id)}>{item.title || 'Nouvelle conversation'}</button>)}{!conversations.length && <p className="empty-history">Aucune conversation</p>}</div>
      <button className="account-button" onClick={onSettings}><span className="account-avatar">{user?.name?.[0]?.toUpperCase() || '◉'}</span><span><b>{user?.name || 'Compte invité'}</b><small>{user?.email || 'Paramètres et profil'}</small></span><span className="account-more">···</span></button>
    </aside></>;
}
