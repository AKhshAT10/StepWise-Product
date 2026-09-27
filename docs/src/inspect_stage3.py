import pandas as pd

files = {
    "UCSFFSX7": "data/raw/UCSFFSX7_26Sep2026.csv",
    "UCSDVOL": "data/raw/UCSDVOL_26Sep2026.csv",
    "UCD_WMH": "data/raw/UCD_WMH_26Sep2026.csv",
}

keywords = ['HIPPO', 'VENT', 'THICK', 'CORTEX', 'ICV', 'ENTORHINAL', 'WMH', 'WHITE']

for name, path in files.items():
    df = pd.read_csv(path, low_memory=False)
    print("="*70)
    print(f"FILE: {name}  ({path})")
    print("Shape:", df.shape)
    print("Columns:", df.columns.tolist())

    matches = [c for c in df.columns if any(k in c.upper() for k in keywords)]
    print(f"\nLikely relevant columns (keyword match): {matches}")

    preview_cols = [c for c in ['RID', 'VISCODE'] if c in df.columns] + matches[:8]
    if preview_cols:
        print(df[preview_cols].head(5))
    print()