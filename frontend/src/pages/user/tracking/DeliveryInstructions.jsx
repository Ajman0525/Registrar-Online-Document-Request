import React from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";

function DeliveryInstructions({ onBack }) {
    return (
        <>
            <div className="text-section">
                <h3 className="status-title-red">LBC Delivery</h3>
                <p className="subtext-long">
                    You have chosen to receive your document via LBC Express. You will be redirected to the official LBC website to complete the delivery request.
                </p>
                <div className="instructions-section">
                    <div className="instructions-title">Instructions Before Redirecting:</div>
                    <div className="instructions-body">
                        <div className="instructions-intro"> Please prepare the following information to enter on the LBC form:</div>
                        <ol className="instructions-list">
                            <li><strong>Recipient Name</strong> - Must match the valid ID.</li>
                            <li><strong>Complete Delivery Address</strong> - Include house number, street, barangay, city/municipality, and province.</li>
                            <li><strong>Contact Number</strong> - Mobile number for LBC updates.</li>
                            <li><strong>Request ID</strong> - [REQ-12345] (for reference).</li>
                            <li><strong>Preferred Delivery Option</strong> - Standard (3-5 business days) or Express (if available).</li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="action-section">
                <div className="button-section">
                    <ButtonLink onClick={onBack} placeholder="Return" variant="secondary" />
                    <ButtonLink onClick={onBack} placeholder="Proceed" variant="primary" />
                </div>
            </div>
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default DeliveryInstructions;
