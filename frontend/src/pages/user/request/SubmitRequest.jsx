import React from "react";
import "./Request.css";
import ContentBox from "../../../components/user/ContentBox";
import ButtonLink from "../../../components/common/ButtonLink";


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

    return (
      <ContentBox className="submit-request-box">
        <div className="text-section">
          <h2 className="title">
            Your request have been submitted
          </h2>
          <p className="subtext">
            Your chosen contact will receive the confirmation and tracking details.
            <br />Keep this number to track your request.
          </p>
        </div>
        <div className="tracking-id-section">
          <div className="tracking-id-label">Tracking ID:</div>
          <div className="tracking-id">{trackingId}</div>
        </div>

       <div className="action-buttons">
          <ButtonLink
            placeholder="Return to Home"
            onClick={() => (window.location.href = "/user/Landing")}
            variant="secondary"
          />
          <ButtonLink
            placeholder="Track"
            onClick={() => (window.location.href = "/user/Track")}
            variant="primary"
          />
      </div>

    </ContentBox>
    );
}

export default SubmitRequest;