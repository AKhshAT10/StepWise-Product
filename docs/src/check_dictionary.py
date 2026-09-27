import pandas as pd
import glob

for f in glob.glob("data/raw/DATADIC*.csv"):
    dd = pd.read_csv(f, low_memory=False, encoding='latin1')
    matches = dd[dd.apply(
        lambda row: row.astype(str).str.contains('ntorhin|ST24|ST83', case=False, na=False).any(),
        axis=1
    )]
    if len(matches) > 0:
        print(f"=== {f} ===")
        print(matches.to_string())
        print()