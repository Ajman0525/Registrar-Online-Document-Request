import React, { useState, useEffect } from "react";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

export default function AssignRequests() {
  const [autoAssignNumber, setAutoAssignNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [message, setMessage] = useState("");
  const [unassignedRequests, setUnassignedRequests] = useState([]);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminRequests, setAdminRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUnassignedRequests();
    fetchProgress();
    fetchAdminsProgress();
  }, []);

  const fetchUnassignedRequests = async () => {
    try {
      const res = await fetch("/api/admin/unassigned-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnassignedRequests(data.requests);
      }
    } catch (err) {
      console.error("Error fetching unassigned requests:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/admin/assignment-progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const fetchAdminsProgress = async () => {
    try {
      const res = await fetch("/api/admin/admins-progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error("Error fetching admins progress:", err);
    }
  };

  const fetchAdminRequests = async (adminId) => {
    try {
      const res = await fetch(`/api/admin/admin-requests/${adminId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdminRequests(data.requests);
        setSelectedAdmin(adminId);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching admin requests:", err);
    }
  };

  const handleAutoAssign = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/auto-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ number: autoAssignNumber }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      fetchProgress();
      fetchUnassignedRequests();
    } catch (err) {
      setMessage("Error during auto-assign");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/manual-assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ request_ids: selectedRequests }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      setSelectedRequests([]);
      fetchProgress();
      fetchUnassignedRequests();
    } catch (err) {
      setMessage("Error during manual assign");
    } finally {
      setLoading(false);
    }
  };

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Assign Requests</h1>

      {/* Admins Progress Display */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Admins Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => (
            <div
              key={admin.admin_id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => fetchAdminRequests(admin.admin_id)}
            >
              <h3 className="font-medium">{admin.admin_id}</h3>
              <div className="text-sm text-gray-600 mb-2">
                {admin.completed} out of {admin.total} completed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${admin.total > 0 ? (admin.completed / admin.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Display */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Assignment Progress</h2>
        <div className="text-lg mb-2">
          {progress.completed} out of {progress.total} completed
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Auto Assign Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Auto Assign</h2>
        <div className="flex gap-4 items-center">
          <input
            type="number"
            min="1"
            value={autoAssignNumber}
            onChange={(e) => setAutoAssignNumber(parseInt(e.target.value))}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={handleAutoAssign}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? "Assigning..." : "Auto Assign"}
          </button>
        </div>
      </div>

      {/* Manual Assign Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Manual Assign</h2>
        <div className="mb-4">
          <button
            onClick={handleManualAssign}
            disabled={loading || selectedRequests.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {loading ? "Assigning..." : `Assign Selected (${selectedRequests.length})`}
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {unassignedRequests.map((req) => (
            <div key={req.request_id} className="flex items-center gap-4 p-2 border-b">
              <input
                type="checkbox"
                checked={selectedRequests.includes(req.request_id)}
                onChange={() => toggleRequestSelection(req.request_id)}
              />
              <div>
                <div className="font-medium">{req.full_name}</div>
                <div className="text-sm text-gray-500">{req.requested_at}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {loading && <LoadingSpinner message="Processing assignment..." />}

      {/* Modal for Admin Requests */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Requests for {selectedAdmin}</h2>
            <div className="space-y-4">
              {adminRequests.map((req) => (
                <div key={req.request_id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{req.full_name}</h3>
                      <p className="text-sm text-gray-600">Request ID: {req.request_id}</p>
                      <p className="text-sm text-gray-600">Assigned At: {req.assigned_at}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      req.status === 'DOC-READY' ? 'bg-green-100 text-green-800' :
                      req.status === 'IN-PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
