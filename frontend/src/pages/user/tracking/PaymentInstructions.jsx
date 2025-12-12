import React from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import LocationIcon from "../../../components/icons/LocationIcon";
import ClockIcon from "../../../components/icons/ClockIcon";

function PaymentInstructions({ onBack }) {
    return (
        <>
            <div className="text-section">
                <h3 className="status-title">In-Person Payment & Pick-up Instructions</h3>
                <p className="subtext-long">
                    You have chosen to pay and claim your document in person at the Registrar's Office. Please review the information below to complete your transaction.
                </p>
                <div className="instructions-section">
                    <div className="instructions-title">Instructions Before Proceeding:</div>
                    <div className="instructions-body">
                        <div className="instructions-intro"> Please prepare the following items before visiting the Registrar's Office:</div>
                        <ol className="instructions-list alpha-list">
                            <li><strong>Valid ID</strong> - Government-issued or student ID (must match the requester's name).</li>
                            <li><strong>Payment</strong> - Settle the required fee at the Cashier's Office before claiming your document.</li>
                            <li><strong>Payment Receipt</strong> - Bring the official receipt as proof of payment</li>
                            <li><strong>Tracking ID</strong> - Bring your tracking ID for reference</li>
                            <li><strong>Authorization Letter</strong> - If someone else will claim the document (include photocopies of both IDs).</li>
                        </ol>
                    </div>
                </div>
                <div className="details-container">
                    <div className="details-card">
                        <LocationIcon className="details-icon" />
                        <div className="instructions-body">
                            <div className="instructions-intro">Office Locations:</div>
                            <ul className="instructions-list bullet-list">
                                <li><strong>Payment</strong> - Cashier's Office</li>
                                <li><strong>Pick-up</strong> - Registrar's Office</li>
                            </ul>
                        </div>
                    </div>
                    <div className="details-card">
                        <ClockIcon className="details-icon" />
                        <div className="instructions-body">
                            <div className="instructions-intro">Office Hours:</div>
                            <ul className="instructions-list bullet-list">
                                <li><strong>Monday to Friday:</strong> 8:00 AM - 5:00 PM</li>
                                <li><strong>Lunch Break:</strong> 12:00 PM - 1:00 PM</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="action-section">
                <div className="button-section">
                    <ButtonLink onClick={onBack} placeholder="Back" variant="primary" />
                </div>
            </div>
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default PaymentInstructions;
