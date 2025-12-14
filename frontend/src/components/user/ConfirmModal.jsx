import React from "react";
import "./ConfirmModal.css";
import ButtonLink from "../common/ButtonLink";

function ConfirmModal({ isOpen, onClose, onConfirm, title = "Confirm Action", message }) {
  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="confirm-modal">
        <h3 className="title">{title}</h3>
        <p className="subtext">{message}</p>
        <div className="confirm-modal-actions">
          <ButtonLink 
            onClick={onClose} 
            placeholder="Cancel" 
            variant="secondary" 
          />
          <ButtonLink 
            onClick={onConfirm} 
            placeholder="Confirm" 
            variant="primary" 
          />
        </div>
      </div>
    </div>
  );

}
export default ConfirmModal;
