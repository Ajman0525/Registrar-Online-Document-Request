import React, { useState } from "react";
import "./CustomDocumentModal.css";

function CustomDocumentModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    document_name: "",
    document_description: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.document_name.trim()) {
      newErrors.document_name = "Document name is required";
    } else if (formData.document_name.trim().length < 3) {
      newErrors.document_name = "Document name must be at least 3 characters";
    }
    
    if (!formData.document_description.trim()) {
      newErrors.document_description = "Document description is required";
    } else if (formData.document_description.trim().length < 10) {
      newErrors.document_description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        doc_id: `CUSTOM_${Date.now()}`, // Generate unique ID for custom documents
        doc_name: formData.document_name.trim(),
        description: formData.document_description.trim(),
        cost: 0.00,
        isCustom: true // Flag to identify as custom document
      });
      // Reset form
      setFormData({
        document_name: "",
        document_description: ""
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      document_name: "",
      document_description: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="custom-doc-modal-overlay" onClick={handleClose}>
      <div className="custom-doc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Custom Document</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Please provide details for your custom document request.
          </p>
          
          <div className="form-group">
            <label htmlFor="document_name">Document Name *</label>
            <input
              type="text"
              id="document_name"
              name="document_name"
              value={formData.document_name}
              onChange={handleChange}
              placeholder="Enter document name (e.g., Official Transcript, Certificate)"
              className={errors.document_name ? "error" : ""}
              maxLength={100}
            />
            {errors.document_name && (
              <span className="error-message">{errors.document_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="document_description">Description *</label>
            <textarea
              id="document_description"
              name="document_description"
              value={formData.document_description}
              onChange={handleChange}
              placeholder="Describe what document you need"
              rows={4}
              className={errors.document_description ? "error" : ""}
              maxLength={500}
            />
            {errors.document_description && (
              <span className="error-message">{errors.document_description}</span>
            )}
            <small className="char-counter">
              {formData.document_description.length}/1000 characters
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Add Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomDocumentModal;
