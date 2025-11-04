import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import NotificationIcon from '../../components/icons/NotificationIcon';
import SearchIcon from "../../components/icons/SearchIcon";

const StatCard = ({ title, icon: Icon, value, subText }) => (
  <div className="stat-card">
    <div className="card-header">
      <div className="card-icon">
        <Icon className="card-metric-icon" />
      </div>
      <p className="card-title">{title}</p>
    </div>
    <div className="card-content-body">
      <h2 className="card-value">{value}</h2>
      <p className="card-subtext">{subText}</p>
    </div>
  </div>
);

function Dashboard() {
  return (
    <div className = "dashboard-content">
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
      
      <section>
        
      </section>
    </div>
  );
}

export default Dashboard;