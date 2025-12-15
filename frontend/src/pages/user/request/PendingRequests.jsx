import React, { useState, useEffect } from 'react';
import { getCSRFToken } from '../../../utils/csrf';
import ClockIcon from '../../../components/icons/ClockIcon';
import ProcessedIcon from '../../../components/icons/ProcessedIcon';
import './PendingRequests.css';

function PendingRequests({ onProceedToNewRequest, onBackToLogin }) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProceedModal, setShowProceedModal] = useState(false);

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  const fetchActiveRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/check-active-requests", {
        method: "GET",
        headers: {
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === "success") {
        setActiveRequests(data.active_requests || []);
      } else {
        setError(data.message || "Failed to fetch active requests");
      }
    } catch (error) {
      console.error("Error fetching active requests:", error);
      setError("An error occurred while fetching active requests.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="status-icon pending" />;
      case 'processing':
      case 'in_progress':
        return <ProcessedIcon className="status-icon processing" />;
      default:
        return <ClockIcon className="status-icon default" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
      case 'in_progress':
        return 'status-processing';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProceedToNewRequest = () => {
    setShowProceedModal(true);
  };

  const handleConfirmProceed = () => {
    setShowProceedModal(false);
    onProceedToNewRequest();
  };


  const handleCancelProceed = () => {
    setShowProceedModal(false);
  };

  const handleBackToLogin = async () => {
    try {
      // Clear the session on the server
      await fetch("/api/clear-session", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Error clearing session:", error);
    }
    // Navigate to landing page
    window.location.href = "/user/login";
  };



  if (loading) {
    return (
      <div className="pr-pending-requests-container">
        <div className="pr-loading-container">
          <div className="pr-loading-spinner"></div>
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pr-pending-requests-container">
        <div className="pr-error-container">
          <div className="pr-error-icon">⚠️</div>
          <h3>Error Loading Requests</h3>
          <p>{error}</p>

          <button onClick={fetchActiveRequests} className="pr-retry-button">
            Try Again
          </button>
          <button onClick={handleBackToLogin} className="pr-back-button">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-pending-requests-container">
      <div className="pr-pending-requests-header">
        <h2>Your Active Requests</h2>
        <p>You have {activeRequests.length} active request{activeRequests.length !== 1 ? 's' : ''}</p>
      </div>

      {activeRequests.length === 0 ? (
        <div className="pr-no-requests-container">
          <div className="pr-no-requests-icon">📋</div>
          <h3>No Active Requests</h3>
          <p>You don't have any active requests at the moment.</p>
          <button onClick={onProceedToNewRequest} className="pr-proceed-button">
            Create New Request
          </button>
        </div>
      ) : (
        <div className="pr-requests-list">
          {activeRequests.map((request) => (
            <div key={request.request_id} className="pr-request-card">
              <div className="pr-request-header">
                <div className="pr-request-id-section">
                  <h3 className="pr-request-id">Request ID: {request.request_id}</h3>
                  <div className={`pr-status-badge ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span className="pr-status-text">{request.status}</span>
                  </div>
                </div>

                <div className="pr-request-dates">
                  <div className="pr-date-item">
                    <span className="pr-date-label">Requested:</span>
                    <span className="pr-date-value">{formatDate(request.requested_at)}</span>
                  </div>
                </div>
              </div>







              <div className="pr-request-details">
                <div className="pr-documents-section">
                  <h4>Documents Requested ({request.document_count || 0}):</h4>

                  <div className="pr-documents-list">
                    {(request.regular_doc_count || 0) > 0 && (
                      <div>
                        <p className="pr-documents-text"><strong>Regular Documents ({request.regular_doc_count}):</strong></p>
                        <p className="pr-documents-text">{request.documents}</p>
                      </div>
                    )}
                    {request.custom_documents && request.custom_documents.length > 0 && (
                      <div className="pr-custom-docs-section">
                        <p className="pr-custom-docs-title"><strong>Custom Documents ({request.custom_documents.length}):</strong></p>
                        {request.custom_documents.map((customDoc, index) => (
                          <p key={customDoc.id || index} className="pr-custom-doc-item">
                            • {customDoc.doc_name}
                            {customDoc.description && <span className="pr-custom-doc-desc"> - {customDoc.description}</span>}
                          </p>
                        ))}
                      </div>
                    )}
                    {((!request.document_count || request.document_count === 0) && (!request.custom_documents || request.custom_documents.length === 0)) && (
                      <p className="pr-documents-text">No documents</p>
                    )}
                  </div>
                </div>

                <div className="pr-cost-section">
                  <span className="pr-cost-label">Total Cost:</span>
                  <span className="pr-cost-value">₱{request.total_cost.toFixed(2)}</span>
                </div>

                {request.remarks && (
                  <div className="pr-remarks-section">
                    <h4>Remarks:</h4>
                    <p>{request.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ))}



          <div className="pr-action-section">
            <button onClick={handleProceedToNewRequest} className="pr-proceed-button">
              Create New Request
            </button>
            <button onClick={handleBackToLogin} className="pr-back-button">
              Back to Login
            </button>
          </div>
        </div>
      )}

      {showProceedModal && (
        <div className="pr-modal-overlay">
          <div className="pr-modal-content">
            <h3>Proceed to New Request?</h3>
            <p>You can create a new request even if you have active ones. Your previous requests will remain active.</p>
            <div className="pr-modal-actions">
              <button onClick={handleConfirmProceed} className="pr-confirm-button">
                Yes, Create New Request
              </button>
              <button onClick={handleCancelProceed} className="pr-cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingRequests;
