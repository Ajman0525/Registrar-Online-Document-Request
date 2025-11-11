import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";

/* track status component */
function TrackStatus({ trackData, onBack, onViewDetails, onViewDeliveryInstructions, onViewPaymentOptions }) {

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
            options: (
                <div className="claim-options">
                    <ButtonLink to="/user/delivery" placeholder="Pick up at Registrar" className="claim-button pickup-button" />
                    <ButtonLink onClick={onViewDeliveryInstructions} placeholder="Delivery" className="claim-button delivery-button" />
                </div>
            )
        },
        "Processing": {
            className: "status-processing",
            title: "In Progress",
            description: (  
                <div className="status-body">
                    <p className="subtext">Our staff is currently preparing your requested documents. This includes printing, verifying details, and ensuring everything is accurate before moving to the next step.</p>
                </div>
            )
        },
        "Under Review": {
            className: "status-review",
            title: "Under Review",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your request and submitted requirements are being carefully checked by the registrar's office to confirm that all details and documents are complete and valid.</p>
                </div>
            )
        },
        "For Signature": {
            className: "status-signature",
            title: "For Signature",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your documents are ready and are now awaiting the official signature and approval from the registrar or authorized school official.</p>
                </div>
            )
        },
        "Payment Pending": {
            className: "status-payment",
            title: "Payment Pending",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your document is now ready. Please complete your payment using the button below. A confirmation will be sent once payment is received.</p>
                </div>
            ),
            options: (
                <div className="claim-options">
                    <ButtonLink onClick={onViewPaymentOptions} placeholder="Proceed to Payment" className="claim-button delivery-button" />
                </div>
            )
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

    const showViewDetailsButton = !config.options;

    return (
        <>
            {/* Main Status Content */}
            <div className={`text-section ${config.className}`}>
                <h3 className="status-title">{config.title}</h3>
                {config.description}
                <div className="tracking-number-section">
                    <p>Tracking Number:</p>
                    <div className="number">
                        <p><strong>{trackData.trackingNumber}</strong></p>
                    </div>
                </div>
            </div>
            {config.options}
            <div className="action-section">
                <div className="button-section">
                    <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />
                    {showViewDetailsButton && (
                        <ButtonLink
                            onClick={onViewDetails}
                            placeholder="View Request"
                            variant="primary"
                        />
                    )}
                </div>
            </div>
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default TrackStatus;