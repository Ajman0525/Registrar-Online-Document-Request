import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="user-header">
            <Link to="/user/Landing" className="brand-section">
                <img src="/assets/MSUIITLogo.png" alt="MSUIIT Logo" className="brand-logo" />
                <div className="brand-name">
                    <p className="brand-name-text" id="online">Online</p>
                    <p className="brand-name-text" id="document">Document</p>
                    <p className="brand-name-text" id="request">Request</p>
                </div>
            </Link>
        </header>
    );
}

export default Header;