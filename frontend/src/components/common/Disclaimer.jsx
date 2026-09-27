import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Disclaimer({ variant = 'banner' }) {
  if (variant === 'inline') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '1.5rem', textAlign: 'center' }}>
        <ShieldAlert size={14} style={{ color: 'var(--text-amber)', flexShrink: 0 }} />
        <span>
          <strong>Research Prototype:</strong> Model predictions are probabilistic estimates for clinical research investigation only.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        background: 'var(--warning-bg)',
        border: '1px solid var(--warning-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        maxWidth: 680,
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <AlertTriangle size={20} style={{ color: 'var(--text-amber)', flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
        <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
          Research &amp; Decision-Support Prototype
        </strong>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          This software is designed for clinical trial stratification and research investigation.
          Predictions should not be used as the sole basis for clinical diagnosis or prescription of therapeutics.
        </p>
      </div>
    </div>
  );
}
