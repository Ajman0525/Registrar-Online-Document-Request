import { useState, useEffect} from "react";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";


function EnterId({ onNext, onBack, maskedPhone, setMaskedPhone}) {
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    const handleInputChange = (e) => {
    let value = e.target.value;

    // Remove any character that's not a digit or dash
    value = value.replace(/[^0-9-]/g, "");

    // Remove any dashes not at 5th position
    if (value.includes("-")) {
        const dashIndex = value.indexOf("-");
        if (dashIndex !== 4) {
        value = value.replace("-", "");
        }
        // Remove additional dashes after the first valid one
        value = value.slice(0, 5) + value.slice(5).replace(/-/g, "");
    }

    // Auto-insert dash after 4 digits if not present
    if (value.length > 4 && value[4] !== "-") {
        value = value.slice(0, 4) + "-" + value.slice(4);
    }

    // Limit total length to 9 (8 digits + 1 dash)
    if (value.length > 9) value = value.slice(0, 9);

    setStudentId(value);
    };



    const handleSubmit = async () => {
        if (studentId.length === 0) {
            triggerError("Please fill in the Student ID.");
        } else if (studentId.length < 9) {
            triggerError("Please enter a valid Student ID.");
            return;
        }

        try {
            const response = await fetch("/user/check-id", {
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

            setMaskedPhone(data.masked_phone);
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