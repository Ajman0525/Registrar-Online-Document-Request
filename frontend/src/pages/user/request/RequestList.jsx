import React from "react";
import "./RequestList.css";

function RequestList({ selectedDocs = [], onBack }) {
  return (
    <div className="request-list-page">
      <h2>Review Requirements</h2>

      {selectedDocs.length === 0 ? (
        <p>No documents selected. Please go back and select documents.</p>
      ) : (
        selectedDocs.map((doc) => (
          <div key={doc.doc_id} className="document-requirements-card">
            <h3>{doc.doc_name}</h3>
            {doc.requirements && doc.requirements.length > 0 ? (
              <ul>
                {doc.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            ) : (
              <p>No requirements listed for this document.</p>
            )}
          </div>
        ))
      )}

      <button className="back-btn" onClick={onBack}>
        Back
      </button>

      {/* You can add "Next" or "Finalize Request" button here later */}
    </div>
  );
}

export default RequestList;
