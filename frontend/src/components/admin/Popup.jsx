import { useState } from "react";
import "./Popup.css";
import ButtonLink from "../common/ButtonLink";

function Popup({ onClose }) {
  const [requirements, setRequirements] = useState([]);

  const handleAddRequirement = () => {
    setRequirements([...requirements, ""]); // add a new empty requirement
  };

  const handleRequirementChange = (index, value) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleRemoveRequirement = (index) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
  };

  return (
    <div className="overlay">
      <div className="Popup">
        <h3 className="title">Add Document</h3>

        <div className="name-and-description-wrapper">
          <div className="name-section">
            <input
              className="document-name-field"
              type="text"
              placeholder="Document Name"
            />
            <hr />
          </div>
          <div className="description-section">
            <input
              className="document-description-field"
              type="text"
              placeholder="Document Description"
            />
            <hr />
          </div>
        </div>

        <div className="requirements-wrapper">
          <p className="subtext">Requirements</p>
          <div className="requirements-section">
            <div
              className="add-requirement"
              onClick={handleAddRequirement}
              style={{ cursor: "pointer" }}
            >
              <p className="subtext">Add Requirements</p>
              <img src="/assets/AddIcon.svg" alt="Add Icon" />
            </div>
            <hr />

            {requirements.map((req, index) => (
              <div className="requirement-item" key={index}>
                <div className="requirement-action-section">
                    <input
                    className="requirement-name-field"
                    type="text"
                    placeholder="Untitled Requirement"
                    value={req}
                    onChange={(e) =>
                        handleRequirementChange(index, e.target.value)
                    }
                    />
                    <img
                    src="/assets/Trash.svg"
                    alt="Remove Icon"
                    style={{ cursor: "pointer" }}
                    className="remove-icon"
                    onClick={() => handleRemoveRequirement(index)}
                    />
                </div>
                <hr />
              </div>
            ))}
          </div>
        </div>

        <div className="price-section">
          <div className="price-wrapper">
            <p className="price-text">Price Php:</p>
            <input
              className="document-price-field"
              type="text"
              placeholder="0000"
            />
          </div>
          <hr />
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
              onClick={onClose}
              placeholder="Add"
              className="proceed-button"
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popup;
