import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import DashboardHeader from "../../components/admin/DashboardHeader";
import "./RegistrarMasterLayout.css";

function RegistrarMasterLayout(){
    return (
      <div className="registrar-master-layout">
        <Sidebar />

        <main className="registrar-content-area">
          <Outlet />
        </main>
      </div>
    );
}

export default RegistrarMasterLayout;
