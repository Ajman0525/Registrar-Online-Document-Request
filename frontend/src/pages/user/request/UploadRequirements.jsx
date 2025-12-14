import React, { useState, useEffect, useMemo, useRef } from "react";
import "./Request.css";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";
import { getCSRFToken } from "../../../utils/csrf";


function UploadRequirements({
  selectedDocs = [],
  uploadedFiles = {},
  onFileSelect,
  onFileRemove,
  onNext = () => {},
  onBack = () => {},
}) {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef({});
  const [requirementsList, setRequirementsList] = useState([]);

  // Fetch requirements from API
  useEffect(() => {
    const fetchRequirements = async () => {
      if (!selectedDocs || selectedDocs.length === 0) {
        setRequirementsList([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const docIds = selectedDocs.map((doc) => doc.doc_id);

        const response = await fetch("/api/list-requirements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": getCSRFToken(),
          },
          credentials: "include",
          body: JSON.stringify({ document_ids: docIds }),
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        if (!data.success) throw new Error(data.notification || "Fetch failed");

        setRequirementsList(data.requirements || []);
      } catch (err) {
        console.error("Error fetching requirements:", err);
        setError(err.message || "Failed to load requirements");
        setRequirementsList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [selectedDocs]);






  // Display file name helper
  const displayFileName = (entry) => {
    if (!entry) return "";
    if (entry instanceof File) return entry.name;
    if (typeof entry === "string") {
      const parts = entry.split("/");
      return parts.pop() || entry;
    }
    return "";
  };


  // Handle file selection
  const handleFileChange = (req_id, e) => {
    const file = e.target.files?.[0] || null;
    const key = String(req_id);

    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

      if (file.size > maxSize) {
        alert("File must be less than 10MB.");
        if (inputRefs.current[key]) inputRefs.current[key].value = "";
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF, JPG, JPEG, PNG allowed.");
        if (inputRefs.current[key]) inputRefs.current[key].value = "";
        return;
      }
    }

    onFileSelect && onFileSelect(req_id, file);
  };

  // Delete file
  const handleDeleteFile = (req_id) => {
    const key = String(req_id);
    if (!window.confirm("Delete this file?")) return;

    onFileRemove && onFileRemove(req_id);

    if (inputRefs.current[key]) inputRefs.current[key].value = "";
  };




  // Check all required files uploaded
  const allRequiredUploaded = useMemo(() => {
    if (!requirementsList || requirementsList.length === 0) return true;
    
    return requirementsList.every(({ req_id }) => {
      const entry = uploadedFiles[String(req_id)];
      return entry instanceof File || (typeof entry === "string" && entry.trim() !== "");
    });
  }, [requirementsList.length, uploadedFiles]);

  // Proceed
  const handleProceedClick = async () => {
    if (requirementsList.length > 0 && !allRequiredUploaded) {
      alert("Please upload all required files.");
      return;
    }


    setUploading(true);
    await new Promise((res) => setTimeout(res, 500));
    onNext(uploadedFiles);
    setUploading(false);
  };

  if (loading) return <LoadingSpinner message="Loading requirements..." />;

  return (
    <>
      {uploading && <LoadingSpinner message="Processing files..." />}
      <ContentBox className="upload-requirements-box">
        <div className="upload-request-title-container">
          <h2 className="title">Upload Requirements</h2>
          <p className="subtext">
            Please upload the required documents. Verification occurs before approval.
          </p>
        </div>

        <div className="requirements-container">
          <div className="requirements-header">
            <span className="requirements-label">Requirements</span>
            <hr />
          </div>

          <div className="requirement-item-container">
            {requirementsList.length === 0 ? (
              <p>No requirements to upload.</p>
            ) : (
              requirementsList.map(({ req_id, requirement_name, doc_names }) => {
                const key = String(req_id);
                const entry = uploadedFiles[key];

                const handleClick = () => {
                  if (!uploading && inputRefs.current[key]) {
                    inputRefs.current[key].click();
                  }
                };

                return (
                  <div
                    key={key}
                    className="requirement-item"
                    onClick={handleClick}
                    style={{ cursor: uploading ? "not-allowed" : "pointer" }}
                  >
                    <div className="file-upload-info">
                      <div>
                        <span className="requirement-text">{requirement_name}</span>
                        <br />
                        {doc_names?.length ? (
                          <small className="doc-reference">
                            Required for: {doc_names.join(", ")}
                          </small>
                        ) : null}
                      </div>

                      <input
                        ref={(el) => (inputRefs.current[key] = el)}
                        type="file"
                        onChange={(e) => handleFileChange(req_id, e)}
                        style={{ display: "none" }}
                        disabled={uploading}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />

                      {entry ? (
                        <div className="requirement-item-action">
                          <span className="file-name">{displayFileName(entry)}</span>
                          <img
                            src="/assets/Trash.svg"
                            alt="Remove"
                            className="remove-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!uploading) handleDeleteFile(req_id);
                            }}
                          />
                        </div>
                      ) : (
                        <p className="file-name">Select file</p>
                      )}
                    </div>
                    <hr />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="action-section">
          {!allRequiredUploaded && (
            <p className="error-text">All required files must be uploaded*</p>
          )}

          <div className="action-buttons">
            <ButtonLink
              placeholder="Edit Request"
              onClick={onBack}
              variant="secondary"
              disabled={uploading}
            />
            <ButtonLink
              placeholder={uploading ? "Processing..." : "Proceed"}
              onClick={handleProceedClick}
              variant="primary"
              disabled={!allRequiredUploaded || uploading}
            />
          </div>
        </div>
      </ContentBox>
    </>
  );
}

export default UploadRequirements;
