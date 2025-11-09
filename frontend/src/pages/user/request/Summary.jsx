import React from "react";
import "./Summary.css";

function Summary({ selectedDocs = [], uploadedFiles = {}, preferredContactInfo = {}, onBack, onNext }) {
  /**
   * Props:
   * - selectedDocs: array of documents with quantity, e.g.
   *     [{ doc_name: "Transcript of Records", quantity: 5 }, ...]
   * - uploadedFiles: object { req_id: File }
   * - preferredContactInfo: object with contact info
   * - onBack: function handler for Back button
   * - onNext: function handler for Complete button
   */

  // Calculate total price (placeholder, assuming each doc has cost)
  const totalPrice = selectedDocs.reduce((sum, doc) => sum + (doc.cost * doc.quantity || 0), 0);

  return (
    <div className="summary-container">
      <h2>Summary</h2>

      <div className="summary-row">
        <label className="summary-label">Selected Document</label>
        <div className="summary-value documents-box">
          {selectedDocs.length === 0 ? (
            <p>No documents selected</p>
          ) : (
            selectedDocs.map((doc, idx) => (
              <div key={idx}>
                {doc.doc_name} {doc.quantity}x
              </div>
            ))
          )}
        </div>
      </div>

      <div className="summary-row">
        <label className="summary-label">Uploaded Files</label>
        <div className="summary-value documents-box">
          {Object.keys(uploadedFiles).length === 0 ? (
            <p>No files uploaded</p>
          ) : (
            Object.entries(uploadedFiles).map(([req_id, file]) => (
              <div key={req_id}>
                {file ? file.name : "No file"}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="summary-row">
        <label className="summary-label">Preferred Contact</label>
        <div className="summary-value documents-box">
          {preferredContactInfo.contact_number || preferredContactInfo.email || "Not set"}
        </div>
      </div>

      <div className="summary-row">
        <label className="summary-label">Total Price (php)</label>
        <div className="summary-value price-box">{totalPrice.toFixed(2)}</div>
      </div>

      <div className="button-row">
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
        <button className="complete-btn" onClick={onNext}>
          Complete
        </button>
      </div>
    </div>
  );
}

export default Summary;
