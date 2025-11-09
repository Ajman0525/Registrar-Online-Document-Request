import React, { useState, useEffect } from "react";
import "./PreferredContact.css";
import { getCSRFToken } from "../../../utils/csrf";

function PreferredContact({ preferredContactInfo = {}, setPreferredContactInfo, contactInfo, setContactInfo, onNext, onBack }) {
  /*
    props:
    - preferredContactInfo: object like { method: "Email" | "SMS" | "WhatsApp" | "Telegram" }
    - setPreferredContactInfo: function to update preferredContactInfo in parent
    - contactInfo: object with email and contact_number
    - setContactInfo: function to update contactInfo in parent
    - onNext: function to call to go next step
    - onBack: function to call to go previous step
  */

  const [selectedMethod, setSelectedMethod] = useState(preferredContactInfo.method || "");

  // Fetch contact info on component mount
  useEffect(() => {
    fetch("/api/get-contact", {
      method: "GET",
      headers: {
        "X-CSRF-TOKEN": getCSRFToken(),
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setContactInfo(data.contact_info);
        } else {
          console.error("Failed to fetch contact info:", data.notification);
        }
      })
      .catch((error) => {
        console.error("Error fetching contact info:", error);
      });
  }, [setContactInfo]);

  // Update parent state on selection change
  useEffect(() => {
    setPreferredContactInfo({ method: selectedMethod });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMethod]);

  // Enable Next only if a method is selected
  const canProceed = selectedMethod !== "";

  const handleNextClick = () => {
    if (!canProceed) {
      alert("Please select a preferred contact method.");
      return;
    }
  // Send the selected method to the backend
    fetch("/api/set-preferred-contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCSRFToken(),
      },
      credentials: "include",
      body: JSON.stringify({ preferred_contact: selectedMethod }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          onNext();
        } else {
          alert(`Error: ${data.notification}`);
        }
      })
      .catch((error) => {
        console.error("Error setting preferred contact:", error);
        alert("An error occurred while setting the preferred contact method.");
      });
  };

  return (
    <div className="preferred-contact-page">
      <h2>Preferred Contact</h2>

      <form>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="contactMethod"
              value="Email"
              checked={selectedMethod === "Email"}
              onChange={() => setSelectedMethod("Email")}
            />
            Email <em className="contact-detail">{contactInfo.email || "test@gmail.com"}</em>
          </label>
        </div>

        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="contactMethod"
              value="SMS"
              checked={selectedMethod === "SMS"}
              onChange={() => setSelectedMethod("SMS")}
            />
            SMS <em className="contact-detail">{contactInfo.contact_number || "09123456789"}</em>
          </label>
        </div>

        <div className="contact-row">
          <label className="radio-label">
            <input
              type="radio"
              name="contactMethod"
              value="WhatsApp"
              checked={selectedMethod === "WhatsApp"}
              onChange={() => setSelectedMethod("WhatsApp")}
            />
            WhatsApp
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="contactMethod"
              value="Telegram"
              checked={selectedMethod === "Telegram"}
              onChange={() => setSelectedMethod("Telegram")}
            />
            Telegram
          </label>
        </div>
      </form>

      <div className="button-row">
        <button type="button" className="back-btn" onClick={onBack}>
          Back
        </button>
        <button type="button" className="next-btn" onClick={handleNextClick} disabled={!canProceed}>
          Next
        </button>
      </div>
    </div>
  );
}

export default PreferredContact;