"""
Model loader — loads existing .pkl models, thresholds, and feature lists once.
Does NOT modify or retrain any models.
"""
import joblib
from pathlib import Path

# Project root is 3 levels up from this file: backend/app/models/loader.py -> project root
PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODELS_DIR = PROJECT_ROOT / "docs" / "models"


class ModelRegistry:
    """Singleton registry that holds all loaded models, thresholds, and feature lists."""

    def __init__(self):
        self._loaded = False
        self.stage1_model = None
        self.stage1_threshold = None
        self.stage1_features = None

        self.stage2_model = None
        self.stage2_threshold = None
        self.stage2_features = None

        self.stage3_model = None
        self.stage3_threshold = None
        self.stage3_features = None

    def load_all(self):
        """Load all models, thresholds, and feature lists from disk."""
        if self._loaded:
            return

        # Stage 1
        self.stage1_model = joblib.load(MODELS_DIR / "stage1_model.pkl")
        self.stage1_threshold = float(joblib.load(MODELS_DIR / "stage1_threshold.pkl"))
        self.stage1_features = list(joblib.load(MODELS_DIR / "stage1_features.pkl"))

        # Stage 2
        self.stage2_model = joblib.load(MODELS_DIR / "stage2_model.pkl")
        self.stage2_threshold = float(joblib.load(MODELS_DIR / "stage2_threshold.pkl"))
        self.stage2_features = list(joblib.load(MODELS_DIR / "stage2_features.pkl"))

        # Stage 3
        self.stage3_model = joblib.load(MODELS_DIR / "stage3_model.pkl")
        self.stage3_threshold = float(joblib.load(MODELS_DIR / "stage3_threshold.pkl"))
        self.stage3_features = list(joblib.load(MODELS_DIR / "stage3_features.pkl"))

        self._loaded = True

    @property
    def is_loaded(self):
        return self._loaded


# Global singleton instance
registry = ModelRegistry()
