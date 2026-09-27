import pandas as pd

amy = pd.read_csv("data/raw/UCBERKELEY_AMY_6MM_26Sep2026.csv", low_memory=False)

print("Shape:", amy.shape)
print("\nColumns:", amy.columns.tolist())

# Look for centiloid / summary SUVR columns specifically
import re
keywords = ['CENTILOID', 'SUMMARY', 'SUVR', 'POSITIVITY', 'STATUS']
matches = [c for c in amy.columns if any(k in c.upper() for k in keywords)]
print("\nLikely relevant columns:", matches)

preview_cols = [c for c in ['RID', 'VISCODE', 'EXAMDATE'] if c in amy.columns] + matches[:10]
print(amy[preview_cols].head(5))