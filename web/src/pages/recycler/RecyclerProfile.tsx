import React, { useEffect, useState } from 'react';
import {
  DocumentAuditLog,
  DocumentType,
  OrganizationDocument,
  UserProfile,
  VerificationSummary,
} from '../../types';
import {
  getDocumentFileUrl,
  getDocumentTypes,
  getMyDocuments,
  replaceDocument,
  uploadDocument,
} from '../../api/client';

export interface RecyclerProfileProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const RecyclerProfile: React.FC<RecyclerProfileProps> = ({ currentUser, onLogout }) => {
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [docNumber, setDocNumber] = useState<string>('');
  const [issuedDate, setIssuedDate] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');

  // Replace Modal State
  const [replaceTargetDoc, setReplaceTargetDoc] = useState<OrganizationDocument | null>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<OrganizationDocument | null>(null);

  // History Drawer State
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  const fetchDocumentData = async () => {
    setLoading(true);
    try {
      const [summaryData, typesData] = await Promise.all([getMyDocuments(), getDocumentTypes()]);
      setSummary(summaryData);
      setDocTypes(typesData);
      if (typesData.length > 0) {
        setSelectedTypeId(typesData[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load organization verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDocumentData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }

    const file = e.target.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF, JPG, PNG, and WEBP documents are accepted.');
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a certificate file (PDF, PNG, JPG, or WEBP).');
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('document_type_id', String(selectedTypeId));
    if (docNumber.trim()) formData.append('document_number', docNumber.trim());
    if (issuedDate.trim()) formData.append('issued_date', issuedDate.trim());
    if (expiryDate.trim()) formData.append('expiry_date', expiryDate.trim());
    formData.append('file', selectedFile);

    try {
      const created = await uploadDocument(formData);
      setFeedback({
        type: 'success',
        text: `Document '${created.document_type_name || created.original_filename}' uploaded successfully for regulatory review.`,
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setDocNumber('');
      setIssuedDate('');
      setExpiryDate('');
      await fetchDocumentData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to upload document. Please check the file and try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replaceTargetDoc || !selectedFile) {
      setFileError('Please select a newer replacement file.');
      return;
    }

    setActionLoading(true);
    setFeedback(null);

    const formData = new FormData();
    if (docNumber.trim()) formData.append('document_number', docNumber.trim());
    if (issuedDate.trim()) formData.append('issued_date', issuedDate.trim());
    if (expiryDate.trim()) formData.append('expiry_date', expiryDate.trim());
    formData.append('file', selectedFile);

    try {
      const updated = await replaceDocument(replaceTargetDoc.id, formData);
      setFeedback({
        type: 'success',
        text: `Replacement document '${updated.document_type_name}' version ${updated.version} submitted for verification.`,
      });
      setReplaceTargetDoc(null);
      setSelectedFile(null);
      setDocNumber('');
      setIssuedDate('');
      setExpiryDate('');
      await fetchDocumentData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to replace document.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const verificationStatus = summary?.verification_status || currentUser?.verification_status || 'NOT_SUBMITTED';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: '✓ Verified Organization',
          subtext: 'CPCB Authorized Facility & Full Statutory Compliance',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          color: '#065f46',
          icon: '🛡️',
        };
      case 'UNDER_REVIEW':
        return {
          label: '⏳ Verification Pending (Under Review)',
          subtext: 'Your submitted documentation is being inspected by CPCB / SPCB auditors.',
          bg: '#fefce8',
          border: '#fef08a',
          color: '#854d0e',
          icon: '⏳',
        };
      case 'PARTIALLY_VERIFIED':
        return {
          label: '⚠ Partially Verified',
          subtext: 'Some certificates are approved, but additional required documents are pending.',
          bg: '#fff7ed',
          border: '#fed7aa',
          color: '#9a3412',
          icon: '📋',
        };
      case 'REJECTED':
        return {
          label: '✕ Verification Rejected / Action Required',
          subtext: 'One or more certificates were rejected. Please review feedback and re-upload.',
          bg: '#fef2f2',
          border: '#fecaca',
          color: '#991b1b',
          icon: '🚨',
        };
      case 'EXPIRED':
        return {
          label: '⚠ Compliance Certificates Expired',
          subtext: 'Your statutory validity has lapsed. Please upload renewed certificates.',
          bg: '#fff7ed',
          border: '#fed7aa',
          color: '#c2410c',
          icon: '⏰',
        };
      default:
        return {
          label: '⚠ Documents Pending Submission',
          subtext: 'Submit required CPCB and enterprise documentation to unlock verified recycler bidding.',
          bg: '#f8fafc',
          border: '#e2e8f0',
          color: '#475569',
          icon: '📁',
        };
    }
  };

  const currentBadge = getStatusBadge(verificationStatus);

  return (
    <div className="recycler-subpage-container" style={{ width: '100%', maxWidth: 'none' }}>
      {/* Header */}
      <div className="subpage-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            🏢 Recycler Organization Profile & Compliance
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Central Pollution Control Board statutory registration, facility metadata & certificate verification
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setUploadModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
            }}
          >
            ➕ Upload Certificate
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={onLogout}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Logout / Switch Account
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Verification Status Hero Banner */}
      <div
        style={{
          background: currentBadge.bg,
          border: `1px solid ${currentBadge.border}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              fontSize: '36px',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {currentBadge.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: currentBadge.color }}>
                {currentBadge.label}
              </h3>
              {summary && (
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: '#fff', border: `1px solid ${currentBadge.border}`, color: currentBadge.color, fontWeight: 700 }}>
                  {summary.total_approved} of {summary.total_required} Required Approved
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0', color: '#475569', fontSize: '14px', maxWidth: '680px' }}>
              {currentBadge.subtext}
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Submit Documentation
          </button>
        </div>
      </div>

      {/* Top Details & Organization Metadata Card */}
      <div className="enterprise-profile-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div className="profile-hero-section" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <div className="facility-logo-placeholder" style={{ fontSize: '28px', background: '#ecfdf5', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🏭
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {currentUser?.company_name || 'EcoCycle Pune Solutions Pvt Ltd'}
            </h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              UID: <code>{currentUser?.custom_user_id || `REV-REC-${currentUser?.id || 1}`}</code> | Primary Facility
            </span>
          </div>
        </div>

        <div className="profile-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>CPCB EPR License #</span>
            <strong style={{ display: 'block', color: '#059669', fontFamily: 'monospace', fontSize: '15px', marginTop: '4px' }}>
              {currentUser?.license_no || 'CPCB/EW/2024/0981'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Facility Location</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginTop: '4px' }}>
              {currentUser?.location || 'Pune MIDC, Bhosari, Maharashtra'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Service Coverage Area</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginTop: '4px' }}>
              {currentUser?.service_area || 'Maharashtra & Western Region'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Authorized Representative</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginTop: '4px' }}>
              {currentUser?.name || 'Raj Recycler'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Official Contact Phone</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginTop: '4px' }}>
              +91 {currentUser?.phone || '9123456780'}
            </strong>
          </div>

          <div className="profile-field-item">
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Official Email</span>
            <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginTop: '4px' }}>
              {currentUser?.email || 'ops@ecocycle.in'}
            </strong>
          </div>
        </div>
      </div>

      {/* SECTION: Required Compliance Documents Checklist */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              📑 Required Organization Certificates
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              Statutory documents specified under Central Pollution Control Board e-waste guidelines
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {docTypes.map((dt) => {
            const uploaded = summary?.documents.find((d) => d.document_type_id === dt.id);
            const isApproved = uploaded?.status === 'APPROVED';
            const isRejected = uploaded?.status === 'REJECTED';
            const isPending = uploaded?.status === 'PENDING';
            const isExpired = uploaded?.status === 'EXPIRED' || uploaded?.is_expired;

            return (
              <div
                key={dt.id}
                style={{
                  background: '#fff',
                  border: isApproved
                    ? '1px solid #bbf7d0'
                    : isRejected
                    ? '1px solid #fecaca'
                    : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: dt.required ? '#fee2e2' : '#f1f5f9',
                        color: dt.required ? '#991b1b' : '#475569',
                      }}
                    >
                      {dt.required ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isApproved
                          ? '#16a34a'
                          : isRejected
                          ? '#dc2626'
                          : isPending
                          ? '#ca8a04'
                          : isExpired
                          ? '#ea580c'
                          : '#94a3b8',
                      }}
                    >
                      {isApproved && '✓ Approved'}
                      {isPending && '⏳ In Review'}
                      {isRejected && '✕ Rejected'}
                      {isExpired && '⚠ Expired'}
                      {!uploaded && '● Not Uploaded'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    {dt.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {dt.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {uploaded ? (
                    <>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>v{uploaded.version} • {uploaded.file_type.split('/')[1]?.toUpperCase()}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplaceTargetDoc(uploaded);
                          setDocNumber(uploaded.document_number || '');
                          setIssuedDate(uploaded.issued_date || '');
                          setExpiryDate(uploaded.expiry_date || '');
                        }}
                        style={{
                          background: isRejected || isExpired ? '#fee2e2' : '#f1f5f9',
                          color: isRejected || isExpired ? '#dc2626' : '#334155',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isRejected || isExpired ? 'Replace Document' : 'Update'}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTypeId(dt.id);
                        setUploadModalOpen(true);
                      }}
                      style={{
                        width: '100%',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Upload Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: Submitted Certificates Table */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
          📋 Document History & Regulatory Review Status
        </h3>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading certificates...</div>
          ) : !summary || summary.documents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
              <strong>No certificates uploaded yet</strong>
              <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                Upload your CPCB and legal documentation to unlock bidding on e-waste scrap lots.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '14px 18px' }}>Document Type</th>
                    <th style={{ padding: '14px 18px' }}>Identifier / License #</th>
                    <th style={{ padding: '14px 18px' }}>File Information</th>
                    <th style={{ padding: '14px 18px' }}>Validity & Expiry</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.documents.map((doc) => (
                    <React.Fragment key={doc.id}>
                      <tr style={{ borderBottom: doc.rejection_reason ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>
                            {doc.document_type_name || doc.document_type_code}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>v{doc.version} • Submitted {doc.submitted_at?.substring(0, 10)}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <code style={{ color: '#059669', fontWeight: 600 }}>{doc.document_number || 'N/A'}</code>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>
                          <div>{doc.original_filename}</div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
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
                            <span style={{ color: '#94a3b8' }}>Perpetual</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
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
                            {doc.status === 'PENDING' && '⏳ PENDING REVIEW'}
                            {doc.status === 'REJECTED' && '✕ REJECTED'}
                            {doc.status === 'EXPIRED' && '⚠ EXPIRED'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                color: '#334155',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              View
                            </button>
                            {(doc.status === 'REJECTED' || doc.status === 'EXPIRED') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplaceTargetDoc(doc);
                                  setDocNumber(doc.document_number || '');
                                  setIssuedDate(doc.issued_date || '');
                                  setExpiryDate(doc.expiry_date || '');
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#dc2626',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                Replace
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Rejection Alert Row */}
                      {doc.rejection_reason && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td colSpan={6} style={{ padding: '0 18px 14px 18px' }}>
                            <div
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '12px',
                                color: '#991b1b',
                              }}
                            >
                              <span>
                                <strong>🚨 Rejection Reason:</strong> {doc.rejection_reason}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplaceTargetDoc(doc);
                                  setDocNumber(doc.document_number || '');
                                  setIssuedDate(doc.issued_date || '');
                                  setExpiryDate(doc.expiry_date || '');
                                }}
                                style={{
                                  background: '#dc2626',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Upload Corrected Version
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {uploadModalOpen && (
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
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Upload Compliance Document
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Document Requirement *
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  required
                >
                  {docTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name} {dt.required ? '(Mandatory)' : '(Optional)'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Document / Registration #
                </label>
                <input
                  type="text"
                  placeholder="e.g. CPCB/EW/2026/0912 or 27AAACG1234F1Z5"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Certificate File (PDF, PNG, JPG, WEBP • Max 10MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #94a3b8', background: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
                {fileError && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{fileError}</div>}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                >
                  {actionLoading ? 'Uploading...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLACE DOCUMENT MODAL */}
      {replaceTargetDoc && (
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
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Replace: {replaceTargetDoc.document_type_name || replaceTargetDoc.document_type_code}
                </h3>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                  Current Version: v{replaceTargetDoc.version} ({replaceTargetDoc.status})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplaceTargetDoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} style={{ padding: '24px' }}>
              {replaceTargetDoc.rejection_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#991b1b' }}>
                  <strong>Prior Rejection Reason:</strong> {replaceTargetDoc.rejection_reason}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Updated Document / Registration #
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    New Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Select Updated File (PDF, PNG, JPG, WEBP) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed #94a3b8', background: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
                  required
                />
                {fileError && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{fileError}</div>}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReplaceTargetDoc(null)}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                >
                  {actionLoading ? 'Submitting...' : 'Upload Replacement Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
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
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  {previewDoc.document_type_name || previewDoc.document_type_code}
                </h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {previewDoc.original_filename} (v{previewDoc.version})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, textAlign: 'center' }}>
              {previewDoc.file_type.includes('pdf') ? (
                <iframe
                  src={getDocumentFileUrl(previewDoc.id)}
                  title="Document Preview"
                  style={{ width: '100%', height: '480px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
              ) : (
                <img
                  src={getDocumentFileUrl(previewDoc.id)}
                  alt="Document Preview"
                  style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '8px' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
