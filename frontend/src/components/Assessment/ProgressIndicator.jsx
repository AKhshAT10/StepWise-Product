import { Check, Dna, TestTube2, Scan, Pill } from 'lucide-react';

const STAGES = [
  { number: 1, label: 'Cognitive & Genotype', desc: 'MMSE & APOE', icon: Dna },
  { number: 2, label: 'Blood Biomarkers', desc: 'p-tau217 & Aβ', icon: TestTube2 },
  { number: 3, label: 'MRI Volumetrics', desc: 'Hippo & Ventricles', icon: Scan },
  { number: 4, label: 'Safety & Candidacy', desc: 'Amyloid & ARIA', icon: Pill },
];

export default function ProgressIndicator({ currentStage, maxCompletedStage, onStageClick }) {
  return (
    <div className="stepper-nav" role="navigation" aria-label="Assessment progress">
      {STAGES.map((stage, idx) => {
        const isCompleted = stage.number < currentStage || (stage.number <= maxCompletedStage && stage.number !== currentStage);
        const isActive = stage.number === currentStage;
        const isAccessible = stage.number <= maxCompletedStage || stage.number <= currentStage;

        return (
          <div key={stage.number} style={{ display: 'contents' }}>
            <button
              type="button"
              className={`step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => isAccessible && onStageClick(stage.number)}
              disabled={!isAccessible}
              style={{ cursor: isAccessible ? 'pointer' : 'default' }}
            >
              <div className="step-node-bubble">
                {isCompleted ? <Check size={18} strokeWidth={2.5} /> : `0${stage.number}`}
              </div>
              <div className="step-node-info">
                <span className="step-node-label">{stage.label}</span>
                <span className="step-node-desc">{stage.desc}</span>
              </div>
            </button>

            {idx < STAGES.length - 1 && (
              <div
                className={`step-connector-line ${
                  stage.number < currentStage ? 'completed' : stage.number === currentStage ? 'active' : ''
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
