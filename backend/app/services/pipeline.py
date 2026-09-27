"""
Pipeline service — runs the full cascade prediction logic.
Follows the exact same escalation rules as the existing project.
"""
import numpy as np
from typing import Optional
from app.models.loader import registry
from app.models.schemas import (
    Stage1Input, Stage2Input, Stage3Input, FullPipelineInput,
    Stage1Output, Stage2Output, Stage3Output, Stage4Result, FullPipelineOutput
)


def _predict_stage1(input_data: Stage1Input) -> Stage1Output:
    """Run Stage 1 prediction."""
    features = registry.stage1_features
    values = [[getattr(input_data, f) for f in features]]
    prob = float(registry.stage1_model.predict_proba(values)[0, 1])
    threshold = registry.stage1_threshold

    # Clinical safety-net override: MMSE < 24 is an established cognitive
    # impairment cutoff. Escalate regardless of the model's probability,
    # even if the ML score alone doesn't cross the learned threshold.
    mmse_override = input_data.MMSCORE < 24
    model_escalates = prob >= threshold
    escalated = model_escalates or mmse_override

    if mmse_override and not model_escalates:
        reason = "mmse_clinical_override"
    else:
        reason = "model_threshold"

    return Stage1Output(
        probability=prob,
        threshold=threshold,
        escalated=escalated,
        features_used=features,
        escalation_reason=reason
    )


def _predict_stage2(input_data: Stage2Input) -> Stage2Output:
    """Run Stage 2 prediction."""
    features = registry.stage2_features
    values = [[getattr(input_data, f) for f in features]]
    prob = float(registry.stage2_model.predict_proba(values)[0, 1])
    threshold = registry.stage2_threshold
    escalated = prob >= threshold
    return Stage2Output(
        probability=prob,
        threshold=threshold,
        escalated=escalated,
        features_used=features
    )


def _predict_stage3(input_data: Stage3Input) -> Stage3Output:
    """Run Stage 3 prediction."""
    features = registry.stage3_features
    # MMSE is already inverted in the trained model (30 - MMSCORE)
    values = [[getattr(input_data, f) for f in features]]
    prob = float(registry.stage3_model.predict_proba(values)[0, 1])
    threshold = registry.stage3_threshold
    escalated = prob >= threshold
    return Stage3Output(
        probability=prob,
        threshold=threshold,
        escalated=escalated,
        features_used=features
    )


def _check_stage4_eligibility(
    amyloid_status: int,
    apoe4: int,
    microhem_count: int
) -> Stage4Result:
    """
    Stage 4 eligibility check — follows EXACT logic from prepare_stage4_shortlist.py:
    
    eligible_amyloid = AMYLOID_STATUS == 1
    aria_risk_flag = (APOE4 == 2) OR (MICROHEM_COUNT >= 5)
    eligibility_shortlist = eligible_amyloid AND NOT aria_risk_flag
    """
    eligible_amyloid = amyloid_status == 1
    aria_risk_flag = (apoe4 == 2) or (microhem_count >= 5)
    eligibility_shortlist = eligible_amyloid and not aria_risk_flag
    
    return Stage4Result(
        eligible_amyloid=eligible_amyloid,
        aria_risk_flag=aria_risk_flag,
        eligibility_shortlist=eligibility_shortlist
    )


def run_full_pipeline(input_data: FullPipelineInput) -> FullPipelineOutput:
    """
    Run the full cascade pipeline:
    Stage 1 -> (if escalated) Stage 2 -> (if escalated) Stage 3 -> Stage 4 eligibility
    """
    # Stage 1
    stage1_input = Stage1Input(
        AGE=input_data.AGE,
        PTEDUCAT=input_data.PTEDUCAT,
        MMSCORE=input_data.MMSCORE,
        APOE4=input_data.APOE4,
        PTGENDER=input_data.PTGENDER
    )
    stage1_result = _predict_stage1(stage1_input)
    
    stage2_result: Optional[Stage2Output] = None
    stage3_result: Optional[Stage3Output] = None
    stage4_result: Optional[Stage4Result] = None
    
    if stage1_result.escalated:
        # Stage 2
        stage2_input = Stage2Input(
            AGE=input_data.AGE,
            PTEDUCAT=input_data.PTEDUCAT,
            MMSCORE=input_data.MMSCORE,
            APOE4=input_data.APOE4,
            PTGENDER=input_data.PTGENDER,
            pT217_F=input_data.pT217_F,
            AB42_AB40_F=input_data.AB42_AB40_F,
            NfL_Q=input_data.NfL_Q,
            GFAP_Q=input_data.GFAP_Q
        )
        stage2_result = _predict_stage2(stage2_input)
        
        if stage2_result.escalated:
            # Stage 3
            stage3_input = Stage3Input(
                AGE=input_data.AGE,
                pT217_F=input_data.pT217_F,
                NfL_Q=input_data.NfL_Q,
                GFAP_Q=input_data.GFAP_Q,
                HIPPO_NORM=input_data.HIPPO_NORM,
                VENTRICLE_NORM=input_data.VENTRICLE_NORM,
                CORTICAL_THICKNESS_AVG=input_data.CORTICAL_THICKNESS_AVG,
                TOTAL_WMH=input_data.TOTAL_WMH
            )
            stage3_result = _predict_stage3(stage3_input)
            
            # Stage 4 — only evaluated if patient escalated through Stage 3
            if stage3_result.escalated:
                stage4_result = _check_stage4_eligibility(
                    amyloid_status=input_data.AMYLOID_STATUS,
                    apoe4=input_data.APOE4,
                    microhem_count=input_data.MICROHEM_COUNT
                )
    
    # Build final recommendation
    if not stage1_result.escalated:
        final_rec = "Low risk — no further testing recommended at this time."
    elif stage2_result and not stage2_result.escalated:
        final_rec = "Stage 1 positive but Stage 2 negative — consider routine follow-up."
    elif stage3_result and not stage3_result.escalated:
        final_rec = "Stage 2 positive but Stage 3 negative — continue monitoring."
    elif stage4_result:
        if stage4_result.eligibility_shortlist:
            final_rec = "Patient is eligible for anti-amyloid treatment shortlist."
        elif stage4_result.aria_risk_flag:
            final_rec = "Patient has ARIA safety concerns — not eligible for treatment shortlist."
        else:
            final_rec = "Patient is amyloid-negative — not eligible for anti-amyloid treatment."
    else:
        final_rec = "Pipeline incomplete — review results."
    
    return FullPipelineOutput(
        stage1=stage1_result,
        stage2=stage2_result,
        stage3=stage3_result,
        stage4=stage4_result,
        final_recommendation=final_rec
    )