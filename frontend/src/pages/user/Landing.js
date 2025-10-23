import "../../components/common/index.css";
import ContentBox from "../../components/user/ContentBox";
import "./Landing.css";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-container">
      <div className="page-label">MSU-IIT</div>
      <h1 className="page-title">Online Document Request</h1>

      <div className="cards-wrapper">
        <ContentBox className="dashboard-box">
          <h3>Track Request</h3>
          <p>Track the progress of your document request using your tracking number and student ID. Payment and pickup options are provided once the requested document is ready.</p>
          <Link to="/user/Track" className="btn">Track</Link>
        </ContentBox>

        <ContentBox className="dashboard-box">
          <h3>Request Document</h3>
          <p>Need your transcript, certificate of enrollment, or other official documents? Start your request here and follow the guided process.</p>
          <Link to="/user/UserLogin" className="btn">Request</Link>
        </ContentBox>

        <ContentBox className="dashboard-box">
          <h3>View Documents</h3>
          <p>Explore all available documents you can request and see what requirements are needed for each. Make sure you have the required materials ready before starting your request.</p>
          <Link to="/user/View" className="btn">View</Link>
        </ContentBox>
      </div>

      <div className="announcement-container">
        <div className="announcement-title">Announcement:</div>
        <div className="announcement-content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </div>
      </div>
    </div>
  );
}


export default Landing;