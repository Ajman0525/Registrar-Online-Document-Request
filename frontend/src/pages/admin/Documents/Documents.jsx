import React, { useEffect, useState } from "react";
import "./Documents.css";
import FileCard from "../../../components/common/FileCard";
import AddCard from "../../../components/common/AddCard";
import Popup from "../../../components/admin/Popup";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [documentsWithRequirements, setDocumentsWithRequirements] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  
  const handleOpen = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  const fetchDocuments = () => {
  fetch("/admin/get-documents")
    .then((res) => res.json())
    .then((data) => setDocuments(data))
    .catch((err) => console.error("Error fetching documents:", err));

  fetch("http://127.0.0.1:8000/get-documents-with-requirements")
    .then((res) => res.json())
    .then((data) => setDocumentsWithRequirements(data))
    .catch((err) => console.error(err));

  fetch("/admin/get-document-requirements")
    .then((res) => res.json())
    .then((data) => setRequirements(data))
    .catch((err) => console.error("Error fetching requirements:", err));
};

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0 && requirements.length > 0) {
      const docsWithReqs = documents.map((doc) => {
        const reqsForDoc = requirements
          .filter((r) => r.doc_id === doc.doc_id)
          .map((r) => r.requirement_name); 
        return { ...doc, requirements: reqsForDoc };
      });
      setDocumentsWithRequirements(docsWithReqs);
    }
  }, [documents, requirements]);



  return (
    <div>

      <h1 className="title">Manage Documents</h1>
      
      <div className="file-cards-container">
        <AddCard onClick={handleOpen} />
        {documentsWithRequirements.length > 0
          ? documentsWithRequirements.map((doc) => (
              <FileCard
                key={doc.doc_id}
                documentName={doc.doc_name}
                docDescription={doc.description}
                requirements={doc.requirements}
                cost={doc.cost}
                onClick={() => console.log("Clicked", doc.doc_id)}
              />
            ))
          : documents.map((doc) => (
              <FileCard
                key={doc.doc_id}
                documentName={doc.doc_name}
                docDescription={doc.description}
                requirements={doc.requirements} // fallback if you don’t have joined data
                cost={doc.cost}
                onClick={() => console.log("Clicked", doc.doc_id)}
              />
            ))}
      </div>

      {showPopup && <Popup onClose={handleClose} onSuccess={fetchDocuments} />}

    </div>
  );
}

export default Documents;
