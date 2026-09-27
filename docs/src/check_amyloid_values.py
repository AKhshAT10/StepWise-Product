import pandas as pd

amy = pd.read_csv("data/raw/UCBERKELEY_AMY_6MM_26Sep2026.csv", low_memory=False)

print("CENTILOIDS describe:")
print(amy['CENTILOIDS'].describe())
print("\nAMYLOID_STATUS value counts:")
print(amy['AMYLOID_STATUS'].value_counts(dropna=False))
print("\nDuplicated RIDs (multiple visits):", amy['RID'].duplicated().sum())
print("\nUnique RIDs total:", amy['RID'].nunique())