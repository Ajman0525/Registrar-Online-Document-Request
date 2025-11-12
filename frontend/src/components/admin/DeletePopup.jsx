import "./DeletePopup.css";
import ButtonLink from "../common/ButtonLink";

function DeletePopup({ onClose, onDelete, document }) {
  const handleConfirm = () => {
    if (typeof onDelete === "function") {
      onDelete(document.doc_id); // call delete handler with doc_id
    }
    onClose(); // close the popup after deletion
  };

  return (
    <div className="overlay">
      <div className="delete-popup">
        <h3 className="title">Confirm Deletion</h3>
        <p className="subtext">
          Are you sure you want to delete the document "{document?.doc_name}"? This action cannot be undone.
        </p>
        <div className="delete-popup-actions">
          <ButtonLink onClick={onClose} placeholder="Cancel" variant="secondary" />
          <ButtonLink onClick={handleConfirm} placeholder="Delete" variant="destructive" />
        </div>
      </div>
    </div>
  );
}

export default DeletePopup;
