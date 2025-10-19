import React from "react";
import { Link } from "react-router-dom";

function Index() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Links</h2>
      <ul>
        <li>
          <Link to="/admin/login">Admin Login</Link>
        </li>
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/document-management">Document Management</Link>
        </li>
        <li>
          <Link to="/admin/logging">Logging</Link>
        </li>
      </ul>

      <h2>User Links</h2>
      <ul>
        <li>
          <Link to="/user/login">User Login</Link>
        </li>
        <li>
          <Link to="/user/document-list">Document List</Link>
        </li>
        <li>
          <Link to="/">Landing</Link>
        </li>
        <li>
          <Link to="/request">Request</Link>
        </li>
        <li>
          <Link to="/tracking">Tracking</Link>
        </li>
      </ul>
    </div>
  );
}

export default Index;
