import { useState } from 'react';
import {
  predictStage1,
  predictStage2,
  predictStage3,
  checkStage4Eligibility,
} from '../services/api';

const STAGE_CONFIG = {
  stage1: {
    title: 'Stage 1 — Basic Screening',
    icon: '📋',
    fields: [
      { name: 'AGE', label: 'Age', type: 'number', min: 40, max: 110 },
      { name: 'PTEDUCAT', label: 'Years of Education', type: 'number', min: 0, max: 30 },
      { name: 'MMSCORE', label: 'MMSE Score', type: 'number', min: 0, max: 30 },
      { name: 'APOE4', label: 'APOE ε4 Count', type: 'select', options: [{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }] },
      { name: 'PTGENDER', label: 'Sex (0=M, 1=F)', type: 'select', options: [{ value: 0, label: 'Male (0)' }, { value: 1, label: 'Female (1)' }] },
    ],
    apiCall: predictStage1,
  },
  stage2: {
    title: 'Stage 2 — Blood Biomarkers',
    icon: '🩸',
    fields: [
      { name: 'AGE', label: 'Age', type: 'number', min: 40, max: 110 },
      { name: 'PTEDUCAT', label: 'Years of Education', type: 'number', min: 0, max: 30 },
      { name: 'MMSCORE', label: 'MMSE Score', type: 'number', min: 0, max: 30 },
      { name: 'APOE4', label: 'APOE ε4 Count', type: 'select', options: [{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }] },
      { name: 'PTGENDER', label: 'Sex (0=M, 1=F)', type: 'select', options: [{ value: 0, label: 'Male (0)' }, { value: 1, label: 'Female (1)' }] },
      { name: 'pT217_F', label: 'p-tau217', type: 'number', min: 0, step: 0.01 },
      { name: 'AB42_AB40_F', label: 'AB42/AB40 Ratio', type: 'number', min: 0, step: 0.001 },
      { name: 'NfL_Q', label: 'NfL', type: 'number', min: 0, step: 0.1 },
      { name: 'GFAP_Q', label: 'GFAP', type: 'number', min: 0, step: 0.1 },
    ],
    apiCall: predictStage2,
  },
  stage3: {
    title: 'Stage 3 — MRI Features',
    icon: '🧲',
    fields: [
      { name: 'AGE', label: 'Age', type: 'number', min: 40, max: 110 },
      { name: 'pT217_F', label: 'p-tau217', type: 'number', min: 0, step: 0.01 },
      { name: 'NfL_Q', label: 'NfL', type: 'number', min: 0, step: 0.1 },
      { name: 'GFAP_Q', label: 'GFAP', type: 'number', min: 0, step: 0.1 },
      { name: 'HIPPO_NORM', label: 'Hippocampal / ICV', type: 'number', min: 0, step: 0.0001 },
      { name: 'VENTRICLE_NORM', label: 'Ventricular / ICV', type: 'number', min: 0, step: 0.0001 },
      { name: 'CORTICAL_THICKNESS_AVG', label: 'Cortical Thickness', type: 'number', min: 0, step: 0.01 },
      { name: 'TOTAL_WMH', label: 'WMH Volume', type: 'number', min: 0, step: 0.1 },
    ],
    apiCall: predictStage3,
  },
  stage4: {
    title: 'Stage 4 — Treatment Eligibility',
    icon: '💊',
    fields: [
      { name: 'AMYLOID_STATUS', label: 'Amyloid Status', type: 'select', options: [{ value: 0, label: 'Negative (0)' }, { value: 1, label: 'Positive (1)' }] },
      { name: 'APOE4', label: 'APOE ε4 Count', type: 'select', options: [{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }] },
      { name: 'MICROHEM_COUNT', label: 'Microhemorrhage Count', type: 'number', min: 0, max: 8, step: 1 },
    ],
    apiCall: checkStage4Eligibility,
  },
};

export default function StageTester() {
  const [activeStage, setActiveStage] = useState('stage1');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const config = STAGE_CONFIG[activeStage];

  const handleStageChange = (stage) => {
    setActiveStage(stage);
    setFormData({});
    setResult(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = config.fields.find((f) => f.name === name);
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : (field?.type === 'number' ? parseFloat(value) : parseInt(value, 10)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate
    const errors = [];
    for (const field of config.fields) {
      const val = formData[field.name];
      if (val === '' || val === null || val === undefined) {
        errors.push(`${field.label} is required`);
      } else if (field.type === 'number' && isNaN(val)) {
        errors.push(`${field.label} must be a number`);
      }
    }
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      const response = await config.apiCall(formData);
      setResult(response.data);
    } catch (err) {
      if (err.response) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join('\n'));
        } else {
          setError(detail || 'An error occurred.');
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

  const renderResult = () => {
    if (!result) return null;

    if (activeStage === 'stage4') {
      return (
        <div className="result-card">
          <h4>Stage 4 Result</h4>
          <div className="result-metrics">
            <div className="metric">
              <span className="metric-label">Amyloid Positive</span>
              <span className="metric-value">{result.eligible_amyloid ? 'Yes' : 'No'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">ARIA Risk Flag</span>
              <span className="metric-value">{result.aria_risk_flag ? 'Yes' : 'No'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Treatment Eligible</span>
              <span className={`metric-value ${result.eligibility_shortlist ? 'text-success' : 'text-error'}`}>
                {result.eligibility_shortlist ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`result-card ${result.escalated ? 'result-positive' : 'result-negative'}`}>
        <h4>Stage {result.stage} Result</h4>
        <div className="result-metrics">
          <div className="metric">
            <span className="metric-label">Probability</span>
            <span className="metric-value">{(result.probability * 100).toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Threshold</span>
            <span className="metric-value">{(result.threshold * 100).toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Escalated</span>
            <span className={`metric-value ${result.escalated ? 'text-success' : 'text-error'}`}>
              {result.escalated ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stage-tester-page">
      <h1>Individual Stage Tester</h1>
      <p className="page-description">
        Test each stage independently. Useful for understanding how individual
        models behave with specific inputs.
      </p>

      <div className="stage-tabs">
        {Object.entries(STAGE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            className={`stage-tab ${activeStage === key ? 'active' : ''}`}
            onClick={() => handleStageChange(key)}
          >
            <span className="tab-icon">{cfg.icon}</span>
            <span className="tab-label">Stage {cfg.title.match(/\d+/)[0]}</span>
          </button>
        ))}
      </div>

      <div className="tester-content">
        <div className="tester-form">
          <h3>{config.title}</h3>
          {error && (
            <div className="error-banner">
              <pre>{error}</pre>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-fields-grid">
              {config.fields.map((field) => (
                <div key={field.name} className="form-field">
                  <label htmlFor={field.name}>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] ?? ''}
                      onChange={handleChange}
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={formData[field.name] ?? ''}
                      onChange={handleChange}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : null}
              {loading ? 'Running...' : 'Run Prediction'}
            </button>
          </form>
        </div>

        <div className="tester-result">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Running prediction...</p>
            </div>
          )}
          {result && renderResult()}
          {!result && !loading && (
            <div className="result-placeholder">
              <p>Submit the form to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
