import "./DeleteReqPopup.css";
import ButtonLink from "../common/ButtonLink";

function DeleteReqPopup({ onClose, onConfirm }) {
  return (
    <div className="delete-req-overlay">
      <div className="delete-popup">
        <div className="text-section">
          <h3 className="title">Confirm Delete</h3>
          <p className="delete-text">
            Warning: This requirement is currently used in one or more requests.
            Deleting it will remove it from all associated documents and cannot be undone.
            If it is linked to any requests, deletion will not be allowed.
          </p>
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
              onClick={onConfirm}
              placeholder="Confirm Delete"
              className="proceed-button"
              variant="destructive"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteReqPopup;
