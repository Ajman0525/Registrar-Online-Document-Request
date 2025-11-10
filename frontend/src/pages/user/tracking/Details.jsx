import React from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";


// request details
function Details({ trackData, onBack }) {
    return (
        <div className="text-section">
            <h3 className="status-title">My Request</h3>
            <div className="status-body">
                <div className="documents-list">
                    <div className="document-item document-header">
                        <h4 className="document-name">Name</h4>
                        <span className="quantity-number">Quantity</span>
                    </div>
                    {trackData.documents && trackData.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                            <h4 className="document-name">{doc.name}</h4>
                            <span className="quantity-number">&nbsp;{doc.quantity}</span>
                        </div>
                    ))}
                </div>

                <div className="action-section">
                    <div className="button-section">
                        <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />
                        <ButtonLink onClick={onBack} placeholder="Back to Status" variant="primary" />
                    </div>
                </div>
                <div className="support-section">
                    <p className="subtext">Need help? Contact the </p>
                    <a href="mailto:support@example.com" className="support-email">support.</a>
                </div>
            </div>
        </div>
    );
}

export default Details;