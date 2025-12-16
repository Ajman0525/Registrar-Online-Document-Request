import React, { useEffect } from 'react';
import ButtonLink from '../../../components/common/ButtonLink';
import './Tracking.css';

function PaymentSuccess({ onViewStatus, trackingNumber }) {
  useEffect(() => {
    // Auto-redirect to status after 3 seconds
    const timer = setTimeout(() => {
      if (onViewStatus) {
        onViewStatus();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onViewStatus]);

  return (
    <div className="text-section">
      <h3 className="status-title">Payment Successful!</h3>
      <p className="subtext">Your payment has been confirmed. Click "View Status" to see how to receive your documents.</p>
      <div style={{ marginTop: '20px' }}>
        <ButtonLink onClick={onViewStatus} placeholder="View Status Now" variant="primary" />
      </div>
    </div>
  );
}

export default PaymentSuccess;
