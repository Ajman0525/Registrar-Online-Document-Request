import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RequestViewPage.css";


const RequestViewPage_InProgress = ({ request, onRefresh }) => {
  const navigate = useNavigate();

  if (!request) return <div className="p-8 text-red-500 text-center">No request data provided</div>;

  return (
    <div className="request-view-wrapper">
      {/* LEFT PANEL */}
      <div className="left-panel-card">
        <h1 className="request-username">{request.full_name}</h1>
        <p className="student-id">{request.student_id || "2025-1034"}</p>

        {/* Selected Documents */}
        <section className="section-block">
          <h2>Selected Documents</h2>
          <hr />
          {request.documents?.length ? (
            request.documents.map((doc, index) => (
              <p key={index}>{doc.name} {doc.quantity}x</p>
            ))
          ) : (
            <p>No selected documents</p>
          )}
        </section>

        {/* Uploaded Files */}
        <section className="section-block">
          <h2>Uploaded Files</h2>
          <hr />
          {request.uploaded_files?.length ? (
            request.uploaded_files.map((file, index) => (
              <div key={index} className="uploaded-file-row">
                <input type="checkbox" checked={file.is_valid} readOnly />
                <span>{file.requirement}</span>
                <button className="view-btn" onClick={() => window.open(file.url)}>View</button>
              </div>
            ))
          ) : (
            <p>No uploaded files</p>
          )}
        </section>

        {/* Preferred Contact */}
        <section className="section-block">
          <h2>Preferred Contact</h2>
          <hr />
          <p>{request.preferred_contact}</p>
        </section>

        {/* Price */}
        <section className="section-block">
          <h2>Price</h2>
          <hr />
          <div className="price-row">
            <span>Total Php:</span>
            <span className="price-value">{request.total_cost}</span>
          </div>
        </section>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel-card">
        <h2 className="details-header">Details</h2>

        <div className="details-grid">
          <div className="details-item">
            <span>Assignee</span>
            <span className="assignee-tag">
              <div className="avatar-icon">👤</div> John Doe
            </span>
          </div>

          <div className="details-item">
            <span>Request ID</span>
            <span>{request.request_id}</span>
          </div>

          <div className="details-item">
            <span>Date Requested</span>
            <span>{request.requested_at}</span>
          </div>

          <div className="details-item">
            <span>Payment Option</span>
            <span>{request.payment_option || "Unconfirmed"}</span>
          </div>

          <div className="details-item">
            <span>Proof of Payment</span>
            <span>{request.payment_status ? "Confirmed" : "Unconfirmed"}</span>
          </div>

          <div className="details-item">
            <span>Pickup Option</span>
            <span>{request.pickup_option || "Unconfirmed"}</span>
          </div>

          <div className="details-item">
            <span>Date Released</span>
            <span>{request.date_released || "Unconfirmed"}</span>
          </div>

          <div className="details-item">
            <span>Date Completed</span>
            <span>{request.completed_at || "Unconfirmed"}</span>
          </div>
        </div>

        <div className="details-buttons">
          <button className="btn-warning">Request Changes</button>
          <button className="btn-primary">Proceed To Payment</button>
        </div>
      </div>
    </div>
  );
};


export default RequestViewPage_InProgress;
