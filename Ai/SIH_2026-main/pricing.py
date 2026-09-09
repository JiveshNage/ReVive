import pandas as pd, re
from pathlib import Path

PRICE = Path(__file__).parents[2] / "dataset" / "price_dataset_india_locations.csv"
price = pd.read_csv(PRICE)
price["price_num"] = price["Price/kg"].astype(str).str.replace(r"[^\d.]", "", regex=True).astype(float)

DIRECT = {
    "Battery":"Battery","Keyboard":"Keyboard","Microwave":"Microwave","Mobile":"Mobile",
    "Mouse":"Mouse","PCB":"PCB","Player":"Player","Printer":"Printer",
    "Television":"Television","Washing Machine":"Washing Machine",
    "glass":"Glass","metal":"Metal","plastic":"Plastic"
}

def estimate(category, location, weight_kg):
    mapped=DIRECT.get(category)
    if not mapped:
        return {"category":category,"location":location,"weight_kg":weight_kg,
                "status":"no_direct_price","message":"No safe direct category match in price dataset."}
    x=price[(price.Category==mapped) & (price.Location.str.lower()==location.lower())]
    if x.empty:
        x=price[price.Category==mapped]
    if x.empty:
        return {"category":category,"status":"no_price_data"}
    rates=x.price_num
    return {
        "category":category,"pricing_category":mapped,"location":location,
        "weight_kg":weight_kg,"price_per_kg_median":round(float(rates.median()),2),
        "estimated_value":round(float(rates.median()*weight_kg),2),
        "range":{"min":round(float(rates.min()*weight_kg),2),
                 "max":round(float(rates.max()*weight_kg),2)},
        "samples":int(len(rates))
    }
