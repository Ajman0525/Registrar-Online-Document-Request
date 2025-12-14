import { useState, useEffect, useCallback, useRef } from "react";
import Documents from "./Documents";
import RequestList from "./RequestList";
import UploadRequirements from "./UploadRequirements";
import PreferredContact from "./PreferredContact";
import PendingRequests from "./PendingRequests";
import Summary from "./Summary.jsx";
import SubmitRequest from "./SubmitRequest.jsx";
import ConfirmModal from "../../../components/user/ConfirmModal";
import { getCSRFToken } from "../../../utils/csrf";



function RequestFlow() {
  const [step, setStep] = useState("checkActiveRequests");
  const [trackingId, setTrackingId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasActiveRequests, setHasActiveRequests] = useState(false);

  // Progress indicator steps
  const steps = [
    { key: "documents", label: "Select Documents" },
    { key: "requestList", label: "Review Request" },
    { key: "uploadRequirements", label: "Upload Files" },
    { key: "preferredContact", label: "Contact Method" },
    { key: "summary", label: "Review & Submit" },
    { key: "submitRequest", label: "Complete" }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  // Centralized state for all request data
  const [requestData, setRequestData] = useState({
    documents: [], // {doc_id, doc_name, cost, quantity}
    requirements: {}, // {req_id: File | string | null}
    studentInfo: {
      full_name: "",
      contact_number: "",
      email: "",
      college_code: ""
    },
    preferredContact: "",
    totalPrice: 0,
    paymentStatus: false,
    remarks: "Request submitted successfully"
  });

  // Safe update function that ensures data types
  const updateRequestData = useCallback((updates) => {
    setRequestData(prev => {
      const updated = { ...prev, ...updates };
      
      // Ensure documents is always an array
      if (updates.documents !== undefined) {
        updated.documents = Array.isArray(updates.documents) ? updates.documents : [];
      }
      
      return updated;
    });
  }, []);

  // Safe setter specifically for documents - always ensures array
  const setDocuments = useCallback((docsOrUpdater) => {
    // First determine the new documents array
    let newDocs;
    if (typeof docsOrUpdater === 'function') {
      // Get current documents safely
      const currentDocs = Array.isArray(requestData.documents) ? requestData.documents : [];
      newDocs = docsOrUpdater(currentDocs);
    } else {
      newDocs = docsOrUpdater;
    }
    
    // Ensure the result is always an array
    const safeDocs = Array.isArray(newDocs) ? newDocs : [];
    
    // Update state with new documents only - preserve requirements
    setRequestData(prev => ({
      ...prev,
      documents: safeDocs
    }));
  }, [requestData.documents]);

  // Always get safe documents array
  const getDocuments = useCallback(() => {
    return Array.isArray(requestData.documents) ? requestData.documents : [];
  }, [requestData.documents]);

  // Load student data on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch("/api/request", {
          method: "GET",
          headers: {
            "X-CSRF-TOKEN": getCSRFToken(),
          },
          credentials: "include",
        });
        const data = await response.json();


        if (data.status === "success" && data.student_data) {
          setRequestData(prev => ({
            ...prev,
            studentInfo: {
              full_name: data.student_data.student_name || "",
              contact_number: data.student_data.student_contact || "",
              email: data.student_data.email || "",
              college_code: data.student_data.college_code || ""
            }
          }));
        }
      } catch (error) {
      }
    };

    fetchStudentData();
  }, []);



  // Initialize requirements state when documents change
  useEffect(() => {
    if (requestData.documents.length > 0 && Object.keys(requestData.requirements).length === 0) {
      // Initialize requirements with null values for each document's requirements
      // This will be populated by the UploadRequirements component when it fetches the requirements
      setRequestData(prev => ({
        ...prev,
        requirements: {}
      }));
    }
  }, [requestData.documents.length]); // Only depend on documents length, not the whole requirements object
  
  // Check for active requests on component mount
  useEffect(() => {
    const checkActiveRequests = async () => {
      try {
        const response = await fetch("/api/check-active-requests", {
          method: "GET",
          headers: {
            "X-CSRF-TOKEN": getCSRFToken(),
          },
          credentials: "include",
        });

        const data = await response.json();
      
        if (data.status === "success") {
          const hasActive = data.active_requests && data.active_requests.length > 0;
          setHasActiveRequests(hasActive);
          
         
          // If active requests exist, go to pending requests page
          // If no active requests, go directly to documents
          if (hasActive) {
            setStep("pendingRequests");
          } else {
            setStep("documents");
          }
        } else {
          // If error checking active requests, proceed to documents

          setStep("documents");
        }
      } catch (error) {
        // If error, proceed to documents
        setStep("documents");
      }
    };

    checkActiveRequests();
  }, []);


  // Step navigation handlers
  const goNextStep = useCallback(() => {
    switch (step) {
      case "pendingRequests":
        setStep("documents");
        break;
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
  }, [step]);

  // Handler for when user wants to proceed to new request from pending requests
  const handleProceedToNewRequest = useCallback(() => {
    setStep("documents");
  }, []);

  // Handler for when user wants to go back to login
  const handleBackToLogin = useCallback(async () => {
    try {
      await fetch("/api/clear-session", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
      });
      // Redirect to login page or reload the page
      window.location.reload();
    } catch (error) {
      // Force reload even if logout fails
      window.location.reload();
    }
  }, []);

  const goBackStep = useCallback(() => {
    // If modal is showing, don't proceed with navigation
    if (showConfirmModal) {
      return;
    }

    switch (step) {
      case "pendingRequests":
        // From pending requests, go back to check active requests (which will redirect appropriately)
        setStep("checkActiveRequests");
        break;
      case "requestList":
        // Check if there are any uploaded files that would be lost
        const hasUploadedFiles = Object.values(requestData.requirements).some(
          file => file instanceof File || (typeof file === "string" && file.trim() !== "")
        );
        
        if (hasUploadedFiles) {
          // Show modal to confirm - DO NOT change step immediately
          setShowConfirmModal(true);
          // Store the navigation action
          setPendingNavigation({
            action: "navigateToDocuments",
            clearFiles: true
          });
          // Return without changing step - wait for user confirmation
          return;
        } else {
          // No uploaded files, navigate directly without modal
          setStep("documents");
          return;
        }
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
  }, [step, showConfirmModal, requestData.requirements]);

  const handleConfirmEdit = () => {
    if (pendingNavigation && pendingNavigation.action === "navigateToDocuments") {
      // Clear all uploaded files
      setRequestData(prev => ({
        ...prev,
        requirements: {}
      }));
      // Now change the step
      setStep("documents");
    }
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  const handleCancelEdit = () => {
    setShowConfirmModal(false);
    setPendingNavigation(null);
  };

  // Handle Next from Documents
  const handleDocumentsNext = (docs) => {
    // Update request data with documents
    updateRequestData({ documents: docs });
    goNextStep();
  };

  // Handle Next from RequestList with updated docs (including quantity)
  const handleRequestListProceed = useCallback((updatedDocs, updatedQuantities) => {
    try {
      // Validate input data
      if (!updatedDocs || !Array.isArray(updatedDocs) || updatedDocs.length === 0) {
        throw new Error("No documents selected");
      }
      
      if (!updatedQuantities || typeof updatedQuantities !== 'object') {
        throw new Error("Invalid quantities data");
      }
      
      // Calculate total price with validation
      const totalPrice = updatedDocs.reduce((sum, doc) => {
        const cost = doc.cost || 0;
        const quantity = Math.max(1, Math.min(100, updatedQuantities[doc.doc_id] || 1));
        return sum + (cost * quantity);
      }, 0);
      
      // Update request data with documents and total price
      const documentsWithQuantities = updatedDocs.map(doc => ({
        ...doc,
        quantity: Math.max(1, Math.min(100, updatedQuantities[doc.doc_id] || 1))
      }));
      
      updateRequestData({
        documents: documentsWithQuantities,
        totalPrice
      });
      
      goNextStep();
    } catch (error) {
      alert("Error processing your request. Please try again.");
    }
  }, [updateRequestData, goNextStep]);

  // Handle requirements upload state changes
  const handleRequirementsUpload = (uploadedFiles) => {
    updateRequestData({ requirements: uploadedFiles });
  };

  // Handle file selection for requirements
  const handleFileSelect = (req_id, file) => {
    setRequestData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [String(req_id)]: file
      }
    }));
  };

  // Handle file removal for requirements
  const handleFileRemove = (req_id) => {
    setRequestData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [String(req_id)]: null
      }
    }));
  };

  // Handle requirements upload and proceed to next step
  const handleRequirementsUploadAndProceed = (uploadedFiles) => {
    handleRequirementsUpload(uploadedFiles);
    goNextStep();
  };

  // Handle preferred contact update
  const handlePreferredContactUpdate = (preferredContact, contactInfo) => {
    updateRequestData({
      preferredContact,
      studentInfo: {
        ...requestData.studentInfo,
        ...contactInfo
      }
    });
    goNextStep();
  };

  // Handle final submission
  const handleFinalSubmission = async () => {
    try {
      // Convert File objects to base64 for submission
      const requirements = Object.entries(requestData.requirements).map(([req_id, file]) => {
        if (file instanceof File) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              const base64 = result.split(',')[1];
              resolve({
                requirement_id: req_id,
                filename: file.name,
                content_type: file.type,
                alreadyUploaded: false,
                file_data: base64
              });
            };
            reader.readAsDataURL(file);
          });
        } else if (typeof file === "string" && file) {
          return {
            requirement_id: req_id,
            filename: file.split("/").pop(),
            content_type: "application/octet-stream",
            alreadyUploaded: true,
            file_data: file
          };
        } else {
          return {
            requirement_id: req_id,
            filename: "",
            content_type: "application/octet-stream",
            alreadyUploaded: false,
            file_data: null
          };
        }
      });

      const requirementsData = await Promise.all(requirements);

      const submissionData = {
        student_info: requestData.studentInfo,
        documents: requestData.documents.map(doc => ({
          doc_id: doc.doc_id,
          quantity: doc.quantity || 1
        })),
        requirements: requirementsData,
        total_price: requestData.totalPrice,
        preferred_contact: requestData.preferredContact || "SMS",
        payment_status: requestData.paymentStatus,
        remarks: requestData.remarks
      };

      const response = await fetch("/api/complete-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();
      if (data.success) {
        setTrackingId(data.request_id);
        goNextStep();
      } else {
        alert(`Error: ${data.notification}`);
      }
    } catch (error) {
      alert("An error occurred while completing the request.");
    }
  };


  return (
    <>
      {step === "checkActiveRequests" && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking for active requests...</p>
        </div>
      )}
      
      {step === "pendingRequests" && (
        <PendingRequests
          onProceedToNewRequest={handleProceedToNewRequest}
          onBackToLogin={handleBackToLogin}
        />
      )}


      {/* Progress Indicator - only for non-documents, non-checkActiveRequests, and non-pendingRequests steps */}
            {step !== "documents" && step !== "checkActiveRequests" && step !== "pendingRequests" && (
              <div className="request-progress-container">
                <div className="request-progress-bar">
                  {steps.map((stepInfo, index) => (
                    <div
                      key={stepInfo.key}
                      className={`progress-step ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
                    >
                      <div className="step-circle">
                        {index < currentStepIndex ? '✓' : index + 1}
                      </div>
                      <div className="step-label">{stepInfo.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      {step === "documents" && (
        <Documents
          selectedDocs={getDocuments()}
          setSelectedDocs={setDocuments}
          onNext={handleDocumentsNext}
          steps={steps}
          currentStepIndex={currentStepIndex}
        />
      )}

      {step === "requestList" && (
        <RequestList
          selectedDocs={getDocuments()}
          setSelectedDocs={setDocuments}
          quantities={getDocuments().reduce((acc, doc) => {
            acc[doc.doc_id] = doc.quantity || 1;
            return acc;
          }, {})}

          setQuantities={(quantitiesUpdater) => {
            // Handle both direct object updates and functional updates
            let newQuantities;
            if (typeof quantitiesUpdater === 'function') {
              // Get current quantities from documents
              const currentQuantities = getDocuments().reduce((acc, doc) => {
                acc[doc.doc_id] = doc.quantity || 1;
                return acc;
              }, {});
              newQuantities = quantitiesUpdater(currentQuantities);
            } else {
              newQuantities = quantitiesUpdater;
            }
            
            // Update documents with new quantities
            const documentsWithQuantities = getDocuments().map(doc => ({
              ...doc,
              quantity: newQuantities[doc.doc_id] || 1
            }));
            updateRequestData({ documents: documentsWithQuantities });
          }}
          onBack={goBackStep}
          onProceed={handleRequestListProceed}
        />
      )}

      {step === "uploadRequirements" && (
        <UploadRequirements
          selectedDocs={requestData.documents}
          uploadedFiles={requestData.requirements}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          onNext={handleRequirementsUploadAndProceed}
          onBack={goBackStep}
        />
      )}

      {step === "preferredContact" && (
        <PreferredContact
          preferredContactInfo={{ method: requestData.preferredContact }}
          contactInfo={requestData.studentInfo}
          onMethodChange={(method) => updateRequestData({ preferredContact: method })}
          onNext={(method) => handlePreferredContactUpdate(method, requestData.studentInfo)}
          onBack={goBackStep}
        />
      )}

      {step === "summary" && (
        <Summary
          selectedDocs={requestData.documents}
          uploadedFiles={requestData.requirements}
          preferredContactInfo={{ method: requestData.preferredContact }}
          contactInfo={requestData.studentInfo}
          onNext={handleFinalSubmission}
          onBack={goBackStep}
        />
      )}


      {step === "submitRequest" && (
        <SubmitRequest
          selectedDocs={requestData.documents}
          uploadedFiles={requestData.requirements}
          preferredContactInfo={{ method: requestData.preferredContact }}
          contactInfo={requestData.studentInfo}
          trackingId={trackingId}
          onBack={goBackStep}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelEdit}
        onConfirm={handleConfirmEdit}
        title="Confirm Edit Request"
        message="Warning: Editing your request will clear all uploaded requirement files. Are you sure you want to continue?"
      />
    </>
  );
}

export default RequestFlow;

