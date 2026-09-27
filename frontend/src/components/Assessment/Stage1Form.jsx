import FormField from './FormField';
import { ArrowRight, Dna } from 'lucide-react';

const FIELDS = [
  {
    name: 'AGE',
    label: 'Patient Age',
    type: 'number',
    min: 40,
    max: 110,
    step: 1,
    placeholder: 'e.g., 75',
    unit: 'years',
    normalRange: '40 – 110 yrs',
    helperText: 'Patient age at initial clinical intake',
  },
  {
    name: 'PTGENDER',
    label: 'Sex at Birth',
    type: 'select',
    options: [
      { value: 0, label: 'Male' },
      { value: 1, label: 'Female' },
    ],
    placeholder: 'Select biological sex',
    normalRange: 'Baseline covariate',
    helperText: 'Biological sex covariate for model calibration',
  },
  {
    name: 'PTEDUCAT',
    label: 'Formal Education',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    placeholder: 'e.g., 16',
    unit: 'years',
    normalRange: '0 – 30 yrs (Cognitive reserve)',
    helperText: 'Years of completed formal education',
  },
  {
    name: 'MMSCORE',
    label: 'MMSE Cognitive Score',
    type: 'number',
    min: 0,
    max: 30,
    step: 1,
    placeholder: 'e.g., 27',
    unit: '/ 30',
    normalRange: '24–30 (Normal), <24 (Impairment)',
    helperText: 'Mini-Mental State Examination score (0–30)',
  },
];

export default function Stage1Form({ formData, errors, onChange, onSubmit, loading }) {
  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dna size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Stage 1 — Cognitive &amp; Demographic Stratification</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Non-invasive clinic intake metrics to assess probability of progression.
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">Stage 1 of 4</span>
      </div>

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
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          All 4 fields required for Stage 1 XGBoost model execution.
        </span>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          <span>Continue to Stage 2 (Blood Biomarkers)</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
