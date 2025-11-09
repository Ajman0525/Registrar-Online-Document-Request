import React, { useEffect, useState, useRef } from "react";
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
import SettingsIcon from "../../components/icons/SettingsIcon";
import ProfileIcon from "../../components/icons/ProfileIcon";
import LogoutIcon from "../../components/icons/LogoutIcon";

const NotificationPanel = ({ notifications, onClose }) => (
  <div className="notification-panel">
    <div className="panel-header">
      <h3>Notifications</h3>
    </div>
    <div className="panel-content">
      {notifications.length === 0 ? (
        <div class = "notification-empty-state">
          <p>No new notifications.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className="notification-item">
            <div className="item-icon-type">
              <span className={`item-icon ${n.type.replace(/\s/g, '-')}`}>{n.type === 'New Request' ? 'R' : 'D'}</span>  {/* To be replaced by icons based on the type of notification */}
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

const UserProfilePanel = ({ onClose, onLogout }) => (
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

const ScrollButton = ({ direction, onClick, isVisible }) => {
  const iconClass = "arrow-icon";
  const baseClass = "card-slide-arrow";

  return (
    <div
      className={`${baseClass} ${direction === 'left' ? 'arrow-left' : 'arrow-right'} ${isVisible ? 'arrow-visible' : 'arrow-hidden'}`}
      onClick={onClick}
    >
      {direction === 'left' ? <ScrollLeft className={iconClass} /> : <ScrollRight className={iconClass} />}
    </div>

  );
}

function Dashboard() {
  const scrollContainerReference = useRef(null);
  const notificationReference = useRef(null);
  const profileReference = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);


  const toggleProfile = () => {
    setIsProfileOpen(prev => !prev);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setIsProfileOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };

  const scrollCards = (direction) => {
    if (scrollContainerReference.current) {
      const scrollAmount = 360; 
      const currentScroll = scrollContainerReference.current.scrollLeft;
      const newScroll = direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

      scrollContainerReference.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const updateScrollState = () => {
    if (scrollContainerReference.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerReference.current;
      const scrollTolerance = 1;

      setCanScrollLeft(scrollLeft > scrollTolerance);

      setCanScrollRight(scrollWidth > clientWidth && scrollLeft + clientWidth < scrollWidth - scrollTolerance);
    }
  };

  useEffect(() => {
    const container = scrollContainerReference.current;
    
    const handleClickOutside = (event) => {
      if (notificationReference.current && !notificationReference.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileReference.current && !profileReference.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (container) {

      updateScrollState();

      container.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        container.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
        document.removeEventListener('mousedown', handleClickOutside); 
      };
    }
  }, [isNotificationsOpen, isProfileOpen]);
  
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

  const notificationsData = [
    // { id: 1, type: 'New Request', message: 'Request #4521 has been submitted.', time: '2 min ago' },
    // { id: 2, type: 'Payment Due', message: 'Invoice #890 is due today.', time: '1 hour ago' },
    // { id: 3, type: 'Document Ready', message: 'Document for Request #4490 is ready.', time: '5 hours ago' },
  ];

  return (
    <div className = "dashboard-content">

      {/*------------------- START OF HEADER CONTENT -------------------*/}
      <div className="dashboard-header-wrapper">
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

            <div className="notification-wrapper" ref={notificationReference}>
              <button className="notification-icon-btn" onClick={toggleNotifications}>
                <NotificationIcon className="notification-icon" />
                {notificationsData.length > 0 && (
                  <span className="notification-badge">{notificationsData.length}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationPanel
                  notifications={notificationsData}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              )}
            </div>

            <div className="user-profile-container" ref={profileReference}>
              <div className="user-profile-wrapper" onClick={toggleProfile}>
                <div className="user-profile">
                  <span className="user-initials">A</span>
                </div>
                <div className="user-info">
                  <div className="user-name">Administrator</div>
                </div>
                <span className="dropdown-menu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>
            {isProfileOpen && (
              <UserProfilePanel
                onClose={() => setIsProfileOpen(false)}
                onLogout={handleLogout}
              />
            )}
           </div> 
          </div>
        </div>
      </div>
      {/*--------------------- END OF HEADER CONTENT -------------------*/}

      {/*--------------------- START OF STAT CARDS ---------------------*/}
      <div className="scroll-shell"> 
        <div 
          className="stat-cards-wrapper scroll-hide"
          ref={scrollContainerReference}
        >
          <div className="stat-card-inner-scroll">
            {cardData.map((card, index) => (
              <StatCard
                key={index}
                title={card.title}
                icon={card.icon}
                value={card.value}
                subText={card.subText}
              />
            ))}
          </div>
        </div>
          <ScrollButton
            direction="left"
            onClick={() => scrollCards('left')}
            isVisible={canScrollLeft}
          />
          <ScrollButton
            direction="right"
            onClick={() => scrollCards('right')}
            isVisible={canScrollRight}
          />
      </div>
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