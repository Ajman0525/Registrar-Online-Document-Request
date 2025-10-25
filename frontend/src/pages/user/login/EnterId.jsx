import React from "react";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";

function EnterId() {
    return (
        <div className="Login-page">
            <ContentBox>
                <div className="text-section">
                    <h3 className="title">Enter Student Id</h3>
                </div>

                <div className="input-section">
                    <p>Id Number</p>
                    <input id="student-id" type="text" placeholder="0000-0000" />
                </div>

                <div className="action-section">
                    <ButtonLink 
                    to="" 
                    placeholder="Proceed"
                    className="proceed-button"
                    />
                    <div className="support-section">
                        <p className="forgot-id-text">Forgot ID Number?, contact the </p>
                        <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                    </div>
                    </div>
            </ContentBox>
        </div>
    );
}

export default EnterId;