import React from "react";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import ContentBox from "../../components/user/ContentBox";
import "./UserMasterLayout.css";

function UserMasterLayout() {
    return (
        <div className="user-master-layout">
            <Header />

        <div className="content-area">
            <ContentBox>
                <p>Content will be rendered here based on user navigation</p>
            </ContentBox>
        </div>

            <Footer />
        </div>
    )
    }

export default UserMasterLayout;