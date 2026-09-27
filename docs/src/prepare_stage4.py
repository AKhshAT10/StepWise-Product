import pandas as pd
import numpy as np
import joblib

RAW = "data/raw/"
OUT = "data/processed/"

np.random.seed(42)

# ---------- Load Stage 3 cohort + trained model ----------
stage3_df = pd.read_csv(OUT + "stage3_clean.csv")
model3 = joblib.load("models/stage3_model.pkl")
threshold3 = joblib.load("models/stage3_threshold.pkl")
features3 = joblib.load("models/stage3_features.pkl")

stage3_df['prob'] = model3.predict_proba(stage3_df[features3])[:, 1]
stage3_df['escalated'] = (stage3_df['prob'] >= threshold3).astype(int)

print("Stage 3 cohort size:", len(stage3_df))
print("Escalated to Stage 4:", stage3_df['escalated'].sum())

escalated_cohort = stage3_df[stage3_df['escalated'] == 1].copy()

# ---------- Amyloid PET: Centiloid burden ----------
amy = pd.read_csv(RAW + "UCBERKELEY_AMY_6MM_26Sep2026.csv", low_memory=False)
amy['SCANDATE'] = pd.to_datetime(amy['SCANDATE'], errors='coerce')
amy = amy.dropna(subset=['SCANDATE', 'CENTILOIDS'])
amy = amy.sort_values(['RID', 'SCANDATE'])

amy_first = amy.groupby('RID').first()[['CENTILOIDS', 'AMYLOID_STATUS']].reset_index()

# ---------- Merge onto escalated Stage 3 cohort ----------
stage4_df = escalated_cohort.merge(amy_first, on='RID', how='inner')

print("\nAfter merging amyloid PET data:", len(stage4_df))
print("Missing AMYLOID_STATUS:", stage4_df['AMYLOID_STATUS'].isna().sum())

stage4_df['AMYLOID_STATUS'] = stage4_df['AMYLOID_STATUS'].fillna(stage4_df['AMYLOID_STATUS'].median())

# ---------- Simulated microhemorrhage count (documented as synthetic) ----------
# No real ADNI table available for this field in the current download.
# Simulated using published incidence-rate patterns (higher with age, APOE4 carriage,
# and higher amyloid burden), per Lecanemab/Aducanumab trial safety literature.
# This is NOT real patient data - clearly flagged for transparency.
age_component = (stage4_df['AGE'] - stage4_df['AGE'].min()) / (stage4_df['AGE'].max() - stage4_df['AGE'].min())
apoe_component = stage4_df['APOE4'] / 2
centiloid_component = (stage4_df['CENTILOIDS'] - stage4_df['CENTILOIDS'].min()) / (stage4_df['CENTILOIDS'].max() - stage4_df['CENTILOIDS'].min())

risk_score = 0.3 * age_component + 0.4 * apoe_component + 0.3 * centiloid_component
noise = np.random.normal(0, 0.15, size=len(stage4_df))
simulated_rate = np.clip(risk_score + noise, 0, 1)

# Convert to a plausible microhemorrhage count (0-8 range, matching typical trial-reported distributions)
stage4_df['MICROHEM_COUNT_SIMULATED'] = np.round(simulated_rate * 8).astype(int)

print("\nSimulated microhemorrhage count distribution:")
print(stage4_df['MICROHEM_COUNT_SIMULATED'].describe())

print("\nFinal label balance at Stage 4:")
print(stage4_df['label'].value_counts())

stage4_df.to_csv(OUT + "stage4_clean.csv", index=False)
print("\nSaved to data/processed/stage4_clean.csv")
print("\n*** NOTE: MICROHEM_COUNT_SIMULATED is synthetic data, not real ADNI measurements. ***")
print("*** Document this clearly in any findings/writeup. ***")