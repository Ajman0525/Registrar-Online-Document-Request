/**
 * Status Restrictions and Validation System for Drag-and-Drop
 * Defines comprehensive business rules for status transitions
 */

// Status mapping (frontend to backend)
export const STATUS_MAP = {
  Pending: "PENDING",
  Processing: "IN-PROGRESS", 
  Unpaid: "DOC-READY", // DOC-READY but unpaid
  Ready: "DOC-READY", // DOC-READY and paid
  Done: "RELEASED", // documents released
  Change: "REJECTED" // documents need changes (renamed from "rejected")
};

// UI Status display names
export const UI_STATUSES = Object.keys(STATUS_MAP);

// Allowed status transitions with business rules
export const STATUS_TRANSITIONS = {
  PENDING: {
    allowed: ['IN-PROGRESS'],
    restrictions: {
      reason: "Cannot move requests from PENDING to other statuses",
      requirement: "Request must first be assigned and processing started",
      nextSteps: "Drag to Processing column to begin document processing"
    }
  },
  IN_PROGRESS: {
    allowed: ['DOC-READY', 'REJECTED'],
    restrictions: {
      reason: "Request is currently being processed",
      requirement: "Document processing must be completed before release",
      nextSteps: "Complete all required documents before moving to Ready/Unpaid or request changes"
    }
  },
  DOC_READY: {
    allowed: ['RELEASED', 'REJECTED'],
    restrictions: {
      reason: "Documents are ready for payment and release",
      requirement: "Payment must be confirmed before release",
      nextSteps: "Confirm payment and move to Done, or request changes if needed"
    }
  },
  RELEASED: {
    allowed: [], // No further transitions allowed
    restrictions: {
      reason: "Request has been completed and released",
      requirement: "This request is final and cannot be modified",
      nextSteps: "Create a new request if additional documents are needed"
    }
  },
  REJECTED: {
    allowed: ['PENDING'], // Can return to pending after changes
    restrictions: {
      reason: "Changes have been requested for this request",
      requirement: "All requested changes must be addressed first",
      nextSteps: "Implement all requested changes before returning to PENDING"
    }
  }
};

/**
 * Validates if a status transition is allowed
 * @param {string} currentStatus - Current backend status
 * @param {string} targetStatus - Target backend status
 * @param {Object} requestData - Full request data for validation
 * @returns {Object} Validation result with success status and restriction info
 */
export function validateStatusTransition(currentStatus, targetStatus, requestData) {
  // Find the UI status for current status
  const currentUIStatus = getUIStatusFromBackend(currentStatus);
  const targetUIStatus = getUIStatusFromBackend(targetStatus);
  
  // Check if transition is defined in rules
  const transitionRules = STATUS_TRANSITIONS[currentStatus];
  if (!transitionRules) {
    return {
      isValid: false,
      reason: "Unknown current status",
      requirement: "Contact system administrator",
      nextSteps: "This status transition is not defined in the system"
    };
  }

  // Check if target status is in allowed list
  if (!transitionRules.allowed.includes(targetStatus)) {
    return {
      isValid: false,
      reason: transitionRules.restrictions.reason,
      requirement: transitionRules.restrictions.requirement,
      nextSteps: transitionRules.restrictions.nextSteps,
      currentStatus: currentUIStatus,
      targetStatus: targetUIStatus
    };
  }

  // Additional business logic validations
  const businessValidation = validateBusinessRules(currentStatus, targetStatus, requestData);
  if (!businessValidation.isValid) {
    return businessValidation;
  }

  return {
    isValid: true,
    reason: "Status transition is allowed",
    currentStatus: currentUIStatus,
    targetStatus: targetUIStatus
  };
}

/**
 * Additional business rule validations
 * @param {string} currentStatus - Current backend status
 * @param {string} targetStatus - Target backend status
 * @param {Object} requestData - Full request data
 * @returns {Object} Validation result
 */
function validateBusinessRules(currentStatus, targetStatus, requestData) {
  // Rule 1: Documents must be completed before moving to DOC-READY
  if (currentStatus === 'IN-PROGRESS' && targetStatus === 'DOC-READY') {
    const allDocumentsCompleted = validateDocumentsCompletion(requestData);
    if (!allDocumentsCompleted.isValid) {
      return {
        isValid: false,
        reason: "All required documents must be completed",
        requirement: "Complete all documents and mark them as done",
        nextSteps: allDocumentsCompleted.nextSteps,
        currentStatus: getUIStatusFromBackend(currentStatus),
        targetStatus: getUIStatusFromBackend(targetStatus)
      };
    }
  }

  // Rule 2: Cannot move from DOC-READY to RELEASED without payment
  if (currentStatus === 'DOC-READY' && targetStatus === 'RELEASED') {
    if (!requestData.payment_status) {
      return {
        isValid: false,
        reason: "Payment must be confirmed before release",
        requirement: "Payment status must be marked as paid",
        nextSteps: "Confirm payment with the requester before releasing documents",
        currentStatus: getUIStatusFromBackend(currentStatus),
        targetStatus: getUIStatusFromBackend(targetStatus)
      };
    }
  }

  // Rule 3: Cannot move from DOC-READY (paid) back to DOC-READY (unpaid)
  if (currentStatus === 'DOC-READY' && targetStatus === 'DOC-READY') {
    const currentPaid = requestData.payment_status;
    // This would be handled by payment status logic, not status transition
  }

  // Rule 4: Check if request is assigned to an admin
  if (!requestData.assigned_admin_id && currentStatus === 'PENDING') {
    return {
      isValid: false,
      reason: "Request must be assigned to an admin",
      requirement: "Assign the request to an admin before processing",
      nextSteps: "Use the assignment dropdown to assign this request to an admin",
      currentStatus: getUIStatusFromBackend(currentStatus),
      targetStatus: getUIStatusFromBackend(targetStatus)
    };
  }

  return { isValid: true };
}

/**
 * Validates if all required documents are completed
 * @param {Object} requestData - Full request data
 * @returns {Object} Validation result
 */
function validateDocumentsCompletion(requestData) {
  const regularDocs = requestData.documents || [];
  const othersDocs = requestData.others_documents || [];
  
  const incompleteRegularDocs = regularDocs.filter(doc => !doc.is_done);
  const incompleteOthersDocs = othersDocs.filter(doc => !doc.is_done);

  if (incompleteRegularDocs.length > 0 || incompleteOthersDocs.length > 0) {
    const nextSteps = [];
    
    if (incompleteRegularDocs.length > 0) {
      nextSteps.push(`Complete ${incompleteRegularDocs.length} regular document(s): ${incompleteRegularDocs.map(doc => doc.name).join(', ')}`);
    }
    
    if (incompleteOthersDocs.length > 0) {
      nextSteps.push(`Complete ${incompleteOthersDocs.length} custom document(s): ${incompleteOthersDocs.map(doc => doc.name).join(', ')}`);
    }

    return {
      isValid: false,
      nextSteps: nextSteps.join(' and ')
    };
  }

  return { isValid: true };
}

/**
 * Gets UI status name from backend status
 * @param {string} backendStatus - Backend status code
 * @returns {string} UI status name
 */
export function getUIStatusFromBackend(backendStatus) {
  for (const [uiStatus, backendCode] of Object.entries(STATUS_MAP)) {
    if (backendCode === backendStatus) {
      return uiStatus;
    }
  }
  return backendStatus; // fallback
}

/**
 * Gets backend status code from UI status
 * @param {string} uiStatus - UI status name
 * @returns {string} Backend status code
 */
export function getBackendStatusFromUI(uiStatus) {
  return STATUS_MAP[uiStatus] || uiStatus;
}

/**
 * Gets display-friendly status name
 * @param {string} backendStatus - Backend status code
 * @returns {string} Display-friendly status name
 */
export function getDisplayStatus(backendStatus) {
  const uiStatus = getUIStatusFromBackend(backendStatus);
  
  // Special handling for display names
  switch (uiStatus) {
    case 'Change':
      return 'Change Required'; // More user-friendly
    case 'Done':
      return 'Completed';
    case 'Unpaid':
      return 'Documents Ready (Unpaid)';
    case 'Ready':
      return 'Documents Ready (Paid)';
    default:
      return uiStatus;
  }
}
