export default function PalLogo({ compact = false }) {
  return <div className={`pal-logo${compact ? ' pal-logo--compact' : ''}`} aria-label="Pal"><span>Pal</span><svg viewBox="0 0 100 24" aria-hidden="true"><path d="M5 18 Q50 -5 95 18"/></svg></div>;
}
