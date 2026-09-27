"""
Prediction router — endpoints for running model predictions.
"""
from fastapi import APIRouter, HTTPException, status
from app.models.loader import registry
from app.models.schemas import (
    Stage1Input, Stage2Input, Stage3Input, FullPipelineInput,
    Stage1Output, Stage2Output, Stage3Output, FullPipelineOutput,
    Stage4Input, Stage4Result
)
from app.services.pipeline import (
    _predict_stage1, _predict_stage2, _predict_stage3,
    run_full_pipeline, _check_stage4_eligibility
)

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.post("/stage1", response_model=Stage1Output)
async def predict_stage1(input_data: Stage1Input):
    """Run Stage 1 prediction (demographics + MMSE + APOE)."""
    if not registry.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is still starting up."
        )
    try:
        return _predict_stage1(input_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@router.post("/stage2", response_model=Stage2Output)
async def predict_stage2(input_data: Stage2Input):
    """Run Stage 2 prediction (Stage 1 features + blood biomarkers)."""
    if not registry.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is still starting up."
        )
    try:
        return _predict_stage2(input_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@router.post("/stage3", response_model=Stage3Output)
async def predict_stage3(input_data: Stage3Input):
    """Run Stage 3 prediction (trimmed features + MRI)."""
    if not registry.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is still starting up."
        )
    try:
        return _predict_stage3(input_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@router.post("/full-pipeline", response_model=FullPipelineOutput)
async def predict_full_pipeline(input_data: FullPipelineInput):
    """
    Run the full cascade pipeline:
    Stage 1 -> (if escalated) Stage 2 -> (if escalated) Stage 3 -> Stage 4 eligibility
    """
    if not registry.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is still starting up."
        )
    try:
        return run_full_pipeline(input_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline error: {str(e)}"
        )


@router.post("/stage4/eligibility", response_model=Stage4Result)
async def check_stage4_eligibility(input_data: Stage4Input):
    """
    Standalone Stage 4 eligibility check.
    Follows the exact logic from the existing prepare_stage4_shortlist.py.
    """
    try:
        return _check_stage4_eligibility(
            amyloid_status=input_data.AMYLOID_STATUS,
            apoe4=input_data.APOE4,
            microhem_count=input_data.MICROHEM_COUNT
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Eligibility check error: {str(e)}"
        )
