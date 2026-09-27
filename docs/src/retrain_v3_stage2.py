"""
Stage 2 Retraining v3 — Inverted MMSE + Grid Search + Stratified CV
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.metrics import (
    roc_auc_score, roc_curve, confusion_matrix,
    classification_report
)
from xgboost import XGBClassifier

# ---------- Load data ----------
df = pd.read_csv("data/processed/stage2_clean.csv")

features = ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER',
            'pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q']

# Invert MMSE
df['MMSCORE_INV'] = 30 - df['MMSCORE']

X = df[features].copy()
X['MMSCORE'] = df['MMSCORE_INV']
y = df['label']

print(f"Stage 2 Dataset: {df.shape[0]} rows, {len(features)} features")
print(f"Label balance: {y.value_counts().to_dict()}")
print(f"Positive rate: {y.mean():.3f}")
print()

# ---------- Train/Test split ----------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

pos = (y_train == 1).sum()
neg = (y_train == 0).sum()
scale = neg / pos
print(f"Train size: {X_train.shape[0]}  Test size: {X_test.shape[0]}")
print(f"scale_pos_weight: {scale:.3f}")
print()

# ---------- Hyperparameter grid ----------
param_grid = {
    'max_depth': [2, 3, 4],
    'n_estimators': [100, 150, 200, 300],
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'min_child_weight': [1, 3, 5],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0],
}

print("Running grid search...")
base_model = XGBClassifier(
    eval_metric='logloss',
    scale_pos_weight=scale,
    random_state=42,
    monotone_constraints="(1,1,1,1,1,1,1,1,1)"  # All features: higher value = higher risk
)

grid = GridSearchCV(
    base_model, param_grid, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring='roc_auc', n_jobs=-1, verbose=1
)
grid.fit(X_train, y_train)

print(f"\nBest parameters: {grid.best_params_}")
print(f"Best CV AUC: {grid.best_score_:.4f}")

model = grid.best_estimator_

# ---------- Evaluate ----------
probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
print(f"\nTest-set AUC: {auc:.4f}")

# ---------- Cross-validation ----------
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = []
for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
    y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
    fold_model = XGBClassifier(**grid.best_params_, eval_metric='logloss', scale_pos_weight=scale, random_state=42)
    fold_model.fit(X_tr, y_tr)
    fold_prob = fold_model.predict_proba(X_val)[:, 1]
    fold_auc = roc_auc_score(y_val, fold_prob)
    cv_scores.append(fold_auc)
    print(f"  Fold {fold+1}: AUC={fold_auc:.4f}")

print(f"\n5-fold CV AUC mean: {np.mean(cv_scores):.4f}  std: {np.std(cv_scores):.4f}")

# ---------- Threshold ----------
fpr, tpr, thr = roc_curve(y_test, probs)
best_idx = np.argmax(tpr - fpr)
best_threshold = thr[best_idx]
print(f"\nChosen threshold: {best_threshold:.4f}")
print(f"Sensitivity: {tpr[best_idx]:.4f}  FPR: {fpr[best_idx]:.4f}")

preds = (probs >= best_threshold).astype(int)
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, preds))
print("\nClassification Report:")
print(classification_report(y_test, preds, digits=4))

importances = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature Importances:")
print(importances)

# ---------- Verify MMSE behavior ----------
print("\n=== MMSE Behavior Check ===")
for mmse in [5, 10, 15, 20, 25, 28, 30]:
    test_input = pd.DataFrame({'AGE': [75], 'PTEDUCAT': [16], 'MMSCORE': [30 - mmse], 'APOE4': [1], 'PTGENDER': [1],
                               'pT217_F': [0.5], 'AB42_AB40_F': [0.08], 'NfL_Q': [15.0], 'GFAP_Q': [150.0]})
    prob = model.predict_proba(test_input)[0, 1]
    print(f"  MMSE={mmse}/30: probability={prob:.4f}")

# ---------- Save ----------
joblib.dump(model, "models/stage2_model.pkl")
joblib.dump(best_threshold, "models/stage2_threshold.pkl")
joblib.dump(features, "models/stage2_features.pkl")
print("\nSaved Stage 2 model, threshold, features to models/")
