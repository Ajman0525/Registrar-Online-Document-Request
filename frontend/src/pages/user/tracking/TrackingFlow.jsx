import { useState } from "react";
import EnterTrackId from "./EnterTrackId";
import TrackStatus from "./TrackStatus";
import Details from "./Details";
import ContentBox from "../../../components/user/ContentBox";
import "./Tracking.css";

function TrackFlow() {
    const [currentView, setCurrentView] = useState("enter-id");
    const [trackData, setTrackData] = useState(null);

    // the 'data' parameter will hold the response from the tracking API
    const handleTrackIdSubmit = (data) => {
		setTrackData(data);
		setCurrentView("status");
    };

    const handleBack = () => {
		if (currentView === "status") {
			setCurrentView("enter-id");
		setTrackData(null); // clear data when going back to initial screen
		} else if (currentView === "details" || currentView === "payment-options" || currentView === "pickup-instructions") {
			setCurrentView("status"); // go back to main status view
		}
  	};

	const handleViewDetails = () => setCurrentView("details");

    return (
        <div className="Track-page">
			<ContentBox key={currentView}> {/* animation on every view change */}
				{currentView === "enter-id" && <EnterTrackId onNext={handleTrackIdSubmit} />}

				{currentView === "status" && trackData && (
				<TrackStatus
					trackData={trackData}
					onViewDetails={handleViewDetails}
					onBack={handleBack} // pass handleBack for the "Track Another" button
				/>
				)}
				{currentView === "details" && trackData && (
					<Details trackData={trackData} onBack={handleBack} />
				)}
			</ContentBox>
		</div>
    );
}

export default TrackFlow;

