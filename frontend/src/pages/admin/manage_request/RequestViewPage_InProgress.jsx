


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RequestViewPage.css";



const RequestViewPage_InProgress = ({ request, onRefresh }) => {
  const navigate = useNavigate();
  const [togglingDocuments, setTogglingDocuments] = useState({});
  const [togglingOthersDocuments, setTogglingOthersDocuments] = useState({});
  const [assigneeInfo, setAssigneeInfo] = useState(null);

  useEffect(() => {
    // Add null check inside useEffect to prevent errors
    if (!request) return;

    // Fetch assignee information if needed
    const fetchAssigneeInfo = async () => {
      try {
        // For now, we'll show a placeholder since we don't have assignee API
        setAssigneeInfo({ name: "Assigned Admin" });
      } catch (error) {
        console.error("Error fetching assignee info:", error);
        setAssigneeInfo({ name: "Unknown Admin" });
      }
    };

    fetchAssigneeInfo();
  }, [request?.request_id]); // Use optional chaining for safe dependency checking

  if (!request) return <div className="p-8 text-red-500 text-center">No request data provided</div>;



  const toggleDocumentCompletion = async (docId, docName) => {
    try {
      setTogglingDocuments(prev => ({ ...prev, [docId]: true }));
      

      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/admin/requests/${request.request_id}/documents/${docId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'include'
      });


      if (response.ok) {
        const data = await response.json();
        // Update the local state
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle document status:', errorData.error);
        alert('Failed to toggle document status: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling document status:', error);
    } finally {
      setTogglingDocuments(prev => ({ ...prev, [docId]: false }));
    }
  };

  const toggleOthersDocumentCompletion = async (docId, docName) => {
    try {
      setTogglingOthersDocuments(prev => ({ ...prev, [docId]: true }));
      

      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/admin/requests/${request.request_id}/others_documents/${docId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'include'
      });


      if (response.ok) {
        const data = await response.json();
        // Update the local state
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle others document status:', errorData.error);
        alert('Failed to toggle others document status: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling others document status:', error);
    } finally {
      setTogglingOthersDocuments(prev => ({ ...prev, [docId]: false }));
    }
  };

  return (
    <div className="request-view-wrapper">
      {/* LEFT PANEL */}
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
                <div className="document-info">
                  <input 
                    type="checkbox"
                    checked={doc.is_done || false}
                    onChange={() => toggleDocumentCompletion(doc.doc_id, doc.name)}
                    disabled={togglingDocuments[doc.doc_id]}
                    className="document-checkbox"
                  />
                  <span className={`document-name ${doc.is_done ? 'completed' : ''}`}>
                    {doc.name} {doc.quantity}x
                  </span>
                  {doc.requires_payment_first && (
                    <span className="payment-required-badge">Payment Required</span>
                  )}
                </div>
                {togglingDocuments[doc.doc_id] && (
                  <div className="loading-spinner-small">⟳</div>
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
              <div key={index} className="uploaded-file-row">
                <span>{file.requirement || file.requirement_name}</span>
                <button className="view-btn" onClick={() => window.open(file.file_path || file.url)}>View</button>
              </div>
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
                  <input 
                    type="checkbox"
                    checked={doc.is_done || false}
                    onChange={() => toggleOthersDocumentCompletion(doc.id, doc.name)}
                    disabled={togglingOthersDocuments[doc.id]}
                    className="document-checkbox"
                  />
                  <span className={`document-name ${doc.is_done ? 'completed' : ''}`}>
                    {doc.name}
                  </span>
                  {doc.description && (
                    <span className="document-description">{doc.description}</span>
                  )}
                </div>
                <div className="document-timestamp">
                  <small>Created: {doc.created_at}</small>
                </div>
                {togglingOthersDocuments[doc.id] && (
                  <div className="loading-spinner-small">⟳</div>
                )}
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
            <span>Assignee</span>
            <span className="assignee-tag">
              <div className="avatar-icon">👤</div> {assigneeInfo?.name || "Loading..."}
            </span>
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
