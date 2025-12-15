import React, { useState, useRef, useEffect } from "react";
import SettingsIcon from "../icons/SettingsIcon";
import NotificationIcon from "../icons/NotificationIcon";
import SearchIcon from "../icons/SearchIcon";
import LogoutIcon from "../icons/LogoutIcon";
import ProfileIcon from "../icons/ProfileIcon";
import "../../pages/admin/Dashboard.css";

// --- Notification Panel ---
const NotificationPanel = ({ notifications }) => (
    <div className="notification-panel">
        <div className="panel-header">
            <h3>Notifications</h3>
        </div>
        <div className="panel-content">
            {notifications.length === 0 ? (
                <div className="notification-empty-state">
                    <p>No new notifications.</p>
                </div>
            ) : (
                notifications.map((n) => (
                    <div key={n.id} className="notification-item">
                        <div className="item-icon-type">
                            {/* Dynamic class for icon colors based on type */}
                            <span className={`item-icon ${n.type.replace(/\s/g, "-")}`}>
                                {n.type === "New Request" ? "R" : n.type === "Payment Due" ? "P" : "D"}
                            </span>
                            <p className="item-type">{n.type}</p>
                        </div>
                        <p className="item-message">{n.message}</p>
                        <span className="item-time">{n.time}</span>
                    </div>
                ))
            )}
        </div>
    </div>
);

// --- User Profile Panel ---
const UserProfilePanel = ({ onLogout }) => (
    <div className="user-profile-panel">
        <div className="profile-panel-header">
            <div className="profile-avatar-large">
                <span>A</span>
            </div>
            <div className="profile-info">
                <h4>Administrator</h4>
                <p>admin@example.com</p>
            </div>
        </div>
        <div className="profile-panel-content">
            <button className="profile-menu-item">
                <ProfileIcon />
                <span>My Profile</span>
            </button>
            <button className="profile-menu-item">
                <SettingsIcon />
                <span>Settings</span>
            </button>
            <div className="profile-divider"></div>
            <button className="profile-menu-item logout" onClick={onLogout}>
                <LogoutIcon />
                <span>Logout</span>
            </button>
        </div>
    </div>
);

// --- Main Header Component ---
const Header = ({ title = "Welcome, Administrator.", notifications = [], onLogout }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const notificationReference = useRef(null);
    const profileReference = useRef(null);

    const toggleNotifications = () => setIsNotificationsOpen((prev) => !prev);
    const toggleProfile = () => setIsProfileOpen((prev) => !prev);

    // Click Outside Logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationReference.current &&
                !notificationReference.current.contains(event.target)
            ) {
                setIsNotificationsOpen(false);
            }
            if (
                profileReference.current &&
                !profileReference.current.contains(event.target)
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="dashboard-header-wrapper">
            <div className="header-content">
                <h1>{title}</h1>

                <div className="header-controls">
                    {/* Search Bar */}
                    <div className="search-input-wrapper">
                        <SearchIcon className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search requests, documents..."
                            className="header-search"
                        />
                    </div>

                    {/* Notifications Dropdown */}
                    <div className="notification-wrapper" ref={notificationReference}>
                        <button className="notification-icon-btn" onClick={toggleNotifications}>
                            <NotificationIcon className="notification-icon" />
                            {notifications.length > 0 && (
                                <span className="notification-badge">{notifications.length}</span>
                            )}
                        </button>
                        {isNotificationsOpen && (
                            <NotificationPanel notifications={notifications} />
                        )}
                    </div>

                    {/* User Profile Dropdown */}
                    <div className="user-profile-container" ref={profileReference}>
                        <div
                            className={`user-profile-wrapper ${isProfileOpen ? "dropdown-menu-inverted" : ""
                                }`}
                            onClick={toggleProfile}
                        >
                            <div className="user-profile">
                                <span className="user-initials">A</span>
                            </div>
                            <div className="user-info">
                                <div className="user-name">Administrator</div>
                            </div>
                            <span className="dropdown-menu">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#333"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </span>
                        </div>
                        {isProfileOpen && (
                            <UserProfilePanel
                                onLogout={onLogout}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;