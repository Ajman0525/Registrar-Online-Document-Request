// Updated React component structure based on provided UI layout
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RequestViewPage.css";


const RequestViewPage_Pending = ({ request, onRefresh }) => {
  const navigate = useNavigate();

  if (!request) return <div className="p-8 text-red-500 text-center">No request data provided</div>;

  return (
    <div className="request-view-wrapper">
      <div className="left-panel-card">
        <h1 className="request-username">{request.full_name}</h1>

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
              <p key={index}>{file.requirement}</p>
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
            <span>Status</span>
            <span>{request.status}</span>
          </div>

          <div className="details-item">
            <span>Authorization Letter</span>
            <span>{request.authorization_letter ? "View Letter" : "None"}</span>
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
          
        </div>

        <div className="details-buttons">
          <button className="btn-warning">Request Changes</button>
          <button className="btn-primary">Process Document</button>
        </div>
      </div>
    </div>
  );
};

export default RequestViewPage_Pending;
