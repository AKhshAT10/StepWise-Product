"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


# ---------- Stage 1 ----------

class Stage1Input(BaseModel):
    """Input features for Stage 1 model."""
    AGE: float = Field(..., ge=40, le=110, description="Patient age at first visit")
    PTEDUCAT: float = Field(..., ge=0, le=30, description="Years of education")
    MMSCORE: float = Field(..., ge=0, le=30, description="MMSE cognitive score (0-30)")
    APOE4: int = Field(..., ge=0, le=2, description="APOE e4 allele count (0, 1, or 2)")
    PTGENDER: int = Field(..., ge=0, le=1, description="Gender (0=Male, 1=Female)")


class Stage1Output(BaseModel):
    probability: float
    threshold: float
    escalated: bool
    features_used: list[str]
    escalation_reason: str = "model_threshold"


# ---------- Stage 2 ----------

class Stage2Input(BaseModel):
    """Input features for Stage 2 model (Stage 1 + blood biomarkers)."""
    AGE: float = Field(..., ge=40, le=110)
    PTEDUCAT: float = Field(..., ge=0, le=30)
    MMSCORE: float = Field(..., ge=0, le=30)
    APOE4: int = Field(..., ge=0, le=2)
    PTGENDER: int = Field(..., ge=0, le=1)
    pT217_F: float = Field(..., ge=0, description="Phospho-tau217 (plasma)")
    AB42_AB40_F: float = Field(..., ge=0, description="Amyloid-beta 42/40 ratio (plasma)")
    NfL_Q: float = Field(..., ge=0, description="Neurofilament light chain (plasma)")
    GFAP_Q: float = Field(..., ge=0, description="GFAP (plasma)")


class Stage2Output(BaseModel):
    """Output from Stage 2 prediction."""
    stage: int = 2
    probability: float
    threshold: float
    escalated: bool
    features_used: list[str]


# ---------- Stage 3 ----------

class Stage3Input(BaseModel):
    """Input features for Stage 3 model (trimmed: AGE + biomarkers + MRI)."""
    AGE: float = Field(..., ge=40, le=110)
    pT217_F: float = Field(..., ge=0)
    NfL_Q: float = Field(..., ge=0)
    GFAP_Q: float = Field(..., ge=0)
    HIPPO_NORM: float = Field(..., ge=0, description="Hippocampal volume / ICV")
    VENTRICLE_NORM: float = Field(..., ge=0, description="Ventricular volume / ICV")
    CORTICAL_THICKNESS_AVG: float = Field(..., ge=0, description="Average cortical thickness")
    TOTAL_WMH: float = Field(..., ge=0, description="White matter hyperintensity volume")


class Stage3Output(BaseModel):
    """Output from Stage 3 prediction."""
    stage: int = 3
    probability: float
    threshold: float
    escalated: bool
    features_used: list[str]


# ---------- Full Pipeline ----------

class FullPipelineInput(BaseModel):
    """All features needed to run the full cascade pipeline."""
    # Stage 1
    AGE: float = Field(..., ge=40, le=110)
    PTEDUCAT: float = Field(..., ge=0, le=30)
    MMSCORE: float = Field(..., ge=0, le=30)
    APOE4: int = Field(..., ge=0, le=2)
    PTGENDER: int = Field(..., ge=0, le=1)
    # Stage 2
    pT217_F: float = Field(..., ge=0)
    AB42_AB40_F: float = Field(..., ge=0)
    NfL_Q: float = Field(..., ge=0)
    GFAP_Q: float = Field(..., ge=0)
    # Stage 3
    HIPPO_NORM: float = Field(..., ge=0)
    VENTRICLE_NORM: float = Field(..., ge=0)
    CORTICAL_THICKNESS_AVG: float = Field(..., ge=0)
    TOTAL_WMH: float = Field(..., ge=0)
    # Stage 4
    AMYLOID_STATUS: int = Field(..., ge=0, le=1, description="Amyloid PET status (0=negative, 1=positive)")
    MICROHEM_COUNT: int = Field(..., ge=0, le=8, description="Microhemorrhage count (0-8)")


class Stage4Result(BaseModel):
    """Stage 4 eligibility result."""
    eligible_amyloid: bool = Field(..., description="Whether patient is amyloid-positive")
    aria_risk_flag: bool = Field(..., description="Whether patient has ARIA safety concern")
    eligibility_shortlist: bool = Field(..., description="Whether patient is eligible for treatment shortlist")


class FullPipelineOutput(BaseModel):
    """Output from full pipeline run."""
    stage1: Stage1Output
    stage2: Optional[Stage2Output] = None
    stage3: Optional[Stage3Output] = None
    stage4: Optional[Stage4Result] = None
    final_recommendation: str = Field(..., description="Human-readable final recommendation")


# ---------- Stage 4 Standalone ----------

class Stage4Input(BaseModel):
    """Input for standalone Stage 4 eligibility check."""
    AMYLOID_STATUS: int = Field(..., ge=0, le=1, description="Amyloid PET status (0=negative, 1=positive)")
    APOE4: int = Field(..., ge=0, le=2, description="APOE e4 allele count")
    MICROHEM_COUNT: int = Field(..., ge=0, le=8, description="Microhemorrhage count (0-8)")


# ---------- Model Info ----------

class ModelInfo(BaseModel):
    """Information about a single model."""
    stage: int
    features: list[str]
    threshold: float
    model_type: str


class ModelsInfoResponse(BaseModel):
    """Response containing info about all loaded models."""
    models: list[ModelInfo]
    all_loaded: bool
