import ButtonLink from "../common/ButtonLink";
import "./RequirementsPopup.css";
import { useState, useEffect } from "react";
import ReqSearchbar from "./ReqSearchbar";

function RequirementsPopup({ onClose, selected, setSelected, onAddRequirement }) {
  const [requirements, setRequirements] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // track search input
  const [filteredRequirements, setFilteredRequirements] = useState([]);

  useEffect(() => {
    fetch("/admin/get-requirements")
      .then((res) => res.json())
      .then((data) => {
        setRequirements(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter requirements whenever searchTerm or requirements change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequirements(requirements);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredRequirements(
        requirements.filter((r) => r.requirement_name.toLowerCase().includes(term))
      );
    }
  }, [searchTerm, requirements]);

  const handleToggle = (req_id) => {
    if (selected.includes(req_id)) {
      setSelected(selected.filter((id) => id !== req_id));
    } else {
      setSelected([...selected, req_id]);
    }
  };

  const handleAddNewRequirement = async () => {
    const name = prompt("Enter requirement name:");
    if (!name || !name.trim()) return;

    try {
      const res = await fetch("/admin/add-requirement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement_name: name }),
      });
      if (!res.ok) throw new Error("Failed to add requirement");

      const result = await res.json();
      const newReq = {
        req_id: result.req_id,
        requirement_name: name,
      };

      setRequirements([newReq, ...requirements]);
      setSelected([...selected, newReq.req_id]);

      // update outer allRequirements in parent
      if (onAddRequirement) onAddRequirement(newReq);
    } catch (err) {
      console.error(err);
      alert("Failed to add requirement. Try again.");
    }
  };

  const handleDeleteRequirement = async (req_id) => {
    if (!window.confirm("Are you sure you want to delete this requirement?")) return;

    try {
      const res = await fetch(`/admin/delete-requirement/${req_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete requirement");
      setRequirements(requirements.filter((r) => r.req_id !== req_id));
      setSelected(selected.filter((id) => id !== req_id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete requirement. Try again.");
    }
  };

  return (
    <div className="requirements-overlay">
      <div className="requirements-popup">
        <h3 className="title">Edit Requirements</h3>

        <div className="search-section">
          <ReqSearchbar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            placeholder="Search requirements..."
          />
        </div>

        <div className="requirements-section">
          <div className="add-requirement-section">
            <div className="add-requirement" onClick={handleAddNewRequirement}>
              <p className="subtext">Add Requirement</p>
              <img src="/assets/AddIcon.svg" alt="Add Icon" />
            </div>
            <hr />
          </div>

          <div className="requirement-item-wrapper">
            {filteredRequirements.map((req) => (
              <div className="requirement-item" key={req.req_id}>
                <div className="requirement-action-section">
                  <input
                    type="checkbox"
                    checked={selected.includes(req.req_id)}
                    onChange={() => handleToggle(req.req_id)}
                  />
                  <input
                    type="text"
                    className="requirement-name-field"
                    value={req.requirement_name}
                    placeholder="Untitled Requirement"
                    onChange={(e) => {
                      const updated = requirements.map((r) =>
                        r.req_id === req.req_id ? { ...r, requirement_name: e.target.value } : r
                      );
                      setRequirements(updated);
                    }}
                  />
                  <img
                    src="/assets/Trash.svg"
                    alt="Remove Icon"
                    className="remove-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteRequirement(req.req_id)}
                  />
                </div>
                <hr />
              </div>
            ))}
            {filteredRequirements.length === 0 && (
              <p style={{ textAlign: "center", color: "#888" }}>No matching requirements</p>
            )}
          </div>
        </div>

        <div className="action-section">
          <div className="button-section">
            <div className="cancel-button-wrapper">
              <ButtonLink onClick={onClose} placeholder="Cancel" className="cancel-button" variant="secondary" />
            </div>
            <div className="proceed-button-wrapper">
              <ButtonLink onClick={onClose} placeholder="Done" className="proceed-button" variant="primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequirementsPopup;
