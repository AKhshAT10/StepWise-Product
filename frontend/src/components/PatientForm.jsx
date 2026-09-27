import { useState } from 'react';
import { predictFullPipeline } from '../services/api';
import StagePathway from './StagePathway';
import PredictionResults from './PredictionResults';

const INITIAL_FORM = {
  // Stage 1
  AGE: '',
  PTEDUCAT: '',
  MMSCORE: '',
  APOE4: '',
  PTGENDER: '',
  // Stage 2
  pT217_F: '',
  AB42_AB40_F: '',
  NfL_Q: '',
  GFAP_Q: '',
  // Stage 3
  HIPPO_NORM: '',
  VENTRICLE_NORM: '',
  CORTICAL_THICKNESS_AVG: '',
  TOTAL_WMH: '',
  // Stage 4
  AMYLOID_STATUS: '',
  MICROHEM_COUNT: '',
};

const FIELD_CONFIG = {
  AGE: { label: 'Age', type: 'number', min: 40, max: 110, step: 1, group: 1, unit: 'years' },
  PTEDUCAT: { label: 'Years of Education', type: 'number', min: 0, max: 30, step: 1, group: 1, unit: 'years' },
  MMSCORE: { label: 'MMSE Score', type: 'number', min: 0, max: 30, step: 1, group: 1, unit: '/ 30' },
  APOE4: { label: 'APOE ε4 Allele Count', type: 'select', options: [{ value: 0, label: '0 — No ε4 alleles' }, { value: 1, label: '1 — Heterozygous' }, { value: 2, label: '2 — Homozygous' }], group: 1 },
  PTGENDER: { label: 'Sex at Birth', type: 'select', options: [{ value: 0, label: 'Male' }, { value: 1, label: 'Female' }], group: 1 },
  pT217_F: { label: 'p-tau217 (plasma)', type: 'number', min: 0, step: 0.01, group: 2 },
  AB42_AB40_F: { label: 'AB42/AB40 Ratio (plasma)', type: 'number', min: 0, step: 0.001, group: 2 },
  NfL_Q: { label: 'NfL (plasma)', type: 'number', min: 0, step: 0.1, group: 2 },
  GFAP_Q: { label: 'GFAP (plasma)', type: 'number', min: 0, step: 0.1, group: 2 },
  HIPPO_NORM: { label: 'Hippocampal Volume / ICV', type: 'number', min: 0, step: 0.0001, group: 3 },
  VENTRICLE_NORM: { label: 'Ventricular Volume / ICV', type: 'number', min: 0, step: 0.0001, group: 3 },
  CORTICAL_THICKNESS_AVG: { label: 'Avg Cortical Thickness', type: 'number', min: 0, step: 0.01, group: 3, unit: 'mm' },
  TOTAL_WMH: { label: 'White Matter Hyperintensity Volume', type: 'number', min: 0, step: 0.1, group: 3 },
  AMYLOID_STATUS: { label: 'Amyloid PET Status', type: 'select', options: [{ value: 0, label: 'Negative (0)' }, { value: 1, label: 'Positive (1)' }], group: 4 },
  MICROHEM_COUNT: { label: 'Microhemorrhage Count', type: 'number', min: 0, max: 8, step: 1, group: 4 },
};

export default function PatientForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : (FIELD_CONFIG[name]?.type === 'number' ? parseFloat(value) : parseInt(value, 10)),
    }));
  };

  const validateForm = () => {
    const errors = [];
    for (const [key, config] of Object.entries(FIELD_CONFIG)) {
      const val = formData[key];
      if (val === '' || val === null || val === undefined) {
        errors.push(`${config.label} is required`);
      } else if (config.type === 'number') {
        if (isNaN(val)) errors.push(`${config.label} must be a number`);
        if (config.min !== undefined && val < config.min) errors.push(`${config.label} must be ≥ ${config.min}`);
        if (config.max !== undefined && val > config.max) errors.push(`${config.label} must be ≤ ${config.max}`);
      }
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(`Please fix the following:\n${validationErrors.map((err) => `• ${err}`).join('\n')}`);
      return;
    }

    try {
      setLoading(true);
      const response = await predictFullPipeline(formData);
      setResult(response.data);
    } catch (err) {
      if (err.response) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join('\n'));
        } else {
          setError(detail || 'An error occurred during prediction.');
        }
      } else if (err.request) {
        setError('Cannot connect to backend. Make sure the FastAPI server is running on port 8000.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setError(null);
  };

  const renderField = (key) => {
    const config = FIELD_CONFIG[key];
    const value = formData[key];

    return (
      <div key={key} className="form-field">
        <label htmlFor={key}>{config.label}</label>
        {config.type === 'select' ? (
          <select id={key} name={key} value={value} onChange={handleChange}>
            <option value="">Select...</option>
            {config.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            id={key}
            name={key}
            type={config.type}
            value={value}
            onChange={handleChange}
            min={config.min}
            max={config.max}
            step={config.step}
            placeholder={`Enter ${config.label.toLowerCase()}`}
          />
        )}
        {config.unit && <span className="field-unit">{config.unit}</span>}
      </div>
    );
  };

  const groups = [
    { group: 1, title: 'Stage 1 — Basic Screening', icon: '📋', fields: ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER'] },
    { group: 2, title: 'Stage 2 — Blood Biomarkers', icon: '🩸', fields: ['pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q'] },
    { group: 3, title: 'Stage 3 — MRI Features', icon: '🧲', fields: ['HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG', 'TOTAL_WMH'] },
    { group: 4, title: 'Stage 4 — Treatment Eligibility', icon: '💊', fields: ['AMYLOID_STATUS', 'MICROHEM_COUNT'] },
  ];

  return (
    <div className="assessment-page">
      <h1>New Patient Assessment</h1>
      <p className="page-description">
        Enter all available patient data below. The system will run the full cascade
        pipeline and show exactly where the patient stops in the pathway.
      </p>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong>
          <pre>{error}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="patient-form">
        {groups.map((g) => (
          <div key={g.group} className="form-group-card">
            <h3 className="form-group-title">
              <span className="group-icon">{g.icon}</span> {g.title}
            </h3>
            <div className="form-fields-grid">
              {g.fields.map(renderField)}
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Running Assessment...
              </>
            ) : (
              '🔬 Run Full Assessment'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Reset Form
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner-large">
            <div className="spinner"></div>
            <p>Running cascade prediction pipeline...</p>
            <p className="loading-subtext">Stage 1 → Stage 2 → Stage 3 → Stage 4</p>
          </div>
        </div>
      )}

      {result && (
        <div className="results-section">
          <h2>Assessment Results</h2>
          <StagePathway stageResults={result} />
          <PredictionResults result={result} />
        </div>
      )}
    </div>
  );
}
