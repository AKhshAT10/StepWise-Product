import pandas as pd

stage2_df = pd.read_csv("data/processed/stage2_clean.csv")
import joblib
model2 = joblib.load("models/stage2_model.pkl")
threshold2 = joblib.load("models/stage2_threshold.pkl")
features2 = joblib.load("models/stage2_features.pkl")
stage2_df['prob'] = model2.predict_proba(stage2_df[features2])[:, 1]
escalated = stage2_df[stage2_df['prob'] >= threshold2].copy()
print("Escalated from Stage 2:", len(escalated))

ucsdvol = pd.read_csv("data/raw/UCSDVOL_26Sep2026.csv")
ucsffsx7 = pd.read_csv("data/raw/UCSFFSX7_26Sep2026.csv", low_memory=False)

print("\nUnique RIDs in UCSDVOL:", ucsdvol['RID'].nunique())
print("Unique RIDs in UCSFFSX7:", ucsffsx7['RID'].nunique())

overlap_ucsdvol = escalated['RID'].isin(ucsdvol['RID']).sum()
overlap_ucsffsx7 = escalated['RID'].isin(ucsffsx7['RID']).sum()
print(f"\nOf {len(escalated)} escalated patients:")
print(f"  Present in UCSDVOL: {overlap_ucsdvol}")
print(f"  Present in UCSFFSX7: {overlap_ucsffsx7}")

# Check label balance among just those present in UCSDVOL
in_ucsdvol = escalated[escalated['RID'].isin(ucsdvol['RID'])]
print("\nLabel balance among escalated patients present in UCSDVOL:")
print(in_ucsdvol['label'].value_counts())

in_ucsffsx7 = escalated[escalated['RID'].isin(ucsffsx7['RID'])]
print("\nLabel balance among escalated patients present in UCSFFSX7:")
print(in_ucsffsx7['label'].value_counts())
