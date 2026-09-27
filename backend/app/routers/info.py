"""
Info router — health check and model information endpoints.
"""
from fastapi import APIRouter, HTTPException, status
from app.models.loader import registry
from app.models.schemas import ModelsInfoResponse, ModelInfo

router = APIRouter(tags=["info"])


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "models_loaded": registry.is_loaded
    }


@router.get("/models/info", response_model=ModelsInfoResponse)
async def models_info():
    """Get information about all loaded models, features, and thresholds."""
    if not registry.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models not loaded. Service is still starting up."
        )
    
    models = [
        ModelInfo(
            stage=1,
            features=registry.stage1_features,
            threshold=registry.stage1_threshold,
            model_type="XGBClassifier"
        ),
        ModelInfo(
            stage=2,
            features=registry.stage2_features,
            threshold=registry.stage2_threshold,
            model_type="XGBClassifier"
        ),
        ModelInfo(
            stage=3,
            features=registry.stage3_features,
            threshold=registry.stage3_threshold,
            model_type="XGBClassifier"
        ),
    ]
    
    return ModelsInfoResponse(
        models=models,
        all_loaded=registry.is_loaded
    )
