import React, { useState } from "react";
import ButtonLink from "../../../components/common/ButtonLink";
import "./Tracking.css";

function PaymentOptions({ trackData, amountDue, onSelectMethod, onBack, onViewDetails }) {
    const [payFull, setPayFull] = useState(true);

    // Only show checkbox if there is a difference between minimum and full amount
    const showCheckbox = trackData.minimumAmountDue > 0 && trackData.minimumAmountDue < trackData.amountDue;
    const currentAmount = (showCheckbox && !payFull) ? trackData.minimumAmountDue : trackData.amountDue;

    return (
        <>
            <div className="text-section">
                <h3 className="status-title">Complete Your Payment</h3>
                <p className="subtext">Your document is ready. Please choose a payment method to proceed.</p>
                <div className="tracking-number-section">
                    <p>Tracking Number:</p>
                    <div className="number">
                        <p><strong>{trackData.trackingNumber}</strong></p>
                    </div>
                </div>
                <div className="amount-due">
                    <p>Amount Due:</p>
                    <div className="number">
                        <p><strong>₱{currentAmount.toFixed(2)}</strong></p>
                    </div>
                </div>
                
                {showCheckbox && (
                    <div className="payment-checkbox-container" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                            <input 
                                type="checkbox" 
                                checked={payFull} 
                                onChange={(e) => setPayFull(e.target.checked)} 
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            Pay Full Amount (₱{trackData.amountDue.toFixed(2)})
                        </label>
                    </div>
                )}
            </div>
            <div className="claim-options">
                <ButtonLink onClick={() => onSelectMethod(payFull ? "online" : "online_minimum")} placeholder="Pay Online" className="claim-button delivery-button" />
                <ButtonLink onClick={() => onSelectMethod("in-person")} placeholder="Pay in Person" className="claim-button pickup-button" />
            </div>
            <div className="action-section">
                <div className="button-section">
                    <ButtonLink onClick={onBack} placeholder="Back" variant="secondary" />
                    <ButtonLink onClick={onViewDetails} placeholder="View Request" variant="primary" />
                </div>
            </div>
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default PaymentOptions;
