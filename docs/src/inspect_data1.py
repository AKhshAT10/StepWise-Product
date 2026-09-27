import pandas as pd

files = {
    "PTDEMOG": "data/raw/All_Subjects_PTDEMOG_26Sep2026.csv",
    "MMSE": "data/raw/All_Subjects_MMSE_26Sep2026.csv",
    "DXSUM": "data/raw/All_Subjects_DXSUM_26Sep2026.csv",
    "APOERES": "data/raw/All_Subjects_APOERES_26Sep2026.csv",
}

for name, path in files.items():
    df = pd.read_csv(path)
    print("="*60)
    print(f"FILE: {name}  ({path})")
    print(f"Shape: {df.shape}")
    print("Columns:", df.columns.tolist())
    print(df.head(3))
    print()