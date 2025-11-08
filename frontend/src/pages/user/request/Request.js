import React from "react";
import "./Request.css";
import files from "./assets/files.png";
import ButtonLink from "../../../components/common/ButtonLink";


function Request() {
    return (
        <div className="request-page">
            <div className="top-section">
                <div className="top-content">
                    <img src={files} alt="Request" className="request-image" />
                    <h2 className="welcome-message">
                        Welcome to the Online Document Request System
                    </h2>
                    <h3 className="instruction-message">
                        Select the documents you need below and follow the steps to complete your request.
                        <br />
                        Make sure to review each document’s requirements before proceeding.
                    </h3>

                    <ButtonLink 
                        to="/documents"  // replace with your desired route or URL
                        className="view-documents-btn"
                    >
                        View Documents
                    </ButtonLink>
                </div>
            </div>
            <div className="bottom-section">
                {/* future content here */}
            </div>
        </div>
    );
}

export default Request;