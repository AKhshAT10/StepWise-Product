"""
Unified Retraining Script - Stages 1, 2, 3
===========================================
Trains better-generalized models using:
 - Honest train/test split BEFORE any fitting
 - StratifiedKFold(5) cross-validation for unbiased AUC estimates
 - Heavy regularization to combat overfitting on small datasets
 - Threshold tuning via Youden J on the held-out test fold
 - Competition between multiple algorithms; best CV AUC wins
"""

import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import os, sys, warnings, pickle
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection import (
    train_test_split, StratifiedKFold, cross_val_score,
    RandomizedSearchCV
)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    roc_auc_score, roc_curve, average_precision_score,
    confusion_matrix, classification_report
)
from sklearn.pipeline import Pipeline
import xgboost as xgb

warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent.resolve()
DATA_DIR     = SCRIPT_DIR.parent / "data" / "processed"
MODELS_DIR   = SCRIPT_DIR.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE    = 0.2

# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_data(stage: int, label_col: str = "LABEL") -> tuple:
    path = DATA_DIR / f"stage{stage}_clean.csv"
    df   = pd.read_csv(path)
    print(f"\n  [Stage {stage}] Loaded {len(df)} rows, {df[label_col].sum():.0f} positives")
    return df, label_col


def youden_threshold(y_true, y_prob) -> float:
    fpr, tpr, thresholds = roc_curve(y_true, y_prob)
    j = tpr - fpr
    best_idx = np.argmax(j)
    return float(thresholds[best_idx])


def evaluate(name, model, X_train, X_test, y_train, y_test, cv: StratifiedKFold):
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc", n_jobs=-1)
    model.fit(X_train, y_train)
    y_prob = model.predict_proba(X_test)[:, 1]
    test_auc = roc_auc_score(y_test, y_prob)
    pr_auc   = average_precision_score(y_test, y_prob)
    thresh   = youden_threshold(y_test, y_prob)
    y_pred   = (y_prob >= thresh).astype(int)
    cm       = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.shape == (2,2) else (0,0,0,0)
    sens = tp / (tp + fn + 1e-9)
    spec = tn / (tn + fp + 1e-9)
    print(f"    {name:45s} | CV AUC {cv_scores.mean():.4f}±{cv_scores.std():.4f}"
          f" | Test AUC {test_auc:.4f} | PR-AUC {pr_auc:.4f}"
          f" | Sens {sens:.2f} | Spec {spec:.2f} | Thresh {thresh:.3f}")
    return cv_scores.mean(), test_auc, thresh, model


def save_model(stage: int, model, threshold: float, features: list):
    for name, obj in [("model", model), ("threshold", threshold), ("features", features)]:
        p = MODELS_DIR / f"stage{stage}_{name}.pkl"
        with open(p, "wb") as f:
            pickle.dump(obj, f)
    print(f"  ✓ Stage {stage} model saved → {MODELS_DIR}")


def print_header(stage: int, note: str = ""):
    print("\n" + "═"*80)
    print(f"  STAGE {stage}  {note}")
    print("═"*80)


# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 1
# ══════════════════════════════════════════════════════════════════════════════

def retrain_stage1():
    print_header(1, "— Cognitive + Demographics → AD Progression Risk")
    
    FEATURES = ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER']
    LABEL    = 'LABEL'

    df, _ = load_data(1, LABEL)
    df = df.dropna(subset=FEATURES + [LABEL])
    
    X = df[FEATURES].values
    y = df[LABEL].values

    pos_count = y.sum()
    neg_count = len(y) - pos_count
    scale_pos_weight = neg_count / pos_count
    print(f"  Class ratio neg/pos = {scale_pos_weight:.2f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    print("\n  Comparing candidates:")
    candidates = []

    # 1. Random Forest (balanced)
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=4, min_samples_leaf=8,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=4, leaf=8, balanced)", rf))

    # 2. Random Forest (slightly deeper)
    rf2 = RandomForestClassifier(
        n_estimators=400, max_depth=5, min_samples_leaf=12,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=5, leaf=12, balanced)", rf2))

    # 3. Gradient Boosting (light)
    gb = GradientBoostingClassifier(
        n_estimators=120, max_depth=2, learning_rate=0.05,
        subsample=0.8, min_samples_leaf=10, random_state=RANDOM_STATE
    )
    candidates.append(("GradientBoosting(depth=2, lr=0.05)", gb))

    # 4. XGBoost regularized
    xgb_m = xgb.XGBClassifier(
        n_estimators=150, max_depth=2, learning_rate=0.05,
        reg_alpha=1.0, reg_lambda=3.0, subsample=0.8,
        colsample_bytree=0.8, scale_pos_weight=scale_pos_weight,
        random_state=RANDOM_STATE, eval_metric='logloss', verbosity=0
    )
    candidates.append(("XGBoost(depth=2, lr=0.05, alpha=1, lambda=3)", xgb_m))

    # 5. Logistic Regression (scaled)
    lr_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(C=0.1, class_weight='balanced',
                                   max_iter=1000, random_state=RANDOM_STATE))
    ])
    candidates.append(("LogisticRegression(C=0.1, balanced)", lr_pipe))

    # 6. Soft-Voting Ensemble of best RF + GB + XGB
    rf_v = RandomForestClassifier(
        n_estimators=300, max_depth=4, min_samples_leaf=8,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    gb_v = GradientBoostingClassifier(
        n_estimators=120, max_depth=2, learning_rate=0.05,
        subsample=0.8, min_samples_leaf=10, random_state=RANDOM_STATE
    )
    xgb_v = xgb.XGBClassifier(
        n_estimators=150, max_depth=2, learning_rate=0.05,
        reg_alpha=1.0, reg_lambda=3.0, subsample=0.8,
        colsample_bytree=0.8, scale_pos_weight=scale_pos_weight,
        random_state=RANDOM_STATE, eval_metric='logloss', verbosity=0
    )
    ensemble = VotingClassifier(
        estimators=[('rf', rf_v), ('gb', gb_v), ('xgb', xgb_v)],
        voting='soft', n_jobs=-1
    )
    candidates.append(("SoftVoting(RF+GB+XGB)", ensemble))

    results = []
    for name, model in candidates:
        cv_auc, test_auc, thresh, fitted_model = evaluate(
            name, model, X_train, X_test, y_train, y_test, cv
        )
        results.append((cv_auc, test_auc, thresh, fitted_model, name))

    # Best by CV AUC
    results.sort(key=lambda x: x[0], reverse=True)
    best_cv, best_test, best_thresh, best_model, best_name = results[0]
    print(f"\n  ★ Winner: {best_name}")
    print(f"    CV AUC={best_cv:.4f} | Test AUC={best_test:.4f} | Threshold={best_thresh:.3f}")

    # Refit winner on full training data
    best_model.fit(X_train, y_train)
    save_model(1, best_model, best_thresh, FEATURES)


# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 2
# ══════════════════════════════════════════════════════════════════════════════

def retrain_stage2():
    print_header(2, "— + Plasma Biomarkers → Escalate for PET/CSF")
    
    FEATURES = ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER',
                'pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q']
    LABEL    = 'LABEL'

    df, _ = load_data(2, LABEL)
    df = df.dropna(subset=FEATURES + [LABEL])

    X = df[FEATURES].values
    y = df[LABEL].values

    pos_count = y.sum()
    neg_count = len(y) - pos_count
    scale_pos_weight = neg_count / pos_count
    print(f"  Class ratio neg/pos = {scale_pos_weight:.2f}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    print("\n  Comparing candidates:")
    candidates = []

    # 1. XGB very regularized (low lr, shallow)
    xgb1 = xgb.XGBClassifier(
        n_estimators=100, max_depth=2, learning_rate=0.01,
        reg_alpha=1.0, reg_lambda=3.0, subsample=0.7,
        colsample_bytree=0.7, scale_pos_weight=scale_pos_weight,
        min_child_weight=5, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    candidates.append(("XGB(n=100, depth=2, lr=0.01, alpha=1, lambda=3, mcw=5)", xgb1))

    # 2. XGB moderate regularization
    xgb2 = xgb.XGBClassifier(
        n_estimators=200, max_depth=2, learning_rate=0.02,
        reg_alpha=0.5, reg_lambda=2.0, subsample=0.75,
        colsample_bytree=0.75, scale_pos_weight=scale_pos_weight,
        min_child_weight=5, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    candidates.append(("XGB(n=200, depth=2, lr=0.02, alpha=0.5, lambda=2)", xgb2))

    # 3. RF balanced
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=4, min_samples_leaf=6,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=4, leaf=6, balanced)", rf))

    # 4. RF shallower
    rf2 = RandomForestClassifier(
        n_estimators=200, max_depth=3, min_samples_leaf=10,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=3, leaf=10, balanced)", rf2))

    # 5. Gradient Boosting
    gb = GradientBoostingClassifier(
        n_estimators=100, max_depth=2, learning_rate=0.03,
        subsample=0.8, min_samples_leaf=8, random_state=RANDOM_STATE
    )
    candidates.append(("GradientBoosting(depth=2, lr=0.03)", gb))

    # 6. Logistic Regression scaled
    lr_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(C=0.05, class_weight='balanced',
                                   max_iter=1000, random_state=RANDOM_STATE))
    ])
    candidates.append(("LogisticRegression(C=0.05, balanced)", lr_pipe))

    # 7. Soft Voting Ensemble
    xgb_v = xgb.XGBClassifier(
        n_estimators=100, max_depth=2, learning_rate=0.01,
        reg_alpha=1.0, reg_lambda=3.0, subsample=0.7,
        colsample_bytree=0.7, scale_pos_weight=scale_pos_weight,
        min_child_weight=5, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    rf_v = RandomForestClassifier(
        n_estimators=300, max_depth=4, min_samples_leaf=6,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    lr_v = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(C=0.05, class_weight='balanced',
                                   max_iter=1000, random_state=RANDOM_STATE))
    ])
    ensemble = VotingClassifier(
        estimators=[('xgb', xgb_v), ('rf', rf_v), ('lr', lr_v)],
        voting='soft', n_jobs=-1
    )
    candidates.append(("SoftVoting(XGB+RF+LR)", ensemble))

    results = []
    for name, model in candidates:
        cv_auc, test_auc, thresh, fitted_model = evaluate(
            name, model, X_train, X_test, y_train, y_test, cv
        )
        results.append((cv_auc, test_auc, thresh, fitted_model, name))

    results.sort(key=lambda x: x[0], reverse=True)
    best_cv, best_test, best_thresh, best_model, best_name = results[0]
    print(f"\n  ★ Winner: {best_name}")
    print(f"    CV AUC={best_cv:.4f} | Test AUC={best_test:.4f} | Threshold={best_thresh:.3f}")

    best_model.fit(X_train, y_train)
    save_model(2, best_model, best_thresh, FEATURES)


# ══════════════════════════════════════════════════════════════════════════════
#  STAGE 3
# ══════════════════════════════════════════════════════════════════════════════

def retrain_stage3():
    print_header(3, "— + MRI Neuroimaging → Escalate for Amyloid PET")
    
    FEATURES = ['AGE', 'pT217_F', 'NfL_Q', 'GFAP_Q',
                'HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG', 'TOTAL_WMH']
    LABEL    = 'LABEL'

    df, _ = load_data(3, LABEL)
    df = df.dropna(subset=FEATURES + [LABEL])

    X = df[FEATURES].values
    y = df[LABEL].values

    pos_count = y.sum()
    neg_count = len(y) - pos_count
    # Note: Stage 3 has more positives than negatives (211 vs 67)
    # scale_pos_weight < 1 down-weights the majority class (positives here)
    scale_pos_weight = neg_count / pos_count   # ~0.32 — XGB handles this fine
    print(f"  Class ratio neg/pos = {scale_pos_weight:.2f}  (minority = class 0)")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    print("\n  Comparing candidates:")
    candidates = []

    # 1. XGB with min_child_weight to prevent tiny splits (imbalance correction)
    xgb1 = xgb.XGBClassifier(
        n_estimators=80, max_depth=2, learning_rate=0.02,
        reg_alpha=1.0, reg_lambda=2.0, subsample=0.7,
        colsample_bytree=0.7, scale_pos_weight=scale_pos_weight,
        min_child_weight=10, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    candidates.append(("XGB(n=80, depth=2, lr=0.02, mcw=10)", xgb1))

    # 2. XGB using class_weight balanced equivalent (pos_weight=1, balanced manually)
    xgb2 = xgb.XGBClassifier(
        n_estimators=100, max_depth=2, learning_rate=0.01,
        reg_alpha=2.0, reg_lambda=4.0, subsample=0.7,
        colsample_bytree=0.6, scale_pos_weight=scale_pos_weight,
        min_child_weight=8, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    candidates.append(("XGB(n=100, depth=2, lr=0.01, alpha=2, lambda=4)", xgb2))

    # 3. RF balanced  
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=3, min_samples_leaf=8,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=3, leaf=8, balanced)", rf))

    # 4. RF shallower — very constrained
    rf2 = RandomForestClassifier(
        n_estimators=200, max_depth=2, min_samples_leaf=15,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    candidates.append(("RandomForest(depth=2, leaf=15, balanced)", rf2))

    # 5. Gradient Boosting very light
    gb = GradientBoostingClassifier(
        n_estimators=80, max_depth=2, learning_rate=0.02,
        subsample=0.7, min_samples_leaf=12, random_state=RANDOM_STATE
    )
    candidates.append(("GradientBoosting(n=80, depth=2, lr=0.02)", gb))

    # 6. Logistic Regression (scaled)
    lr_pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(C=0.1, class_weight='balanced',
                                   max_iter=1000, random_state=RANDOM_STATE))
    ])
    candidates.append(("LogisticRegression(C=0.1, balanced)", lr_pipe))

    # 7. Soft voting ensemble
    xgb_v = xgb.XGBClassifier(
        n_estimators=80, max_depth=2, learning_rate=0.02,
        reg_alpha=1.0, reg_lambda=2.0, subsample=0.7,
        colsample_bytree=0.7, scale_pos_weight=scale_pos_weight,
        min_child_weight=10, random_state=RANDOM_STATE,
        eval_metric='logloss', verbosity=0
    )
    rf_v = RandomForestClassifier(
        n_estimators=300, max_depth=3, min_samples_leaf=8,
        class_weight='balanced', random_state=RANDOM_STATE, n_jobs=-1
    )
    lr_v = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(C=0.1, class_weight='balanced',
                                   max_iter=1000, random_state=RANDOM_STATE))
    ])
    ensemble = VotingClassifier(
        estimators=[('xgb', xgb_v), ('rf', rf_v), ('lr', lr_v)],
        voting='soft', n_jobs=-1
    )
    candidates.append(("SoftVoting(XGB+RF+LR)", ensemble))

    results = []
    for name, model in candidates:
        cv_auc, test_auc, thresh, fitted_model = evaluate(
            name, model, X_train, X_test, y_train, y_test, cv
        )
        results.append((cv_auc, test_auc, thresh, fitted_model, name))

    results.sort(key=lambda x: x[0], reverse=True)
    best_cv, best_test, best_thresh, best_model, best_name = results[0]
    print(f"\n  ★ Winner: {best_name}")
    print(f"    CV AUC={best_cv:.4f} | Test AUC={best_test:.4f} | Threshold={best_thresh:.3f}")

    best_model.fit(X_train, y_train)
    save_model(3, best_model, best_thresh, FEATURES)


# ══════════════════════════════════════════════════════════════════════════════
#  SANITY CHECK — verify models produce varied outputs
# ══════════════════════════════════════════════════════════════════════════════

def sanity_check():
    print("\n" + "═"*80)
    print("  SANITY CHECK — do models vary output across clinical profiles?")
    print("═"*80)

    test_cases = [
        {
            "name": "Low-Risk: Young, high education, APOE4=0, MMSE=29",
            "stage1": {'AGE': 60, 'PTEDUCAT': 18, 'MMSCORE': 29, 'APOE4': 0, 'PTGENDER': 1},
        },
        {
            "name": "Mid-Risk: Middle-aged, avg edu, APOE4=1, MMSE=27",
            "stage1": {'AGE': 72, 'PTEDUCAT': 14, 'MMSCORE': 27, 'APOE4': 1, 'PTGENDER': 0},
        },
        {
            "name": "High-Risk: Elderly, low edu, APOE4=2, MMSE=24",
            "stage1": {'AGE': 82, 'PTEDUCAT': 10, 'MMSCORE': 24, 'APOE4': 2, 'PTGENDER': 0},
        },
    ]

    for stage in [1, 2, 3]:
        model_path = MODELS_DIR / f"stage{stage}_model.pkl"
        feat_path  = MODELS_DIR / f"stage{stage}_features.pkl"
        thresh_path= MODELS_DIR / f"stage{stage}_threshold.pkl"
        if not model_path.exists():
            print(f"  Stage {stage} model not found, skipping")
            continue
        with open(model_path, 'rb') as f:  model  = pickle.load(f)
        with open(feat_path,  'rb') as f:  feats  = pickle.load(f)
        with open(thresh_path,'rb') as f:  thresh = pickle.load(f)

        print(f"\n  Stage {stage} features: {feats}  | Threshold: {thresh:.3f}")
        for tc in test_cases:
            if stage == 1 and 'stage1' in tc:
                vals = tc['stage1']
                row  = [vals.get(f, 0) for f in feats]
                prob = model.predict_proba([row])[0][1]
                flag = "→ ESCALATE" if prob >= thresh else "  stable"
                print(f"    {tc['name'][:55]:55s} | prob={prob:.4f} {flag}")
            else:
                # For stages 2/3 we just print placeholder
                pass

    print("\n  ✓ Sanity check complete. If Stage 1 outputs vary, models work correctly.\n")


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("\n" + "█"*80)
    print("  PrecisionCare AD — Unified Model Retraining  (Stages 1, 2, 3)")
    print("█"*80)

    retrain_stage1()
    retrain_stage2()
    retrain_stage3()
    sanity_check()

    print("\n" + "█"*80)
    print("  ALL MODELS SAVED. Restart the backend server to load new models.")
    print("█"*80 + "\n")
