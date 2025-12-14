import React, { useState, useEffect } from "react";
import "./Request.css";
import ContentBox from "../../../components/user/ContentBox";
import ButtonLink from "../../../components/common/ButtonLink";
import { getCSRFToken } from "../../../utils/csrf";

function SubmitRequest({ trackingId }) {
  const [loading, setLoading] = useState(false);
  const [sessionCleared, setSessionCleared] = useState(false);

  // Auto-clear session when component mounts
  useEffect(() => {
    const clearSession = async () => {
      try {
        await fetch("/api/clear-session", {
          method: "POST",
          credentials: "include",
          headers: {
            "X-CSRF-TOKEN": getCSRFToken(),
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        });
        
        // Clear any local or session storage
        localStorage.removeItem("jwtToken");
        sessionStorage.clear();

        // Clear cookies to ensure session is fully cleared
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        setSessionCleared(true);
      } catch (error) {
        console.error("Error during session clear:", error);
        // Still mark as cleared to allow navigation
        setSessionCleared(true);
      }
    };

    clearSession();
  }, []);

  // Simplified redirect function - session is already cleared
  const handleRedirect = (redirectPath) => {
    setLoading(true);
    
    // Redirect smoothly after session is cleared
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 400);
  };

  return (
    <div className="upload-requirements-page">
      <ContentBox className="submit-request-box">
        <div className="text-section">
          <h2 className="title">Your request has been submitted</h2>
          <p className="subtext">
            Your chosen contact will receive the confirmation and tracking details.
            <br />
            Keep this tracking number for future reference.
          </p>
        </div>

        <div className="tracking-id-section">
          <div className="tracking-id-label">Tracking ID:</div>
          <div className="tracking-id">{trackingId}</div>
        </div>

        <div className="action-buttons">
          <ButtonLink
            placeholder={loading ? "Please wait..." : "Return to Home"}
            onClick={() => handleRedirect("/user/Landing")}
            variant="secondary"
            disabled={loading || !sessionCleared}
          />
          <ButtonLink
            placeholder={loading ? "Please wait..." : "Track Request"}
            onClick={() => handleRedirect("/user/Track")}
            variant="primary"
            disabled={loading || !sessionCleared}
          />
        </div>
      </ContentBox>
    </div>
  );
}

export default SubmitRequest;
