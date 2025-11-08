import React, { useEffect, useState } from "react";
import "./Request.css";
import files from "./assets/files.png";
import whiteFile from "./assets/white-file.png";

function Request() {
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]); // ✅ Store selected documents
    const [requestInfo, setRequestInfo] = useState({
        status: "",
        request_id: "",
        student_name: ""
    });

    // Fetch JSON data
    useEffect(() => {
        fetch("/api/request")
            .then((res) => res.json())
            .then((data) => {
                setDocuments(data.documents || []);
                setRequestInfo({
                    status: data.status,
                    request_id: data.request_id,
                    student_name: data.student_name
                });
            })
            .catch((err) => console.error("Error fetching documents:", err));
    }, []);

    // ✅ Toggle document selection
    const handleSelect = (docId) => {
        setSelectedDocs((prevSelected) => {
            if (prevSelected.includes(docId)) {
                return prevSelected.filter((id) => id !== docId); // unselect
            } else {
                return [...prevSelected, docId]; // select
            }
        });
    };

    // ✅ Submit selected documents (optional backend integration)
    const handleSubmit = () => {
        console.log("Selected Documents:", selectedDocs);
        fetch("/api/submit-documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                request_id: requestInfo.request_id,
                selected_documents: selectedDocs
            })
        })
            .then((res) => res.json())
            .then((data) => console.log("Submission response:", data))
            .catch((err) => console.error("Error submitting documents:", err));
    };

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
                        <div
                            key={doc.doc_id}
                            className={`document-card ${
                                selectedDocs.includes(doc.doc_id) ? "selected" : ""
                            }`}
                            onClick={() => handleSelect(doc.doc_id)}
                        >
                            <img src={doc.logo_link} alt="Logo" className="card-logo" />
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

                {/* ✅ Submit button */}
                <button className="submit-btn" onClick={handleSubmit}>
                    Submit Selected Documents
                </button>
            </div>
        </div>
    );
}

export default Request;
