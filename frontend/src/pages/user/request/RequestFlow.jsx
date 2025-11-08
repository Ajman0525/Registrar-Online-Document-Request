import { useState } from "react";
import Documents from "./Documents";
import RequestList from "./RequestList";

function RequestFlow() {
  const [step, setStep] = useState("documents");
  const [selectedDocs, setSelectedDocs] = useState([]);

  const goNext = () => setStep("requestList"); // move to RequestList step
  const goBack = () => setStep("documents");

  return (
    <>
      {step === "documents" && (
        <Documents
          selectedDocs={selectedDocs}
          setSelectedDocs={setSelectedDocs}
          onNext={goNext} // call this after selecting docs
        />
      )}

      {step === "requestList" && (
        <RequestList
          selectedDocs={selectedDocs} // pass selected docs
          onBack={goBack}
        />
      )}
    </>
  );
}

export default RequestFlow;
