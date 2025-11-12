import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import bgImage from "./assets/Motif.png";


function AdminLogin() {
  const navigate = useNavigate();
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;


  const onSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;


    const response = await fetch("/api/admin/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: idToken }),
    });


    const data = await response.json();
    if (response.ok) {
      navigate("/admin/dashboard");
    } else {
      alert(data.error);
    }
  };


  const onFailure = (res) => {
    console.error("Google login failed:", res);
    alert("Google login failed");
  };


  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        className="body"
        style={{
          height: "100vh",
          backgroundColor: "#c20505ff",
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}

      >
        <div
          className="content"


          style={{
            display: "flex",
            height: "800px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f5f5f5",
            borderRadius: "20px",
            width: "1100px",
          }}
        >
          <div
            className="image-container"
            style={{
              flex: 1,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: "white",
              padding: "300px 60px",


            }}
          >
            <h1 style={{ fontWeight: "bold", fontSize: "2.5rem" }}>
              Hello, Welcome!
            </h1>
            <p style={{ maxWidth: "400px", marginTop: "10px", lineHeight: "1.5" }}>
              Lorem ddadkm adkjak dj adadakan dkiadnka ad dnakdawd d
            </p>
            <div style={{ marginTop: "auto" }}>
              <p style={{ fontSize: "0.9rem", marginTop: "30px" }}>
                <strong>Online</strong> Document Request
              </p>
            </div>
          </div>


          {/* Right side login section */}
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px",
            }}
          >
            <div style={{ width: "100%", maxWidth: "320px", textAlign: "center" }}>
              <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>Login</h2>
              <p style={{ color: "#6c757d", marginBottom: "30px" }}>
                Please sign in with your myIIT account
              </p>


              <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}


export default AdminLogin;
