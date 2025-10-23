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
          <p>Track the status of your document request by entering your tracking number and Student ID</p>
          <Link to="/user/Track" className="btn">Track</Link>
        </ContentBox>

        <ContentBox className="dashboard-box">
          <h3>Request Document</h3>
          <p>Need your transcript, certificate of enrollment, or other official documents? Start your request here and follow the guided process.</p>
          <Link to="/user/UserLogin" className="btn">Request</Link>
        </ContentBox>

        <ContentBox className="dashboard-box">
          <h3>View Documents</h3>
          <p>View Available Documents</p>
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