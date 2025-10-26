import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";


function OtpVerification({ onNext, onBack }) {
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setOtpCode(value);
    }
    
    const handleSubmit = (e) => {
         if (otpCode.length === 0) {
            setError("Please fill in the OTP code.");
        } else if (otpCode.length < 6) {
            setError("Please enter a valid 6-digit OTP code.");
        } else {
            setError("");
            navigate("/user/request");
        }
    }

    return (
        <div className="Login-page">
            <ContentBox>
                <div className="text-section">
                    <h3 className="title">Enter 6 Digit Code</h3>
                    <div className="subtext">
                        <p>We have sent a OTP to your school registered mobile number</p>
                        <p>*********54.</p>
                        <p>Please enter the 6-digit code below to continue.</p>
                    </div>
                </div>

                <div className="input-section">
                    <p className="subtext">6 Digit Code</p>
                    <input 
                        id="Code" 
                        type="numeric"
                        className="otp-input"
                        placeholder="000000"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={handleInputChange}
                        inputMode="numeric"
                        maxLength={6}
                    />
                    <div className="error-section">
                    {error && <p className="error-text">{error}</p>}
                    </div>
                </div>

                <div className="action-section">
                    <div className="button-section">
                        <ButtonLink 
                        onClick={onBack}
                        placeholder="Cancel"
                        className="cancel-button"
                        variant="secondary"
                        />

                        <ButtonLink
                        onClick={handleSubmit}
                        placeholder="Proceed"
                        className="proceed-button"
                        />
                    </div>

                    <div className="support-section">
                        <p className="subtext">Didn’t receive the code?, </p>
                        <a href="mailto:support@example.com" className="forgot-id-link">Resend OTP.</a>
                    </div>
                    </div>
            </ContentBox>
        </div>
    );
}

export default OtpVerification;