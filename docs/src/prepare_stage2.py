import pandas as pd
import joblib

RAW = "data/raw/"
OUT = "data/processed/"

# ---------- Load Stage 1 cohort + trained model ----------
stage1_df = pd.read_csv(OUT + "stage1_clean.csv")
model1 = joblib.load("models/stage1_model.pkl")
threshold1 = joblib.load("models/stage1_threshold.pkl")
features1 = joblib.load("models/stage1_features.pkl")

stage1_probs = model1.predict_proba(stage1_df[features1])[:, 1]
stage1_df['stage1_prob'] = stage1_probs
stage1_df['escalated'] = (stage1_probs >= threshold1).astype(int)

print("Stage 1 cohort size:", len(stage1_df))
print("Escalated to Stage 2:", stage1_df['escalated'].sum())

escalated_cohort = stage1_df[stage1_df['escalated'] == 1].copy()

# ---------- Load and clean UPenn plasma biomarker file ----------
upenn = pd.read_csv(RAW + "UPENN_PLASMA_FUJIREBIO_QUANTERIX_26Sep2026.csv")

biomarker_cols = ['pT217_F', 'AB42_AB40_F', 'NfL_Q', 'GFAP_Q']

# Replace sentinel missing-value codes with NaN
for col in biomarker_cols:
    upenn.loc[upenn[col] < 0, col] = pd.NA

upenn['EXAMDATE'] = pd.to_datetime(upenn['EXAMDATE'], errors='coerce')
upenn = upenn.dropna(subset=['EXAMDATE'])

# Keep each patient's EARLIEST available reading
upenn = upenn.sort_values(['RID', 'EXAMDATE'])
upenn_first = upenn.groupby('RID').first()[biomarker_cols].reset_index()

# ---------- Merge onto the escalated Stage 1 cohort ----------
stage2_df = escalated_cohort.merge(upenn_first, on='RID', how='inner')

print("\nAfter merging with biomarker data:", len(stage2_df))
print("\nMissing values per biomarker column:")
print(stage2_df[biomarker_cols].isna().sum())

# For Stage 2, drop rows still missing the core two (most complete) markers
stage2_df = stage2_df.dropna(subset=['pT217_F', 'AB42_AB40_F'])
print("\nFinal Stage 2 cohort (has at least p-tau217 + AB42/40):", len(stage2_df))

# NfL/GFAP will still have some missing — fill with median for now
stage2_df['NfL_Q'] = stage2_df['NfL_Q'].fillna(stage2_df['NfL_Q'].median())
stage2_df['GFAP_Q'] = stage2_df['GFAP_Q'].fillna(stage2_df['GFAP_Q'].median())

print("\nFinal label balance at Stage 2:")
print(stage2_df['label'].value_counts())

stage2_df.to_csv(OUT + "stage2_clean.csv", index=False)
print("\nSaved to data/processed/stage2_clean.csv")