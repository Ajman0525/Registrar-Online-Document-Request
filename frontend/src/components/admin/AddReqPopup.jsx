import { useState } from "react";
import ButtonLink from "../common/ButtonLink";
import "./AddReqPopup.css";

function AddReqPopup({ onClose, onSave }) {
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Requirement name cannot be empty");
      return;
    }

    // Call parent save handler
    if (onSave) onSave(name);
  };

  return (
    <div className="requirements-overlay">
      <div className="requirements-popup">
        <h3 className="title">Add Requirement</h3>

        <div className="input-section">
          <input
            type="text"
            placeholder="Requirement name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="requirement-input"
          />
        </div>

        <div className="action-section">
          <div className="button-section">
            <ButtonLink
              onClick={onClose}
              placeholder="Cancel"
              className="cancel-button"
              variant="secondary"
            />
            <ButtonLink
              onClick={handleSave}
              placeholder="Save"
              className="proceed-button"
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddReqPopup;
