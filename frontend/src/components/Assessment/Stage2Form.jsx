import FormField from './FormField';
import { ArrowLeft, ArrowRight, TestTube2 } from 'lucide-react';

const FIELDS = [
  {
    name: 'APOE4',
    label: 'APOE ε4 Allele Genotype',
    type: 'select',
    options: [
      { value: 0, label: '0 — Non-carrier (ε3/ε3, ε2/ε3)' },
      { value: 1, label: '1 — Heterozygous (ε3/ε4, ε2/ε4)' },
      { value: 2, label: '2 — Homozygous (ε4/ε4, Highest Risk)' },
    ],
    placeholder: 'Select APOE status',
    unit: 'Alleles',
    normalRange: '0 = Baseline, 2 = ARIA Risk Alert',
    helperText: 'Apolipoprotein E ε4 carrier count',
  },
  {
    name: 'pT217_F',
    label: 'Plasma Phospho-Tau217',
    type: 'number',
    min: 0,
    step: 0.01,
    placeholder: 'e.g., 0.55',
    unit: 'pg/mL',
    normalRange: '< 0.20 (Normal), > 0.40 (Elevated AD)',
    helperText: 'High-specificity blood biomarker for cerebral amyloid plaque pathology',
  },
  {
    name: 'AB42_AB40_F',
    label: 'Plasma Aβ42 / Aβ40 Ratio',
    type: 'number',
    min: 0,
    step: 0.001,
    placeholder: 'e.g., 0.055',
    unit: 'ratio',
    normalRange: '> 0.085 (Normal), < 0.070 (Amyloidosis)',
    helperText: 'Decreased ratio indicates amyloid sequestration in brain parenchyma',
  },
  {
    name: 'NfL_Q',
    label: 'Plasma Neurofilament Light (NfL)',
    type: 'number',
    min: 0,
    step: 0.1,
    placeholder: 'e.g., 25.0',
    unit: 'pg/mL',
    normalRange: '< 15.0 pg/mL (Normal age-adjusted)',
    helperText: 'Marker of active subcortical large-caliber axonal degeneration',
  },
  {
    name: 'GFAP_Q',
    label: 'Plasma GFAP',
    type: 'number',
    min: 0,
    step: 0.1,
    placeholder: 'e.g., 220.0',
    unit: 'pg/mL',
    normalRange: '< 130.0 pg/mL (Reactive Astrogliosis)',
    helperText: 'Glial fibrillary acidic protein — reflects neuroinflammatory activation',
  },
];

export default function Stage2Form({ formData, errors, onChange, onSubmit, onBack, loading }) {
  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--indigo-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TestTube2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Stage 2 — High-Sensitivity Blood Biomarkers</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Plasma assays quantifying amyloid burden, tau phosphorylation, and axonal damage.
            </p>
          </div>
        </div>

        <span className="badge badge-cyan">Stage 2 of 4</span>
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
          <span>Back to Stage 1</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          <span>Continue to Stage 3 (MRI Volumetrics)</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
