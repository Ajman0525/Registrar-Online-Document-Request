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

  // Calculate total price - ensure doc.cost is used correctly
  const totalPrice = selectedDocs.reduce((sum, doc) => {
    const cost = doc.cost || 0;
    const quantity = doc.quantity || 1;
    return sum + (cost * quantity);
  }, 0);

  const handleComplete = () => {
    setCompleting(true);
    
    // Convert File objects to base64 for submission
    const convertFilesToBase64 = async () => {
      const requirementsPromises = Object.entries(uploadedFiles).map(async ([req_id, file]) => {
        if (file instanceof File) {
          // Convert File to base64
          const base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          return {
            requirement_id: req_id,
            filename: file.name,
            content_type: file.type,
            alreadyUploaded: false,
            file_data: base64Data
          };
        } else if (typeof file === "string" && file) {
          // Already uploaded file
          return {
            requirement_id: req_id,
            filename: file.split("/").pop(),
            content_type: "application/octet-stream",
            alreadyUploaded: true,
            file_data: file
          };
        } else {
          // No file
          return {
            requirement_id: req_id,
            filename: "",
            content_type: "application/octet-stream",
            alreadyUploaded: false,
            file_data: null
          };
        }
      });
      
      return Promise.all(requirementsPromises);
    };
    
    // Process the data and call onNext
    convertFilesToBase64().then(requirements => {
      const student_info = {
        full_name: contactInfo.full_name || "",
        contact_number: contactInfo.contact_number || "",
        email: contactInfo.email || ""
      };
      
      const documents = selectedDocs.map(doc => ({
        doc_id: doc.doc_id,
        quantity: doc.quantity || 1
      }));
      
      const submissionData = {
        student_info,
        documents,
        requirements,
        total_price: totalPrice,
        preferred_contact: preferredContactInfo.method || "SMS",
        payment_status: false, // Default to unpaid for now
        remarks: "Request submitted successfully"
      };
      
      onNext(submissionData);
    }).catch(error => {
      console.error("Error converting files:", error);
      setCompleting(false);
      alert("An error occurred while processing files. Please try again.");
    });
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
                <div key={idx} className="summary-item">
                  {doc.doc_name} {doc.quantity && doc.quantity > 1 ? `${doc.quantity}x` : ''}
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
              Object.entries(uploadedFiles).map(([req_id, file]) => (
                <div key={req_id} className="summary-item">
                  {file
                    ? file instanceof File
                      ? file.name
                      : file.split("/").pop() // show the filename from the server path
                    : "No file"}
                </div>
              ))
            )}
          </div>
        </div>

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
