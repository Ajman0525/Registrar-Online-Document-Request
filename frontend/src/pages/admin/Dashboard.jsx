import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

function Dashboard() {
  return (
    // The main content area wrapper
    <div >

      {/* --- FOCUS: THE DASHBOARD HEADER --- */}
      <div className="header-simple">
        <h1>Dashboard</h1>
      </div>
      {/* --- END DASHBOARD HEADER --- */}


    </div>
  );
}

export default Dashboard;