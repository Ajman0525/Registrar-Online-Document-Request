import "./Footer.css";

function Footer() {
    return (
        <footer className="user-footer">
            <div className="Top-section">
                <div className="footer-brand-name">
                    <p className="footer-text" id="registrars-office">Registrars Office</p>
                    <p className="footer-text">Document Request System</p>
                    <p className="footer-subtext">Maintaining student academic records and providing essential </p>
                    <p className="footer-subtext">university services.</p>
                </div>
                <div className="footer-brand-information">
                    <div className="footer-row-1">
                        <p className="footer-subtext">Contact Info:</p>
                    </div>
                    <div className="footer-row-2">
                        <div className="column-1"> 
                            <p className="footer-subtext" id="information">Email: Insert Email Here</p>
                            <p className="footer-subtext" id="information">Office Hours: Insert Office Hours Here</p>
                        </div>
                        <div className="column-2">
                            <p className="footer-subtext" id="information">Address: Insert Address Here</p>
                            <p className="footer-subtext" id="information">Phone: Insert Phone Number Here</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="Bottom-section">
                <p>© 2025 Mindanao State University Iligan Institute of Technology. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;