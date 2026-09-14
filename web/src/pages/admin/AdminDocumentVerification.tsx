import React, { useEffect, useState } from 'react';
import { DocumentAuditLog, OrganizationDocument } from '../../types';
import {
  adminGetDocumentAuditLogs,
  adminGetDocuments,
  adminReviewDocument,
  getDocumentFileUrl,
} from '../../api/client';

export interface AdminDocumentVerificationProps {
  onRefreshStats?: () => void;
}

const COMMON_REJECTION_REASONS = [
  'Document is expired or nearing immediate invalidity',
  'Document scan is unreadable, blurred, or truncated',
  'Document number does not match organization legal registration',
  'Incorrect document type uploaded for this compliance requirement',
  'Document missing statutory stamp / authorized signatory signature',
  'Additional SPCB / CPCB state consent documentation required',
];

export const AdminDocumentVerification: React.FC<AdminDocumentVerificationProps> = ({
  onRefreshStats,
}) => {
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<OrganizationDocument | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(COMMON_REJECTION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audit trail drawer
  const [auditDrawerOpen, setAuditDrawerOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await adminGetDocuments(statusFilter === 'ALL' ? undefined : statusFilter);
      setDocuments(data);
    } catch (err: any) {
      console.error('Failed to load admin documents:', err);
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to fetch compliance documents.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, [statusFilter]);

  const handleOpenInspect = (doc: OrganizationDocument) => {
    setSelectedDoc(doc);
    setReviewAction(null);
    setInspectModalOpen(true);
  };

  const handleReviewSubmit = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedDoc) return;
    setSubmittingReview(true);
    setFeedbackMsg(null);

    const finalReason =
      status === 'REJECTED'
        ? customNotes.trim()
          ? `${rejectionReason} - Notes: ${customNotes.trim()}`
          : rejectionReason
        : undefined;

    try {
      const updated = await adminReviewDocument(selectedDoc.id, {
        status,
        rejection_reason: finalReason,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Document '${updated.document_type_name || updated.file_name}' successfully marked as ${status}.`,
      });

      // Update local state
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDoc(null);
      setInspectModalOpen(false);
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Review failed. Rejection reason is strictly required.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenAudit = async () => {
    setAuditDrawerOpen(true);
    setLoadingAudit(true);
    try {
      const logs = await adminGetDocumentAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Metrics
  const pendingCount = documents.filter((d) => d.status === 'PENDING').length;
  const approvedCount = documents.filter((d) => d.status === 'APPROVED').length;
  const rejectedCount = documents.filter((d) => d.status === 'REJECTED').length;
  const expiredCount = documents.filter((d) => d.status === 'EXPIRED' || d.is_expired).length;

  return (
    <div className="admin-subpage-container" style={{ width: '100%' }}>
      {/* Header Row */}
      <div className="subpage-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            📜 Organization Certificate & Compliance Verification
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Statutory verification of CPCB authorizations, SPCB consents, GSTIN, and enterprise registrations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => void handleOpenAudit()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            📋 Compliance Audit Trail
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => void loadDocuments()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            🔄 Refresh Queue
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedbackMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedbackMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          <span>{feedbackMsg.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Queue Total</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{documents.length}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #fef08a', background: '#fefce8', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#854d0e', fontWeight: 600, textTransform: 'uppercase' }}>⏳ Pending Review</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ca8a04', marginTop: '4px' }}>{pendingCount}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #bbf7d0', background: '#f0fdf4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>✓ Approved & Compliant</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{approvedCount}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #fecaca', background: '#fef2f2', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase' }}>✕ Rejected / Action Needed</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>{rejectedCount}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid #fed7aa', background: '#fff7ed', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '12px', color: '#9a3412', fontWeight: 600, textTransform: 'uppercase' }}>⚠ Expired / Expiring</span>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>{expiredCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'ALL', label: `All Documents (${documents.length})` },
          { id: 'PENDING', label: `Pending Review (${pendingCount})` },
          { id: 'APPROVED', label: `Approved (${approvedCount})` },
          { id: 'REJECTED', label: `Rejected (${rejectedCount})` },
          { id: 'EXPIRED', label: `Expired (${expiredCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: statusFilter === tab.id ? '#059669' : '#f1f5f9',
              color: statusFilter === tab.id ? '#fff' : '#475569',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="panel legacy-panel" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Loading organization compliance certificates...</div>
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
            <strong style={{ fontSize: '16px', color: '#1e293b' }}>No documents in this queue</strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
              {statusFilter === 'ALL'
                ? 'No organization has submitted compliance documentation yet.'
                : `No documents currently marked as ${statusFilter}.`}
            </p>
          </div>
        ) : (
          <div className="admin-table-container" style={{ overflowX: 'auto' }}>
            <table className="admin-data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Organization</th>
                  <th style={{ padding: '12px 16px' }}>Document Type</th>
                  <th style={{ padding: '12px 16px' }}>Identifier / License #</th>
                  <th style={{ padding: '12px 16px' }}>Validity & Expiry</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Submission Info</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{doc.organization_name || `Org #${doc.organization_id}`}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>UID: #{doc.organization_id}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: '#334155', display: 'block' }}>
                        {doc.document_type_name || doc.document_type_code}
                      </span>
                      <code style={{ fontSize: '11px', color: '#64748b' }}>{doc.original_filename}</code>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ fontFamily: 'monospace', color: '#059669' }}>
                        {doc.document_number || 'N/A'}
                      </strong>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {doc.expiry_date ? (
                        <div>
                          <span>Exp: {doc.expiry_date}</span>
                          {doc.is_expired ? (
                            <span style={{ display: 'block', color: '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>
                              ⚠ EXPIRED
                            </span>
                          ) : doc.is_expiring_soon ? (
                            <span style={{ display: 'block', color: '#ea580c', fontSize: '11px', fontWeight: 'bold' }}>
                              ⚠ Expiring Soon
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Perpetual / Unspecified</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            doc.status === 'APPROVED'
                              ? '#dcfce7'
                              : doc.status === 'PENDING'
                              ? '#fef9c3'
                              : doc.status === 'REJECTED'
                              ? '#fee2e2'
                              : '#ffedd5',
                          color:
                            doc.status === 'APPROVED'
                              ? '#15803d'
                              : doc.status === 'PENDING'
                              ? '#a16207'
                              : doc.status === 'REJECTED'
                              ? '#b91c1c'
                              : '#c2410c',
                        }}
                      >
                        {doc.status === 'APPROVED' && '✓ APPROVED'}
                        {doc.status === 'PENDING' && '⏳ PENDING'}
                        {doc.status === 'REJECTED' && '✕ REJECTED'}
                        {doc.status === 'EXPIRED' && '⚠ EXPIRED'}
                      </span>
                      {doc.rejection_reason && (
                        <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', maxWidth: '200px' }}>
                          Reason: {doc.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      <div>v{doc.version}</div>
                      <div>{doc.submitted_at ? doc.submitted_at.substring(0, 10) : 'Recent'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(doc)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #059669',
                          background: '#ecfdf5',
                          color: '#059669',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Review & Preview Modal */}
      {inspectModalOpen && selectedDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Regulatory Inspection: {selectedDoc.document_type_name || selectedDoc.document_type_code}
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Organization: <strong>{selectedDoc.organization_name || `Org #${selectedDoc.organization_id}`}</strong> | Doc #: <code>{selectedDoc.document_number || 'N/A'}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Document Preview Area */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    📎 {selectedDoc.original_filename} ({(selectedDoc.file_size / 1024).toFixed(1)} KB)
                  </span>
                  <a
                    href={getDocumentFileUrl(selectedDoc.id)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#059669', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Open in New Tab ↗
                  </a>
                </div>

                {selectedDoc.file_type.includes('pdf') ? (
                  <iframe
                    src={getDocumentFileUrl(selectedDoc.id)}
                    title="Document Stream Preview"
                    style={{ width: '100%', height: '360px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}
                  />
                ) : (
                  <img
                    src={getDocumentFileUrl(selectedDoc.id)}
                    alt="Document Stream Preview"
                    style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                )}
              </div>

              {/* Review Decision Form */}
              <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                  Administrator Verification Action
                </h4>

                {reviewAction === 'REJECTED' ? (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#991b1b', marginBottom: '6px' }}>
                      Select Mandatory Rejection Reason *
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f87171', fontSize: '13px', marginBottom: '12px', background: '#fff' }}
                    >
                      {COMMON_REJECTION_REASONS.map((r, i) => (
                        <option key={i} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>

                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Additional Inspector Notes (Sent to Organization)
                    </label>
                    <textarea
                      rows={2}
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="e.g. Please upload the clear front page of CTO order signed by Member Secretary..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  {reviewAction === 'REJECTED' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setReviewAction(null)}
                        style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={submittingReview}
                        onClick={() => void handleReviewSubmit('REJECTED')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                      >
                        {submittingReview ? 'Submitting...' : 'Confirm Document Rejection'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setReviewAction('REJECTED')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #f87171', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                      >
                        ✕ Reject with Reason
                      </button>
                      <button
                        type="button"
                        disabled={submittingReview}
                        onClick={() => void handleReviewSubmit('APPROVED')}
                        style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                      >
                        {submittingReview ? 'Approving...' : '✓ Approve Certificate'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Audit Trail Drawer */}
      {auditDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                📋 Statutory Compliance Audit Trail
              </h3>
              <button
                type="button"
                onClick={() => setAuditDrawerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingAudit ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading audit events...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No audit events logged yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              log.action === 'APPROVED'
                                ? '#15803d'
                                : log.action === 'REJECTED'
                                ? '#b91c1c'
                                : '#0284c7',
                          }}
                        >
                          {log.action}
                        </span>
                        <span style={{ color: '#94a3b8' }}>{log.created_at?.replace('T', ' ').substring(0, 19)}</span>
                      </div>
                      <div style={{ color: '#334155', fontWeight: 500 }}>{log.details}</div>
                      {log.actor_name && (
                        <div style={{ color: '#64748b', marginTop: '4px' }}>By: {log.actor_name}</div>
                      )}
                      {log.rejection_reason && (
                        <div style={{ color: '#dc2626', marginTop: '4px', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                          Reason: {log.rejection_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
