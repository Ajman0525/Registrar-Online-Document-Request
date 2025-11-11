import React from "react";
import ButtonLink from "../../../components/common/ButtonLink";
import "./Tracking.css";

function PaymentOptions({ trackData, amountDue, onSelectMethod, onBack, onViewDetails }) {
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
                        <p><strong>₱{trackData.amountDue.toFixed(2)}</strong></p>
                    </div>
                </div>
            </div>
            <div className="claim-options">
                <ButtonLink onClick={() => onSelectMethod("online")} placeholder="Pay Online" className="claim-button delivery-button" />
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
