import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import NotificationIcon from '../../components/icons/NotificationIcon';


function Dashboard() {
  return (
    <div className="header-simple">
      <div className="header-content">
        <h1>Dashboard</h1>

        {/* --- NEW: Header Controls --- */}
        <div className="header-controls">
          {/* Placeholder for Search Bar */}
          <input
            type="text"
            placeholder="Search requests, documents..."
            className="header-search"
          />

          <button className="header-icon-btn">
            <NotificationIcon className="custom-icon" />
          </button>

          {/* Placeholder for User Profile/Settings */}
          <div className="user-profile">
            <span className="user-initials">JD</span>
          </div>
        </div>
        {/* --- END NEW CONTROLS --- */}

      </div>
    </div>
  );
}

export default Dashboard;