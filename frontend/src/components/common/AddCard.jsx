import "./FileCard.css";

function AddCard({onClick }) {
    return (
        <div className="card-container" onClick={onClick}>
            <div className="add-card">
            <img src="/assets/PlusIcon.svg" alt="plus icon" className="plus-icon" />
            </div>
        </div>
    );
}

export default AddCard;