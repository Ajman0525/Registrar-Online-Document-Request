import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { getCSRFToken } from "../../utils/csrf";
import "./RegistrarMasterLayout.css";

function RegistrarMasterLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      });

      if (response.ok) {
        navigate("/admin/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="registrar-master-layout">
      <Sidebar />

      <main className="registrar-content-area">
        <Header
          title="Welcome, Administrator."
          onLogout={handleLogout}
          notifications={[]}
        />
        <div className="registrar-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default RegistrarMasterLayout;
