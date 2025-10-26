import { useState } from "react";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";


function EnterId({ onNext, onBack }) {
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
        if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4, 8);
        setStudentId(value);
    }

    const handleSubmit = (e) => {
        if (studentId.length === 0) {
            setError("Please fill in the Student ID.");
        } else if (studentId.length < 9) {
            setError("Please enter a valid Student ID.");
        } else {
            setError("");
            onNext();
        }
    }

    return (
        <div className="Login-page">
            <ContentBox>
                <div className="text-section">
                    <h3 className="title">Enter Student Id</h3>
                </div>

                <div className="input-section">
                    <p className="subtext">Id Number</p>
                    <input 
                        id="student-id" 
                        type="text" 
                        placeholder="0000-0000" 
                        value={studentId}
                        onChange={handleInputChange}
                        maxLength={9}
                    />
                    <div className="error-section">
                    {error && <p className="error-text">{error}</p>}
                    </div>
                </div>

                <div className="action-section">
                   <div className="button-section">
                        <ButtonLink 
                        to={"/user/landing"}
                        placeholder="Return"
                        className="cancel-button"
                        variant="secondary"
                        />

                        <ButtonLink 
                        onClick={handleSubmit}
                        placeholder="Proceed"
                        className="proceed-button"
                        variant="primary"
                        />
                    </div>

                    <div className="support-section">
                        <p className="subtext">Forgot ID Number?, contact the </p>
                        <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                    </div>
                    </div>
            </ContentBox>
        </div>
    );
}

export default EnterId;