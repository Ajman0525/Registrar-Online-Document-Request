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
      </ul>
    </div>
  );
}

export default Index;
