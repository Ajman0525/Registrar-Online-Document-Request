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
            description: (
                <div className="status-body">
                    <p className="subtext">Your document is now ready for release. Please choose how you would like to receive it:</p>
                </div>
            ),
            action: (
                <div className="claim-options">
                    <ButtonLink to="/user/pickup-registrar" placeholder="Pick up at Registrar" className="claim-button pickup-button" />
                    <ButtonLink to="/user/delivery" placeholder="Delivery" className="claim-button delivery-button" />
                </div>
            )
        },
        "Processing": {
            className: "status-processing",
            title: "In Progress"
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
                    <div className="tracking-number-section">
                        <p>Tracking Number:</p>
                        <div className="number">
                            <p><strong>{trackData.trackingNumber}</strong></p>
                        </div>
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