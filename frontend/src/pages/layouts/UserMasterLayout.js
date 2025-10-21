import React from "react";
import Header from "../../components/user/Header";
import "./UserMasterLayout.css";

function UserMasterLayout() {
    return (
        <div className="user-master-layout">
            <Header />
        <div className="content-area">
            {/* Content will be rendered here based on user navigation */}
        </div>
        </div>
    )
    }

export default UserMasterLayout;