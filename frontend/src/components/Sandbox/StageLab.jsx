import { useState, useEffect } from 'react';
import {
  predictStage1,
  predictStage2,
  predictStage3,
  checkStage4Eligibility,
} from '../../services/api';
import ProbabilityBar from '../Results/ProbabilityBar';
import {
  Sliders,
  Dna,
  TestTube2,
  Scan,
  Pill,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function StageLab() {
  const [activeStage, setActiveStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Stage 1 State
  const [s1, setS1] = useState({
    AGE: 75,
    PTEDUCAT: 16,
    MMSCORE: 27,
    APOE4: 1,
    PTGENDER: 0,
  });

  // Stage 2 State
  const [s2, setS2] = useState({
    AGE: 75,
    PTEDUCAT: 16,
    MMSCORE: 27,
    APOE4: 1,
    PTGENDER: 0,
    pT217_F: 0.55,
    AB42_AB40_F: 0.055,
    NfL_Q: 25.0,
    GFAP_Q: 220.0,
  });

  // Stage 3 State
  const [s3, setS3] = useState({
    AGE: 75,
    pT217_F: 0.55,
    NfL_Q: 25.0,
    GFAP_Q: 220.0,
    HIPPO_NORM: 0.0042,
    VENTRICLE_NORM: 0.038,
    CORTICAL_THICKNESS_AVG: 2.15,
    TOTAL_WMH: 5.2,
  });

  // Stage 4 State
  const [s4, setS4] = useState({
    AMYLOID_STATUS: 1,
    APOE4: 1,
    MICROHEM_COUNT: 2,
  });

  // Run prediction on current active stage
  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (activeStage === 1) {
        res = await predictStage1(s1);
      } else if (activeStage === 2) {
        res = await predictStage2(s2);
      } else if (activeStage === 3) {
        res = await predictStage3(s3);
      } else if (activeStage === 4) {
        res = await checkStage4Eligibility(s4);
      }
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Inference error');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [activeStage, s1, s2, s3, s4]);

  return (
    <div className="sandbox-view">
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span className="badge badge-cyan" style={{ alignSelf: 'center' }}>
          Interactive Researcher Sandbox
        </span>
        <h2>Stage Laboratory &amp; Sensitivity Explorer</h2>
        <p style={{ maxWidth: 680, margin: '0 auto' }}>
          Isolate any single stage of the cascade. Adjust biometric sliders in real time to observe
          live model probability responses, decision boundary crossings, and ARIA safety gates.
        </p>
      </div>

      {/* Stage Tabs */}
      <div className="sandbox-stage-tabs">
        <button
          className={`sandbox-tab-btn ${activeStage === 1 ? 'active' : ''}`}
          onClick={() => setActiveStage(1)}
        >
          <Dna size={16} />
          <span>Stage 1: Cognitive</span>
        </button>
        <button
          className={`sandbox-tab-btn ${activeStage === 2 ? 'active' : ''}`}
          onClick={() => setActiveStage(2)}
        >
          <TestTube2 size={16} />
          <span>Stage 2: Plasma</span>
        </button>
        <button
          className={`sandbox-tab-btn ${activeStage === 3 ? 'active' : ''}`}
          onClick={() => setActiveStage(3)}
        >
          <Scan size={16} />
          <span>Stage 3: MRI</span>
        </button>
        <button
          className={`sandbox-tab-btn ${activeStage === 4 ? 'active' : ''}`}
          onClick={() => setActiveStage(4)}
        >
          <Pill size={16} />
          <span>Stage 4: Safety</span>
        </button>
      </div>

      {/* Layout: Interactive Controls on Left, Live Inference on Right */}
      <div className="sandbox-layout">
        {/* Controls Column */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card-header">
            <h4>
              {activeStage === 1 && 'Stage 1 Parameters (Demographics & Cognitive)'}
              {activeStage === 2 && 'Stage 2 Parameters (Plasma Biomarkers Panel)'}
              {activeStage === 3 && 'Stage 3 Parameters (Structural MRI Volumetrics)'}
              {activeStage === 4 && 'Stage 4 Parameters (Amyloid & Safety Screening)'}
            </h4>
            <span className="badge badge-cyan">Live Interactive Sliders</span>
          </div>

          {/* STAGE 1 SLIDERS */}
          {activeStage === 1 && (
            <>
              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">MMSE Cognitive Score</span>
                  <strong className="font-mono" style={{ color: 'var(--text-cyan)' }}>
                    {s1.MMSCORE} / 30
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={s1.MMSCORE}
                  className="slider-input"
                  onChange={(e) => setS1({ ...s1, MMSCORE: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>0 (Severe Impairment)</span>
                  <span>24 (Cutoff)</span>
                  <span>30 (Intact)</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Patient Age</span>
                  <strong className="font-mono">{s1.AGE} years</strong>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={s1.AGE}
                  className="slider-input"
                  onChange={(e) => setS1({ ...s1, AGE: parseInt(e.target.value, 10) })}
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">APOE ε4 Allele Status</span>
                  <strong className="font-mono">{s1.APOE4} allele(s)</strong>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[0, 1, 2].map((count) => (
                    <button
                      key={count}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        background: s1.APOE4 === count ? 'var(--cyan-500)' : 'var(--bg-pill)',
                        color: s1.APOE4 === count ? '#ffffff' : 'var(--text-main)',
                      }}
                      onClick={() => setS1({ ...s1, APOE4: count })}
                    >
                      {count === 0 ? '0 (Non-carrier)' : count === 1 ? '1 (Hetero)' : '2 (Homozygous)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Education (Years)</span>
                  <strong className="font-mono">{s1.PTEDUCAT} yrs</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={s1.PTEDUCAT}
                  className="slider-input"
                  onChange={(e) => setS1({ ...s1, PTEDUCAT: parseInt(e.target.value, 10) })}
                />
              </div>
            </>
          )}

          {/* STAGE 2 SLIDERS */}
          {activeStage === 2 && (
            <>
              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Plasma p-tau217</span>
                  <strong className="font-mono" style={{ color: 'var(--text-cyan)' }}>
                    {s2.pT217_F.toFixed(2)} pg/mL
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.50"
                  step="0.01"
                  value={s2.pT217_F}
                  className="slider-input"
                  onChange={(e) => setS2({ ...s2, pT217_F: parseFloat(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>0.05 pg/mL (Normal)</span>
                  <span>0.20 (Threshold)</span>
                  <span>1.50 (High)</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Plasma Aβ42 / Aβ40 Ratio</span>
                  <strong className="font-mono">{s2.AB42_AB40_F.toFixed(3)}</strong>
                </div>
                <input
                  type="range"
                  min="0.030"
                  max="0.140"
                  step="0.001"
                  value={s2.AB42_AB40_F}
                  className="slider-input"
                  onChange={(e) => setS2({ ...s2, AB42_AB40_F: parseFloat(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>0.030 (Amyloidosis)</span>
                  <span>0.085 (Normal)</span>
                  <span>0.140</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Plasma NfL</span>
                  <strong className="font-mono">{s2.NfL_Q.toFixed(1)} pg/mL</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="0.5"
                  value={s2.NfL_Q}
                  className="slider-input"
                  onChange={(e) => setS2({ ...s2, NfL_Q: parseFloat(e.target.value) })}
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Plasma GFAP</span>
                  <strong className="font-mono">{s2.GFAP_Q.toFixed(0)} pg/mL</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="450"
                  step="5"
                  value={s2.GFAP_Q}
                  className="slider-input"
                  onChange={(e) => setS2({ ...s2, GFAP_Q: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* STAGE 3 SLIDERS */}
          {activeStage === 3 && (
            <>
              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Hippocampal Volume / ICV</span>
                  <strong className="font-mono" style={{ color: 'var(--text-cyan)' }}>
                    {s3.HIPPO_NORM.toFixed(4)}
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.0025"
                  max="0.0090"
                  step="0.0001"
                  value={s3.HIPPO_NORM}
                  className="slider-input"
                  onChange={(e) => setS3({ ...s3, HIPPO_NORM: parseFloat(e.target.value) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>0.0025 (Severe Atrophy)</span>
                  <span>0.0050 (Cutoff)</span>
                  <span>0.0090 (Preserved)</span>
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Ventricular Volume / ICV</span>
                  <strong className="font-mono">{s3.VENTRICLE_NORM.toFixed(4)}</strong>
                </div>
                <input
                  type="range"
                  min="0.010"
                  max="0.060"
                  step="0.001"
                  value={s3.VENTRICLE_NORM}
                  className="slider-input"
                  onChange={(e) => setS3({ ...s3, VENTRICLE_NORM: parseFloat(e.target.value) })}
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Cortical Thickness (mm)</span>
                  <strong className="font-mono">{s3.CORTICAL_THICKNESS_AVG.toFixed(2)} mm</strong>
                </div>
                <input
                  type="range"
                  min="1.80"
                  max="3.00"
                  step="0.02"
                  value={s3.CORTICAL_THICKNESS_AVG}
                  className="slider-input"
                  onChange={(e) => setS3({ ...s3, CORTICAL_THICKNESS_AVG: parseFloat(e.target.value) })}
                />
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">White Matter Hyperintensity (WMH)</span>
                  <strong className="font-mono">{s3.TOTAL_WMH.toFixed(1)} cm³</strong>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="15.0"
                  step="0.2"
                  value={s3.TOTAL_WMH}
                  className="slider-input"
                  onChange={(e) => setS3({ ...s3, TOTAL_WMH: parseFloat(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* STAGE 4 SLIDERS */}
          {activeStage === 4 && (
            <>
              <div className="slider-group">
                <span className="form-label">Amyloid PET Status</span>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      background: s4.AMYLOID_STATUS === 0 ? 'var(--cyan-500)' : 'var(--bg-pill)',
                      color: s4.AMYLOID_STATUS === 0 ? '#ffffff' : 'var(--text-main)',
                    }}
                    onClick={() => setS4({ ...s4, AMYLOID_STATUS: 0 })}
                  >
                    Negative (0)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      background: s4.AMYLOID_STATUS === 1 ? 'var(--cyan-500)' : 'var(--bg-pill)',
                      color: s4.AMYLOID_STATUS === 1 ? '#ffffff' : 'var(--text-main)',
                    }}
                    onClick={() => setS4({ ...s4, AMYLOID_STATUS: 1 })}
                  >
                    Positive (1)
                  </button>
                </div>
              </div>

              <div className="slider-group">
                <span className="form-label">APOE ε4 Allele Status (ARIA Risk)</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {[0, 1, 2].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        background: s4.APOE4 === c ? 'var(--cyan-500)' : 'var(--bg-pill)',
                        color: s4.APOE4 === c ? '#ffffff' : 'var(--text-main)',
                      }}
                      onClick={() => setS4({ ...s4, APOE4: c })}
                    >
                      {c === 0 ? '0' : c === 1 ? '1' : '2 (Homozygous)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="slider-group">
                <div className="slider-header">
                  <span className="form-label">Cerebral Microhemorrhages Count</span>
                  <strong className="font-mono">{s4.MICROHEM_COUNT} lesions</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={s4.MICROHEM_COUNT}
                  className="slider-input"
                  onChange={(e) => setS4({ ...s4, MICROHEM_COUNT: parseInt(e.target.value, 10) })}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>0 (Safe)</span>
                  <span>4 (Borderline)</span>
                  <span>5+ (ARIA Exclusion)</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Inference Output Column */}
        <div className="live-gauge-panel">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-card-header">
              <h4>Real-Time Model Output</h4>
              <span className="badge badge-emerald">
                {loading ? 'Evaluating...' : 'Sub-10ms Live'}
              </span>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--text-rose)', fontSize: '0.825rem' }}>
                {error}
              </div>
            )}

            {/* Stages 1-3 Model Meter */}
            {prediction && prediction.probability !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: prediction.escalated ? 'var(--success-bg)' : 'var(--bg-pill)',
                    border: `1px solid ${prediction.escalated ? 'var(--success-border)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Classification Decision
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', color: prediction.escalated ? 'var(--text-emerald)' : 'var(--text-main)' }}>
                      {prediction.escalated ? 'Escalates to Next Tier' : 'Gate Hold / Non-Escalated'}
                    </h3>
                  </div>
                  {prediction.escalated ? (
                    <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
                  ) : (
                    <XCircle size={28} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>

                <ProbabilityBar
                  probability={prediction.probability}
                  threshold={prediction.threshold}
                  escalated={prediction.escalated}
                  label={`Stage ${activeStage} Output`}
                />

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Sensitivity Analysis:</strong> Try dragging the sliders on the left to watch
                  how this stage's decision boundary reacts dynamically.
                </div>
              </div>
            )}

            {/* Stage 4 Result Card */}
            {prediction && prediction.eligibility_shortlist !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: prediction.eligibility_shortlist ? 'var(--success-bg)' : 'var(--warning-bg)',
                    border: `1px solid ${prediction.eligibility_shortlist ? 'var(--success-border)' : 'var(--warning-border)'}`,
                  }}
                >
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Therapy Shortlist Decision
                  </span>
                  <h3 style={{ margin: '0.2rem 0', color: prediction.eligibility_shortlist ? 'var(--text-emerald)' : 'var(--text-amber)' }}>
                    {prediction.eligibility_shortlist ? 'Treatment Candidate' : 'Excluded from Shortlist'}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>Amyloid Positive:</span>
                    <strong style={{ color: prediction.eligible_amyloid ? 'var(--text-emerald)' : 'var(--text-muted)' }}>
                      {prediction.eligible_amyloid ? 'Yes (+)' : 'No (–)'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span>ARIA Safety Concern:</span>
                    <strong style={{ color: prediction.aria_risk_flag ? 'var(--text-rose)' : 'var(--text-emerald)' }}>
                      {prediction.aria_risk_flag ? 'High Risk' : 'Low / Cleared'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span>Eligible Shortlist:</span>
                    <strong style={{ color: prediction.eligibility_shortlist ? 'var(--text-emerald)' : 'var(--text-amber)' }}>
                      {prediction.eligibility_shortlist ? 'Eligible' : 'Not Eligible'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}