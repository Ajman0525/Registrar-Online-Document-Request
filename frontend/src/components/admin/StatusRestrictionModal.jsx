import React from 'react';
import './StatusRestrictionModal.css';

const StatusRestrictionModal = ({ 
  isOpen, 
  restriction, 
  request, 
  onClose,
  onViewDetails 
}) => {
  if (!isOpen || !restriction) return null;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(request);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="status-restriction-modal-overlay">
      <div className="status-restriction-modal-popup">
        {/* Header with icon */}
        <div className="status-restriction-modal-header">
          <div className="status-restriction-modal-icon">⚠️</div>
          <h3 className="status-restriction-modal-title">
            Status Transition Not Allowed
          </h3>
        </div>

        {/* Current vs Target Status */}
        <div className="status-restriction-modal-status-comparison">
          <div className="status-comparison-item">
            <span className="status-label">From:</span>
            <span className="status-value current">{restriction.currentStatus}</span>
          </div>
          <div className="status-arrow">→</div>
          <div className="status-comparison-item">
            <span className="status-label">To:</span>
            <span className="status-value target">{restriction.targetStatus}</span>
          </div>
        </div>

        {/* Request Info */}
        {request && (
          <div className="status-restriction-modal-request-info">
            <h4>Request Details</h4>
            <div className="request-info-grid">
              <div className="info-item">
                <span className="info-label">Request ID:</span>
                <span className="info-value">{request.request_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Requester:</span>
                <span className="info-value">{request.full_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Status:</span>
                <span className={`info-value ${request.payment_status ? 'paid' : 'unpaid'}`}>
                  {request.payment_status ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Assigned Admin:</span>
                <span className="info-value">
                  {request.assigned_admin_id ? request.assigned_admin_id : 'Not Assigned'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Restriction Details */}
        <div className="status-restriction-modal-content">
          <div className="restriction-section">
            <h4 className="restriction-title">
              <span className="restriction-icon">❌</span>
              Why This Transition Is Not Allowed
            </h4>
            <p className="restriction-reason">{restriction.reason}</p>
          </div>

          <div className="restriction-section">
            <h4 className="restriction-title">
              <span className="restriction-icon">📋</span>
              Requirements to Meet
            </h4>
            <p className="restriction-requirement">{restriction.requirement}</p>
          </div>

          <div className="restriction-section">
            <h4 className="restriction-title">
              <span className="restriction-icon">🔧</span>
              Next Steps to Resolve
            </h4>
            <p className="restriction-next-steps">{restriction.nextSteps}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="status-restriction-modal-actions">
          <button 
            onClick={handleViewDetails}
            className="status-restriction-modal-view-details-btn"
          >
            View Request Details
          </button>
          <button 
            onClick={handleClose}
            className="status-restriction-modal-close-btn"
          >
            Got It
          </button>
        </div>

        {/* Additional Help */}
        <div className="status-restriction-modal-help">
          <p>
            💡 <strong>Need Help?</strong> Contact your supervisor if you need assistance 
            with this request or if you believe this restriction should not apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusRestrictionModal;
