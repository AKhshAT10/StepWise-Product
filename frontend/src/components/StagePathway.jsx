export default function StagePathway({ currentStage = 0, stageResults = null }) {
  const stages = [
    {
      number: 1,
      title: 'Basic Screening',
      description: 'Demographics, MMSE cognitive test, APOE genotype',
      icon: '📋',
    },
    {
      number: 2,
      title: 'Blood Biomarkers',
      description: 'Plasma p-tau217, AB42/40, NfL, GFAP',
      icon: '🩸',
    },
    {
      number: 3,
      title: 'MRI Analysis',
      description: 'Hippocampus, ventricles, cortical thickness, WMH',
      icon: '🧲',
    },
    {
      number: 4,
      title: 'Treatment Eligibility',
      description: 'Amyloid PET + safety screening',
      icon: '💊',
    },
  ];

  const getStageStatus = (stageNum) => {
    if (stageResults) {
      if (stageNum === 1) return stageResults.stage1?.escalated ? 'positive' : 'negative';
      if (stageNum === 2) {
        if (!stageResults.stage2) return 'skipped';
        return stageResults.stage2.escalated ? 'positive' : 'negative';
      }
      if (stageNum === 3) {
        if (!stageResults.stage3) return 'skipped';
        return stageResults.stage3.escalated ? 'positive' : 'negative';
      }
      if (stageNum === 4) {
        if (!stageResults.stage4) return 'skipped';
        return stageResults.stage4.eligibility_shortlist ? 'positive' : 'negative';
      }
    }
    if (currentStage === 0) return 'upcoming';
    if (stageNum < currentStage) return 'completed';
    if (stageNum === currentStage) return 'current';
    return 'upcoming';
  };

  return (
    <div className="stage-pathway">
      {stages.map((stage, idx) => {
        const status = getStageStatus(stage.number);
        return (
          <div key={stage.number} className="pathway-wrapper">
            <div className={`stage-card stage-${status}`}>
              <div className="stage-icon">{stage.icon}</div>
              <div className="stage-number">Stage {stage.number}</div>
              <div className="stage-title">{stage.title}</div>
              <div className="stage-description">{stage.description}</div>
              {status === 'positive' && <div className="stage-badge badge-positive">Positive →</div>}
              {status === 'negative' && <div className="stage-badge badge-negative">Negative ✕</div>}
              {status === 'skipped' && <div className="stage-badge badge-skipped">Skipped</div>}
              {status === 'current' && <div className="stage-badge badge-current">Current</div>}
            </div>
            {idx < stages.length - 1 && (
              <div className={`pathway-connector ${getStageStatus(stage.number) === 'positive' ? 'connector-active' : ''}`}>
                <span className="connector-arrow">→</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
