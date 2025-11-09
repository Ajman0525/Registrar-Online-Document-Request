import { useState } from "react";
import Documents from "./Documents";
import RequestList from "./RequestList";
import UploadRequirements from "./UploadRequirements";
import PreferredContact from "./PreferredContact";
import Summary from "./Summary.jsx";
import SubmitRequest from "./SubmitRequest.jsx";

function RequestFlow() {
  const [step, setStep] = useState("documents");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [requestId, setRequestId] = useState("");
  
  // State to hold data from each step for final submission
  const [uploadedFiles, setUploadedFiles] = useState({}); // e.g. { docId: fileList }
  const [preferredContactInfo, setPreferredContactInfo] = useState({});

  // Step navigation handlers
  const goNextStep = () => {
    switch (step) {
      case "documents":
        setStep("requestList");
        break;
      case "requestList":
        setStep("uploadRequirements");
        break;
      case "uploadRequirements":
        setStep("preferredContact");
        break;
      case "preferredContact":
        setStep("summary");
        break;
      case "summary":
        setStep("submitRequest");
        break;
      default:
        break;
    }
  };

  const goBackStep = () => {
    switch (step) {
      case "requestList":
        setStep("documents");
        break;
      case "uploadRequirements":
        setStep("requestList");
        break;
      case "preferredContact":
        setStep("uploadRequirements");
        break;
      case "summary":
        setStep("preferredContact");
        break;
      case "submitRequest":
        setStep("summary");
        break;
      default:
        break;
    }
  };

  // Handle Next from Documents with requestId
  const handleDocumentsNext = (docs, reqId) => {
    setSelectedDocs(docs);
    setRequestId(reqId);
    goNextStep();
  };

  // Handle Next from RequestList with updated docs (including quantity)
  const handleRequestListProceed = (updatedDocs) => {
    setSelectedDocs(updatedDocs);
    goNextStep();
  };

  return (
    <>
      {step === "documents" && (
        <Documents
          selectedDocs={selectedDocs}
          setSelectedDocs={setSelectedDocs}
          onNext={handleDocumentsNext}
        />
      )}

      {step === "requestList" && (
        <RequestList
          selectedDocs={selectedDocs}
          onBack={goBackStep}
          onProceed={handleRequestListProceed}
          requestId={requestId}
        />
      )}

      {step === "uploadRequirements" && (
        <UploadRequirements
          selectedDocs={selectedDocs}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          onNext={goNextStep}
          onBack={goBackStep}
        />
      )}

      {step === "preferredContact" && (
        <PreferredContact
          preferredContactInfo={preferredContactInfo}
          setPreferredContactInfo={setPreferredContactInfo}
          onNext={goNextStep}
          onBack={goBackStep}
        />
      )}

      {step === "summary" && (
        <Summary
          selectedDocs={selectedDocs}
          uploadedFiles={uploadedFiles}
          preferredContactInfo={preferredContactInfo}
          onNext={goNextStep}
          onBack={goBackStep}
        />
      )}

      {step === "submitRequest" && (
        <SubmitRequest
          requestId={requestId}
          selectedDocs={selectedDocs}
          uploadedFiles={uploadedFiles}
          preferredContactInfo={preferredContactInfo}
          onBack={goBackStep}
          // e.g. onSubmitSuccess={...} can be added here
        />
      )}
    </>
  );
}

export default RequestFlow;
