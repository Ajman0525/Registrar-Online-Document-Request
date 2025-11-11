import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="user-header">
            <Link to="/user/Landing" className="brand-section">
                <img src="/assets/MSUIITLogo.png" alt="MSUIIT Logo" className="brand-logo" />
                <div className="brand-text">
                    <p className="header-text" id="online">Online</p>
                    <p className="header-text" id="document-request">Document Request</p>
                </div>
            </Link>
        </header>
    );
}

export default Header;