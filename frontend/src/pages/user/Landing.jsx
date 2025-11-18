import { useNavigate } from "react-router-dom";
import ButtonLink from "../../components/common/ButtonLink";
import ContentBox from "../../components/user/ContentBox";
import "../../components/common/index.css";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="page-label">MSU-IIT</div>
      <h1 className="page-title">Online Document Request</h1>

      <div className="cards-wrapper">
        <ContentBox className="card" onClick={() => navigate("/user/track")}>
          <img src="/assets/TruckIcon.svg" alt="" />
          <div className="text-section">
            <div className="title-section">
              <h3 className="cards-title">Track</h3>
              <h3 className="cards-title">Request</h3>
            </div>
            <p className="subtext">Track your document’s progress with your tracking number and ID.</p>
          </div>
          <ButtonLink 
            to="/user/track" 
            placeholder="Track"
            className="btn"
          />
        </ContentBox>

        <ContentBox className="card" onClick={() => navigate("/user/login")}>
          <img src="/assets/FolderPlusIcon.svg" alt="" />
          <div className="text-section">
            <div className="title-section">
              <h3 className="cards-title">Request</h3>
              <h3 className="cards-title">Document</h3>
            </div>
            <p className="subtext">Request your transcript or other official documents.</p>  
          </div>
          <ButtonLink 
            to="/user/login" 
            placeholder="Request"
            className="btn"
          />
        </ContentBox>

        <ContentBox className="card" onClick={() => navigate("/user/documents")}>
          <img src="/assets/FileTextIcon.svg" alt="" />
          <div className="text-section">
            <div className="title-section">
              <h3 className="cards-title">View</h3>
              <h3 className="cards-title">Documents</h3>
            </div>
            <p className="subtext">See available documents and their requirements before making a request.</p>
          </div>
            <ButtonLink 
            to="/user/documents" 
            placeholder="View"
            className="btn"
          />
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