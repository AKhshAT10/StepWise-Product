import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix
from xgboost import XGBClassifier

# ---------- Load cleaned data ----------
df = pd.read_csv("data/processed/stage1_clean.csv")

features = ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER']
X = df[features]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

pos = (y_train == 1).sum()
neg = (y_train == 0).sum()
scale = neg / pos

# ---------- Hyperparameter search ----------
param_grid = {
    'max_depth': [2, 3, 4, 5],
    'n_estimators': [100, 150, 200, 300],
    'learning_rate': [0.01, 0.05, 0.1, 0.2],
    'min_child_weight': [1, 3, 5],
}

print("Running grid search... this may take a few minutes")

base_model = XGBClassifier(eval_metric='logloss', scale_pos_weight=scale, random_state=42)

grid = GridSearchCV(
    base_model, param_grid, cv=5, scoring='roc_auc', n_jobs=-1, verbose=1
)
grid.fit(X_train, y_train)

print("\nBest hyperparameters found:", grid.best_params_)
print("Best CV AUC during search:", grid.best_score_)

model = grid.best_estimator_

# ---------- Evaluate the improved model ----------
probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
print(f"\nImproved Test-set AUC: {auc:.4f}")

cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
print(f"5-fold CV AUC mean: {cv_scores.mean():.4f}  std: {cv_scores.std():.4f}")

# ---------- Re-pick threshold for the new model ----------
fpr, tpr, thr = roc_curve(y_test, probs)
best_idx = np.argmax(tpr - fpr)
best_threshold = thr[best_idx]
print(f"\nNew chosen threshold: {best_threshold:.4f}")
print(f"Sensitivity: {tpr[best_idx]:.4f}  False Positive Rate: {fpr[best_idx]:.4f}")

preds_at_threshold = (probs >= best_threshold).astype(int)
cm = confusion_matrix(y_test, preds_at_threshold)
print("\nConfusion matrix:")
print(cm)

importances = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature importances:")
print(importances)

# ---------- Save as the new, improved model (overwrites old one) ----------
joblib.dump(model, "models/stage1_model.pkl")
joblib.dump(best_threshold, "models/stage1_threshold.pkl")
joblib.dump(features, "models/stage1_features.pkl")
print("\nSaved improved model to models/stage1_model.pkl (previous version overwritten)")