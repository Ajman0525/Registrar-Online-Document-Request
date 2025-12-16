import React, { useState, useEffect, useRef } from "react";
import { getCSRFToken } from "../../utils/csrf";


const AssignDropdown = ({ requestId, onAssign, onToggleOpen, assignedAdminId, assignedAdminProfilePicture }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAdmins(filtered);
  }, [searchQuery, admins]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onToggleOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggleOpen]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
        setFilteredAdmins(data);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (adminId) => {
    onAssign(requestId, adminId);
    setIsOpen(false);
    setSearchQuery("");
    onToggleOpen(false);
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-6 h-6 cursor-pointer hover:bg-gray-400 transition-colors flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          const newIsOpen = !isOpen;
          setIsOpen(newIsOpen);
          onToggleOpen(newIsOpen);
        }}
      >
        {assignedAdminProfilePicture ? (
          <img 
            src={assignedAdminProfilePicture} 
            alt="Assigned Admin"
            className="w-6 h-6 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium ${
            assignedAdminProfilePicture ? 'hidden' : 'flex'
          }`}
        >
          {assignedAdminId ? assignedAdminId.charAt(0).toUpperCase() : '+'}
        </div>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No admins found</div>
            ) : (
              filteredAdmins.map((admin) => (
                <div
                  key={admin.email}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAssign(admin.email)}
                >
                  <div className="font-medium text-gray-900">{admin.email}</div>
                  <div className="text-sm text-gray-500">{admin.role}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignDropdown;
