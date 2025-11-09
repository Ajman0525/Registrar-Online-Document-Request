import React, { useState } from "react";
import "./SubmitRequest.css";

function SubmitRequest({ selectedDocs, uploadedFiles, preferredContactInfo, contactInfo, trackingId, onBack }) {
  /**
   * Props:
   * - selectedDocs: array of selected documents
   * - uploadedFiles: object { req_id: File }
   * - preferredContactInfo: object with contact info
   * - contactInfo: object with email and contact_number
   * - trackingId: string, the tracking ID from the complete request
   * - onBack: function handler for Back button
   */

  const [loading, setLoading] = useState(false);

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

export default SubmitRequest;