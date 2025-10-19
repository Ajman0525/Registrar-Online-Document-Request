import React, { useEffect, useState } from "react";

function AdminLogin() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/login")   // this hits your Flask route
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Admin Login Page</h1>
      <p>{message || "Loading..."}</p>
    </div>
  );
}

export default AdminLogin;
