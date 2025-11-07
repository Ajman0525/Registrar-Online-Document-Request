import { useState, useEffect} from "react";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";


function EnterId({ onNext, onBack }) {
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    const handleInputChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
        if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4, 8);
        setStudentId(value);
    }

    const handleSubmit = async () => {
        if (studentId.length === 0) {
            triggerError("Please fill in the Student ID.");
        } else if (studentId.length < 9) {
            triggerError("Please enter a valid Student ID.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/user/check-id", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ student_id: studentId })
            });

            const data = await response.json();

            if (response.status === 404) {
                triggerError(data.message);
                return;
            }

            if (data.status === "has_liability") {
                triggerError(data.message);
                return;
            }

            setError("");
            onNext();
        } catch (error) {
            triggerError("An error occurred. Please try again.");
            console.error(error);
        }
    }

    const triggerError = (message) => {
        setError(message);
        setShake(true);
      };
    
      useEffect(() => {
        if (shake) {
          const timer = setTimeout(() => setShake(false), 400);
          return () => clearTimeout(timer);
        }
      }, [shake]);
    

    return (
        <div className="Login-page">
            <ContentBox>
                <div className="text-section">
                    <h3 className="title">Enter Student ID</h3>
                </div>

                <div className="input-section">
                    <p className="subtext">ID Number</p>
                    <input 
                        id="student-id" 
                        type="text"
                        className={`id-input ${error ? "input-error" : ""} ${shake ? "shake" : ""}`}
                        placeholder="0000-0000" 
                        value={studentId}
                        onChange={handleInputChange}
                        maxLength={9}
                    />
                    <div className="error-section">
                    {error && <p className={`error-text ${shake ? "shake" : ""}`}>{error}</p>}
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
                        <p className="subtext">Forgot ID Number? Contact the </p>
                        <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                    </div>
                    </div>
            </ContentBox>
        </div>
    );
}

export default EnterId;