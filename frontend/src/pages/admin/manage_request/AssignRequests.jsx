import React, { useState, useEffect } from "react";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

export default function AssignRequests() {
  const [autoAssignNumber, setAutoAssignNumber] = useState(1);
  const [globalMaxAssign, setGlobalMaxAssign] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [globalProgress, setGlobalProgress] = useState({ completed: 0, total: 0 });
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
    fetchGlobalMaxAssign();
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
        // Calculate global progress
        const totalCompleted = data.admins.reduce((sum, admin) => sum + admin.completed, 0);
        const totalAssigned = data.admins.reduce((sum, admin) => sum + admin.total, 0);
        setGlobalProgress({ completed: totalCompleted, total: totalAssigned });
      }
    } catch (err) {
      console.error("Error fetching admins progress:", err);
    }
  };

  const fetchGlobalMaxAssign = async () => {
    try {
      const res = await fetch("/api/admin/global-max-assign", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalMaxAssign(data.max);
      }
    } catch (err) {
      console.error("Error fetching global max assign:", err);
    }
  };

  const setGlobalMaxAssignValue = async (max) => {
    try {
      const res = await fetch("/api/admin/global-max-assign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ max }),
      });
      if (res.ok) {
        setGlobalMaxAssign(max);
        setMessage("Global max assign updated successfully");
      } else {
        setMessage("Error updating global max assign");
      }
    } catch (err) {
      setMessage("Error updating global max assign");
    }
  };

  const setAdminMaxRequests = async (adminId, max) => {
    try {
      const res = await fetch(`/api/admin/admin-max-requests/${adminId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ max }),
      });
      if (res.ok) {
        // Update the admins state
        setAdmins(prev => prev.map(admin =>
          admin.admin_id === adminId ? { ...admin, max_requests: max } : admin
        ));
        setMessage("Admin max requests updated successfully");
      } else {
        setMessage("Error updating admin max requests");
      }
    } catch (err) {
      setMessage("Error updating admin max requests");
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

  const handleUnassignRequest = async (requestId) => {
    if (!window.confirm(`Are you sure you want to unassign request ${requestId} from ${selectedAdmin}?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/unassign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ request_id: requestId, admin_id: selectedAdmin }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        // Refresh the admin requests
        fetchAdminRequests(selectedAdmin);
        // Refresh progress data
        fetchProgress();
        fetchAdminsProgress();
      }
    } catch (err) {
      setMessage("Error unassigning request");
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

      {/* Global Progress Summary */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Global Progress Summary</h2>
        <div className="text-lg mb-2">
          {globalProgress.completed} out of {globalProgress.total} completed
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${globalProgress.total > 0 ? (globalProgress.completed / globalProgress.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Settings Panel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Max Assign Per Account (N)</label>
            <input
              type="number"
              min="1"
              value={globalMaxAssign}
              onChange={(e) => setGlobalMaxAssign(parseInt(e.target.value))}
              className="px-3 py-2 border rounded w-full"
            />
            <button
              onClick={() => setGlobalMaxAssignValue(globalMaxAssign)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Set Max Assign
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Auto Assign</label>
            <input
              type="number"
              min="1"
              value={autoAssignNumber}
              onChange={(e) => setAutoAssignNumber(parseInt(e.target.value))}
              className="px-3 py-2 border rounded w-full"
            />
            <button
              onClick={handleAutoAssign}
              disabled={loading}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              {loading ? "Assigning..." : "Auto Assign"}
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table (Admins) */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Admin Name</th>
                <th className="px-4 py-2 text-left">Progress Bar</th>
                <th className="px-4 py-2 text-left">Max Requests</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.admin_id} className="border-b">
                  <td className="px-4 py-2">{admin.admin_id}</td>
                  <td className="px-4 py-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${admin.total > 0 ? (admin.completed / admin.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {admin.completed} / {admin.total}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      value={admin.max_requests}
                      onChange={(e) => {
                        const newMax = parseInt(e.target.value);
                        setAdmins(prev => prev.map(a =>
                          a.admin_id === admin.admin_id ? { ...a, max_requests: newMax } : a
                        ));
                      }}
                      onBlur={() => setAdminMaxRequests(admin.admin_id, admin.max_requests)}
                      className="px-2 py-1 border rounded w-20"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => fetchAdminRequests(admin.admin_id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Requests
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unassigned Requests Table */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Unassigned Requests Table</h2>
        <div className="mb-4">
          <button
            onClick={handleManualAssign}
            disabled={loading || selectedRequests.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            {loading ? "Assigning..." : `Manual Assign (${selectedRequests.length})`}
          </button>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRequests(unassignedRequests.map(req => req.request_id));
                      } else {
                        setSelectedRequests([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Requested At</th>
              </tr>
            </thead>
            <tbody>
              {unassignedRequests.map((req) => (
                <tr key={req.request_id} className="border-b">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(req.request_id)}
                      onChange={() => toggleRequestSelection(req.request_id)}
                    />
                  </td>
                  <td className="px-4 py-2">{req.full_name}</td>
                  <td className="px-4 py-2">{req.requested_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        req.status === 'DOC-READY' ? 'bg-green-100 text-green-800' :
                        req.status === 'IN-PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        req.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {req.status}
                      </span>
                      <button
                        onClick={() => handleUnassignRequest(req.request_id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
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
