
import React, { useState } from "react";
import "./Request.css";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";


function Summary({
  selectedDocs = [],
  uploadedFiles = {},
  preferredContactInfo = {},
  contactInfo = {},
  onNext = () => {},
  onBack = () => {},
}) {
  const [completing, setCompleting] = useState(false);

  // Check for authorization letter data
  const authLetterData = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem("authLetterData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Handle view file function
  const handleViewFile = (file, filename) => {
    if (file instanceof File) {
      // Create a blob URL for local files
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (typeof file === 'string' && file) {
      // For server files, open the URL directly
      window.open(file, '_blank');
    }
  };

  // Handle view authorization letter
  const handleViewAuthLetter = () => {
    if (authLetterData && authLetterData.fileData) {
      try {
        // Convert base64 to blob and open
        const byteCharacters = atob(authLetterData.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: authLetterData.fileType });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error('Error viewing authorization letter:', error);
        alert('Error opening authorization letter');
      }
    }
  };

  // Calculate total price - ensure doc.cost is used correctly
  const totalPrice = selectedDocs.reduce((sum, doc) => {
    const cost = doc.cost || 0;
    const quantity = doc.quantity || 1;
    return sum + (cost * quantity);
  }, 0);

  const handleComplete = () => {
    setCompleting(true);
    // Directly call onNext, parent handles the submission logic
    onNext();
  };

  return (
    <>
      {completing && <LoadingSpinner message="Completing request..." />}
      <ContentBox className="summary-box">
        <h2 className="title">Review Your Documents</h2>
        <div className="summary-row">
          <label className="selected-documents-label">Selected Documents</label>
          <hr />
          <div className="summary-info-box">

            {selectedDocs.length === 0 ? (
              <p>No documents selected</p>
            ) : (
              selectedDocs.map((doc, idx) => (
                <div key={idx} className={`summary-item ${doc.isCustom ? 'custom-doc-item' : ''}`}>
                  <div className="doc-name">
                    {doc.doc_name} {doc.quantity && doc.quantity > 1 ? `${doc.quantity}x` : ''}
                  </div>
                  {doc.isCustom && doc.description && (
                    <div className="custom-doc-description">
                      {doc.description}
                    </div>
                  )}
                  {doc.isCustom && (
                    <div className="custom-doc-badge">Custom Document</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>


        <div className="summary-row">
          <label className="summary-label">Uploaded Files</label>
          <hr />
          <div className="summary-info-box">
            {Object.keys(uploadedFiles).length === 0 ? (
              <p>No files uploaded</p>
            ) : (
              Object.entries(uploadedFiles).map(([req_id, file]) => {
                const fileName = file
                  ? file instanceof File
                    ? file.name
                    : file.split("/").pop() // show the filename from the server path
                  : "No file";
                
                return (
                  <div key={req_id} className="uploaded-file-item">
                    <div className="file-info">
                      <span className="file-name">{fileName}</span>
                      {file && (
                        <button 
                          className="view-file-btn"
                          onClick={() => handleViewFile(file, fileName)}
                          title="View file"
                        >
                          <img src="/assets/EyeIcon.svg" alt="View" className="view-icon" />
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {authLetterData && (
          <div className="summary-row">
            <label className="summary-label">Authorization Letter</label>
            <hr />
            <div className="summary-info-box">
              <div className="auth-info">
                <div className="auth-details">
                  <div className="summary-item">
                    <strong>Requester:</strong> {authLetterData.requesterName} 
                  </div>
                  <div className="summary-item">
                    <strong>Requesting For:</strong> {authLetterData.firstname} {authLetterData.lastname} 
                  </div>
                  <div className="summary-item">
                    <strong>Contact Number:</strong> {authLetterData.number}
                  </div>
                </div>
                <button 
                  className="view-file-btn auth-view-btn"
                  onClick={handleViewAuthLetter}
                  title="View authorization letter"
                >
                  <img src="/assets/EyeIcon.svg" alt="View" className="view-icon" />
                  View Authorization Letter
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="summary-row">
          <label className="summary-label">Preferred Contact</label>
          <hr />
          <div className="summary-info-box">
            {preferredContactInfo.method ? (
              <div className="contact-info-item">
                <p className="contact-type-info">{preferredContactInfo.method}</p>
                {preferredContactInfo.method === "Email" && contactInfo.email && (
                  <div className="summary-item">{contactInfo.email}</div>
                )}
                {preferredContactInfo.method === "SMS" && contactInfo.contact_number && (
                  <div className="summary-item">{contactInfo.contact_number}</div>
                )}
                {(preferredContactInfo.method === "WhatsApp" || preferredContactInfo.method === "Telegram") && (
                  <div className="summary-item">Contact via {preferredContactInfo.method}</div>
                )}
              </div>
            ) : (
              "Not set"
            )}
          </div>
        </div>

        <div className="summary-row">
          <label className="summary-label">Price</label>
          <hr />
          <div className="price-item">
            <p className="total-text">Total Php:</p>
            <div className="price-amount">{totalPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="action-buttons">
          <ButtonLink
            placeholder="Back"
            onClick={onBack}
            variant="secondary"
            disabled={completing}
          />
          <ButtonLink
            placeholder={completing ? "Completing..." : "Complete"}
            onClick={handleComplete}
            variant="primary"
            disabled={completing}
          />
        </div>
      </ContentBox>
    </>
  );
}

export default Summary;

