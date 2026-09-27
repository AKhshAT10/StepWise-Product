import { AlertCircle, X } from 'lucide-react';

export default function ErrorBanner({ title = 'Error', children, onDismiss }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.85rem',
        background: 'var(--danger-bg)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertCircle size={20} style={{ color: 'var(--text-rose)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem' }}>
          {title && (
            <strong style={{ display: 'block', color: 'var(--text-rose)', marginBottom: '0.2rem' }}>
              {title}
            </strong>
          )}
          <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{children}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
