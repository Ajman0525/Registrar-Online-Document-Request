import { useState } from "react";
import EnterTrackId from "./EnterTrackId";
import TrackStatus from "./TrackStatus";

function TrackFlow() {
  const [step, setStep] = useState("enter-track-id");
  const [trackData, setTrackData] = useState(null);

  // the 'data' parameter will hold the response from the tracking API
  const goNext = (data) => {
    if (step === "enter-track-id") {
      setTrackData(data);
      setStep("track-status");
    }
  };

  const goBack = () => {
    if (step === "track-status") {
      setStep("enter-track-id");
      setTrackData(null); // clears previous tracking data
    }
  };

  return (
    <>
      {step === "enter-track-id" && <EnterTrackId onNext={goNext} />}
      {step === "track-status" && <TrackStatus onBack={goBack} trackData={trackData} />}
    </>
  );
}

export default TrackFlow;

