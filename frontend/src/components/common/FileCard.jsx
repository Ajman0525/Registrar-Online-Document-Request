import "./FileCard.css";
import ButtonLink from "./ButtonLink";

function FileCard({ documentName, docDescription, requirements = [], cost, onClick }) {
    return (
        <div className="card-container">
             <div className="file-card">
                <div className="logo-section">

                </div>

                <div className="name-and-description-section">
                    <h2 className="document-name">{documentName}</h2>
                    <p className="subtext">{docDescription}</p>
                </div>

                <div className="requirements-section">
                    <p className="requirements-title">Requirements:</p>
                    <ul className="subtext">
                        {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                        ))}
                    </ul>
                </div>


                <div className="price-and-action-section">
                    <div className="card-price-section">
                        <p className="price-amount">Php{Number(cost).toFixed(2)}</p>
                        <p className="card-price-text">per copy</p>
                    </div>
                    <div className="action-section">
                        <ButtonLink text="Edit" placeholder={"Edit"} onClick={onClick} />
                        <button className="delete-button">
                            <img src="/assets/TrashWhite.svg" alt="Delete" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileCard;