import "../../components/common/index.css";
import "./Landing.css";
import { Link } from "react-router-dom";

function Landing() {
    return (
        <div className="landing-page">
            <h2>Welcome to the Online Document Request System</h2>
            <p>Please log in to access your dashboard and manage your document requests.</p>
            <Link to="/user">Track Document</Link>
            <button>Request Document</button>
            <button>View Document</button>
        </div>
    );
}

export default Landing;