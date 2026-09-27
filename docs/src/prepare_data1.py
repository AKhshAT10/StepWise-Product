import pandas as pd

RAW = "data/raw/"
OUT = "data/processed/"

# ---------- Load ----------
demog = pd.read_csv(RAW + "All_Subjects_PTDEMOG_26Sep2026.csv")
mmse = pd.read_csv(RAW + "All_Subjects_MMSE_26Sep2026.csv")
dxsum = pd.read_csv(RAW + "All_Subjects_DXSUM_26Sep2026.csv", low_memory=False)
apoe = pd.read_csv(RAW + "All_Subjects_APOERES_26Sep2026.csv")

# ---------- 1. Build the LABEL from DXSUM ----------
# Keep only rows with a valid, known diagnosis (1, 2, or 3)
dxsum = dxsum[dxsum['DIAGNOSIS'].isin([1, 2, 3])].copy()
dxsum['EXAMDATE'] = pd.to_datetime(dxsum['EXAMDATE'], errors='coerce')
dxsum = dxsum.dropna(subset=['EXAMDATE'])

# Sort each patient's visits by actual date, earliest first
dxsum = dxsum.sort_values(['RID', 'EXAMDATE'])

# First diagnosis per patient = their baseline diagnosis
first_dx = dxsum.groupby('RID').first()['DIAGNOSIS'].rename('baseline_dx')

# Worst (highest/most severe) diagnosis ever recorded per patient
worst_dx = dxsum.groupby('RID')['DIAGNOSIS'].max().rename('worst_dx')

label_df = pd.concat([first_dx, worst_dx], axis=1).reset_index()
label_df['label'] = (label_df['worst_dx'] > label_df['baseline_dx']).astype(int)

print("Label balance:")
print(label_df['label'].value_counts())

# ---------- 2. Demographics: age + education + gender ----------
demog['PTDOBYY'] = pd.to_datetime(demog['PTDOBYY'], errors='coerce').dt.year
demog_small = demog.dropna(subset=['PTDOBYY']).sort_values('RID')
demog_small = demog_small.groupby('RID').first()[['PTDOBYY', 'PTEDUCAT', 'PTGENDER']].reset_index()

# Get each patient's earliest exam date (from DXSUM) to compute age at first visit
first_exam_date = dxsum.groupby('RID')['EXAMDATE'].min().rename('first_exam').reset_index()
demog_small = demog_small.merge(first_exam_date, on='RID', how='inner')
demog_small['AGE'] = demog_small['first_exam'].dt.year - demog_small['PTDOBYY']

# ---------- 3. MMSE: earliest score per patient ----------
mmse['VISDATE'] = pd.to_datetime(mmse['VISDATE'], errors='coerce')
mmse_clean = mmse.dropna(subset=['MMSCORE', 'VISDATE'])
mmse_clean = mmse_clean.sort_values(['RID', 'VISDATE'])
mmse_first = mmse_clean.groupby('RID').first()[['MMSCORE']].reset_index()

# ---------- 4. APOE: parse genotype string into ε4 count ----------
def count_e4(genotype):
    if pd.isna(genotype):
        return None
    alleles = str(genotype).split('/')
    return sum(1 for a in alleles if a.strip() == '4')

apoe['APOE4'] = apoe['GENOTYPE'].apply(count_e4)
apoe_small = apoe.dropna(subset=['APOE4']).groupby('RID').first()[['APOE4']].reset_index()

# ---------- 5. Merge everything into one master table ----------
df = label_df[['RID', 'label']].merge(demog_small[['RID', 'AGE', 'PTEDUCAT', 'PTGENDER']], on='RID', how='inner')
df = df.merge(mmse_first, on='RID', how='inner')
df = df.merge(apoe_small, on='RID', how='inner')

# Clean gender to numeric
df['PTGENDER'] = df['PTGENDER'].map({1: 0, 2: 1})  # ADNI usually codes 1=Male, 2=Female — verify against DATADIC if unsure

# Basic sanity filtering
df = df[(df['AGE'] > 40) & (df['AGE'] < 110)]
df = df[(df['MMSCORE'] >= 0) & (df['MMSCORE'] <= 30)]

print("\nFinal merged shape:", df.shape)
print(df.isna().sum())
print(df.describe())

df.to_csv(OUT + "stage1_clean.csv", index=False)
print("\nSaved to data/processed/stage1_clean.csv")