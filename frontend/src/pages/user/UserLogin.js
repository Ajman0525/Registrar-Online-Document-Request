import React from "react";
import { Link } from "react-router-dom";
import "./UserLogin.css";
import ContentBox from "../../components/user/ContentBox";

function UserLogin() {
    return (
        <div className="Login-page">
            <ContentBox>
                <p>User Login Page</p>
                <Link to="/user/Request">Login</Link>
            </ContentBox>
        </div>
    );
}

export default UserLogin;