import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RequestViewPage.css";

const RequestViewPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/admin/requests/${requestId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": getCSRFToken(),
          },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error('Error fetching request:', err);
        setError("Failed to load request");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  if (loading) return <LoadingSpinner message="Loading request..." />;
  if (error) return <div className="p-8 text-red-500 text-center">Error: {error}</div>;
  if (!request) return <h2>No Request Found</h2>;

  return (
    <div className="request-view-container">
      {/* LEFT SIDE PANEL */}
      <div className="request-left-panel">
        <h1 className="request-name">{request.full_name}</h1>

        {/* Selected Documents */}
        <section className="request-section">
          <h2 className="request-section-title">Selected Documents</h2>
          <hr />

          {request.documents && request.documents.length > 0 ? (
            request.documents.map((doc, index) => (
              <p key={index}>
                {doc.name} {doc.quantity}x
              </p>
            ))
          ) : (
            <p>No selected documents</p>
          )}
        </section>

        {/* Uploaded Files */}
        <section className="request-section">
          <h2 className="request-section-title">Uploaded Files</h2>
          <hr />

          {request.uploaded_files && request.uploaded_files.length > 0 ? (
            request.uploaded_files.map((file, index) => (
              <p key={index}>{file.requirement}</p>
            ))
          ) : (
            <p>No uploaded files</p>
          )}
        </section>

        {/* Preferred Contact */}
        <section className="request-section">
          <h2 className="request-section-title">Preferred Contact</h2>
          <hr />
          <p>{request.preferred_contact}</p>
        </section>

        {/* Price */}
        <section className="request-section">
          <h2 className="request-section-title">Price</h2>
          <hr />
          <div className="request-price-line">
            <span>Total Php:</span>
            <span className="request-price">{request.total_cost}</span>
          </div>
        </section>
      </div>

      {/* RIGHT SIDE DETAILS PANEL */}
      <div className="request-right-panel">
        <h2 className="details-title">Details</h2>

        <div className="details-box">
          <div className="details-row">
            <span className="details-label">Status</span>
            <span className="details-value">{request.status}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Request ID</span>
            <span className="details-value">{request.request_id}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Date Requested</span>
            <span className="details-value">{request.requested_at}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Payment Option</span>
            <span className="details-value">{request.payment_option || "Unconfirmed"}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Proof of Payment</span>
            <span className="details-value">{request.payment_status ? "Confirmed" : "Unconfirmed"}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Pickup Option</span>
            <span className="details-value">{request.pickup_option || "Unconfirmed"}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Date Released</span>
            <span className="details-value">{request.date_released || "Unconfirmed"}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Date Completed</span>
            <span className="details-value">{request.completed_at || "Unconfirmed"}</span>
          </div>

          <div className="details-row">
            <span className="details-label">Remarks</span>
            <span className="details-value">{request.remarks || "None"}</span>
          </div>
        </div>

        <button className="process-document-btn" onClick={() => navigate('/admin/Requests')}>Back to Requests</button>
      </div>
    </div>
  );
};

export default RequestViewPage;
