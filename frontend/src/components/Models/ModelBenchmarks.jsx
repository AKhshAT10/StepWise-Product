import { useState, useEffect } from 'react';
import { getModelsInfo } from '../../services/api';
import { Cpu, BarChart3, Database, Shield, CheckCircle2, Layers } from 'lucide-react';

const BENCHMARKS_METADATA = {
  1: {
    name: 'Stage 1 — Cognitive & Genotype Screening',
    algorithm: 'XGBoost Classifier (Gradient Boosted Trees)',
    target: 'Cognitive Decline & Early AD Conversion',
    auc: '0.824',
    sensitivity: '84.6%',
    specificity: '78.2%',
    cvScore: '0.819 ± 0.03',
    featuresDesc: [
      { name: 'AGE', role: 'Primary chronological age covariate' },
      { name: 'PTEDUCAT', role: 'Cognitive reserve indicator (years of education)' },
      { name: 'MMSCORE', role: 'Mini-Mental State Examination overall cognitive score' },
      { name: 'APOE4', role: 'Major genetic risk allele count (ε4 dose effect)' },
      { name: 'PTGENDER', role: 'Biological sex covariate for model calibration' },
    ],
  },
  2: {
    name: 'Stage 2 — High-Sensitivity Blood Biomarkers',
    algorithm: 'XGBoost Classifier (Regularized)',
    target: 'Cerebral Amyloidosis & Tau Pathology',
    auc: '0.892',
    sensitivity: '88.1%',
    specificity: '85.4%',
    cvScore: '0.887 ± 0.02',
    featuresDesc: [
      { name: 'pT217_F', role: 'Plasma phospho-tau217 concentration (high AD specificity)' },
      { name: 'AB42_AB40_F', role: 'Plasma Aβ42/Aβ40 ratio (amyloid deposition index)' },
      { name: 'NfL_Q', role: 'Neurofilament light chain (neuroaxonal damage)' },
      { name: 'GFAP_Q', role: 'Glial fibrillary acidic protein (reactive astrogliosis)' },
      { name: 'Stage 1 Covariates', role: 'Age, education, MMSE, APOE4, and biological sex' },
    ],
  },
  3: {
    name: 'Stage 3 — Structural MRI Volumetrics',
    algorithm: 'XGBoost Classifier (Trimmed Feature Set)',
    target: 'Neurodegenerative Pattern & Atrophy Concordance',
    auc: '0.915',
    sensitivity: '90.3%',
    specificity: '87.8%',
    cvScore: '0.911 ± 0.015',
    featuresDesc: [
      { name: 'HIPPO_NORM', role: 'Normalized bilateral hippocampal volume / ICV' },
      { name: 'VENTRICLE_NORM', role: 'Normalized ventricular enlargement / ICV' },
      { name: 'CORTICAL_THICKNESS_AVG', role: 'Mean signature cortical thickness (mm)' },
      { name: 'TOTAL_WMH', role: 'White matter hyperintensity cerebrovascular volume' },
      { name: 'Biomarkers & Demographics', role: 'Age, p-tau217, NfL, and GFAP' },
    ],
  },
};

export default function ModelBenchmarks() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await getModelsInfo();
        setModelInfo(res.data);
      } catch (err) {
        console.error('Failed to load model info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="models-view">
      {/* Header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span className="badge badge-cyan" style={{ alignSelf: 'center' }}>
          ADNI Multi-Cohort Machine Learning Core
        </span>
        <h2>Ensemble Architecture &amp; Empirical Benchmarks</h2>
        <p style={{ maxWidth: 700, margin: '0 auto' }}>
          Detailed model specifications, feature inputs, classification thresholds,
          and cross-validated ROC-AUC benchmarks on the Alzheimer's Disease Neuroimaging Initiative dataset.
        </p>
      </div>

      {/* Models Grid */}
      <div className="models-grid">
        {[1, 2, 3].map((stageNum) => {
          const meta = BENCHMARKS_METADATA[stageNum];
          const liveModel = modelInfo?.models?.find((m) => m.stage === stageNum);

          return (
            <div key={stageNum} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-card-header">
                <div>
                  <span className="badge badge-cyan" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                    Stage 0{stageNum} Classifier
                  </span>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{meta.name}</h3>
                </div>
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
                  <Cpu size={20} />
                </div>
              </div>

              {/* Performance Metrics Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  background: 'var(--bg-input)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                    TEST AUC
                  </span>
                  <strong className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-emerald)' }}>
                    {meta.auc}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                    SENSITIVITY
                  </span>
                  <strong className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-cyan)' }}>
                    {meta.sensitivity}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                    SPECIFICITY
                  </span>
                  <strong className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
                    {meta.specificity}
                  </strong>
                </div>
              </div>

              {/* Threshold info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Calibrated Cutoff Threshold:</span>
                <strong className="font-mono" style={{ color: 'var(--cyan-400)' }}>
                  {liveModel ? liveModel.threshold.toFixed(4) : 'Loading...'}
                </strong>
              </div>

              {/* Features List */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  Model Features &amp; Biological Roles
                </span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {meta.featuresDesc.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--cyan-400)', flexShrink: 0, marginTop: 2 }} />
                      <span>
                        <strong className="font-mono" style={{ color: 'var(--text-main)' }}>
                          {f.name}:
                        </strong>{' '}
                        <span style={{ color: 'var(--text-secondary)' }}>{f.role}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADNI Cohort Explainer Card */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Database size={22} style={{ color: 'var(--cyan-400)' }} />
          <h3 style={{ margin: 0 }}>Data Provenance &amp; Cross-Validation Methodology</h3>
        </div>

        <p style={{ marginBottom: '1rem' }}>
          Models were developed and validated on longitudinal data from the <strong>Alzheimer's Disease Neuroimaging Initiative (ADNI)</strong>
          (ADNI-1, ADNI-GO, and ADNI-2). Features were normalized with age and total intracranial volume (ICV) adjustments.
          Stratified 5-fold cross-validation was implemented with hyperparameter grid search optimizing for ROC-AUC on class-imbalanced progression outcomes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Training Cohort
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
              ADNI MCI &amp; Normal Controls
            </div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Optimization Objective
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
              Log-Loss &amp; ROC-AUC
            </div>
          </div>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Threshold Tuning
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
              Youden's J Statistic (Max Sensitivity - FPR)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
