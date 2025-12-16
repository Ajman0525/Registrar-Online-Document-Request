
import React, { useState, useEffect, useCallback } from "react";
import { getCSRFToken } from "../../../utils/csrf";
import LoadingSpinner from "../../../components/common/LoadingSpinner";



export default function AssignRequests() {
  const [autoAssignNumber, setAutoAssignNumber] = useState(10);
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
  const [showManualAssignModal, setShowManualAssignModal] = useState(false);
  const [selectedAdminForManual, setSelectedAdminForManual] = useState(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [collegeCodeFilter, setCollegeCodeFilter] = useState("all");
  const [requesterTypeFilter, setRequesterTypeFilter] = useState("all");
  const [filterOptions, setFilterOptions] = useState({ college_codes: [], requester_types: [] });
  
  // Tab state
  const [activeTab, setActiveTab] = useState("admins");




  useEffect(() => {
    if (activeTab === "admins") {
      fetchProgress();
      fetchAdminsProgress();
    } else if (activeTab === "requests") {
      fetchUnassignedRequests();
      fetchFilterOptions();
    }
  }, [activeTab]);



  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Debounced search function
  const debouncedFetchUnassignedRequests = useCallback(
    debounce(() => {
      fetchUnassignedRequests();
    }, 300),
    [searchTerm, collegeCodeFilter, requesterTypeFilter]
  );

  useEffect(() => {
    debouncedFetchUnassignedRequests();
  }, [debouncedFetchUnassignedRequests]);


  const fetchUnassignedRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (collegeCodeFilter !== 'all') params.append('college_code', collegeCodeFilter);
      if (requesterTypeFilter !== 'all') params.append('requester_type', requesterTypeFilter);
      
      const res = await fetch(`/api/admin/unassigned-requests?${params.toString()}`, {
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

  const fetchFilterOptions = async () => {
    try {
      const res = await fetch("/api/admin/unassigned-requests/filters", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFilterOptions(data);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
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
      if (res.ok) {
        setMessage(data.message || "Auto-assignment completed successfully");
        fetchProgress();
        fetchUnassignedRequests();
        fetchAdminsProgress();
      } else {
        setMessage(data.error || "Error during auto-assign");
      }
    } catch (err) {
      setMessage("Error during auto-assign");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = () => {
    if (selectedRequests.length === 0) return;
    setShowManualAssignModal(true);
  };

  const confirmManualAssign = async () => {
    if (!selectedAdminForManual) return;

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
        body: JSON.stringify({ request_ids: selectedRequests, admin_id: selectedAdminForManual }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        setSelectedRequests([]);
        setShowManualAssignModal(false);
        setSelectedAdminForManual(null);
        fetchProgress();
        fetchUnassignedRequests();
        fetchAdminsProgress();
      }
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
    <div className="assign-requests-page">
      <h1 className="title">Assign Requests</h1>

      {/* Global Progress Summary */}
      <div className="admin-accounts-section">
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

      {/* Tab Navigation */}
      <div className="admin-accounts-section">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("admins")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "admins"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Admin Accounts
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Unassigned Requests
            </button>
          </nav>
        </div>


        {/* Tab Content */}
        <div>
          {activeTab === "admins" && (
            <div className="admin-section-main">
                <h2 className="text-xl font-semibold mb-4">Admin Accounts Management</h2>
                <p className="subtext">
                  Configure individual admin request limits. Auto assign will distribute requests evenly across available admins.
                </p>

              {/* Accounts Table (Admins) */}
              <div className="bg-white border rounded-lg">
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
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Unassigned Requests</h2>
              
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Auto Assign:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={autoAssignNumber}
                    onChange={(e) => setAutoAssignNumber(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded w-20"
                  />
                  <button
                    onClick={handleAutoAssign}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {loading ? "Assigning..." : "Auto Assign"}
                  </button>
                </div>
                <button
                  onClick={handleManualAssign}
                  disabled={loading || selectedRequests.length === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                >
                  {loading ? "Assigning..." : `Manual Assign (${selectedRequests.length})`}
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or request ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College Code</label>
                  <select
                    value={collegeCodeFilter}
                    onChange={(e) => setCollegeCodeFilter(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Colleges</option>
                    {filterOptions.college_codes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Requester Type</label>
                  <select
                    value={requesterTypeFilter}
                    onChange={(e) => setRequesterTypeFilter(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Requesters</option>
                    {filterOptions.requester_types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCollegeCodeFilter("all");
                      setRequesterTypeFilter("all");
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Unassigned Requests Table */}
              <div className="bg-white border rounded-lg">
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
                        <th className="px-4 py-2 text-left">College Code</th>
                        <th className="px-4 py-2 text-left">Requester Type</th>
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
                          <td className="px-4 py-2">{req.college_code}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              req.requester_type === 'Student' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {req.requester_type}
                            </span>
                          </td>
                          <td className="px-4 py-2">{req.requested_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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

      {/* Modal for Manual Assign */}
      {showManualAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Assign {selectedRequests.length} Request(s)</h2>
            <p className="mb-4 text-gray-600">Select an admin to assign the selected requests to:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {admins.map((admin) => {
                const isAtCapacity = admin.total >= admin.max_requests;
                return (
                  <div
                    key={admin.admin_id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedAdminForManual === admin.admin_id
                        ? 'border-blue-500 bg-blue-50'
                        : isAtCapacity
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => !isAtCapacity && setSelectedAdminForManual(admin.admin_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex-shrink-0">
                          {admin.profile_picture ? (
                            <img 
                              src={admin.profile_picture} 
                              alt="Admin Profile"
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium ${
                              admin.profile_picture ? 'hidden' : 'flex'
                            }`}
                          >
                            {admin.admin_id ? admin.admin_id.charAt(0).toUpperCase() : 'A'}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{admin.admin_id}</div>
                          <div className="text-sm text-gray-600">
                            {admin.total} / {admin.max_requests} requests
                          </div>
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
                  setShowManualAssignModal(false);
                  setSelectedAdminForManual(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmManualAssign}
                disabled={!selectedAdminForManual || loading}
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
}
