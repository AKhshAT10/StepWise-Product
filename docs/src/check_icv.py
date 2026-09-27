import pandas as pd
import glob

for f in glob.glob("data/raw/DATADIC*.csv"):
    dd = pd.read_csv(f, low_memory=False, encoding='latin1')
    matches = dd[
        dd['TBLNAME'].astype(str).str.contains('UCSFFSX7', na=False) &
        dd['TEXT'].astype(str).str.contains('ntracranial|ICV', case=False, na=False)
    ]
    if len(matches) > 0:
        print(matches[['FLDNAME', 'TEXT', 'UNITS']].to_string())
        break