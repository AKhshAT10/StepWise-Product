import FormField from './FormField';
import { ArrowLeft, Sparkles, Pill, ShieldAlert, CheckCircle2 } from 'lucide-react';

const FIELDS = [
  {
    name: 'AMYLOID_STATUS',
    label: 'Amyloid PET Scan Status',
    type: 'select',
    options: [
      { value: 0, label: '0 — Negative (No significant cortical fibrillar plaque)' },
      { value: 1, label: '1 — Positive (Cortical amyloid tracer retention confirmed)' },
    ],
    placeholder: 'Select amyloid PET status',
    unit: 'PET Tracer',
    normalRange: '1 = Required for anti-amyloid immunotherapy',
    helperText: 'Confirmatory visual read or quantitative Centiloid threshold',
  },
  {
    name: 'MICROHEM_COUNT',
    label: 'Cerebral Microhemorrhage Count (T2* / SWI)',
    type: 'number',
    min: 0,
    max: 8,
    step: 1,
    placeholder: 'e.g., 2',
    unit: 'Lesions',
    normalRange: '< 5 (Safe), ≥ 5 (ARIA High Risk Exclusion)',
    helperText: 'Number of punctate hemosiderin deposits identified on gradient echo MRI',
  },
];

export default function Stage4Form({ formData, errors, onChange, onSubmit, onBack, loading }) {
  const isAriaWarning =
    formData.APOE4 === 2 || (typeof formData.MICROHEM_COUNT === 'number' && formData.MICROHEM_COUNT >= 5);

  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pill size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Stage 4 — Amyloid PET Confirmation &amp; ARIA Safety Gate</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Determine clinical therapy shortlist candidacy and Amyloid-Related Imaging Abnormality risk.
            </p>
          </div>
        </div>

        <span className="badge badge-emerald">Final Stage 4 of 4</span>
      </div>

      {/* Safety Gate Warning Box if patient triggers ARIA criteria */}
      {isAriaWarning && (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <ShieldAlert size={20} style={{ color: 'var(--text-amber)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-amber)', display: 'block', marginBottom: '0.2rem' }}>
              ARIA Risk Indicator Detected in Profile
            </strong>
            <span>
              {formData.APOE4 === 2 && 'Patient has homozygous APOE ε4/ε4 alleles. '}
              {formData.MICROHEM_COUNT >= 5 && 'Patient has 5 or more baseline cerebral microbleeds. '}
              This will trigger an ARIA Safety Flag in final clinical recommendations.
            </span>
          </div>
        </div>
      )}

      <div className="form-grid-2col">
        {FIELDS.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={formData[field.name]}
            error={errors[field.name]}
            onChange={onChange}
          />
        ))}
      </div>

      <div className="form-card-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={16} />
          <span>Back to Stage 3</span>
        </button>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" />
              <span>Running Cascade Ensembles...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Execute Full Cascade Prediction</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
