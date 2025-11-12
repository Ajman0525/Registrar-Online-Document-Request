import React, { useState, useEffect, useMemo } from "react";
import "./UploadRequirements.css";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

function UploadRequirements({ selectedDocs = [], uploadedFiles = {}, setUploadedFiles, onNext, onBack }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch requirements from backend
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await fetch("/api/list-requirements", {
          method: "GET",
          headers: { "X-CSRF-TOKEN": getCSRFToken() },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setRequirements(data.requirements);
      } catch (err) {
        console.error("Error fetching requirements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequirements();
  }, []);

  // Fetch previously uploaded files
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const res = await fetch("/api/get-uploaded-files", {
          method: "GET",
          headers: { "X-CSRF-TOKEN": getCSRFToken() },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setUploadedFiles(prev => {
          const updated = { ...prev };
          for (const [req_id, path] of Object.entries(data.uploaded_files)) {
            if (!(req_id in updated) || !(updated[req_id] instanceof File)) {
              updated[req_id] = path;
            }
          }
          return updated;
        });
      } catch (err) {
        console.error("Error fetching uploaded files:", err);
      }
    };
    fetchUploadedFiles();
  }, []);

  // Build unique requirements list
  const requirementsList = useMemo(() => {
    const uniqueReqs = new Map();
    selectedDocs.forEach(({ requirements: docReqs }) => {
      docReqs.forEach(reqText => {
        const req = requirements.find(r => r.requirement_name === reqText);
        if (req && !uniqueReqs.has(req.req_id)) {
          uniqueReqs.set(req.req_id, { req_id: req.req_id, reqText });
        }
      });
    });
    return Array.from(uniqueReqs.values());
  }, [selectedDocs, requirements]);

  // Sync uploaded files with current requirements
  useEffect(() => {
    const validReqIds = new Set(requirementsList.map(r => r.req_id));

    // Keep existing valid uploads and add new ones
    const updatedUploads = { ...uploadedFiles };
    requirementsList.forEach(({ req_id }) => {
      if (!(req_id in updatedUploads)) updatedUploads[req_id] = null;
    });

    setUploadedFiles(updatedUploads);
  }, [requirementsList, selectedDocs]);

  // Handle file selection
  const handleFileChange = (req_id, e) => {
    const file = e.target.files[0] || null;
    setUploadedFiles(prev => ({ ...prev, [req_id]: file }));
  };

  // Handle file deletion
  const handleDeleteFile = async (req_id) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/delete-file/${req_id}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": getCSRFToken() },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setUploadedFiles(prev => ({ ...prev, [req_id]: null }));
      else alert(data.notification);
    } catch (err) {
      console.error("Failed to delete file:", err);
      alert("Failed to delete file.");
    }
  };

  // Compute deselected uploads (files no longer required)
  const deselectedUploads = useMemo(() => {
    const validReqIds = new Set(requirementsList.map(r => r.req_id));
    return Object.entries(uploadedFiles)
      .filter(([req_id, file]) => file && !validReqIds.has(req_id))
      .map(([req_id, file]) => ({ req_id, file }));
  }, [uploadedFiles, requirementsList]);

  // Check if all required files are uploaded
  const allRequiredUploaded = requirementsList.every(
    ({ req_id }) => uploadedFiles[req_id] instanceof File || typeof uploadedFiles[req_id] === "string"
  );

 // Handle proceed
  const handleProceedClick = async () => {
    if (!allRequiredUploaded) {
      alert("Please upload all required files before proceeding.");
      return;
    }

    setUploading(true);
    const formData = new FormData();

    // Include alreadyUploaded flag for each requirement
    const reqs = requirementsList.map(({ req_id }) => ({
      requirement_id: req_id,
      alreadyUploaded: typeof uploadedFiles[req_id] === "string" // true if already uploaded
    }));
    formData.append("requirements", JSON.stringify(reqs));

    // Only append new files (File instances) to FormData
    requirementsList.forEach(({ req_id }) => {
      const file = uploadedFiles[req_id];
      if (file instanceof File) formData.append(`file_${req_id}`, file);
    });

    try {
      const res = await fetch("/api/save-file", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": getCSRFToken() },
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) onNext();
      else alert(`Error: ${data.notification}`);
    } catch (err) {
      console.error("Error uploading files:", err);
      alert("An error occurred while uploading files. Please try again.");
    } finally {
      setUploading(false);
    }
  };


  if (loading) return <LoadingSpinner message="Loading requirements..." />;

  return (
    <>
      {uploading && <LoadingSpinner message="Uploading files..." />}
      <div className="upload-requirements-page">
        <h2>Upload Requirements</h2>
        <p>Please upload the required documents. All submissions are subject to verification.</p>

        {/* Required files */}
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
                <label htmlFor={`upload-${req_id}`}>{reqText}</label>
                {uploadedFiles[req_id] ? (
                  <>
                    <span className="file-name">
                      {uploadedFiles[req_id] instanceof File
                        ? uploadedFiles[req_id].name
                        : uploadedFiles[req_id].split("/").pop()}
                    </span>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteFile(req_id)} disabled={uploading}>
                      Delete
                    </button>
                  </>
                ) : (
                  <input type="file" id={`upload-${req_id}`} onChange={(e) => handleFileChange(req_id, e)} disabled={uploading} />
                )}
              </div>
            ))
          )}
        </div>

        {/* Deselected uploads */}
        {deselectedUploads.length > 0 && (
          <div className="deselected-uploads">
            <h3>Deselected Files</h3>
            <p>These files are no longer required. You can delete them if you wish:</p>
            {deselectedUploads.map(({ req_id, file }) => (
              <div key={req_id} className="requirement-upload-row">
                <span className="file-name">{file instanceof File ? file.name : file.split("/").pop()}</span>
                <button type="button" className="delete-btn" onClick={() => handleDeleteFile(req_id)} disabled={uploading}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {!allRequiredUploaded && <p className="error-text">All required fields are required*</p>}

        <div className="button-row">
          <button className="back-btn" onClick={onBack} disabled={uploading}>
            Edit Request
          </button>
          <button className="proceed-btn" onClick={handleProceedClick} disabled={!allRequiredUploaded || uploading}>
            {uploading ? "Uploading..." : "Proceed"}
          </button>
        </div>
      </div>
    </>
  );
}

export default UploadRequirements;
