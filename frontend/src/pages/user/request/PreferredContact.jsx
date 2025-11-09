import React, { useState, useEffect } from "react";
import "./PreferredContact.css";

function PreferredContact({ preferredContactInfo = {}, setPreferredContactInfo, onNext, onBack }) {
  /*
    props:
    - preferredContactInfo: object like { method: "Email" | "SMS" | "WhatsApp" | "Telegram" }
    - setPreferredContactInfo: function to update preferredContactInfo in parent
    - onNext: function to call to go next step
    - onBack: function to call to go previous step
  */

  const [selectedMethod, setSelectedMethod] = useState(preferredContactInfo.method || "");

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
    onNext();
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
            Email <em className="contact-detail">test@gmail.com</em>
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
            SMS <em className="contact-detail">09123456789</em>
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