import React, { useState, useEffect } from 'react';
import { API_ENDPOINT } from '../../config';
import { Spinner } from './Spinner';

function backendBaseFromApiEndpoint_() {
  const endpoint = String(API_ENDPOINT || '').trim();
  if (!endpoint) return '';
  try {
    const u = new URL(endpoint);
    u.pathname = u.pathname.replace(/\/api\/?$/i, '/');
    u.search = '';
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function isHex32_(value) {
  return /^[0-9a-f]{32}$/i.test(String(value || '').trim());
}

function isHttpUrl_(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function isGoogleHostPath_(value) {
  return /^(drive|docs)\.google\.com\//i.test(String(value || '').trim());
}

function getCvUrl(fileId, token) {
  const id = String(fileId || '').trim();
  if (!id) return null;

  // If already a URL
  if (isHttpUrl_(id)) {
    return id;
  }

  // Google hosted path
  if (isGoogleHostPath_(id)) {
    return `https://${id}`;
  }

  const base = backendBaseFromApiEndpoint_();
  const isLocalId = isHex32_(id);

  // Flask backend local uploads
  if (isLocalId && base) {
    const t = String(token || '').trim();
    if (!t) return null;
    return `${base}/files/${encodeURIComponent(id)}?token=${encodeURIComponent(t)}`;
  }

  // Legacy Google Drive - use preview mode
  return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
}

/**
 * CvPreviewModal - Modal to preview CV/PDF in same page
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Close callback
 * @param {string} props.cvFileId - CV file ID
 * @param {string} props.token - Auth token
 * @param {Object} props.candidate - Candidate data for showing details
 */
export function CvPreviewModal({ open, onClose, cvFileId, token, candidate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(false);
    }
  }, [open, cvFileId]);

  if (!open) return null;

  const cvUrl = getCvUrl(cvFileId, token);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const openInNewTab = () => {
    if (cvUrl) {
      window.open(cvUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="cv-modal-overlay" onClick={onClose}>
      <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cv-modal-header">
          <div className="cv-modal-title">
            <span className="cv-modal-icon">📄</span>
            <div>
              <h3>CV Preview</h3>
              {candidate && (
                <span className="cv-modal-candidate">
                  {candidate.fullName || candidate.candidateId}
                </span>
              )}
            </div>
          </div>
          <div className="cv-modal-actions">
            <button 
              type="button" 
              className="button" 
              onClick={openInNewTab}
              title="Open in new tab"
            >
              ↗ New Tab
            </button>
            <button 
              type="button" 
              className="cv-modal-close" 
              onClick={onClose}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Candidate Details Panel (if provided) */}
        {candidate && (
          <div className="cv-modal-details">
            <div className="cv-modal-details-grid">
              {candidate.jobRole && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Position</span>
                  <span className="cv-modal-detail-value">{candidate.jobRole}</span>
                </div>
              )}
              {candidate.source && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Source</span>
                  <span className="cv-modal-detail-value">{candidate.source}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Phone</span>
                  <span className="cv-modal-detail-value">{candidate.phone}</span>
                </div>
              )}
              {candidate.email && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Email</span>
                  <span className="cv-modal-detail-value">{candidate.email}</span>
                </div>
              )}
              {candidate.experience && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Experience</span>
                  <span className="cv-modal-detail-value">{candidate.experience}</span>
                </div>
              )}
              {candidate.currentSalary && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Current Salary</span>
                  <span className="cv-modal-detail-value">{candidate.currentSalary}</span>
                </div>
              )}
              {candidate.expectedSalary && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Expected Salary</span>
                  <span className="cv-modal-detail-value">{candidate.expectedSalary}</span>
                </div>
              )}
              {candidate.noticePeriod && (
                <div className="cv-modal-detail">
                  <span className="cv-modal-detail-label">Notice Period</span>
                  <span className="cv-modal-detail-value">{candidate.noticePeriod}</span>
                </div>
              )}
            </div>

            {/* Test Scores if available */}
            {(candidate.onlineTestScore || candidate.preInterviewMarks || candidate.inPersonMarks) && (
              <div className="cv-modal-scores">
                <span className="cv-modal-detail-label">Scores</span>
                <div className="cv-modal-scores-badges">
                  {candidate.onlineTestScore != null && (
                    <span className="badge">Online Test: {candidate.onlineTestScore}</span>
                  )}
                  {candidate.preInterviewMarks != null && (
                    <span className="badge">Pre-interview: {candidate.preInterviewMarks}</span>
                  )}
                  {candidate.inPersonMarks != null && (
                    <span className="badge" style={{ background: '#22c55e', color: '#fff' }}>
                      In-person: {candidate.inPersonMarks}/10
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CV Iframe */}
        <div className="cv-modal-body">
          {loading && (
            <div className="cv-modal-loading">
              <Spinner size={32} />
              <span>Loading CV...</span>
            </div>
          )}
          
          {error && (
            <div className="cv-modal-error">
              <span className="cv-modal-error-icon">⚠️</span>
              <span>Unable to load CV preview</span>
              <button className="button" onClick={openInNewTab}>
                Try opening in new tab
              </button>
            </div>
          )}

          {cvUrl ? (
            <iframe
              src={cvUrl}
              className="cv-modal-iframe"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="CV Preview"
              style={{ display: loading || error ? 'none' : 'block' }}
            />
          ) : (
            <div className="cv-modal-error">
              <span className="cv-modal-error-icon">📄</span>
              <span>CV not available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
