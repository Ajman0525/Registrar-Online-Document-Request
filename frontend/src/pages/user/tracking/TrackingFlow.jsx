import { useState } from "react";
import EnterTrackId from "./EnterTrackId";
import TrackStatus from "./TrackStatus";
import OtpVerification from "../OtpVerification";
import Details from "./Details";
import PaymentOptions from "./PaymentOptions";
import PaymentInstructions from "./PaymentInstructions";
import PaymentSuccess from "./PaymentSuccess";
import DeliveryInstructions from "./DeliveryInstructions";
import ContentBox from "../../../components/user/ContentBox";
import "./Tracking.css";

function TrackFlow() {
    const [currentView, setCurrentView] = useState("enter-id");
    const [trackData, setTrackData] = useState(null);
    const [studentId, setStudentId] = useState("");

    // the 'data' parameter will hold the response from the tracking API
    const handleTrackIdSubmit = (data) => {
		setTrackData(data.trackData);
        setStudentId(data.studentId);
		setCurrentView("otp");
    };

    const handleBack = () => {
		if (currentView === "status") {
			setCurrentView("enter-id");
			setTrackData(null); // clear data when going back to initial screen
		} else if (currentView === "otp") {
            setCurrentView("enter-id");
        } else if (currentView === "details" || currentView === "payment-options" || currentView === "payment-instructions" || currentView === "delivery-instructions") {
			setCurrentView("status"); // go back to main status view
		}
  	};

	const handleViewDetails = () => setCurrentView("details");
	const handleTrackAnother = () => setCurrentView("enter-id");
	const handleViewPaymentOptions = () => setCurrentView("payment-options");
	const handleViewPaymentInstructions = () => setCurrentView("payment-instructions");
	const handleOtpSuccess = () => setCurrentView("status");
	const handleViewDeliveryInstructions = () => setCurrentView("delivery-instructions");

	const handleSelectPaymentMethod = (method) => {
		if (method === "online") {
			// simulate successful online payment
			setCurrentView("payment-success");
		} else if (method === "in-person") {
			handleViewPaymentInstructions();
		}
	};
	
	const handlePaymentComplete = () => {
		// Update the status in trackData and go to the status page
		setTrackData(prevData => ({ ...prevData, status: "Ready for Pickup" }));
		setCurrentView("status");
	};

    return (
        <div className="Track-page">
			<ContentBox key={currentView}> {/* animation on every view change */}
				{currentView === "enter-id" && <EnterTrackId onNext={handleTrackIdSubmit} />}

				{currentView === "otp" && (
                    <OtpVerification
                        onNext={handleOtpSuccess}
                        onBack={handleBack}
                        studentId={studentId}
                    />
                )}

				{currentView === "status" && trackData && (
					<TrackStatus
						trackData={trackData}
						onViewDetails={handleViewDetails}
						onViewPaymentOptions={handleViewPaymentOptions}
						onViewDeliveryInstructions={handleViewDeliveryInstructions}
						onBack={handleBack} // pass handleBack for the "Track Another" button
					/>
				)}

				{currentView === "details" && trackData && (
					<Details trackData={trackData} onTrackAnoter={handleTrackAnother} onBack={handleBack} />
				)}

				{currentView === "payment-options" && (
					<PaymentOptions 
						trackData={trackData} 
						onSelectMethod={handleSelectPaymentMethod} 
						onBack={handleBack}
						onViewDetails={handleViewDetails}
					/>
				)}

				{currentView === "payment-success" && (
					<PaymentSuccess onPaymentComplete={handlePaymentComplete} />
				)}

				{currentView === "payment-instructions" && (
					<PaymentInstructions onBack={handleBack} />
				)}

				{currentView === "delivery-instructions" && (
					<DeliveryInstructions onBack={handleBack} />
				)}
			</ContentBox>
		</div>
    );
}

export default TrackFlow;