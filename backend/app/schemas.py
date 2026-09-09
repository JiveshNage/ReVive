from pydantic import BaseModel, Field


class MaterialOut(BaseModel):
    id: int
    name: str
    category: str
    description: str | None = None
    is_hazardous: bool = False


class LotCreate(BaseModel):
    collector_id: int = Field(..., ge=1)
    material_id: int = Field(..., ge=1)
    quantity_kg: float = Field(..., gt=0)
    photo_url: str | None = None


class LotOut(BaseModel):
    id: int
    collector_id: int
    material_id: int
    photo_url: str | None = None
    quantity_kg: float
    estimated_value: float
    status: str


class OfferCreate(BaseModel):
    lot_id: int = Field(..., ge=1)
    recycler_id: int = Field(..., ge=1)
    offer_price: float = Field(..., ge=0)
    pickup_available: bool = True


class HandoverCreate(BaseModel):
    lot_id: int = Field(..., ge=1)
    collector_id: int = Field(..., ge=1)
    recycler_id: int = Field(..., ge=1)
    final_weight_kg: float = Field(..., gt=0)
    handover_location: str = Field(..., min_length=2)
    collector_confirmed: bool = False
    recycler_confirmed: bool = False
    signature: str | None = None


class HandoverOut(BaseModel):
    id: int
    lot_id: int
    collector_id: int
    recycler_id: int
    final_weight_kg: float
    handover_location: str
    collector_confirmed: bool
    recycler_confirmed: bool
    signature: str | None = None
    status: str


class RecyclerOut(BaseModel):
    id: int
    name: str
    verified: bool
    location: str
    contact_phone: str | None = None


class TimelineEvent(BaseModel):
    step: int
    title: str
    description: str
    timestamp: str | None = None
    completed: bool = True


class TraceabilityOut(BaseModel):
    lot_id: int
    lot_status: str
    quantity_kg: float
    final_weight_kg: float | None = None
    weight_discrepancy_kg: float | None = None
    estimated_value: float
    final_price: float | None = None
    material: MaterialOut | None = None
    collector_id: int
    recycler: RecyclerOut | None = None
    handover: HandoverOut | None = None
    certificate_hash: str
    timeline: list[TimelineEvent] = []


class PriceEstimateOut(BaseModel):
    category: str
    pricing_category: str
    location: str
    weight_kg: float
    price_per_kg_median: float
    estimated_value: float
    price_min: float
    price_max: float
    samples: int


class RecyclerMatchOut(BaseModel):
    recycler_id: int
    recycler_name: str
    location: str
    accepted_materials: str
    authorization_status: str
    contact: str | None = None
    rate: str | None = None
    pickup_availability: str
    service_area: str
    score: int


class PredictionTopItem(BaseModel):
    category: str
    confidence: float


class PredictionOut(BaseModel):
    category: str
    confidence: float
    confidence_tier: str  # "high" | "medium" | "low"
    recommendation: str   # "strong_suggestion" | "confirm_manually" | "manual_required"
    location: str
    weight_kg: float
    top_predictions: list[PredictionTopItem]
    pricing: PriceEstimateOut | None = None
    recycler_matches: list[RecyclerMatchOut] = []


class BenchmarkCategoryRate(BaseModel):
    category: str
    median_rate_per_kg: float
    min_rate_per_kg: float
    max_rate_per_kg: float
    sample_count: int


class RecyclingPassportOut(BaseModel):
    passport_id: str
    lot_id: int
    material_name: str
    material_category: str
    is_hazardous: bool
    initial_weight_kg: float
    verified_weight_kg: float | None = None
    collector_alias: str
    recycler_name: str | None = None
    recycler_authorization: str | None = None
    status: str
    certificate_hash: str
    co2_saved_kg: float
    toxic_diverted_kg: float
    qr_data: str
    created_at: str | None = None
    timeline: list[TimelineEvent] = []


class SafetyGuidanceItem(BaseModel):
    material_key: str
    category_name: str
    hazard_level: str
    vernacular_slogan: dict[str, str]
    explanation: dict[str, str]
    dos: list[dict[str, str]]
    donts: list[dict[str, str]]


class SafetyGuidanceResponse(BaseModel):
    items: list[SafetyGuidanceItem]


class AdminMetricsOut(BaseModel):
    total_lots: int
    active_lots: int
    completed_lots: int
    total_weight_kg: float
    total_turnover_inr: float
    co2_saved_kg: float
    toxic_metals_diverted_kg: float
    total_recyclers: int
    verified_recyclers: int
    recycler_verification_ratio: float
    flagged_anomalies_count: int


class AdminAnomalyOut(BaseModel):
    id: str
    type: str  # "weight_discrepancy" | "price_outlier" | "unverified_actor"
    severity: str  # "high" | "medium" | "low"
    lot_id: int
    title: str
    description: str
    expected_value: str
    actual_value: str
    detected_at: str
    status: str = "open"  # "open" | "resolved"


class RecyclerVerificationUpdate(BaseModel):
    verified: bool
    cpcb_license: str | None = None
    notes: str | None = None


class DemoWorkflowResult(BaseModel):
    success: bool
    lot_id: int
    passport_id: str
    steps_completed: list[str]
    certificate_hash: str
    qr_data: str


class OtpSendRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    email: str | None = None


class OtpSendResponse(BaseModel):
    success: bool
    message: str
    demo_otp: str


class OtpVerifyRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=8)


class UserProfileOut(BaseModel):
    id: int
    custom_user_id: str | None = None
    name: str
    phone: str
    role: str
    language: str
    location: str = "Bhopal, MP"
    email: str | None = None
    company_name: str | None = None
    license_no: str | None = None
    service_area: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut
    is_new_user: bool = False


class OtpVerifyResponse(BaseModel):
    verified: bool
    is_new_user: bool
    user: UserProfileOut | None = None
    token: str
    access_token: str | None = None
    token_type: str = "bearer"


class UserSignupRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2)
    password: str | None = Field(None, min_length=4, max_length=128)
    email: str | None = None
    role: str = "collector"
    language: str = "hi"
    location: str = "Bhopal, MP"
    company_name: str | None = None
    license_no: str | None = None
    service_area: str | None = None
    custom_user_id: str | None = None


class UserLoginRequest(BaseModel):
    phone_or_email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)


class ProfileCreateRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2)
    password: str | None = Field(None, min_length=4, max_length=128)
    role: str = "collector"
    language: str = "hi"
    location: str = "Bhopal, MP"
    email: str | None = None
    company_name: str | None = None
    license_no: str | None = None
    service_area: str | None = None
    custom_user_id: str | None = None


class LoginAuditOut(BaseModel):
    id: int
    user_id: int | None = None
    phone: str
    login_type: str
    status: str
    created_at: str | None = None
