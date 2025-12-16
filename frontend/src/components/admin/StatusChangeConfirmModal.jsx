
import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getDisplayStatus } from '../../utils/statusRestrictions';
import './StatusChangeConfirmModal.css';

const StatusChangeConfirmModal = ({ request, newStatus, onConfirm, onCancel, isLoading = false }) => {
  if (!request) return null;

  return (
    <div className="status-change-modal-overlay">
      <div className="status-change-modal-popup">

        <h3 className="status-change-modal-title">Confirm Status Change</h3>
        <p className="status-change-modal-message">
          Are you sure you want to change the status of <strong>{request.request_id}</strong> ({request.full_name}) from <strong>{getDisplayStatus(request.status)}</strong> to <strong>{getDisplayStatus(newStatus.status)}</strong>?
        </p>
        {isLoading && <LoadingSpinner message="Updating status..." />}
        <div className="status-change-modal-action-section">
          <button onClick={onCancel} className="status-change-modal-cancel-button" disabled={isLoading}>No</button>
          <button onClick={onConfirm} className="status-change-modal-confirm-button" disabled={isLoading}>Yes</button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfirmModal;
