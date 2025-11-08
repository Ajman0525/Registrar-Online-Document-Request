import React, { useEffect, useState } from "react";
import "./Request.css";
import files from "./assets/files.png";
import whiteFile from "./assets/white-file.png";


function Request() {
    const [documents, setDocuments] = useState([]);

    // Fetch JSON data using GET method
    useEffect(() => {
        fetch("/api/request") // replace with your actual backend endpoint
            .then((res) => res.json())
            .then((data) => setDocuments(data))
            .catch((err) => console.error("Error fetching documents:", err));
    }, []);

    return (
        <div className="request-page">
            {/* Top Section */}
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

                    <a href="#documents-section" className="view-documents-btn">
                        View Documents
                    </a>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section" id="documents-section">
                <div className="documents-grid">
                    {documents.map((doc) => (
                        <div key={doc.doc_id} className="document-card">
                            <div className="card-image-wrapper">
                                <img src={whiteFile} alt="Document File" className="card-bg" />
                                <img src={doc.logo_link} alt="Logo" className="card-logo" />
                            </div>
                            <div className="card-content">
                                <h3 className="doc-name">{doc.doc_name}</h3>
                                <p className="doc-description">{doc.description}</p>
                                <h4 className="req-title">Requirements</h4>
                                <ul className="req-list">
                                    {doc.requirements.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Request;