import { Link, useNavigate } from 'react-router-dom';
import { CLINICAL_PRESETS } from '../config/presets';
import {
  ArrowRight,
  Activity,
  Layers,
  Sliders,
  Shield,
  Dna,
  TestTube2,
  Scan,
  Pill,
  CheckCircle2,
  Sparkles,
  BarChart3,
  TrendingDown,
  Clock,
} from 'lucide-react';

const STAGES = [
  {
    number: 1,
    title: 'Cognitive & Genotype',
    modality: 'Clinic Intake',
    icon: Dna,
    color: '#06b6d4',
    features: ['Age, Education & Sex', 'MMSE Cognitive Exam', 'APOE ε4 Allele Count'],
    rule: 'Model Gate: Threshold ~0.517',
    desc: 'Rapid non-invasive stratification. Evaluates cognitive performance adjusted for demographics and genetic predisposition.',
  },
  {
    number: 2,
    title: 'Plasma Biomarkers',
    modality: 'Blood Analysis',
    icon: TestTube2,
    color: '#6366f1',
    features: ['p-tau217 Concentration', 'Aβ42 / Aβ40 Ratio', 'NfL & GFAP Panels'],
    rule: 'Model Gate: Threshold ~0.464',
    desc: 'High-sensitivity blood assay. Detects early amyloid pathology and neuroaxonal injury before structural changes appear.',
  },
  {
    number: 3,
    title: 'Structural MRI',
    modality: 'Neuroimaging',
    icon: Scan,
    color: '#a855f7',
    features: ['Hippocampal Volume / ICV', 'Ventricular Enlargement', 'Cortical Thickness & WMH'],
    rule: 'Model Gate: Threshold ~0.510',
    desc: 'Automated volumetric segmentation. Quantifies regional neurodegeneration and vascular white matter burden.',
  },
  {
    number: 4,
    title: 'Treatment & Safety',
    modality: 'Therapy Shortlist',
    icon: Pill,
    color: '#10b981',
    features: ['Amyloid PET Status', 'APOE ε4/ε4 Homozygosity', 'Cerebral Microhemorrhages'],
    rule: 'Eligibility: Amyloid+ & ARIA Safe',
    desc: 'Clinical trial and monoclonal antibody candidacy screening (Lecanemab/Donanemab criteria & ARIA risk gate).',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLaunchPreset = (preset) => {
    navigate('/assessment', { state: { presetData: preset.data, presetId: preset.id } });
  };

  return (
    <div className="dashboard-view">
      {/* Hero Section */}
      <section className="hero-wrapper">
        <div className="hero-pill-badge">
          <Sparkles size={15} />
          <span>ADNI Multi-Cohort Machine Learning Cascade</span>
        </div>

        <h1 className="hero-title">
          Precision Staged Screening for <br />
          <span className="gradient-text">Alzheimer's Disease</span> &amp; Candidacy
        </h1>

        <p className="hero-subtitle">
          An evidence-based multi-tier cascade. Progressively stratifies cognitive impairment,
          quantifies plasma p-tau217 biomarkers, evaluates structural MRI volumetrics,
          and validates anti-amyloid safety eligibility while reducing unnecessary invasive procedures by &gt;64%.
        </p>

        {/* Primary Action Buttons */}
        <div className="hero-actions-row">
          <Link to="/assessment" className="btn btn-primary btn-lg">
            <Activity size={18} />
            <span>Launch Patient Assessment</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/sandbox" className="btn btn-secondary btn-lg">
            <Sliders size={18} />
            <span>Explore Stage Lab</span>
          </Link>
        </div>

        {/* Preset Quick-Launcher Strip */}
        <div className="preset-strip">
          <span className="preset-strip-title">Instant Evaluation Presets (Click to Auto-Load &amp; Run)</span>
          <div className="preset-buttons-group">
            {CLINICAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="preset-chip-btn"
                onClick={() => handleLaunchPreset(preset)}
                title={preset.description}
              >
                <span className="preset-chip-dot" style={{ backgroundColor: preset.dotColor }} />
                <span>{preset.title}</span>
                <span className={`badge ${preset.badgeVariant}`} style={{ fontSize: '0.675rem' }}>
                  {preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Showcase Grid */}
      <section className="stats-showcase-grid">
        <div className="glass-card stat-glass-card">
          <div className="stat-icon-row">
            <span className="stat-label">Cascade Architecture</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Layers size={22} />
            </div>
          </div>
          <span className="stat-value">4-Stage</span>
          <span className="stat-desc">Sequential clinical gatekeepers filtering patients progressively.</span>
        </div>

        <div className="glass-card stat-glass-card">
          <div className="stat-icon-row">
            <span className="stat-label">Model Foundation</span>
            <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <BarChart3 size={22} />
            </div>
          </div>
          <span className="stat-value">3 XGBoost</span>
          <span className="stat-desc">Tuned ensembles cross-validated on comprehensive ADNI cohorts.</span>
        </div>

        <div className="glass-card stat-glass-card">
          <div className="stat-icon-row">
            <span className="stat-label">Burden Avoidance</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <span className="stat-value">64.2%</span>
          <span className="stat-desc">Reduction in unneeded confirmatory amyloid PET and CSF punctures.</span>
        </div>

        <div className="glass-card stat-glass-card">
          <div className="stat-icon-row">
            <span className="stat-label">Inference Engine</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
          </div>
          <span className="stat-value">&lt; 35ms</span>
          <span className="stat-desc">Ultra-responsive full pipeline execution via optimized Python backend.</span>
        </div>
      </section>

      {/* Interactive Cascade Pathway Section */}
      <section className="cascade-section-wrapper">
        <div className="section-head">
          <span className="badge badge-cyan" style={{ alignSelf: 'center' }}>
            Sequential Clinical Logic
          </span>
          <h2>The 4-Stage Precision Care Pathway</h2>
          <p>
            Patients are evaluated sequentially. Non-escalated patients exit with reassurance and
            routine follow-up recommendations, preventing unnecessary invasive interventions and healthcare costs.
          </p>
        </div>

        <div className="cascade-pipeline-grid">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.number} className="pipeline-stage-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="stage-number-badge">0{stage.number}</div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${stage.color}20`,
                      color: stage.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <span className="stage-modality-pill">{stage.modality}</span>
                  <h3 className="stage-card-title">{stage.title}</h3>
                </div>

                <p style={{ fontSize: '0.825rem', lineHeight: '1.5' }}>{stage.desc}</p>

                <ul className="stage-feature-list">
                  {stage.features.map((feat, i) => (
                    <li key={i} className="stage-feature-item">
                      <CheckCircle2 size={13} style={{ color: stage.color, flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="stage-gate-rule">
                  <span>{stage.rule}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clinical Architecture Explainer Card */}
      <section className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '1rem' }}>
              Standardized Clinical Protocol
            </span>
            <h2 style={{ marginBottom: '1rem' }}>Designed for Modern Neurological Decision Support</h2>
            <p style={{ marginBottom: '1.25rem' }}>
              Recent approvals for monoclonal anti-amyloid therapies (such as Lecanemab and Donanemab) have highlighted
              the urgent need for efficient triaging tools. Frontline memory clinics face unprecedented demand for Amyloid PET scans
              that are resource-limited and expensive.
            </p>
            <p>
              By coupling <strong>Plasma p-tau217</strong> with <strong>Automated MRI Volumetrics</strong> and an
              <strong> ARIA Safety Pre-screening Gate</strong>, PrecisionCare AD delivers definitive shortlist recommendations
              while protecting patient safety.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: 'var(--cyan-400)' }} />
              ARIA Safety Gate Protocol (Stage 4)
            </h4>
            <p style={{ fontSize: '0.85rem' }}>
              Amyloid-Related Imaging Abnormalities with edema (ARIA-E) or hemorrhage (ARIA-H) represent significant risks in
              anti-amyloid therapies:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.825rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--bg-pill)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f59e0b' }}>
                <strong>APOE ε4/ε4 Homozygotes:</strong> Carries significantly heightened relative risk for ARIA; flagged for heightened monitoring or alternative therapy consideration.
              </div>
              <div style={{ padding: '0.75rem', background: 'var(--bg-pill)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #f43f5e' }}>
                <strong>Microhemorrhage Burden (≥ 5):</strong> Pre-existing microbleeds violate standard trial safety inclusion guidelines, preventing severe hemorrhagic complications.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
