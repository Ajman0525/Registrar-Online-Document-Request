import React from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";

function TrackStatus({ onBack, trackData }) {
    // config for each status
    const statusConfig = {
        "Ready for Pickup": {
            className: "status-ready",
            title: "Document Ready",
            action: (
                <div className="choice-section">
                    <p className="subtext">Your document is now ready for release. Please choose how you would like to receive it:</p>
                    <div className="choice-buttons">
                        <ButtonLink to="/user/pickup-registrar" placeholder="Pick up at Registrar" className="choice-button pickup-button" />
                        <ButtonLink to="/user/delivery" placeholder="Delivery" className="choice-button delivery-button" />
                    </div>
                </div>
            )
        },
        "Processing": {
            className: "status-processing",
            title: "Processing"
        },
        "Under Review": {
            className: "status-review",
            title: "Under Review"
        },
        "For Signature": {
            className: "status-signature",
            title: "For Signature"
        },
        "Payment Pending": {
            className: "status-payment",
            title: "Payment Pending",

            action: <ButtonLink to="link" placeholder="Pay Now" variant="primary" /> // replace "link" with actual payment link
        }
    };

    if (!trackData) {
        return (
            <div className="Track-page">
                <ContentBox>
                    <p>No tracking data available. Please go back and enter your details.</p>
                    <ButtonLink onClick={onBack} placeholder="Return" variant="primary" />
                </ContentBox>
            </div>
        );
    }

    // get the specific configuration for the current status
    const config = statusConfig[trackData.status];

    // data not found case
    if (!config) {
        return (
            <div className="Track-page">
                <ContentBox>
                    <p>An unknown status was received. Please contact support.</p>
                    <ButtonLink onClick={onBack} placeholder="Return" variant="primary" />
                </ContentBox>
            </div>
        );
    }

    return (
        <div className="Track-page">
            <ContentBox>
                {/* The className from the config is applied here */}
                <div className={`text-section ${config.className}`}>
                    <h3 className="status-title">{config.title}</h3>
                    <div className="subtext">
                        <p><strong>Tracking Number:</strong> {trackData.trackingNumber}</p>
                        <p>{trackData.details}</p>
                    </div>
                </div>

                <div className="action-section">
                    {config.action || <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />}

                    <div className="support-section">
                        <p className="subtext">Need help? Contact the </p>
                        <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                    </div>
                </div>
            </ContentBox>
        </div>
    );
}

export default TrackStatus;