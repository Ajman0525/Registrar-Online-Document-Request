import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import "./UserMasterLayout.css";
import { Outlet } from "react-router-dom";

function UserMasterLayout() {
    return (
        <div className="user-master-layout">
            <Header />

        <div className="content-area">
            <Outlet />
        </div>

            <Footer />
        </div>
    )
    }

export default UserMasterLayout;