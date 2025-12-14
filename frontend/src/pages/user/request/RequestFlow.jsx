import { useState, useEffect, useCallback, useRef } from "react";
import Documents from "./Documents";
import RequestList from "./RequestList";
import UploadRequirements from "./UploadRequirements";
import PreferredContact from "./PreferredContact";
import PendingRequests from "./PendingRequests";
import Summary from "./Summary.jsx";
import SubmitRequest from "./SubmitRequest.jsx";
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
      email: ""
    },
    preferredContact: "",
    totalPrice: 0,
    paymentStatus: false,
    remarks: "Request submitted successfully"
  });


  // Track which requirements belong to which documents
  const [documentRequirementMap, setDocumentRequirementMap] = useState({});

  // Fetch document-requirement mapping
  const fetchDocumentRequirements = useCallback(async (docs) => {
    if (!docs || docs.length === 0) {
      setDocumentRequirementMap({});
      return;
    }

    try {
      const docIds = docs.map(doc => doc.doc_id);
      const response = await fetch("/api/list-requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ document_ids: docIds }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.notification || "Fetch failed");

      // Build mapping: doc_id -> [req_id, req_id, ...]
      const mapping = {};
      docs.forEach(doc => {
        mapping[doc.doc_id] = [];
      });

      (data.requirements || []).forEach(req => {
        if (req.doc_ids && Array.isArray(req.doc_ids)) {
          req.doc_ids.forEach(docId => {
            if (mapping[docId]) {
              mapping[docId].push(req.req_id);
            }
          });
        }
      });

      setDocumentRequirementMap(mapping);
    } catch (err) {
      setDocumentRequirementMap({});
    }
  }, []);

  // Clean up requirements for removed documents
  const cleanUpRequirementsForRemovedDocuments = useCallback((newDocuments) => {
    setRequestData(prev => {
      const currentDocIds = new Set(prev.documents.map(doc => doc.doc_id));
      const newDocIds = new Set(newDocuments.map(doc => doc.doc_id));

      // Find documents that were removed
      const removedDocIds = [...currentDocIds].filter(id => !newDocIds.has(id));

      if (removedDocIds.length === 0) {
        return prev; // No documents removed
      }

      // Get all requirement IDs that belong to removed documents
      const requirementIdsToRemove = [];
      removedDocIds.forEach(docId => {
        const reqIds = documentRequirementMap[docId] || [];
        requirementIdsToRemove.push(...reqIds);
      });

      // Remove uploaded files for these requirements
      const newRequirements = { ...prev.requirements };
      requirementIdsToRemove.forEach(reqId => {
        delete newRequirements[String(reqId)];
      });

      return {
        ...prev,
        requirements: newRequirements
      };
    });
  }, [documentRequirementMap]);




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
    setRequestData(prev => {
      let newDocs;
      
      if (typeof docsOrUpdater === 'function') {
        // If it's a function, call it with current documents (ensured to be array)
        const currentDocs = Array.isArray(prev.documents) ? prev.documents : [];
        newDocs = docsOrUpdater(currentDocs);
      } else {
        // If it's a direct value, use it directly
        newDocs = docsOrUpdater;
      }
      
      // Ensure the result is always an array
      const safeDocs = Array.isArray(newDocs) ? newDocs : [];
      
      return {
        ...prev,
        documents: safeDocs
      };
    });

    // Clean up requirements for removed documents after state update
    setTimeout(() => {
      const newDocs = typeof docsOrUpdater === 'function' ? docsOrUpdater([]) : docsOrUpdater;
      if (Array.isArray(newDocs)) {
        cleanUpRequirementsForRemovedDocuments(newDocs);
        // Also update the document-requirement mapping
        fetchDocumentRequirements(newDocs);
      }
    }, 100);
  }, [cleanUpRequirementsForRemovedDocuments, fetchDocumentRequirements]);

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
              email: data.student_data.email || ""
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
    switch (step) {
      case "pendingRequests":
        // From pending requests, go back to check active requests (which will redirect appropriately)
        setStep("checkActiveRequests");
        break;
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
  }, [step]);

  // Handle Next from Documents
  const handleDocumentsNext = (docs) => {
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
    </>
  );
}

export default RequestFlow;
