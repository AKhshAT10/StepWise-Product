import FormField from './FormField';
import { ArrowLeft, ArrowRight, Scan } from 'lucide-react';

const FIELDS = [
  {
    name: 'HIPPO_NORM',
    label: 'Hippocampal Volume / ICV',
    type: 'number',
    min: 0,
    step: 0.0001,
    placeholder: 'e.g., 0.0042',
    unit: 'ratio',
    normalRange: '0.0060 – 0.0080 (< 0.0050 = Atrophy)',
    helperText: 'Bilateral hippocampal volume normalized by total intracranial volume',
  },
  {
    name: 'VENTRICLE_NORM',
    label: 'Ventricular Volume / ICV',
    type: 'number',
    min: 0,
    step: 0.0001,
    placeholder: 'e.g., 0.0380',
    unit: 'ratio',
    normalRange: '0.015 – 0.025 (> 0.035 = Enlargement)',
    helperText: 'Lateral + 3rd ventricle volume normalized by ICV (hydrocephalus ex vacuo)',
  },
  {
    name: 'CORTICAL_THICKNESS_AVG',
    label: 'Mean Cortical Thickness',
    type: 'number',
    min: 0,
    step: 0.01,
    placeholder: 'e.g., 2.15',
    unit: 'mm',
    normalRange: '2.50 – 2.90 mm (< 2.30 mm = Thinning)',
    helperText: 'Average signature cortical thickness across entorhinal, temporal, and parietal lobes',
  },
  {
    name: 'TOTAL_WMH',
    label: 'White Matter Hyperintensity (WMH)',
    type: 'number',
    min: 0,
    step: 0.1,
    placeholder: 'e.g., 5.2',
    unit: 'cm³',
    normalRange: '< 2.0 cm³ (Minimal vascular load)',
    helperText: 'Quantified FLAIR hyperintensity volume representing small vessel cerebrovascular disease',
  },
];

export default function Stage3Form({ formData, errors, onChange, onSubmit, onBack, loading }) {
  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Scan size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Stage 3 — Quantitative Structural MRI Volumetrics</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Automated FreeSurfer / SPM morphometric features indexing regional neurodegeneration.
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">Stage 3 of 4</span>
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
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft size={16} />
          <span>Back to Stage 2</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          <span>Continue to Stage 4 (Eligibility &amp; Safety)</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
