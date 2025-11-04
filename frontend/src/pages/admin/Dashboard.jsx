import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import NotificationIcon from '../../components/icons/NotificationIcon';
import SearchIcon from "../../components/icons/SearchIcon";


function Dashboard() {
  return (
    <div className="header-simple">
      <div className="header-content">
        <h1>Dashboard</h1>

        <div className="header-controls">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon"/>
            <input
              type="text"
              placeholder="Search requests, documents..."
              className="header-search"
            />
          </div>

          <button className="notification-icon-btn">
            <NotificationIcon className="notification-icon" />
          </button>

          <div className = "user-profile-wrapper">
            <div className="user-profile">
              <span className="user-initials">A</span>
            </div>

            <div className = "user-info">
              <div className = "user-name">Administrator</div>
            </div>

            <span className="dropdown-menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;