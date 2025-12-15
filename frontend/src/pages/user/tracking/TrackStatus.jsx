import { useState, useEffect, useRef } from "react";
import "./Tracking.css";
import ButtonLink from "../../../components/common/ButtonLink";
import ContentBox from "../../../components/user/ContentBox";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { getCSRFToken } from "../../../utils/csrf";

/* track status component */


function TrackStatus({ trackData, onBack, onViewDetails, onViewDeliveryInstructions, onViewPaymentOptions, onViewPickupInstructions, onRefreshTrackData }) {
    const [changes, setChanges] = useState([]);
    const [loadingChanges, setLoadingChanges] = useState(false);
    const [consolidatedRemarks, setConsolidatedRemarks] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [changeFiles, setChangeFiles] = useState({});
    const fileInputRefs = useRef({});

    // Fetch changes when status is REJECTED
    useEffect(() => {
        if (trackData?.status === 'REJECTED' && trackData?.trackingNumber) {
            fetchChanges();
        }
    }, [trackData?.status, trackData?.trackingNumber]);

    const fetchChanges = async () => {
        setLoadingChanges(true);
        try {
            const response = await fetch(`/api/track/changes/${trackData.trackingNumber}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-CSRF-TOKEN': getCSRFToken() }
            });


            if (response.ok) {
                const data = await response.json();
                if (data.changes) {
                    // The backend returns the structure directly
                    setChanges(data.changes.changes || data.changes || []);
                    setConsolidatedRemarks(data.changes.remarks || '');
                } else {
                    setChanges([]);
                    setConsolidatedRemarks('');
                }
            } else {
                console.error('Failed to fetch changes');
                setChanges([]);
                setConsolidatedRemarks('');
            }
        } catch (error) {
            console.error('Error fetching changes:', error);
            setChanges([]);
            setConsolidatedRemarks('');
        } finally {
            setLoadingChanges(false);
        }
    };

    // Handle file change for changes
    const handleFileChange = (changeId, e) => {
        const file = e.target.files?.[0] || null;
        const key = String(changeId);

        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

            if (file.size > maxSize) {
                alert("File must be less than 10MB.");
                if (fileInputRefs.current[key]) fileInputRefs.current[key].value = "";
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                alert("Only PDF, JPG, JPEG, PNG allowed.");
                if (fileInputRefs.current[key]) fileInputRefs.current[key].value = "";
                return;
            }
        }

        setChangeFiles(prev => ({
            ...prev,
            [key]: file
        }));
    };

    // Convert file to base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };


    // Upload files for changes
    const handleUploadFiles = async () => {
        try {
            setUploadingFiles(true);

            const filesToUpload = Object.entries(changeFiles).filter(([key, file]) => file instanceof File);
            
            if (filesToUpload.length === 0) {
                alert("Please select files to upload.");
                return;
            }

            const uploadPromises = filesToUpload.map(async ([changeId, file]) => {
                const base64 = await fileToBase64(file);
                
                const formData = new FormData();
                formData.append('file_data', base64);
                formData.append('file_name', file.name);
                formData.append('file_type', file.type);
                formData.append('change_id', changeId);

                const response = await fetch(`/api/track/changes/${trackData.trackingNumber}/upload`, {
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': getCSRFToken() },
                    credentials: 'include',
                    body: formData
                });

                const responseData = await response.json();

                if (!response.ok) {
                    // Provide specific error messages based on response
                    if (response.status === 403) {
                        throw new Error(`File uploads are only allowed for rejected requests. Current status: ${responseData.status || 'Unknown'}`);
                    } else if (response.status === 400) {
                        throw new Error(`Invalid file: ${responseData.message || 'Please check your file format and size'}`);
                    } else {
                        throw new Error(responseData.message || `Upload failed for change ${changeId}`);
                    }
                }

                return responseData;
            });

            const results = await Promise.allSettled(uploadPromises);
            
            // Check for any failed uploads
            const failedUploads = results.filter(result => result.status === 'rejected');
            const successfulUploads = results.filter(result => result.status === 'fulfilled');

            if (failedUploads.length > 0) {
                const errorMessages = failedUploads.map(result => result.reason.message).join('\n');
                alert(`Some files failed to upload:\n${errorMessages}`);
            }

            if (successfulUploads.length > 0) {
                alert(`${successfulUploads.length} file(s) uploaded successfully!`);
            }
            
            // Only clear uploaded files that were successful
            const successfulChangeIds = successfulUploads.map(result => {
                const fulfilled = result.value;
                return fulfilled.change_id || result.value.change_id;
            }).filter(Boolean);

            setChangeFiles(prev => {
                const updated = { ...prev };
                successfulChangeIds.forEach(changeId => {
                    delete updated[changeId];
                });
                return updated;
            });
            
            // Clear file inputs for successful uploads
            Object.keys(fileInputRefs.current).forEach(key => {
                if (successfulChangeIds.includes(key) && fileInputRefs.current[key]) {
                    fileInputRefs.current[key].value = "";
                }
            });

            // Refresh changes to show uploaded files
            fetchChanges();

            // Refresh track data to get updated status (REJECTED -> PENDING)
            if (onRefreshTrackData) {
                onRefreshTrackData();
            }

        } catch (error) {
            console.error('Error uploading files:', error);
            alert(`Error uploading files: ${error.message || 'Please try again.'}`);
        } finally {
            setUploadingFiles(false);
        }
    };

    // config for each status
    const statusConfig = {
        "DOC-READY": {
            className: "status-doc-ready",
            title: "Document Ready",
            description: (
                <div className="status-body">
                    <p className="subtext">Your document is now ready for release. Please choose how you would like to receive it:</p>
                </div>
            ),
            options: (
                <div className="claim-options">
                    <ButtonLink onClick={onViewPickupInstructions} placeholder="Pick up at Registrar" className="claim-button pickup-button" />
                    <ButtonLink onClick={onViewDeliveryInstructions} placeholder="Delivery" className="claim-button delivery-button" />
                </div>
            )
        },
        "OUT-FOR-DELIVERY": {
            className: "status-out-for-delivery",
            title: "Out for Delivery",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your document has been picked up by the courier. Please expect it to arrive soon at your provided address.</p>
                </div>
            )
        },
        "IN-PROGRESS": {
            className: "status-processing",
            title: "In Progress",
            description: (  
                <div className="status-body">
                    <p className="subtext">Our staff is currently preparing your requested documents. This includes printing, verifying details, and ensuring everything is accurate before moving to the next step.</p>
                </div>
            )
        },
        "SUBMITTED": {
            className: "status-submitted",
            title: "Request Submitted",
            description: (
                <div className="status-body">
                    <p className="subtext">Your request has been received and will be processed soon.</p>
                </div>
            )
        },
        "PENDING": {
            className: "status-review",
            title: "Under Review",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your request and submitted requirements are being carefully checked by the registrar's office to confirm that all details and documents are complete and valid.</p>
                </div>
            )
        },
        "PAYMENT-PENDING": {
            className: "status-payment",
            title: "Payment Pending",
            description: (  
                <div className="status-body">
                    <p className="subtext">Your document is now ready. Please complete your payment using the button below. A confirmation will be sent once payment is received.</p>
                </div>
            ),
            actionSection: (
                <div className="action-section">
                    <div className="button-section">
                        <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />
                        <ButtonLink onClick={onViewPaymentOptions} placeholder="Pay Now" variant="primary" />
                    </div>
                </div>
            ),
        },
        "PAYMENT-REQUIRED": {
            className: "status-payment",
            title: "Payment Required",
            description: (  
                <div className="status-body">
                    <p className="subtext">Payment is required before we can process your request. Please complete your payment before we process your documents.</p>
                </div>
            ),
            actionSection: (
                <div className="action-section">
                    <div className="button-section">
                        <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />
                        <ButtonLink onClick={onViewPaymentOptions} placeholder="Pay Now" variant="primary" />
                    </div>
                </div>
            ),
        },
        "RELEASED": {
            className: "status-released",
            title: "Document Released",
            description: (
                <div className="status-body">
                    <p className="subtext">Your document has been successfully claimed or delivered. Thank you for using our service.</p>
                </div>
            )
        },
        "REJECTED": {
            className: "status-rejected",
            title: <span style={{ color: "#dc2626" }}>Missing or Incorrect Information</span>,
            description: (
                <div className="status-body">
                    <p className="subtext">
                        We are unable to proceed with your request at this time. Please review the reason below.
                        If you have questions, please contact support.
                    </p>
                </div>
            )
        }
    };

    if (!trackData) {
        return (
            <div className="track-page">
                <ContentBox>
                    <p>No tracking data available. Please go back and enter your details.</p>
                    <ButtonLink onClick={onBack} placeholder="Return" variant="primary" />
                </ContentBox>
            </div>
        );
    }

    // get the specific configuration for the current status
    // convert status to uppercase for case-insensitive matching
    let statusKey = trackData.status ? trackData.status.toUpperCase() : '';
    
    if (statusKey !== 'REJECTED' && trackData.minimumAmountDue > 0) {
        statusKey = 'PAYMENT-REQUIRED';
    } else if (statusKey === 'DOC-READY' && trackData.paymentStatus === false) {
        statusKey = 'PAYMENT-PENDING';
    } else if (statusKey === 'DOC-READY' && trackData.orderType === 'LBC') {
        // [TEMP] show 'Out for Delivery' if order type is LBC and document is ready
        statusKey = 'OUT-FOR-DELIVERY';
    }

    const config = statusConfig[statusKey];

    // data not found case
    if (!config) {
        return (
            <div className="track-page">
                <p>An unknown status was received. Please contact support.</p>
                <ButtonLink onClick={onBack} placeholder="Return" variant="primary" />
            </div>
        );
    }

    const showViewDetailsButton = !config.options;

    return (
        <>
            {/* Main Status Content */}
            <div className={`text-section ${config.className}`}>
                <h3 className="status-title">{config.title}</h3>
                {config.description}
                <div className="tracking-number-section" style={{ marginTop: '1rem' }}>
                    <p>Tracking Number:</p>
                    <div className="number">
                        <p><strong>{trackData.trackingNumber}</strong></p>
                    </div>
                </div>

                {/* Display changes requirements if the status is REJECTED */}
                {statusKey === 'REJECTED' && (
                    <div className="changes-requirements-section">
                        {loadingChanges ? (
                            <div className="changes-loading">
                                <LoadingSpinner message="Loading changes..." />
                            </div>
                        ) : changes.length > 0 ? (
                            <div className="changes-list">
                                {/* Show consolidated remarks */}
                                {consolidatedRemarks && (
                                    <div className="rejection-remarks-section">
                                        <p className="remarks-title">Remarks:</p>
                                        <strong className="remarks-text">{consolidatedRemarks}</strong>
                                    </div>
                                )}
                                
                                <p className="changes-title">Required Changes:</p>
                                {changes.map((change, index) => (
                                    <div key={change.change_id || index} className="change-item">

                                        <div className="change-header">
                                            <span className="change-requirement-name">{change.requirement_name}</span>

                                            <span className="change-status">
                                                {change.status === 'uploaded' ? 'Uploaded' : 
                                                 change.status === 'pending' ? 'Pending' : 
                                                 change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                                            </span>
                                        </div>
                                        

                                        {/* File upload section for each change */}
                                        <div className="change-file-upload">
                                            <input
                                                ref={(el) => (fileInputRefs.current[String(change.change_id)] = el)}
                                                type="file"
                                                onChange={(e) => handleFileChange(change.change_id, e)}
                                                style={{ display: 'none' }}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                disabled={uploadingFiles}
                                            />
                                            
                                            {/* Check if file is already uploaded */}
                                            {change.file_link ? (
                                                <div className="file-uploaded-info">
                                                    <span className="file-name">File already uploaded</span>
                                                    <a 
                                                        href={change.file_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="view-file-btn"
                                                    >
                                                        View File
                                                    </a>
                                                </div>
                                            ) : changeFiles[String(change.change_id)] ? (
                                                <div className="file-uploaded-info">
                                                    <span className="file-name">{changeFiles[String(change.change_id)].name}</span>
                                                    <button 
                                                        className="remove-file-btn"
                                                        onClick={() => {
                                                            setChangeFiles(prev => ({
                                                                ...prev,
                                                                [String(change.change_id)]: null
                                                            }));
                                                            if (fileInputRefs.current[String(change.change_id)]) {
                                                                fileInputRefs.current[String(change.change_id)].value = "";
                                                            }
                                                        }}
                                                        disabled={uploadingFiles}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="upload-file-btn"
                                                    onClick={() => fileInputRefs.current[String(change.change_id)]?.click()}
                                                    disabled={uploadingFiles}
                                                >
                                                    Upload File
                                                </button>
                                            )}
                                        </div>
                                        
                                        {index < changes.length - 1 && <hr className="change-divider" />}
                                    </div>
                                ))}
                                
                                {/* Upload all files button */}
                                {Object.keys(changeFiles).length > 0 && (
                                    <div className="upload-all-files-section">
                                        <ButtonLink 
                                            onClick={handleUploadFiles}
                                            placeholder={uploadingFiles ? "Uploading..." : "Upload Files"}
                                            variant="primary"
                                            disabled={uploadingFiles}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="no-changes-section">
                                {(consolidatedRemarks || trackData.remarks) && (
                                    <div className="rejection-remarks-section">
                                        <p className="remarks-title">Remarks:</p>
                                        <strong className="remarks-text">{consolidatedRemarks || trackData.remarks}</strong>
                                    </div>
                                )}
                                <p className="no-changes-text">No specific changes required.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {config.options}
            {config.actionSection ? (
                config.actionSection
            ) : (
                <div className="action-section">
                    <div className="button-section">
                        <ButtonLink onClick={onBack} placeholder="Track Another" variant="secondary" />
                        {/* Only show "View Request" if there are no main option buttons like "Pay Now" */}
                        {showViewDetailsButton &&
                            <ButtonLink onClick={onViewDetails} placeholder="View Request" variant="primary" />
                        }
                    </div>
                </div>
            )}
            <div className="support-section">
                <p className="subtext">Need help? Contact the </p>
                <a href="mailto:support@example.com" className="support-email">support.</a>
            </div>
        </>
    );
}

export default TrackStatus;
