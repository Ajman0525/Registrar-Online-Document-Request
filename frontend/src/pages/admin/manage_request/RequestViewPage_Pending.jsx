
// Updated React component structure based on provided UI layout
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import "./RequestViewPage.css";


const RequestViewPage_Pending = ({ request, onRefresh }) => {
  const navigate = useNavigate();


  // Modal state management
  const [showProcessDocumentModal, setShowProcessDocumentModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch admins for assignment
  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins-progress', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCSRFToken()
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  // Handle process document button click
  const handleProcessDocument = () => {
    fetchAdmins();
    setShowProcessDocumentModal(true);
  };


  // Handle assignment confirmation
  const handleAssignRequest = async (adminId) => {
    try {
      setLoading(true);
      
      // First, assign the request to the admin
      const assignResponse = await fetch('/api/admin/manual-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCSRFToken()
        },
        credentials: 'include',
        body: JSON.stringify({
          request_ids: [request.request_id],
          admin_id: adminId
        })
      });

      const assignData = await assignResponse.json();
      
      if (!assignResponse.ok) {
        alert(assignData.error || 'Failed to assign request');
        return;
      }

      // Then, update the status to IN-PROGRESS
      const statusResponse = await fetch(`/api/admin/requests/${request.request_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCSRFToken()
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'IN-PROGRESS'
        })
      });

      const statusData = await statusResponse.json();
      
      if (statusResponse.ok) {
        setShowProcessDocumentModal(false);
        if (onRefresh) onRefresh();
        alert(`Request ${request.request_id} assigned successfully to ${adminId} and status updated to IN-PROGRESS`);
      } else {
        // Assignment succeeded but status update failed
        setShowProcessDocumentModal(false);
        if (onRefresh) onRefresh();
        alert(`Request ${request.request_id} assigned to ${adminId} but failed to update status: ${statusData.error}`);
      }
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request');
    } finally {
      setLoading(false);
    }
  };

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
          <button className="btn-primary" onClick={handleProcessDocument}>Process Document</button>
        </div>

      </div>

      {/* Process Document Modal */}
      {showProcessDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Assign Request</h2>
            <p className="mb-4 text-gray-600">Select an admin to assign request {request.request_id} ({request.full_name}) to:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {admins.map((admin) => {
                const isAtCapacity = admin.total >= admin.max_requests;
                return (
                  <div
                    key={admin.admin_id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedAdmin === admin.admin_id
                        ? 'border-blue-500 bg-blue-50'
                        : isAtCapacity
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => !isAtCapacity && setSelectedAdmin(admin.admin_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{admin.admin_id}</div>
                        <div className="text-sm text-gray-600">
                          {admin.completed} / {admin.total} requests completed
                        </div>
                        <div className="text-xs text-gray-500">
                          Capacity: {admin.total} / {admin.max_requests}
                        </div>
                      </div>
                      {isAtCapacity && (
                        <span className="text-xs text-red-600 font-medium">At Capacity</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowProcessDocumentModal(false);
                  setSelectedAdmin(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => selectedAdmin && handleAssignRequest(selectedAdmin)}
                disabled={!selectedAdmin || loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                {loading ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestViewPage_Pending;
