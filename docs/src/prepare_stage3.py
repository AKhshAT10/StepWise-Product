import pandas as pd
import joblib

RAW = "data/raw/"
OUT = "data/processed/"

# ---------- Load Stage 2 cohort + trained model ----------
stage2_df = pd.read_csv(OUT + "stage2_clean.csv")
model2 = joblib.load("models/stage2_model.pkl")
threshold2 = joblib.load("models/stage2_threshold.pkl")
features2 = joblib.load("models/stage2_features.pkl")

stage2_df['prob'] = model2.predict_proba(stage2_df[features2])[:, 1]
stage2_df['escalated'] = (stage2_df['prob'] >= threshold2).astype(int)

print("Stage 2 cohort size:", len(stage2_df))
print("Escalated to Stage 3:", stage2_df['escalated'].sum())

escalated_cohort = stage2_df[stage2_df['escalated'] == 1].copy()

# ---------- UCSFFSX7: hippocampus, ventricles, ICV, cortical thickness (all in one file) ----------
ucsffsx7 = pd.read_csv(RAW + "UCSFFSX7_26Sep2026.csv", low_memory=False)
ucsffsx7['EXAMDATE'] = pd.to_datetime(ucsffsx7['EXAMDATE'], errors='coerce')
ucsffsx7 = ucsffsx7.dropna(subset=['EXAMDATE'])
ucsffsx7 = ucsffsx7.sort_values(['RID', 'EXAMDATE'])

mri_cols = ['ST29SV', 'ST88SV', 'ST37SV', 'ST96SV', 'ST10CV', 'ST24TA', 'ST83TA']
ucsffsx7_first = ucsffsx7.groupby('RID').first()[mri_cols].reset_index()

# Engineer combined features
ucsffsx7_first['HIPPO_TOTAL'] = ucsffsx7_first['ST29SV'] + ucsffsx7_first['ST88SV']
ucsffsx7_first['VENTRICLE_TOTAL'] = ucsffsx7_first['ST37SV'] + ucsffsx7_first['ST96SV']
ucsffsx7_first['HIPPO_NORM'] = ucsffsx7_first['HIPPO_TOTAL'] / ucsffsx7_first['ST10CV']
ucsffsx7_first['VENTRICLE_NORM'] = ucsffsx7_first['VENTRICLE_TOTAL'] / ucsffsx7_first['ST10CV']
ucsffsx7_first['CORTICAL_THICKNESS_AVG'] = ucsffsx7_first[['ST24TA', 'ST83TA']].mean(axis=1)

mri_features = ucsffsx7_first[['RID', 'HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG']]

# ---------- UCD_WMH: white matter hyperintensity (bonus feature) ----------
ucd_wmh = pd.read_csv(RAW + "UCD_WMH_26Sep2026.csv", low_memory=False)
ucd_wmh['EXAMDATE'] = pd.to_datetime(ucd_wmh['EXAMDATE'], errors='coerce')
ucd_wmh = ucd_wmh.dropna(subset=['EXAMDATE'])
ucd_wmh = ucd_wmh.sort_values(['RID', 'EXAMDATE'])
wmh_first = ucd_wmh.groupby('RID').first()[['TOTAL_WMH']].reset_index()

# ---------- Merge onto escalated Stage 2 cohort ----------
stage3_df = escalated_cohort.merge(mri_features, on='RID', how='inner')
stage3_df = stage3_df.merge(wmh_first, on='RID', how='left')

print("\nAfter merging MRI data:", len(stage3_df))
print("\nMissing values per new column:")
print(stage3_df[['HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG', 'TOTAL_WMH']].isna().sum())

# Core MRI features essential - drop if missing
stage3_df = stage3_df.dropna(subset=['HIPPO_NORM', 'VENTRICLE_NORM', 'CORTICAL_THICKNESS_AVG'])

# WMH is bonus - fill missing with median rather than dropping patients
stage3_df['TOTAL_WMH'] = stage3_df['TOTAL_WMH'].fillna(stage3_df['TOTAL_WMH'].median())

print("\nFinal Stage 3 cohort:", len(stage3_df))
print("\nFinal label balance:")
print(stage3_df['label'].value_counts())

stage3_df.to_csv(OUT + "stage3_clean.csv", index=False)
print("\nSaved to data/processed/stage3_clean.csv")