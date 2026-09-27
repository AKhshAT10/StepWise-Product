import pandas as pd

dxsum = pd.read_csv("data/raw/All_Subjects_DXSUM_26Sep2026.csv")
apoe = pd.read_csv("data/raw/All_Subjects_APOERES_26Sep2026.csv")
demog = pd.read_csv("data/raw/All_Subjects_PTDEMOG_26Sep2026.csv")

print("DIAGNOSIS value counts:")
print(dxsum['DIAGNOSIS'].value_counts(dropna=False))

print("\nGENOTYPE sample values:")
print(apoe['GENOTYPE'].value_counts(dropna=False).head(15))

print("\nPTDOBYY sample:")
print(demog['PTDOBYY'].head(10))
print(demog['PTDOBYY'].describe())

print("\nVISCODE sample in DXSUM:")
print(dxsum['VISCODE'].value_counts().head(10))