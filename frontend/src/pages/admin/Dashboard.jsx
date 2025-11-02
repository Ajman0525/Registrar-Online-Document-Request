import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';

function Dashboard() {
  return (
    <div >
      <div className="header-simple">
        <h1>Dashboard</h1>
      </div>
    </div>
  );
}

export default Dashboard;