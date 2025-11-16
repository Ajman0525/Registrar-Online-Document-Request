import React, { useEffect } from 'react';
import './Tracking.css';

function PaymentSuccess({ onPaymentComplete }) {
  useEffect(() => {
    // simulate a delay for the user to see the success message before redirecting
    const timer = setTimeout(() => {
      onPaymentComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onPaymentComplete]);

  return (
    <div className="text-section">
      <h3 className="status-title">Payment Successful!</h3>
      <p className="subtext">Your payment has been confirmed. You will be redirected shortly...</p>
    </div>
  );
}

export default PaymentSuccess;
