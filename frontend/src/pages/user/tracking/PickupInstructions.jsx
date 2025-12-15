import React from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ClockIcon from "../../../components/icons/ClockIcon";
import LocationIcon from "../../../components/icons/LocationIcon";

function PickupInstructions({ onBack, onViewDetails }) {
    return (
        <>
            <div className="text-section">
                <h3 className="status-title">Pickup at Registrar</h3>
                <p className="subtext-long">
                    You have chosen to pick up your document at the Registrar's Office. Please follow the instructions below to complete the pickup process.
                </p>
                <div className="instructions-section">
                    <div className="instructions-title">Pickup Instructions:</div>
                    <div className="instructions-body">
                        <div className="instructions-intro">Please prepare the following and visit the Registrar's Office:</div>
                        <ol className="instructions-list">
                            <li><strong>Valid ID</strong> - Bring a government-issued ID for verification.</li>
                            <li><strong>Tracking Number</strong> - Have your tracking number ready for reference.</li>
                            <li><strong>Payment Receipt</strong> - If applicable, bring proof of payment.</li>
                        </ol>
                    </div>
                </div>
                <div className="details-container">
                    <div className="details-card">
                        <ClockIcon className="details-icon" />
                        <div className="details-text">
                            <strong>Office Hours: </strong>
                            <span>Mon-Fri, 8:00 AM - 5:00 PM</span>
                        </div>
                    </div>
                    <div className="details-card">
                        <LocationIcon className="details-icon" />
                        <div className="details-text">
                            <strong>Location: </strong>
                            <span>Registrar's Office, MSU-IIT Campus</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="action-section">
                <div className="button-section">
                    <ButtonLink onClick={onBack} placeholder="Return" variant="secondary" />
                    <ButtonLink
                        onClick={onViewDetails}
                        placeholder="View Documents"
                        variant="primary"
                    />
                </div>
            </div>
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default PickupInstructions;
