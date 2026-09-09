from functools import lru_cache
import io
from pathlib import Path
import re

import pandas as pd


class AIServiceUnavailable(RuntimeError):
    pass


# Mapping between detected/input scrap categories and dataset categories
CATEGORY_MAPPING = {
    "Battery": "Battery",
    "Keyboard": "Keyboard",
    "Microwave": "Microwave",
    "Mobile": "Mobile",
    "Mouse": "Mouse",
    "PCB": "PCB",
    "Player": "Player",
    "Printer": "Printer",
    "Television": "Television",
    "Washing Machine": "Washing Machine",
    "Glass": "Glass",
    "glass": "Glass",
    "Metal": "Metal",
    "metal": "Metal",
    "Plastic": "Plastic",
    "plastic": "Plastic",
    "Copper Wire": "Metal",
    "Laptop Battery": "Battery",
    "Mobile Phone": "Mobile",
}

RECYCLER_MATERIAL_ALIASES = {
    "Glass": "Glass",
    "glass": "Glass",
    "Metal": "Mixed Metal",
    "metal": "Mixed Metal",
    "Copper Wire": "Mixed Metal",
    "Plastic": "Mixed Plastic",
    "plastic": "Mixed Plastic",
    "Battery": "Battery",
    "Laptop Battery": "Battery",
    "PCB": "PCB",
    "Mobile": "Mobile",
    "Mobile Phone": "Mobile",
}


def _get_project_root() -> Path:
    return Path(__file__).resolve().parents[2]


@lru_cache(maxsize=1)
def get_price_dataset() -> pd.DataFrame:
    dataset_path = _get_project_root() / "dataset" / "price_dataset_india_locations.csv"
    if not dataset_path.exists():
        return pd.DataFrame()
    df = pd.read_csv(dataset_path)
    df["price_num"] = df["Price/kg"].astype(str).str.replace(r"[^\d.]", "", regex=True).astype(float)
    return df


@lru_cache(maxsize=1)
def get_recycler_dataset() -> pd.DataFrame:
    dataset_path = _get_project_root() / "dataset" / "recycler_dataset_large.csv"
    if not dataset_path.exists():
        return pd.DataFrame()
    df = pd.read_csv(dataset_path)
    return df


def estimate_price(category: str, location: str, weight_kg: float) -> dict | None:
    mapped = CATEGORY_MAPPING.get(category, category)
    df = get_price_dataset()
    if df.empty:
        # Fallback baseline calculation if dataset file is absent
        fallback_rate = 120.0 if "PCB" in category else (90.0 if "Metal" in mapped else 65.0)
        return {
            "category": category,
            "pricing_category": mapped,
            "location": location,
            "weight_kg": weight_kg,
            "price_per_kg_median": fallback_rate,
            "estimated_value": round(fallback_rate * weight_kg, 2),
            "price_min": round(fallback_rate * 0.85 * weight_kg, 2),
            "price_max": round(fallback_rate * 1.15 * weight_kg, 2),
            "samples": 1,
        }

    # Filter by category and location
    subset = df[(df.Category.str.lower() == mapped.lower()) & (df.Location.str.lower() == location.lower())]
    if subset.empty:
        subset = df[df.Category.str.lower() == mapped.lower()]
    if subset.empty:
        subset = df

    rates = subset["price_num"].dropna()
    if rates.empty:
        median_val = 80.0
        min_val = 50.0
        max_val = 110.0
        count = 1
    else:
        median_val = float(rates.median())
        min_val = float(rates.min())
        max_val = float(rates.max())
        count = int(len(rates))

    return {
        "category": category,
        "pricing_category": mapped,
        "location": location,
        "weight_kg": round(weight_kg, 2),
        "price_per_kg_median": round(median_val, 2),
        "estimated_value": round(median_val * weight_kg, 2),
        "price_min": round(min_val * weight_kg, 2),
        "price_max": round(max_val * weight_kg, 2),
        "samples": count,
    }


def get_price_benchmarks() -> list[dict]:
    df = get_price_dataset()
    if df.empty:
        return []
    results = []
    for cat, group in df.groupby("Category"):
        rates = group["price_num"].dropna()
        if rates.empty:
            continue
        results.append({
            "category": str(cat),
            "median_rate_per_kg": round(float(rates.median()), 2),
            "min_rate_per_kg": round(float(rates.min()), 2),
            "max_rate_per_kg": round(float(rates.max()), 2),
            "sample_count": int(len(rates)),
        })
    results.sort(key=lambda x: x["median_rate_per_kg"], reverse=True)
    return results


def match_recyclers(
    category: str = "PCB",
    location: str = "Bhopal",
    limit: int = 10,
    query: str | None = None,
    pickup_only: bool = False,
) -> list[dict]:
    target = RECYCLER_MATERIAL_ALIASES.get(category, category)
    df = get_recycler_dataset()
    if df.empty:
        fallback_recyclers = [
            {
                "recycler_id": 1,
                "recycler_name": "EcoCycle Bhopal Green Solutions 0001",
                "location": "Bhopal",
                "accepted_materials": "PCB, Mixed Metal, Battery, Cable, Display",
                "authorization_status": "Authorized",
                "contact": "+91 98765 40001",
                "rate": "PCB: ₹450/kg | Battery: ₹65/kg | Cable: ₹110/kg",
                "pickup_availability": "Yes",
                "service_area": "Bhopal, Sehore, Vidisha",
                "score": 98,
            },
            {
                "recycler_id": 2,
                "recycler_name": "CleanEarth Central MP Recyclers",
                "location": "Bhopal",
                "accepted_materials": "Battery, Lead-Acid, Lithium-ion, Cable",
                "authorization_status": "Authorized",
                "contact": "+91 98765 40002",
                "rate": "Battery: ₹70/kg | Metal: ₹95/kg",
                "pickup_availability": "Yes",
                "service_area": "Bhopal, Raisen, Hoshangabad",
                "score": 94,
            },
            {
                "recycler_id": 3,
                "recycler_name": "EcoReclaim Maharashtra & MP Hub",
                "location": "Pune",
                "accepted_materials": "PCB, Display, Mobile, Plastic, Glass",
                "authorization_status": "Authorized",
                "contact": "+91 91234 56780",
                "rate": "PCB: ₹480/kg | Mobile: ₹290/kg | Display: ₹85/kg",
                "pickup_availability": "Yes",
                "service_area": "Pune, Mumbai, Nashik, Bhopal",
                "score": 89,
            },
            {
                "recycler_id": 4,
                "recycler_name": "Metro E-Recyclers North India",
                "location": "New Delhi",
                "accepted_materials": "PCB, Metal, Copper Wire, Battery",
                "authorization_status": "Authorized",
                "contact": "+91 99988 87770",
                "rate": "Metal: ₹105/kg | Cable: ₹118/kg | PCB: ₹460/kg",
                "pickup_availability": "No",
                "service_area": "Delhi NCR, Haryana, Western UP",
                "score": 82,
            },
        ]
        return fallback_recyclers[:limit]

    # Authorized recyclers only
    auth_mask = df["Authorization status"].fillna("").str.contains("Authorized", case=False, regex=False)
    filtered = df[auth_mask].copy()

    # Category filtering (ignore if 'all' or empty)
    cat_clean = category.strip() if category else ""
    if cat_clean and cat_clean.lower() != "all":
        mat_mask = filtered["Accepted materials"].fillna("").str.contains(target, case=False, regex=False)
        mat_matches = filtered[mat_mask].copy()
        if not mat_matches.empty:
            filtered = mat_matches

    # Doorstep pickup filter
    if pickup_only:
        filtered = filtered[filtered["Pickup availability"].fillna("").str.lower() == "yes"]

    # Text search filter
    if query and query.strip():
        q = query.strip().lower()
        search_mask = (
            filtered["Recycler name"].fillna("").str.lower().str.contains(q, regex=False)
            | filtered["Accepted materials"].fillna("").str.lower().str.contains(q, regex=False)
            | filtered["Service area"].fillna("").str.lower().str.contains(q, regex=False)
            | filtered["Location"].fillna("").str.lower().str.contains(q, regex=False)
        )
        filtered = filtered[search_mask]

    if filtered.empty:
        filtered = df[auth_mask].head(limit).copy()

    # Intelligent scoring:
    loc_clean = location.strip().lower().split(",")[0]
    is_loc_match = filtered["Location"].fillna("").str.lower().str.contains(loc_clean, regex=False).astype(int)
    is_svc_match = filtered["Service area"].fillna("").str.lower().str.contains(loc_clean, regex=False).astype(int)
    is_pickup = filtered["Pickup availability"].fillna("").str.lower().eq("yes").astype(int)
    is_mat = filtered["Accepted materials"].fillna("").str.contains(target, case=False, regex=False).astype(int)

    filtered["score"] = (is_loc_match * 40) + (is_svc_match * 30) + (is_pickup * 20) + (is_mat * 10)
    filtered["score"] = filtered["score"].clip(lower=60, upper=99)

    ranked = filtered.sort_values(["score", "Recycler ID"], ascending=[False, True]).head(limit)

    results = []
    for _, row in ranked.iterrows():
        rec_id_raw = str(row.get("Recycler ID", "1"))
        num_match = re.search(r"\d+", rec_id_raw)
        rec_id = int(num_match.group(0)) if num_match else 1

        results.append({
            "recycler_id": rec_id,
            "recycler_name": str(row.get("Recycler name", "Authorized Recycler")),
            "location": str(row.get("Location", location)),
            "accepted_materials": str(row.get("Accepted materials", target)),
            "authorization_status": str(row.get("Authorization status", "Authorized")),
            "contact": str(row.get("Contact", "+91 9800000000")),
            "rate": str(row.get("Rate", "Market rate")),
            "pickup_availability": str(row.get("Pickup availability", "Yes")),
            "service_area": str(row.get("Service area", location)),
            "score": int(row.get("score", 75)),
        })
    return results


def _build_model(classes: list[str], state_dict: dict):
    from torch import nn

    # Detect if checkpoint matches SmallCNN or MobileNet
    first_key = next(iter(state_dict.keys()), "")
    if "features.0.weight" in state_dict or "features.1.weight" in state_dict:
        class SmallCNN(nn.Module):
            def __init__(self, k):
                super().__init__()
                self.features = nn.Sequential(
                    nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(), nn.MaxPool2d(2),
                    nn.Conv2d(128, 256, 3, padding=1), nn.BatchNorm2d(256), nn.ReLU(), nn.AdaptiveAvgPool2d(1),
                )
                self.head = nn.Sequential(nn.Flatten(), nn.Dropout(0.3), nn.Linear(256, k))

            def forward(self, x):
                return self.head(self.features(x))

        model = SmallCNN(len(classes))
    else:
        try:
            from torchvision import models  # type: ignore[import]
            model = models.mobilenet_v3_small(weights=None)
            model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(classes))
        except ImportError as err:
            raise AIServiceUnavailable("torchvision is required for MobileNet architecture but is not installed.") from err

    model.load_state_dict(state_dict)
    model.eval()
    return model


@lru_cache(maxsize=1)
def get_cached_model():
    project_root = _get_project_root()
    model_candidates = [
        project_root / "Ai" / "SIH_2026-main" / "model" / "ewaste_classifier.pt",
        project_root / "backend" / "model" / "ewaste_classifier.pt",
    ]
    model_path = next((p for p in model_candidates if p.exists()), None)
    if not model_path:
        return None, None, None

    try:
        import torch
    except ImportError as err:
        raise AIServiceUnavailable("PyTorch dependencies are not installed.") from err

    try:
        checkpoint = torch.load(model_path, map_location="cpu", weights_only=True)
    except Exception:
        checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
    classes = checkpoint["classes"]
    img_size = checkpoint.get("img_size", 128)
    model = _build_model(classes, checkpoint["state_dict"])
    return model, classes, img_size


def predict_image(image_bytes: bytes, content_type: str | None, location: str = "Bhopal", weight_kg: float = 1.0):
    from app.file_security import validate_image_upload

    is_valid, err_msg, _ = validate_image_upload(image_bytes, content_type)
    if not is_valid:
        raise ValueError(err_msg)
    if weight_kg <= 0:
        raise ValueError("weight_kg must be greater than zero.")

    model, classes, img_size = get_cached_model()
    if model is None:
        raise AIServiceUnavailable("AI model checkpoint not found at Ai/SIH_2026-main/model/ewaste_classifier.pt")

    import torch
    from PIL import Image

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    try:
        from torchvision import transforms  # type: ignore[import]
        transform = transforms.Compose([
            transforms.Resize((img_size, img_size)),
            transforms.ToTensor(),
        ])
        image_tensor = transform(image).unsqueeze(0)
    except ImportError:
        import numpy as np
        if image.size != (img_size, img_size):
            image = image.resize((img_size, img_size), Image.Resampling.BILINEAR)
        img_arr = np.array(image, dtype=np.float32) / 255.0
        img_arr = np.transpose(img_arr, (2, 0, 1))
        image_tensor = torch.from_numpy(img_arr).unsqueeze(0)

    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.softmax(logits, dim=1)[0]

    top_values, top_indices = torch.topk(probabilities, min(3, len(classes)))
    top_predictions = [
        {"category": classes[int(idx)], "confidence": round(float(val), 4)}
        for val, idx in zip(top_values, top_indices)
    ]
    predicted_category = top_predictions[0]["category"]
    confidence = top_predictions[0]["confidence"]

    # Tiered Confidence Handling Policy
    if confidence >= 0.80:
        tier = "high"
        recommendation = "strong_suggestion"
    elif confidence >= 0.50:
        tier = "medium"
        recommendation = "confirm_manually"
    else:
        tier = "low"
        recommendation = "manual_required"

    pricing_info = estimate_price(predicted_category, location, weight_kg)
    matched_recyclers = match_recyclers(predicted_category, location, limit=5)

    return {
        "category": predicted_category,
        "confidence": confidence,
        "confidence_tier": tier,
        "recommendation": recommendation,
        "location": location,
        "weight_kg": weight_kg,
        "top_predictions": top_predictions,
        "pricing": pricing_info,
        "recycler_matches": matched_recyclers,
    }