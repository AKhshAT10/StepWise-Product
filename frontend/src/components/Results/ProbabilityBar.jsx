import { CheckCircle2, XCircle } from 'lucide-react';

export default function ProbabilityBar({ probability, threshold, escalated, label = 'Model Probability' }) {
  const probPercent = Math.min(Math.max(probability * 100, 0), 100);
  const threshPercent = Math.min(Math.max(threshold * 100, 0), 100);
  // Trust the backend's decision (honors clinical overrides like MMSE < 24)
  // instead of silently recalculating from probability/threshold alone.
  const isEscalated = escalated !== undefined ? escalated : probability >= threshold;
  const delta = (probability - threshold) * 100;

  return (
    <div className="probability-meter-box">
      <div className="prob-meta-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isEscalated ? (
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          ) : (
            <XCircle size={16} style={{ color: 'var(--text-muted)' }} />
          )}
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            className="prob-val-tag"
            style={{ color: isEscalated ? 'var(--text-emerald)' : 'var(--text-cyan)' }}
          >
            {probPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="prob-track">
        <div
          className="prob-fill"
          style={{
            width: `${probPercent}%`,
            background: isEscalated
              ? 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)'
              : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
            boxShadow: isEscalated
              ? '0 0 12px rgba(16, 185, 129, 0.4)'
              : '0 0 12px rgba(2, 132, 199, 0.4)',
          }}
        />

        {/* Threshold Marker Needle — the ONLY place the threshold value is shown */}
        <div className="prob-threshold-needle" style={{ left: `${threshPercent}%` }}>
          <span className="prob-threshold-needle-label">
            Cutoff {threshPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Scale & Delta Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-dim)' }}>
        <span>0% (Low Risk)</span>
        <span style={{ color: isEscalated ? 'var(--text-emerald)' : 'var(--text-cyan)', fontWeight: 600 }}>
          {isEscalated
            ? (delta >= 0
                ? `+${delta.toFixed(1)}% above cutoff (Escalates to Next Stage)`
                : `Clinical override — escalates despite lower model score`)
            : `${delta.toFixed(1)}% below cutoff (Gate Hold / Non-Escalated)`}
        </span>
        <span>100% (High Risk)</span>
      </div>
    </div>
  );
}