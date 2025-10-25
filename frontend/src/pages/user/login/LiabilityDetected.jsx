import React from "react";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";

function LiabilityDetected({ onNext }) {
    return (
        <div className="Login-page">
            <ContentBox>
                <div className="text-section">
                    <h3 className="liability-title">Liabilities Detected</h3>
                    <div className="subtext">
                    <p>You currently have outstanding liabilities.</p>
                    <p>Please settle them before requesting any documents.</p>
                    </div>
                </div>

                <div className="action-section">
                    <ButtonLink 
                    onClick={onNext}
                    placeholder="Return"
                    className="proceed-button"
                    />
                    <div className="support-section">
                        <p className="forgot-id-text">For more details, contact the</p>
                        <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                    </div>
                    </div>
            </ContentBox>
        </div>
    );
}

export default LiabilityDetected;