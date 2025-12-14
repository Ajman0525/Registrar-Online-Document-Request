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
        <p className="student-id">{request.student_id || "N/A"}</p>


        {/* Selected Documents */}
        <section className="section-block">
          <h2>Selected Documents</h2>
          <hr />
          {request.documents?.length ? (
            request.documents.map((doc, index) => (
              <div key={index} className="document-row">
                <span>{doc.name} {doc.quantity}x</span>
                {doc.requires_payment_first && (
                  <span className="payment-required-badge">Payment Required</span>
                )}
              </div>
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

        {/* Others Documents */}
        <section className="section-block">
          <h2>Others Documents</h2>
          <hr />
          {request.others_documents?.length ? (
            request.others_documents.map((doc, index) => (
              <div key={index} className="others-document-row">
                <div className="document-info">
                  <span className="document-name">{doc.name}</span>
                  {doc.description && (
                    <span className="document-description">{doc.description}</span>
                  )}
                </div>
                <div className="document-timestamp">
                  <small>Created: {doc.created_at}</small>
                </div>
              </div>
            ))
          ) : (
            <p>No other documents</p>
          )}
        </section>

        {/* Authorization Letter for Outsiders */}
        {request.requester_type === 'Outsider' && request.authorization_letter && (
          <section className="section-block">
            <h2>Authorization Letter</h2>
            <hr />
            <div className="auth-letter-info">
              <p><strong>Requested by:</strong> {request.authorization_letter.requester_name}</p>
              <button 
                className="view-auth-letter-btn"
                onClick={() => window.open(request.authorization_letter.file_url, '_blank')}
              >
                View Authorization Letter
              </button>
            </div>
          </section>
        )}

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
            <span>Request ID</span>
            <span>{request.request_id}</span>
          </div>

          <div className="details-item">
            <span>College Code</span>
            <span>{request.college_code || "N/A"}</span>
          </div>


          <div className="details-item">
            <span>Requester</span>
            <span className={`requester-type ${request.requester_type === 'Outsider' ? 'outsider' : 'student'}`}>
              {request.requester_type || "Student"}
            </span>
          </div>


          <div className="details-item">
            <span>Payment</span>
            <span className={`payment-status ${request.payment_status ? 'paid' : 'unpaid'}`}>
              {request.payment_status ? "Paid" : "Unpaid"}
            </span>
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
