import React, { useState, useEffect, useMemo } from "react";
import "./UploadRequirements.css";
import { getCSRFToken } from "../../../utils/csrf";

function UploadRequirements({ selectedDocs = [], uploadedFiles = {}, setUploadedFiles, onNext, onBack }) {
  /*
    props:
    - selectedDocs: array of documents with requirements array, e.g.
      [{ doc_id, doc_name, requirements: ["Requirement 1", "Requirement 2"] }, ...]
    - uploadedFiles: object mapping doc_id to arrays of uploaded File objects by requirement index:
      { [doc_id]: [ File | null, File | null, ... ] }
    - setUploadedFiles: function to update uploadedFiles state in parent
    - onNext: function to call to proceed to next step
    - onBack: function to call to go back to previous step
  */

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch requirements from backend
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await fetch("/api/list-requirements", {
          method: "GET",
          headers: {
            "X-CSRF-TOKEN": getCSRFToken(),
          },
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setRequirements(data.requirements); // array of {req_id, requirement_name}
        } else {
          console.error("Failed to fetch requirements:", data.notification);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  // Prepare a unique array of requirements for rendering
  // Each item: { req_id, reqText }
  const requirementsList = useMemo(() => {
    const uniqueReqs = new Map();
    selectedDocs.forEach(({ requirements: docReqs }) => {
      docReqs.forEach((reqText) => {
        const req = requirements.find(r => r.requirement_name === reqText);
        if (req && !uniqueReqs.has(req.req_id)) {
          uniqueReqs.set(req.req_id, { req_id: req.req_id, reqText });
        }
      });
    });
    return Array.from(uniqueReqs.values());
  }, [selectedDocs, requirements]);

  // Initialize uploaded files entries to object mapping req_id to File | null
  useEffect(() => {
    const newUploadedFiles = { ...uploadedFiles };
    let hasChanges = false;
    requirementsList.forEach(({ req_id }) => {
      if (!(req_id in newUploadedFiles)) {
        newUploadedFiles[req_id] = null;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      setUploadedFiles(newUploadedFiles);
    }
  }, [requirementsList]);

  // Handle file selection for a given req_id
  const handleFileChange = (req_id, event) => {
    const file = event.target.files[0] || null;
    setUploadedFiles((prevUploads) => ({
      ...prevUploads,
      [req_id]: file,
    }));
  };

  // Check if all requirements have files uploaded
  const allRequiredUploaded = requirementsList.every(
    ({ req_id }) => uploadedFiles[req_id] instanceof File
  );

  // Handler for "Proceed" button
  const handleProceedClick = async () => {
    if (!allRequiredUploaded) {
      alert("Please upload all required files before proceeding.");
      return;
    }

    // Prepare FormData for submission
    const formData = new FormData();
    const reqs = requirementsList.map(({ req_id }) => ({ requirement_id: req_id }));
    formData.append("requirements", JSON.stringify(reqs));

    requirementsList.forEach(({ req_id }) => {
      const file = uploadedFiles[req_id];
      if (file) {
        formData.append(`file_${req_id}`, file);
      }
    });

    try {
      const response = await fetch("/api/save-file", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        onNext();
      } else {
        alert(`Error: ${data.notification}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("An error occurred while uploading files. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading requirements...</div>;
  }

  return (
    <div className="upload-requirements-page">
      <h2>Upload Requirements</h2>
      <p>Please upload the required documents. Note that all submissions are subject to verification before approval.</p>

      <div className="requirements-container">
        <div className="requirements-header">
          <span className="requirements-label">Requirements</span>
          <hr />
        </div>

        {requirementsList.length === 0 ? (
          <p>No requirements to upload.</p>
        ) : (
          requirementsList.map(({ req_id, reqText }) => (
            <div key={req_id} className="requirement-upload-row">
              <label htmlFor={`upload-${req_id}`}>
                {reqText}
              </label>
              <input
                type="file"
                id={`upload-${req_id}`}
                onChange={(e) => handleFileChange(req_id, e)}
                disabled={false}
              />
              {uploadedFiles[req_id] && (
                <span className="file-name">{uploadedFiles[req_id].name}</span>
              )}
            </div>
          ))
        )}
      </div>

      {!allRequiredUploaded && (
        <p className="error-text">all fields are required*</p>
      )}

      <div className="button-row">
        <button className="back-btn" onClick={onBack}>
          Edit Request
        </button>
        <button
          className="proceed-btn"
          onClick={handleProceedClick}
          disabled={!allRequiredUploaded}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default UploadRequirements;
