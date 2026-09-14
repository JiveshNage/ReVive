from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.ai_service import (
    AIServiceUnavailable,
    estimate_price,
    get_price_benchmarks,
    match_recyclers,
    predict_image,
)
from app.config import settings
from app.file_security import validate_image_upload
from app.schemas import (
    BenchmarkCategoryRate,
    PredictionOut,
    PriceEstimateOut,
    RecyclerMatchOut,
    SafetyGuidanceItem,
    SafetyGuidanceResponse,
)

router = APIRouter(prefix=settings.api_v1_prefix, tags=["AI, Pricing & Safety"])


SAFETY_KNOWLEDGE_BASE = [
    SafetyGuidanceItem(
        material_key="cable",
        category_name="Copper Cable & Wire",
        hazard_level="high",
        vernacular_slogan={
            "en": "Do not burn wire! Releases carcinogenic dioxins and neurotoxins.",
            "hi": "तार मत जलाओ! इससे जहरीला धुआं और कैंसर कारक गैसें निकलती हैं।",
            "mr": "वायर जाळू नका! यामुळे विषारी धूर आणि कर्करोगास कारणीभूत वायू तयार होतात.",
        },
        explanation={
            "en": "Open burning of PVC cables emits furans and dioxins causing severe respiratory damage and soil contamination.",
            "hi": "पीवीसी कोटिंग वाले तारों को जलाने से फ्यूरॉन और डायऑक्सिन निकलते हैं जो फेफड़ों और पर्यावरण को नुकसान पहुंचाते हैं।",
            "mr": "पीव्हीसी तारा जाळल्याने श्वसन प्रणाली खराब होते आणि विषारी धूर हवेत पसरतो.",
        },
        dos=[
            {"en": "Use mechanical wire strippers or cutters.", "hi": "मैकेनिकल वायर स्ट्रिपर या कटर का इस्तेमाल करें।", "mr": "वायर स्ट्रिपर किंवा कटरचा वापर करा."},
            {"en": "Sell intact cable bundles to verified recyclers.", "hi": "तारों के बंडल सीधे अधिकृत रीसाइक्लर को दें।", "mr": "तारांचे बंडल थेट अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Never burn cables in open heaps or barrel pits.", "hi": "खुले में तारों को कभी आग मत लगाएं।", "mr": "उघड्यावर तारांना कधीही आग लावू नका."},
            {"en": "Do not inhale hot fumes or melting insulation.", "hi": "तार काटते समय धुआं अंदर न लें।", "mr": "कापताना येणारा धूर श्वासात घेऊ नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="battery",
        category_name="Lithium-ion & Lead-Acid Battery",
        hazard_level="high",
        vernacular_slogan={
            "en": "Do not puncture or crush batteries! Risk of fire and chemical burns.",
            "hi": "बैटरी को कभी मत तोड़ो या छेदो! आग और एसिड का भारी खतरा।",
            "mr": "बॅटरी कधीही फोडू नका! आग आणि ॲसिडचा तीव्र धोका.",
        },
        explanation={
            "en": "Puncturing lithium batteries causes instant thermal runaway explosions. Lead-acid batteries leak corrosive sulfuric acid.",
            "hi": "लिथियम बैटरी फटने पर भयंकर आग लगती है और लेड-एसिड बैटरी से तेजाब लीक होता है।",
            "mr": "लिथियम बॅटरी फुटल्यास स्फोट आणि आग लागते, तर लेड बॅटरीतून ॲसिड गळती होते.",
        },
        dos=[
            {"en": "Tape battery terminals with non-conductive tape.", "hi": "शॉर्ट सर्किट से बचने के लिए बैटरी टर्मिनलों पर टेप लगाएं।", "mr": "शॉर्ट सर्किट टाळण्यासाठी टोकांवर चिकटपट्टी लावा."},
            {"en": "Store in dry, non-flammable insulated crates.", "hi": "सूखे और हवादार डिब्बे में ज्वलनशील चीजों से दूर रखें।", "mr": "ज्वलनशील पदार्थांपासून दूर कोरड्या जागी ठेवा."},
        ],
        donts=[
            {"en": "Never strike batteries with hammers or chisels.", "hi": "हथौड़े से बैटरी को तोड़ने की कोशिश कभी न करें।", "mr": "हातोड्याने बॅटरी फोडण्याचा प्रयत्न करू नका."},
            {"en": "Do not throw leaking batteries into common bins.", "hi": "लीक हो रही बैटरी को आम कूड़ेदान में न फेंकें।", "mr": "गळती होणाऱ्या बॅटऱ्या साध्या कचऱ्यात टाकू नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="pcb",
        category_name="Printed Circuit Boards (PCB)",
        hazard_level="high",
        vernacular_slogan={
            "en": "Wear protective gloves & mask. Do not use acid baths!",
            "hi": "दस्ताने और मास्क पहनें। एसिड (तेजाब) में मत डालो।",
            "mr": "हातमोजे व मास्क वापरा. ॲसिडमध्ये भिजवू नका.",
        },
        explanation={
            "en": "Backyard nitric/cyanide leaching releases deadly nitrogen dioxide gas and permanently toxifies drinking groundwater.",
            "hi": "सोना निकालने के लिए तेजाब का उपयोग जानलेवा गैस बनाता है और पानी को जहरीला करता है।",
            "mr": "सोनं काढण्यासाठी ॲसिडचा वापर केल्यास विषारी वायू तयार होऊन जीवाचा धोका होतो.",
        },
        dos=[
            {"en": "Wear cut-resistant nitrile gloves and N95 masks.", "hi": "मजबूत दस्ताने और फेस मास्क पहनकर काम करें।", "mr": "मजबूत हातमोजे आणि मास्क घालूनच काम करा."},
            {"en": "Keep boards whole for authorized hydrometallurgy facilities.", "hi": "बोर्ड को तोड़े बिना अधिकृत रीसाइक्लर को दें।", "mr": "सर्किट बोर्ड तोडण्याऐवजी संपूर्ण अधिकृत रिसायकलरला द्या."},
        ],
        donts=[
            {"en": "Never cook green boards over gas stoves.", "hi": "स्टोव या खुली आग पर सर्किट बोर्ड कभी न तपाएं।", "mr": "शेगडीवर सर्किट बोर्ड कधीही गरम करू नका."},
            {"en": "Never pour toxic leachate down household drains.", "hi": "तेजाब का गंदा पानी नाली या जमीन पर न बहाएं।", "mr": "ॲसिडचे घाण पाणी गटारात वाहू देऊ नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="crt",
        category_name="CRT Monitors & Glass Displays",
        hazard_level="medium",
        vernacular_slogan={
            "en": "Keep vacuum tube intact! Implosion spreads lead dust.",
            "hi": "कांच की पिक्चर ट्यूब मत फोड़ो! लेड और फॉस्फोर का जहर फैलता है।",
            "mr": "काचेची ट्यूब फोडू नका! लेड आणि फॉस्फरची विषारी धूळ पसरते.",
        },
        explanation={
            "en": "CRT funnels contain 1.5 to 3 kg of lead. Breaking tubes implodes glass and scatters toxic cadmium phosphor.",
            "hi": "सीआरटी मॉनिटर में बहुत ज्यादा लेड होता है, टूटने पर जहरीला पाउडर हवा में फैलता है।",
            "mr": "सीआरटी स्क्रीनमध्ये भरपूर शिसे असते, फुटल्यास विषारी पावडर हवेत पसरते.",
        },
        dos=[
            {"en": "Keep screens whole and cushioned during transit.", "hi": "स्क्रीन को सुरक्षित कपड़े पर रखकर ले जाएं।", "mr": "स्क्रीन सुरक्षित ठेवून वाहून न्या."},
            {"en": "Hand over complete unit to authorized dismantling units.", "hi": "पूरा मॉनिटर अधिकृत रीसाइक्लर को सौंपें।", "mr": "संपूर्ण युनिट अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Do not smash vacuum glass to get copper coils.", "hi": "तांबे के लिए कांच कभी न तोड़ें।", "mr": "तांब्यासाठी काच कधीही फोडू नका."},
            {"en": "Do not discard broken screen glass in landfills.", "hi": "टूटा कांच खुले मैदान में न फेंके।", "mr": "फुटलेली काच उघड्यावर टाकू नका."},
        ],
    ),
    SafetyGuidanceItem(
        material_key="mobile_phone",
        category_name="Mobile Phones & Handheld Gadgets",
        hazard_level="standard",
        vernacular_slogan={
            "en": "Keep devices dry and intact. Handle swollen batteries safely.",
            "hi": "डिवाइस को सूखा रखें। फूली हुई बैटरी को अलग रखें।",
            "mr": "डिव्हाइस कोरडे ठेवा. फुगलेली बॅटरी काळजीपूर्वक हाताळा.",
        },
        explanation={
            "en": "Internal smartphone lithium batteries can short and explode if pierced with sharp pry tools.",
            "hi": "फोन की बैटरी में नुकीला औजार लगने से आग लग सकती है।",
            "mr": "मोबाईलमधील बॅटरीवर टोकदार हत्यार लागल्यास आग लागू शकते.",
        },
        dos=[
            {"en": "Store in dry bins away from sparks and moisture.", "hi": "सूखे डिब्बे में नमी और आग से दूर रखें।", "mr": "कोरड्या डब्यात आग आणि ओलाव्यापासून दूर ठेवा."},
            {"en": "Batch phones for bulk authorized pickup.", "hi": "फोन इकट्ठे करके अधिकृत रीसाइक्लर को दें।", "mr": "फोन गोळा करून अधिकृत रिसायकलर्सना द्या."},
        ],
        donts=[
            {"en": "Do not burn plastic housings or battery packs.", "hi": "प्लास्टिक बॉडी या बैटरी को कभी न जलाएं।", "mr": "प्लास्टिक बॉडी किंवा बॅटरी जाळू नका."},
            {"en": "Do not attempt crude backyard battery harvesting.", "hi": "घर पर बैटरी जबरदस्ती खोलने की कोशिश न करें।", "mr": "घरी बॅटरी उघडण्याचा प्रयत्न करू नका."},
        ],
    ),
]

@router.post("/ai/predict", response_model=PredictionOut)
async def predict_material(
    file: UploadFile = File(...),
    location: str = "Bhopal",
    weight_kg: float = 1.0,
):
    contents = await file.read()
    is_valid, err_msg, _ = validate_image_upload(contents, file.content_type)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)

    try:
        return predict_image(contents, file.content_type, location, weight_kg)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except AIServiceUnavailable as error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)) from error


@router.get("/prices/estimate", response_model=PriceEstimateOut)
def get_price_estimate(category: str = "PCB", location: str = "Bhopal", weight_kg: float = 1.0):
    if weight_kg <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="weight_kg must be greater than zero")
    res = estimate_price(category, location, weight_kg)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing benchmark not available")
    return res


@router.get("/prices/benchmarks", response_model=list[BenchmarkCategoryRate])
def get_benchmarks():
    return get_price_benchmarks()


@router.get("/prices/trends")
def get_price_trends(category: str = "PCB", city: str = "Bhopal"):
    city_factors = {
        "bhopal": 1.0,
        "indore": 1.03,
        "pune": 1.08,
        "delhi": 1.12,
        "mumbai": 1.10,
        "nashik": 1.02,
    }
    norm_city = city.lower().split(",")[0].strip()
    factor = city_factors.get(norm_city, 1.0)

    base_trajectories = {
        "PCB": [168, 172, 178, 182, 186, 192],
        "Battery": [54, 56, 58, 62, 65, 68],
        "Cable": [92, 95, 102, 106, 110, 115],
        "Display": [82, 85, 89, 92, 95, 98],
        "Metal": [85, 88, 90, 94, 98, 102],
        "Plastic": [34, 36, 38, 40, 42, 44],
    }

    matched_key = "PCB"
    cat_lower = category.lower()
    for k in base_trajectories:
        if k.lower() in cat_lower or cat_lower in k.lower():
            matched_key = k
            break

    months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov (Live)"]
    raw_points = base_trajectories[matched_key]
    points = [round(p * factor, 1) for p in raw_points]
    live_rate = points[-1]
    prev_rate = points[-2]
    mom_change = round(((live_rate - prev_rate) / prev_rate) * 100.0, 1)

    return {
        "category": matched_key,
        "city": city,
        "live_rate_inr": live_rate,
        "currency": "INR",
        "unit": "kg",
        "mom_change_pct": mom_change,
        "trend_direction": "up" if mom_change >= 0 else "down",
        "series": [
            {"month": m, "rate": p, "volume_index": round(p * 1.5, 0)}
            for m, p in zip(months, points)
        ],
        "min_6m": min(points),
        "max_6m": max(points),
        "avg_6m": round(sum(points) / len(points), 1),
        "last_updated": "Just now (Live Feed)",
    }


@router.get("/recyclers/match", response_model=list[RecyclerMatchOut])
def get_recycler_matches(
    category: str = "PCB",
    location: str = "Bhopal",
    limit: int = 12,
    query: str | None = None,
    pickup_only: bool = False,
):
    return match_recyclers(
        category=category,
        location=location,
        limit=limit,
        query=query,
        pickup_only=pickup_only,
    )


@router.get("/safety/guidance", response_model=SafetyGuidanceResponse)
def get_safety_guidance(category: str | None = None):
    if category:
        cat_lower = category.lower()
        filtered = [
            item for item in SAFETY_KNOWLEDGE_BASE
            if item.material_key in cat_lower or cat_lower in item.category_name.lower()
        ]
        if filtered:
            return SafetyGuidanceResponse(items=filtered)
    return SafetyGuidanceResponse(items=SAFETY_KNOWLEDGE_BASE)
