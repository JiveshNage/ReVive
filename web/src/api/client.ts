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

