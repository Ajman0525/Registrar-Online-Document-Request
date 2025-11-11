import React, { useEffect, useState } from "react";
import "./Documents.css";
import files from "./assets/files.png";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

function Documents({ selectedDocs, setSelectedDocs, onNext }) {
    const [documents, setDocuments] = useState([]);
    const [requestInfo, setRequestInfo] = useState({
        status: "",
        request_id: "",
        student_name: ""
    });
    const [loading, setLoading] = useState(true);

    // Fetch JSON data
    useEffect(() => {
        fetch("/api/request", {
            method: "GET",
            headers: {
                "X-CSRF-TOKEN": getCSRFToken(),
            },
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setDocuments(data.documents || []);
                setRequestInfo({
                    status: data.status,
                    request_id: data.request_id,
                    student_name: data.student_name
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching documents:", err);
                setLoading(false);
            });
    }, []);

    // Toggle document selection (store full objects)
    const handleSelect = (doc) => {
        setSelectedDocs((prevSelected) => {
            if (prevSelected.find((d) => d.doc_id === doc.doc_id)) {
                return prevSelected.filter((d) => d.doc_id !== doc.doc_id); // unselect
            } else {
                return [...prevSelected, doc]; // select full doc object
            }
        });
    };

    // Move to next step
    const handleNextStep = () => {
        if (selectedDocs.length === 0) {
            alert("Please select at least one document to continue.");
            return;
        }
        onNext(selectedDocs);
    };

    return (
        <>
            {loading && <LoadingSpinner message="Loading documents..." />}
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
                                    selectedDocs.find((d) => d.doc_id === doc.doc_id) ? "selected" : ""
                                }`}
                                onClick={() => handleSelect(doc)}
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
                                    <p className="doc-Cost">Price: {doc.cost} </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* View Request button */}
                    <button className="submit-btn" onClick={handleNextStep} disabled={loading}>
                        View Request
                    </button>
                </div>
            </div>
        </>
    );
}

export default Documents;
