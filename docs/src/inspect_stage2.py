import pandas as pd

files = {
    "C2N_PTAU217": "data/raw/C2N_PRECIVITYAD2_PLASMA_26Sep2026.csv",
    "UPENN_FUJIREBIO_QUANTERIX": "data/raw/UPENN_PLASMA_FUJIREBIO_QUANTERIX_26Sep2026.csv",
    "BLENNOW_TAU": "data/raw/BLENNOWPLASMATAU_26Sep2026.csv",
}

for name, path in files.items():
    df = pd.read_csv(path, low_memory=False)
    print("="*70)
    print(f"FILE: {name}  ({path})")
    print(f"Shape: {df.shape}")
    print("Columns:", df.columns.tolist())
    print(df.head(3))
    print()