import pandas as pd
from pathlib import Path

DATASET_ROOT = Path(__file__).parents[2] / "dataset"
df=pd.read_csv(DATASET_ROOT / "recycler_dataset_large.csv")
MATERIAL_ALIASES={"glass":"Glass","metal":"Mixed Metal","plastic":"Mixed Plastic"}

def match(category, location, limit=5):
    target=MATERIAL_ALIASES.get(category,category)
    x=df[df["Accepted materials"].fillna("").str.contains(target, case=False, regex=False)].copy()
    x=x[x["Authorization status"].fillna("").str.contains("Authorized",case=False,regex=False)]
    x["pickup_score"]=x["Pickup availability"].fillna("").str.lower().eq("yes").astype(int)
    x["location_score"]=x["Service area"].fillna("").str.lower().str.contains(location.lower(),regex=False).astype(int)
    x["score"]=x["location_score"]*3+x["pickup_score"]*2
    return x.sort_values(["score","Recycler ID"],ascending=[False,True]).head(limit)[
        ["Recycler ID","Recycler name","Location","Accepted materials",
         "Authorization status","Contact","Rate","Pickup availability","Service area","score"]
    ].to_dict("records")
