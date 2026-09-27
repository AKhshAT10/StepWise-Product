import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix
from xgboost import XGBClassifier

df = pd.read_csv("data/processed/stage2_clean.csv")

# Stage 2 = Stage 1 features + new biomarkers
features = ['AGE', 'PTEDUCAT', 'MMSCORE', 'APOE4', 'PTGENDER',
            'pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q']

X = df[features]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print("Train size:", X_train.shape[0], " Test size:", X_test.shape[0])

pos = (y_train == 1).sum()
neg = (y_train == 0).sum()
scale = neg / pos
print(f"scale_pos_weight: {scale:.2f}")

# ---------- Train with the same reasonable defaults used for Stage 1 ----------
# (Grid search was tried and produced a worse, unstable result at this smaller
# sample size — n=637 is too small for reliable exhaustive tuning. Using
# sensible fixed defaults instead, same approach as Stage 1's baseline.)
model = XGBClassifier(
    n_estimators=150, max_depth=3, learning_rate=0.1,
    eval_metric='logloss', scale_pos_weight=scale, random_state=42
)
model.fit(X_train, y_train)

probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
print(f"\nTest-set AUC: {auc:.4f}")

cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
print(f"5-fold CV AUC mean: {cv_scores.mean():.4f}  std: {cv_scores.std():.4f}")

# ---------- Threshold ----------
fpr, tpr, thr = roc_curve(y_test, probs)
best_idx = np.argmax(tpr - fpr)
best_threshold = thr[best_idx]
print(f"\nChosen threshold: {best_threshold:.4f}")
print(f"Sensitivity: {tpr[best_idx]:.4f}  FPR: {fpr[best_idx]:.4f}")

preds = (probs >= best_threshold).astype(int)
print("\nConfusion matrix:")
print(confusion_matrix(y_test, preds))

importances = pd.Series(model.feature_importances_, index=features).sort_values(ascending=False)
print("\nFeature importances:")
print(importances)

# ---------- Save ----------
joblib.dump(model, "models/stage2_model.pkl")
joblib.dump(best_threshold, "models/stage2_threshold.pkl")
joblib.dump(features, "models/stage2_features.pkl")
print("\nSaved Stage 2 model, threshold, features to models/")