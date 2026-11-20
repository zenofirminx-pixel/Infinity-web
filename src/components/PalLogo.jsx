export default function PalLogo({ compact = false }) {
  return <div className={`pal-logo${compact ? ' pal-logo--compact' : ''}`} aria-label="Pal">
    <span>Pal</span><i aria-hidden="true" />
  </div>;
}
