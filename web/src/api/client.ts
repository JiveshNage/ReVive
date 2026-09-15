import { API_BASE_URL } from '../types';

export { API_BASE_URL };

export interface ApiErrorDetail {
  field?: string;
  message?: string;
  type?: string;
}

export class ApiError extends Error {
  status: number;
  errors?: ApiErrorDetail[];

  constructor(message: string, status: number, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Type-safe HTTP request wrapper that automatically attaches the user's
 * JWT Bearer token from localStorage and parses response data or errors.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('revive_token') : null;

  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers || {});

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    let errors: ApiErrorDetail[] | undefined;
    try {
      const data = await response.json();
      errorDetail = data.detail || errorDetail;
      errors = data.errors;
    } catch {
      // Body not JSON
    }
    throw new ApiError(errorDetail, response.status, errors);
  }

  return response.json() as Promise<T>;
}

export const apiGet = <T>(endpoint: string, options?: RequestInit) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPut = <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
  apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiDelete = <T>(endpoint: string, options?: RequestInit) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });

// ============================================================================
// Document Verification API Client Methods
// ============================================================================
import type {
  DocumentAuditLog,
  DocumentType,
  OrganizationDocument,
  VerificationSummary,
} from '../types';

export async function getDocumentTypes(): Promise<DocumentType[]> {
  return apiGet<DocumentType[]>('/api/documents/types');
}

export async function getMyDocuments(): Promise<VerificationSummary> {
  return apiGet<VerificationSummary>('/api/documents/my');
}

export async function uploadDocument(formData: FormData): Promise<OrganizationDocument> {
  return apiPost<OrganizationDocument>('/api/documents/upload', formData);
}

export async function replaceDocument(
  documentId: number,
  formData: FormData
): Promise<OrganizationDocument> {
  return apiPut<OrganizationDocument>(`/api/documents/${documentId}`, formData);
}

export function getDocumentFileUrl(documentId: number): string {
  return `${API_BASE_URL}/api/documents/${documentId}/file`;
}

export async function adminGetDocuments(
  statusFilter?: string,
  orgId?: number
): Promise<OrganizationDocument[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'ALL') params.set('status_filter', statusFilter);
  if (orgId) params.set('org_id', String(orgId));
  const qs = params.toString();
  return apiGet<OrganizationDocument[]>(`/api/admin/documents${qs ? `?${qs}` : ''}`);
}

export async function adminReviewDocument(
  documentId: number,
  payload: { status: 'APPROVED' | 'REJECTED'; rejection_reason?: string }
): Promise<OrganizationDocument> {
  return apiPost<OrganizationDocument>(`/api/admin/documents/${documentId}/review`, payload);
}

export async function adminGetDocumentAuditLogs(
  orgId?: number
): Promise<DocumentAuditLog[]> {
  const qs = orgId ? `?org_id=${orgId}` : '';
  return apiGet<DocumentAuditLog[]>(`/api/admin/document-audit-logs${qs}`);
}

// ============================================================================
// Phase 2: Collector Earnings, Reputation & Price Intelligence Client Methods
// ============================================================================

export interface CollectorEarningsSummary {
  collector_id: number;
  collector_name: string;
  today_earnings: number;
  weekly_earnings: number;
  monthly_earnings: number;
  pending_dues: number;
  completed_cash_amount: number;
  completed_digital_amount: number;
  total_lifetime_earnings: number;
  total_completed_lots: number;
  total_pending_lots: number;
  transactions: Array<{
    lot_id: number;
    lot_reference: string;
    material_name: string;
    material_category: string;
    quantity_kg: number;
    final_amount: number;
    payment_method: string;
    status: string;
    date: string;
  }>;
}

export interface CollectorReputation {
  collector_id: number;
  custom_user_id: string;
  collector_name: string;
  reputation_tier: string;
  total_transactions: number;
  weight_accuracy_pct: number;
  on_time_handover_pct: number;
  recycler_rating: number;
  formalized_kg: number;
  total_earnings_inr: number;
}

export interface PriceExplanation {
  category: string;
  pricing_category: string;
  location: string;
  weight_kg: number;
  price_per_kg_median: number;
  suggested_rate_per_kg: number;
  estimated_value: number;
  price_min: number;
  price_max: number;
  samples: number;
  trend_pct_7d: number;
  trend_direction: string;
  provenance_status: string;
  why_this_price: Array<{
    factor: string;
    amount_inr: number;
    description: string;
  }>;
  historical_7d: Array<{
    day: string;
    price_per_kg: number;
  }>;
}

export async function getCollectorEarnings(collectorId: number): Promise<CollectorEarningsSummary> {
  return apiGet<CollectorEarningsSummary>(`/api/collector/${collectorId}/earnings`);
}

export async function getCollectorReputation(collectorId: number): Promise<CollectorReputation> {
  return apiGet<CollectorReputation>(`/api/collector/${collectorId}/reputation`);
}

export async function getPriceEstimate(
  category: string,
  location: string = 'Bhopal',
  weightKg: number = 1.0
): Promise<PriceExplanation> {
  const params = new URLSearchParams({
    category,
    location,
    weight_kg: String(weightKg),
  });
  return apiGet<PriceExplanation>(`/api/prices/estimate?${params.toString()}`);
}

export async function processLotPayment(
  lotId: number,
  payload: {
    amount: number;
    payment_method?: string;
    reference_id?: string;
    notes?: string;
  }
): Promise<{
  id: number;
  payment_reference: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  cash_received_confirmed: boolean;
}> {
  return apiPost(`/api/lots/${lotId}/pay`, {
    lot_id: lotId,
    amount: payload.amount,
    payment_method: payload.payment_method || 'CASH',
    reference_id: payload.reference_id,
    notes: payload.notes,
  });
}

export async function verifyFirebaseAuth(idToken: string): Promise<{
  access_token: string;
  token_type: string;
  user: unknown;
}> {
  return apiPost('/api/auth/firebase/verify', { id_token: idToken });
}

export interface HandoverOtpResult {
  lot_id: number;
  otp_code: string;
  expires_at: string;
  valid_duration_minutes: number;
  collector_id: number;
  message: string;
}

export interface HandoverVerifyResult {
  id: number;
  lot_id: number;
  collector_id: number;
  recycler_id: number;
  final_weight_kg: number;
  handover_location: string;
  collector_confirmed: boolean;
  recycler_confirmed: boolean;
  signature: string;
  status: string;
  discrepancy_flagged: boolean;
  discrepancy_pct: number;
  handover_reference: string;
}

export async function generateHandoverOtp(lotId: number): Promise<HandoverOtpResult> {
  return apiPost<HandoverOtpResult>(`/api/handovers/generate-otp?lot_id=${lotId}`);
}

export async function verifyHandoverOtp(
  lotId: number,
  payload: {
    otp_code: string;
    scale_weight_kg: number;
    latitude?: number;
    longitude?: number;
  }
): Promise<HandoverVerifyResult> {
  return apiPost<HandoverVerifyResult>(`/api/handovers/${lotId}/verify-otp`, payload);
}

export async function uploadLotPhoto(file: File): Promise<{
  success: boolean;
  photo_url: string;
  provider: string;
  file_size: number;
  format: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('revive_token') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/lots/upload-photo`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json();
}


