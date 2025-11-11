import { useState, useEffect } from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";

function EnterTrackId({ onNext }) {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [studentId, setStudentId] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    const handleStudentIdChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4, 8);
        setStudentId(value);
    };

    const handleSubmit = async () => {
        if (!trackingNumber || !studentId) {
            triggerError("Please fill in all fields.");
            return;
        }

        // mock database for status checking
        try {
            const mockDatabase = {
                "DOC-2021-0001": {
                    studentId: "2021-0001",
                    status: "Ready for Pickup",
                    documents: [
                        { name: "Transcript of Records", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Certificate of Good Moral", quantity: 2, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Honorable Dismissal", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                    ]
                },
                "DOC-2022-0001": {
                    studentId: "2022-0001",
                    status: "Processing",
                    documents: [
                        { name: "Form 137", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                    ]
                },
                "DOC-2023-0001": {
                    studentId: "2023-0001",
                    status: "Under Review",
                    documents: [
                        { name: "Diploma (Reissue)", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Authentication", quantity: 5, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Transcript of Records", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Certificate of Good Moral", quantity: 2, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "Honorable Dismissal", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                    ]
                },
                "DOC-2024-0001": {
                    studentId: "2024-0001",
                    status: "For Signature",
                    documents: [
                        { 
                            name: "Certificate of Graduation", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                    ]
                },
                "DOC-2025-0001": {
                    studentId: "2025-0001",
                    status: "Payment Pending",
                    amountDue: 550.00,
                    documents: [
                        { name: "Transcript of Records", quantity: 2, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                        { name: "CAV (CHED)", quantity: 1, requirements: ["Valid ID", "Birth Certificate", "Birth Certificate"] },
                    ]
                }
            };

            const record = mockDatabase[trackingNumber];

            if (!record || record.studentId !== studentId) {
                triggerError("Invalid Tracking Number or Student ID.");
                return;
            }

            setError("");
            onNext({ ...record, trackingNumber, studentId }); // pass the tracking data to the next step
        } catch (err) {
            triggerError("An error occurred. Please try again.");
            console.error(err);
        }
    };

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
        <div className="Track-page">
            <div className="text-section">
                <h3 className="title">Track your request</h3>
                <p className="subtext">Only verified students can access request status. Make sure you have your registered number ready.</p>
            </div>

            <div className="input-section">
                <p className="subtext">Tracking Number</p>
                <input
                    type="text"
                    className={`track-input ${error && !studentId ? "input-error" : ""} ${shake ? "shake" : ""}`}
                    placeholder="e.g., DOC-2021-2134"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <p className="subtext">ID Number</p>
                <input
                    type="text"
                    className={`track-input ${error && !trackingNumber ? "input-error" : ""} ${shake ? "shake" : ""}`}
                    placeholder="0000-0000"
                    value={studentId}
                    onChange={handleStudentIdChange}
                    maxLength={9}
                />
                <div className="error-section">
                    {error && <p className={`error-text ${shake ? "shake" : ""}`}>{error}</p>}
                </div>
            </div>

            <div className="action-section">
                <div className="button-section">
                    <ButtonLink to={"/user/landing"} placeholder="Return" className="cancel-button" variant="secondary" />
                    <ButtonLink onClick={handleSubmit} placeholder="Track" className="proceed-button" variant="primary" />
                </div>

                <div className="support-section">
                    <p className="subtext">Forgot ID Number or Tracking Number? Contact the </p>
                    <a href="mailto:support@example.com" className="forgot-id-link">support.</a>
                </div>
            </div>
        </div>
    );
}

export default EnterTrackId;
