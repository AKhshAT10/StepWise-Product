import pandas as pd

c2n = pd.read_csv("data/raw/C2N_PRECIVITYAD2_PLASMA_26Sep2026.csv")
upenn = pd.read_csv("data/raw/UPENN_PLASMA_FUJIREBIO_QUANTERIX_26Sep2026.csv")
blennow = pd.read_csv("data/raw/BLENNOWPLASMATAU_26Sep2026.csv")

print("---- C2N key columns ----")
for col in ['pT217_C2N', 'AB42_AB40_C2N', 'APS2_C2N']:
    print(f"\n{col}:")
    print(c2n[col].describe())
    print("Negative or zero values count:", (c2n[col] <= 0).sum())

print("\n\n---- UPenn key columns ----")
for col in ['pT217_F', 'AB42_AB40_F', 'NfL_F', 'GFAP_F', 'NfL_Q', 'GFAP_Q']:
    print(f"\n{col}:")
    print(upenn[col].describe())
    print("Negative or zero values count:", (upenn[col] <= 0).sum())
    print("Value counts of negatives:", upenn[upenn[col] < 0][col].value_counts())

print("\n\n---- Blennow ----")
print(blennow['PLASMATAU'].describe())
print("Negative or zero values count:", (blennow['PLASMATAU'] <= 0).sum())

print("\n\nDuplicate RIDs per file (multiple visits):")
print("C2N duplicated RIDs:", c2n['RID'].duplicated().sum())
print("UPenn duplicated RIDs:", upenn['RID'].duplicated().sum())
print("Blennow duplicated RIDs:", blennow['RID'].duplicated().sum())