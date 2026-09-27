import pandas as pd

df = pd.read_csv("data/processed/stage4_clean.csv")

# Treatment-eligibility criteria, based on established clinical trial inclusion
# logic (Lecanemab/Aducanumab trials): amyloid-positive + safety screening
df['eligible_amyloid'] = df['AMYLOID_STATUS'] == 1
df['aria_risk_flag'] = (
    (df['APOE4'] == 2) |                          # homozygous e4 = highest ARIA risk
    (df['MICROHEM_COUNT_SIMULATED'] >= 5)          # pre-existing microhemorrhage burden
)

df['eligibility_shortlist'] = df['eligible_amyloid'] & ~df['aria_risk_flag']

print("Amyloid-positive:", df['eligible_amyloid'].sum(), "/", len(df))
print("Flagged for ARIA safety concern:", df['aria_risk_flag'].sum(), "/", len(df))
print("Final shortlist (eligible + safe):", df['eligibility_shortlist'].sum(), "/", len(df))

df.to_csv("data/processed/stage4_shortlist.csv", index=False)