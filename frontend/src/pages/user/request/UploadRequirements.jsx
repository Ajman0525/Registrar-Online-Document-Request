import React, { useState, useEffect, useMemo } from "react";
import "./UploadRequirements.css";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

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
  const [uploading, setUploading] = useState(false);

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
    // Build new valid set of requirement IDs from currently selected docs
    const validReqIds = new Set(requirementsList.map(r => r.req_id));

    // Create a fresh object only with still-valid entries
    const filteredUploads = Object.fromEntries(
      Object.entries(uploadedFiles).filter(([req_id]) => validReqIds.has(parseInt(req_id)))
    );

    // Add new requirements that aren't in uploadedFiles yet
    requirementsList.forEach(({ req_id }) => {
      if (!(req_id in filteredUploads)) {
        filteredUploads[req_id] = null;
      }
    });

    // Update only if there are actual changes
    const hasChanges =
      Object.keys(filteredUploads).length !== Object.keys(uploadedFiles).length ||
      Object.keys(filteredUploads).some(k => uploadedFiles[k] !== filteredUploads[k]);

    if (hasChanges) {
      setUploadedFiles(filteredUploads);
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

    setUploading(true);

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
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading requirements..." />;
  }

  return (
    <>
      {uploading && <LoadingSpinner message="Uploading files..." />}
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
                  disabled={uploading}
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
          <button className="back-btn" onClick={onBack} disabled={uploading}>
            Edit Request
          </button>
          <button
            className="proceed-btn"
            onClick={handleProceedClick}
            disabled={!allRequiredUploaded || uploading}
          >
            {uploading ? "Uploading..." : "Proceed"}
          </button>
        </div>
      </div>
    </>
  );
}

export default UploadRequirements;
