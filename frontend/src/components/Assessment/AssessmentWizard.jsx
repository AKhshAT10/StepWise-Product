import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { predictFullPipeline } from '../../services/api';
import { CLINICAL_PRESETS } from '../../config/presets';
import ProgressIndicator from './ProgressIndicator';
import Stage1Form from './Stage1Form';
import Stage2Form from './Stage2Form';
import Stage3Form from './Stage3Form';
import Stage4Form from './Stage4Form';
import ResultsPage from '../Results/ResultsPage';
import ErrorBanner from '../common/ErrorBanner';
import Disclaimer from '../common/Disclaimer';
import { Sparkles, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

const INITIAL_FORM_DATA = {
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

const STAGE_FIELDS = {
  1: ['AGE', 'PTEDUCAT', 'MMSCORE', 'PTGENDER'],
  2: ['APOE4', 'pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q'],
  3: ['HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG', 'TOTAL_WMH'],
  4: ['AMYLOID_STATUS', 'MICROHEM_COUNT'],
};

export default function AssessmentWizard() {
  const location = useLocation();
  const [currentStage, setCurrentStage] = useState(1);
  const [maxCompletedStage, setMaxCompletedStage] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);
  const [activePresetId, setActivePresetId] = useState(null);

  // Check if routed with preloaded preset from Dashboard
  useEffect(() => {
    if (location.state?.presetData) {
      setFormData(location.state.presetData);
      setActivePresetId(location.state.presetId || null);
      setMaxCompletedStage(4);
    }
  }, [location.state]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : isNaN(value) ? value : parseFloat(value),
    }));
    setActivePresetId(null);
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleApplyPreset = (preset) => {
    setFormData(preset.data);
    setActivePresetId(preset.id);
    setMaxCompletedStage(4);
    setErrors({});
    setApiError(null);
  };

  const validateStage = (stage) => {
    const stageErrors = {};
    const fields = STAGE_FIELDS[stage];

    for (const field of fields) {
      const value = formData[field];
      if (value === '' || value === null || value === undefined) {
        stageErrors[field] = 'This field is required';
      } else if (typeof value === 'number' && isNaN(value)) {
        stageErrors[field] = 'Must be a valid number';
      }
    }

    return stageErrors;
  };

  const handleStageSubmit = async (stage) => {
    setApiError(null);
    const stageErrors = validateStage(stage);

    if (Object.keys(stageErrors).length > 0) {
      setErrors(stageErrors);
      return;
    }

    setErrors({});

    // If advancing past stage 3 to stage 4
    if (stage === 4) {
      await runFullPipeline();
    } else {
      setMaxCompletedStage((prev) => Math.max(prev, stage));
      setCurrentStage(stage + 1);
    }
  };

  const runFullPipeline = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const payload = {};
      for (const [key, value] of Object.entries(formData)) {
        payload[key] = typeof value === 'number' ? value : parseFloat(value) || 0;
      }

      const response = await predictFullPipeline(payload);
      setResult(response.data);
      setMaxCompletedStage(4);
    } catch (err) {
      if (err.response) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors = {};
          detail.forEach((d) => {
            const field = d.loc?.[d.loc.length - 1];
            if (field) fieldErrors[field] = d.msg;
          });
          setErrors(fieldErrors);
          setApiError('Validation errors encountered. Please check highlighted inputs.');
        } else {
          setApiError(detail || 'An error occurred while evaluating the prediction pipeline.');
        }
      } else if (err.request) {
        setApiError('Cannot connect to FastAPI backend server (http://127.0.0.1:8000). Please verify the server is running.');
      } else {
        setApiError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (stage) => {
    setCurrentStage(stage);
    setErrors({});
    setApiError(null);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setApiError(null);
    setResult(null);
    setCurrentStage(1);
    setMaxCompletedStage(0);
    setActivePresetId(null);
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      setErrors({});
      setApiError(null);
    }
  };

  // If results are available, show the comprehensive ResultsPage
  if (result) {
    return (
      <ResultsPage
        result={result}
        formData={formData}
        onReset={handleReset}
        onEdit={() => setResult(null)}
      />
    );
  }

  return (
    <div className="assessment-container">
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span className="badge badge-cyan" style={{ alignSelf: 'center' }}>
          Sequential Cascade Intake
        </span>
        <h2>New Patient Clinical Assessment</h2>
        <p style={{ maxWidth: 640, margin: '0 auto' }}>
          Input patient parameters sequentially through each stage. The cascade runs our 3 XGBoost models
          and screens against the ARIA safety gate.
        </p>
      </div>

      {/* Preset Quick-Fill Bar */}
      <div className="wizard-preset-bar">
        <div className="wizard-preset-label">
          <Sparkles size={16} />
          <span>Quick Patient Scenarios:</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CLINICAL_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-chip-btn ${activePresetId === preset.id ? 'active' : ''}`}
              onClick={() => handleApplyPreset(preset)}
              style={
                activePresetId === preset.id
                  ? { borderColor: 'var(--cyan-400)', background: 'var(--bg-pill-hover)' }
                  : {}
              }
              title={preset.description}
            >
              <span className="preset-chip-dot" style={{ backgroundColor: preset.dotColor }} />
              <span>{preset.title}</span>
            </button>
          ))}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            title="Clear all fields"
            style={{ marginLeft: 'auto' }}
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress */}
      <ProgressIndicator
        currentStage={currentStage}
        maxCompletedStage={maxCompletedStage}
        onStageClick={handleStageClick}
      />

      {/* Error Banner */}
      {apiError && (
        <ErrorBanner title="Evaluation Notice" onDismiss={() => setApiError(null)}>
          {apiError}
        </ErrorBanner>
      )}

      {/* Active Stage Form */}
      <div>
        {currentStage === 1 && (
          <Stage1Form
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={() => handleStageSubmit(1)}
            loading={loading}
          />
        )}
        {currentStage === 2 && (
          <Stage2Form
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={() => handleStageSubmit(2)}
            onBack={handleBack}
            loading={loading}
          />
        )}
        {currentStage === 3 && (
          <Stage3Form
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={() => handleStageSubmit(3)}
            onBack={handleBack}
            loading={loading}
          />
        )}
        {currentStage === 4 && (
          <Stage4Form
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onSubmit={() => handleStageSubmit(4)}
            onBack={handleBack}
            loading={loading}
          />
        )}
      </div>

      <Disclaimer variant="inline" />
    </div>
  );
}
