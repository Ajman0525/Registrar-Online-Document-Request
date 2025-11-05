import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import NotificationIcon from '../../components/icons/NotificationIcon';
import SearchIcon from "../../components/icons/SearchIcon";
import TotalRequestsIcon from "../../components/icons/TotalRequestsIcon";
import PendingIcon from "../../components/icons/PendingIcon";
import UnpaidIcon from "../../components/icons/UnpaidIcon";
import ProcessedIcon from "../../components/icons/ProcessedIcon";
import ScrollLeft from "../../components/icons/ScrollLeft";
import ScrollRight from "../../components/icons/ScrollRight";

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
  const cardData = [
    {
      title: "Total Requests",
      icon: TotalRequestsIcon,
      value: "2,345",
      subText: "↑ 5% from last month"
    },

    {
      title: "Pending Requests",
      icon: PendingIcon,
      value: "78",
      subText: "7 are overdue"
    },
    
    {
      title: "Unpaid Requests",
      icon: UnpaidIcon,
      value: "₱1,250.00",
      subText: "Total outstanding value"
    },

    {
      title: "Documents Ready",
      icon: ProcessedIcon,
      value: "50+",
      subText: "Recently processed"
    },
  ];

  return (
    <div className = "dashboard-content">

      {/*------------------- START OF HEADER CONTENT -------------------*/}
      <div className="dashboard-header">
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
      {/*--------------------- END OF HEADER CONTENT -------------------*/}

      {/*--------------------- START OF STAT CARDS ---------------------*/}
      <section className="stat-cards-wrapper">
        {cardData.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            icon={card.icon}
            value={card.value}
            subText={card.subText}
          />
        ))}

        {/* The red slide arrow for scrolling indication */}
        {/* <div className="card-slide-arrow">
          <span style={{ fontSize: '24px' }}>»</span>
        </div> */}
      </section>
      {/*---------------------- END OF STAT CARDS ---------------------*/}

      {/*------------------ START OF RECENT ACTIVITY ------------------*/}

      <section className="content-area">
        <h2>Recent Activity</h2>
      </section>

      {/*------------------ START OF RECENT ACTIVITY ------------------*/}
    </div>
  );
}

export default Dashboard;