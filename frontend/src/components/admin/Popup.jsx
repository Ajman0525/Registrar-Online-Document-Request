import { useState } from "react";
import "./Popup.css";
import ButtonLink from "../common/ButtonLink";

function Popup({ onClose, onSuccess }) {
  const [docName, setDocName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [requirements, setRequirements] = useState([]);

  const handleAddRequirement = () => {
    setRequirements([...requirements, ""]);
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

  const handleSubmit = async () => {
    const data = {
      doc_name: docName,
      description,
      cost: parseFloat(price) || 0,
      requirements,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/admin/add-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to add document");

      const result = await res.json();
      console.log("Document added successfully:", result);

      // Refresh the document list right after adding
      if (typeof onSuccess === "function") {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error adding document:", error);
    }
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
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
            <hr />
          </div>
          <div className="description-section">
            <input
              className="document-description-field"
              type="text"
              placeholder="Document Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <p className="subtext">Add Requirement</p>
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
              type="number"
              placeholder="0000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
              onClick={handleSubmit}
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
