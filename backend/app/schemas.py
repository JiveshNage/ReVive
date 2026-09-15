from pydantic import BaseModel, Field, model_validator


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
    lot_reference: str | None = None


class OfferCreate(BaseModel):
    lot_id: int = Field(..., ge=1)
    recycler_id: int = Field(..., ge=1)
    offer_price: float = Field(..., ge=0)
    pickup_available: bool = True


class OfferOut(BaseModel):
    id: int
    lot_id: int
    recycler_id: int
    offer_price: float
    pickup_available: bool = True
    status: str


class HandoverCreate(BaseModel):
    lot_id: int = Field(..., ge=1)
    collector_id: int = Field(..., ge=1)
    recycler_id: int = Field(..., ge=1)
    final_weight_kg: float = Field(..., gt=0)
    handover_location: str = Field(..., min_length=2)
    collector_confirmed: bool = False
    recycler_confirmed: bool = False
    signature: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    photo_url: str | None = None


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
    latitude: float | None = None
    longitude: float | None = None
    photo_url: str | None = None
    handover_reference: str | None = None
    discrepancy_flagged: bool = False


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
    suggested_rate_per_kg: float | None = None
    estimated_value: float
    price_min: float
    price_max: float
    samples: int
    trend_pct_7d: float | None = None
    trend_direction: str | None = None
    provenance_status: str | None = None
    why_this_price: list[dict] = []
    historical_7d: list[dict] = []


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
    phone: str | None = None
    email: str | None = None

    @model_validator(mode="after")
    def validate_identifier(self):
        if not (self.phone and self.phone.strip()) and not (self.email and self.email.strip()):
            raise ValueError("Either phone or email must be provided.")
        return self


class OtpSendResponse(BaseModel):
    success: bool
    message: str
    demo_otp: str | None = None


class OtpVerifyRequest(BaseModel):
    phone: str | None = None
    email: str | None = None
    otp: str = Field(..., min_length=4, max_length=8)
    role: str | None = "collector"


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
    verification_status: str = "NOT_SUBMITTED"


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


class DocumentTypeOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    required: bool = True
    active: bool = True
    applicable_to: str = "recycler,enterprise"
    validity_required: bool = True
    created_at: str | None = None
    updated_at: str | None = None


class DocumentTypeCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=150)
    description: str | None = None
    required: bool = True
    active: bool = True
    applicable_to: str = "recycler,enterprise"
    validity_required: bool = True


class OrganizationDocumentOut(BaseModel):
    id: int
    organization_id: int
    organization_name: str | None = None
    document_type_id: int
    document_type_code: str | None = None
    document_type_name: str | None = None
    document_number: str | None = None
    file_name: str
    original_filename: str
    file_type: str
    file_size: int
    issued_date: str | None = None
    expiry_date: str | None = None
    status: str
    rejection_reason: str | None = None
    submitted_at: str | None = None
    reviewed_at: str | None = None
    reviewed_by: int | None = None
    reviewer_name: str | None = None
    version: int = 1
    is_expiring_soon: bool = False
    is_expired: bool = False
    download_url: str | None = None


class DocumentReviewRequest(BaseModel):
    status: str = Field(..., pattern="^(APPROVED|REJECTED)$")
    rejection_reason: str | None = None

    @model_validator(mode="after")
    def validate_rejection_reason(self):
        if self.status == "REJECTED":
            if not self.rejection_reason or not self.rejection_reason.strip():
                raise ValueError("A clear rejection reason is mandatory when rejecting a document.")
        return self


class DocumentAuditLogOut(BaseModel):
    id: int
    document_id: int | None = None
    organization_id: int
    actor_id: int | None = None
    actor_name: str | None = None
    action: str
    details: str | None = None
    rejection_reason: str | None = None
    created_at: str | None = None


class VerificationSummaryOut(BaseModel):
    verification_status: str
    total_required: int
    total_uploaded: int
    total_approved: int
    total_pending: int
    total_rejected: int
    total_expired: int
    expiring_within_30_days: int
    can_transact: bool
    message: str
    documents: list[OrganizationDocumentOut] = []


class FirebaseVerifyRequest(BaseModel):
    id_token: str = Field(..., min_length=10)


class PaymentCreate(BaseModel):
    lot_id: int = Field(..., ge=1)
    handover_id: int | None = None
    amount: float = Field(..., gt=0)
    payment_method: str = Field(default="CASH")  # CASH or UPI
    reference_id: str | None = None
    notes: str | None = None


class PaymentOut(BaseModel):
    id: int
    payment_reference: str
    lot_id: int
    collector_id: int
    recycler_id: int
    amount: float
    payment_method: str
    payment_status: str
    reference_id: str | None = None
    cash_received_confirmed: bool
    notes: str | None = None
    created_at: str | None = None


class CollectorEarningsTransaction(BaseModel):
    lot_id: int
    lot_reference: str
    material_name: str
    material_category: str
    quantity_kg: float
    final_amount: float
    payment_method: str
    status: str  # PAID, PENDING
    date: str


class CollectorEarningsSummary(BaseModel):
    collector_id: int
    collector_name: str
    today_earnings: float
    weekly_earnings: float
    monthly_earnings: float
    pending_dues: float
    completed_cash_amount: float
    completed_digital_amount: float
    total_lifetime_earnings: float
    total_completed_lots: int
    total_pending_lots: int
    transactions: list[CollectorEarningsTransaction] = []


class CollectorReputationOut(BaseModel):
    collector_id: int
    custom_user_id: str
    collector_name: str
    reputation_tier: str
    total_transactions: int
    weight_accuracy_pct: float
    on_time_handover_pct: float
    recycler_rating: float
    formalized_kg: float
    total_earnings_inr: float


class PriceBreakdownItem(BaseModel):
    factor: str
    amount_inr: float
    description: str


class PriceTrendPoint(BaseModel):
    day: str
    price_per_kg: float


class PriceExplanationOut(BaseModel):
    category: str
    pricing_category: str
    location: str
    weight_kg: float
    price_per_kg_median: float
    estimated_value: float
    price_min: float
    price_max: float
    suggested_rate_per_kg: float
    samples: int
    trend_pct_7d: float
    trend_direction: str  # up, down, stable
    provenance_status: str  # REAL_MARKET_INDEX, RECENT, DEMO
    why_this_price: list[PriceBreakdownItem] = []
    historical_7d: list[PriceTrendPoint] = []


