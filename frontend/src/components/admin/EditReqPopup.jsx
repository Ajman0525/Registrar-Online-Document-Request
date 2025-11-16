import "./EditReqPopup.css";
import ButtonLink from "../common/ButtonLink";
import { useState } from "react";

function EditReqPopup({ onClose, onSave, requirement }) {
  const [name, setName] = useState(requirement.requirement_name);

  const handleSave = () => {
    if (!name.trim()) return alert("Requirement name cannot be empty");
    onSave(requirement.req_id, name.trim());
  };

  return (
    <div className="delete-req-overlay">
      <div className="edit-popup">
        <h3>Edit Requirement</h3>
        <div className="input-section">
          <input
            type="text"
            className="box-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Requirement Name"
          />
        </div>
        <div className="button-section">
          <ButtonLink onClick={onClose} placeholder="Cancel" variant="secondary" />
          <ButtonLink onClick={handleSave} placeholder="Save" variant="primary" />
        </div>
      </div>
    </div>
  );
}

export default EditReqPopup;
