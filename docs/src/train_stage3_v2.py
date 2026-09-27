import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import roc_auc_score, roc_curve, confusion_matrix
from xgboost import XGBClassifier

df = pd.read_csv("data/processed/stage3_clean.csv")

# Trimmed feature set - dropped PTGENDER (0 importance), APOE4, MMSCORE, PTEDUCAT, AB42_AB40_F
# (weakest contributors from the first run) to reduce overfitting risk with only ~67 negatives
features = ['AGE', 'pT217_F', 'NfL_Q', 'GFAP_Q',
            'HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG', 'TOTAL_WMH']

X = df[features]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
print("Train size:", X_train.shape[0], " Test size:", X_test.shape[0])
print("Train label balance:", y_train.value_counts().to_dict())
print("Test label balance:", y_test.value_counts().to_dict())

pos = (y_train == 1).sum()
neg = (y_train == 0).sum()
scale = neg / pos
print(f"scale_pos_weight: {scale:.2f}")

# Slightly shallower/simpler than before given the smaller effective sample
model = XGBClassifier(
    n_estimators=100, max_depth=2, learning_rate=0.1,
    eval_metric='logloss', scale_pos_weight=scale, random_state=42
)
model.fit(X_train, y_train)

probs = model.predict_proba(X_test)[:, 1]
auc = roc_auc_score(y_test, probs)
print(f"\nTest-set AUC: {auc:.4f}")

# Use StratifiedKFold explicitly to guarantee each fold has both classes represented
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=skf, scoring='roc_auc')
print(f"5-fold Stratified CV AUC mean: {cv_scores.mean():.4f}  std: {cv_scores.std():.4f}")
print(f"Individual fold scores: {cv_scores}")

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

joblib.dump(model, "models/stage3_model.pkl")
joblib.dump(best_threshold, "models/stage3_threshold.pkl")
joblib.dump(features, "models/stage3_features.pkl")
print("\nSaved Stage 3 model (trimmed feature version), threshold, features to models/")