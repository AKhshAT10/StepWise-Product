import ProbabilityBar from './ProbabilityBar';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Dna,
  TestTube2,
  Scan,
  Pill,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

const STAGE_CONFIGS = {
  1: {
    title: 'Stage 1 — Cognitive & Genotype Screening',
    modality: 'Clinic Intake',
    icon: Dna,
    desc: 'Demographic baseline, MMSE score, and APOE ε4 allele status.',
  },
  2: {
    title: 'Stage 2 — Plasma Blood Biomarkers',
    modality: 'Blood Assay',
    icon: TestTube2,
    desc: 'High-precision plasma phospho-tau217, Aβ42/40 ratio, NfL, and GFAP.',
  },
  3: {
    title: 'Stage 3 — Structural MRI Volumetrics',
    modality: 'Neuroimaging',
    icon: Scan,
    desc: 'Automated normalized hippocampal volume, ventriculomegaly, and cortical thickness.',
  },
  4: {
    title: 'Stage 4 — Amyloid PET & ARIA Safety Shortlist',
    modality: 'Treatment Candidacy',
    icon: Pill,
    desc: 'Amyloid status confirmation and microhemorrhage safety screening.',
  },
};

export default function StageTimeline({ result }) {
  const { stage1, stage2, stage3, stage4 } = result;

  const stageData = [
    { number: 1, data: stage1 },
    { number: 2, data: stage2 },
    { number: 3, data: stage3 },
    { number: 4, data: stage4 },
  ];

  // Determine where the cascade stopped
  let stopStage = 4;
  if (stage1 && !stage1.escalated) stopStage = 1;
  else if (stage2 && !stage2.escalated) stopStage = 2;
  else if (stage3 && !stage3.escalated) stopStage = 3;

  return (
    <div className="cascade-results-flow">
      {stageData.map(({ number, data }) => {
        const config = STAGE_CONFIGS[number];
        const Icon = config.icon;

        // Stage not reached
        if (!data) {
          return (
            <div key={number} className="cascade-result-card skipped">
              <div className="result-card-header">
                <div className="result-stage-ident">
                  <div
                    className="result-stage-pill"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    0{number}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-muted)' }}>
                      {config.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                      }}
                    >
                      {config.modality}
                    </span>
                  </div>
                </div>

                <span
                  className="badge"
                  style={{
                    background: 'var(--bg-pill)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <MinusCircle size={13} />
                  Procedure Spared (Not Reached)
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-dim)',
                  margin: 0,
                }}
              >
                Patient was filtered out at an earlier gate. Upstream
                non-escalation eliminated the clinical need, cost, and burden
                of this {config.modality.toLowerCase()} procedure.
              </p>
            </div>
          );
        }

        // Stage 4 (Eligibility Check)
        if (number === 4) {
          const isEligible = data.eligibility_shortlist;
          const isAriaRisk = data.aria_risk_flag;

          return (
            <div
              key={number}
              className={`cascade-result-card ${
                isEligible
                  ? 'passed'
                  : isAriaRisk
                  ? 'stopped'
                  : 'stopped'
              }`}
            >
              <div className="result-card-header">
                <div className="result-stage-ident">
                  <div
                    className="result-stage-pill"
                    style={{
                      background: isEligible
                        ? 'rgba(16, 185, 129, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                      color: isEligible
                        ? 'var(--text-emerald)'
                        : 'var(--text-amber)',
                      borderColor: isEligible
                        ? 'var(--success-border)'
                        : 'var(--warning-border)',
                    }}
                  >
                    04
                  </div>

                  <div>
                    <h4>{config.title}</h4>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-cyan)',
                      }}
                    >
                      {config.modality} • Final Gate
                    </span>
                  </div>
                </div>

                <span
                  className={`badge ${
                    isEligible
                      ? 'badge-emerald'
                      : isAriaRisk
                      ? 'badge-amber'
                      : 'badge-rose'
                  }`}
                >
                  {isEligible ? (
                    <>
                      <CheckCircle2 size={13} />
                      Treatment Shortlist Eligible
                    </>
                  ) : isAriaRisk ? (
                    <>
                      <AlertTriangle size={13} />
                      ARIA Safety Exclusion
                    </>
                  ) : (
                    <>
                      <XCircle size={13} />
                      Amyloid Negative
                    </>
                  )}
                </span>
              </div>

              {/* 3-Column Matrix */}
              <div className="eligibility-matrix-grid">
                <div className="matrix-card">
                  <span className="matrix-title">
                    Amyloid PET Confirmation
                  </span>

                  <span
                    className="matrix-val"
                    style={{
                      color: data.eligible_amyloid
                        ? 'var(--text-emerald)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {data.eligible_amyloid ? 'Positive (+)' : 'Negative (–)'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Cortical amyloid plaque pathology confirmed
                  </span>
                </div>

                <div className="matrix-card">
                  <span className="matrix-title">ARIA Safety Risk</span>

                  <span
                    className="matrix-val"
                    style={{
                      color: data.aria_risk_flag
                        ? 'var(--text-rose)'
                        : 'var(--text-emerald)',
                    }}
                  >
                    {data.aria_risk_flag
                      ? 'High Risk Flagged'
                      : 'Low Risk Cleared'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {data.aria_risk_flag
                      ? 'Elevated risk of ARIA-E edema or ARIA-H microhemorrhage'
                      : 'Acceptable baseline microhemorrhage & genotype safety profile'}
                  </span>
                </div>

                <div className="matrix-card">
                  <span className="matrix-title">Therapy Shortlist</span>

                  <span
                    className="matrix-val"
                    style={{
                      color: data.eligibility_shortlist
                        ? 'var(--text-emerald)'
                        : 'var(--text-amber)',
                    }}
                  >
                    {data.eligibility_shortlist ? 'Shortlisted' : 'Excluded'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {data.eligibility_shortlist
                      ? 'Eligible candidate for monoclonal anti-amyloid therapy'
                      : 'Does not satisfy dual criteria of amyloid presence + safety margin'}
                  </span>
                </div>
              </div>
            </div>
          );
        }

        // Stages 1, 2, 3 (ML Model Predictions)
        const isEscalated = data.escalated;
        const isStopPoint = number === stopStage && !isEscalated;

        return (
          <div
            key={number}
            className={`cascade-result-card ${
              isEscalated
                ? 'passed'
                : isStopPoint
                ? 'stopped'
                : 'stopped'
            }`}
          >
            <div className="result-card-header">
              <div className="result-stage-ident">
                <div
                  className="result-stage-pill"
                  style={{
                    background: isEscalated
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(6, 182, 212, 0.1)',
                    color: isEscalated
                      ? 'var(--text-emerald)'
                      : 'var(--text-cyan)',
                  }}
                >
                  0{number}
                </div>

                <div>
                  <h4>{config.title}</h4>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-cyan)',
                    }}
                  >
                    {config.modality}
                  </span>
                </div>
              </div>

              <span
                className={`badge ${
                  isEscalated ? 'badge-emerald' : 'badge-cyan'
                }`}
              >
                {isEscalated ? (
                  <>
                    <CheckCircle2 size={13} />
                    Escalated to Stage {number + 1}
                  </>
                ) : (
                  <>
                    <XCircle size={13} />
                    Gate Hold / Non-Escalated
                  </>
                )}
              </span>
            </div>

            {/* Model Probability Bar */}
            <ProbabilityBar
              probability={data.probability}
              threshold={data.threshold}
              escalated={data.escalated}
              label={`Stage ${number} XGBoost Classifier`}
            />

            {/* Features Used Pill Strip */}
            {data.features_used && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  Features Evaluated:
                </span>

                {data.features_used.map((feat) => (
                  <span key={feat} className="badge-tag">
                    {feat}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

