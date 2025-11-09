import React, { useState } from "react";
import "./SubmitRequest.css";

function SubmitRequest({ selectedDocs, uploadedFiles, preferredContactInfo, onBack }) {
  /**
   * Props:
   * - selectedDocs: array of selected documents
   * - uploadedFiles: object { req_id: File }
   * - preferredContactInfo: object with contact info
   * - onBack: function handler for Back button
   */

  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/submit-request", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setTrackingId(data.request_id);
      } else {
        alert(`Error: ${data.notification}`);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("An error occurred while submitting the request.");
    } finally {
      setLoading(false);
    }
  };

  if (trackingId) {
    return (
      <div className="submit-request-container" aria-live="polite">
        <h2 className="submit-title">
          Your request have been submitted
        </h2>

        <p className="submit-message">
          Please check your preferred contact method for the confirmation message and tracking details.
          keep this number safe as you will need it to track the status of your request.
        </p>

        <div className="tracking-id-label">Tracking ID:</div>
        <div className="tracking-id">{trackingId}</div>

        <div className="button-row">
          <button className="return-btn" onClick={() => window.location.href = "/"}>
            Return to Home
          </button>
          <button className="track-btn" onClick={() => window.location.href = "/tracking"}>
            Track
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-request-container" aria-live="polite">
      <h2 className="submit-title">
        Review and Submit Your Request
      </h2>

      <p className="submit-message">
        Please review your request details below. Click "Submit Request" to complete your submission.
      </p>

      <div className="summary-section">
        <h3>Selected Documents</h3>
        {selectedDocs.map((doc, idx) => (
          <div key={idx}>{doc.doc_name} - Quantity: {doc.quantity}</div>
        ))}

        <h3>Uploaded Files</h3>
        {Object.entries(uploadedFiles).map(([req_id, file]) => (
          <div key={req_id}>{file ? file.name : "No file"}</div>
        ))}

        <h3>Preferred Contact</h3>
        <div>{preferredContactInfo.contact_number || preferredContactInfo.email || "Not set"}</div>
      </div>

      <div className="button-row">
        <button className="back-btn" onClick={onBack} disabled={loading}>
          Back
        </button>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

export default SubmitRequest;