import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/admin/dashboard", {
      method: "GET",
      credentials: "include",
      headers: {
        "X-CSRF-TOKEN": getCSRFToken()
      },
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Unauthorized");
        try {
          return JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response from server");
        }
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST", 
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": getCSRFToken()
        },
      });

      const data = await res.json();
      if (res.ok) {
        navigate("/admin/login"); // redirect to login after logout
      } else {
        setError(data.error || "Logout failed");
      }
    } catch (err) {
      setError("Network error during logout");
      console.error(err);
    }
  };

  if (error) return <p>{error}</p>;
  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <p>Total Users: {stats.users_count}</p>
      <p>Pending Documents: {stats.documents_pending}</p>
      <h3>Recent Activity:</h3>
      <ul>
        {stats.recent_activity.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button
        style={{ marginTop: "20px" }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
