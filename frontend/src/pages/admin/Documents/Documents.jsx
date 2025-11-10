import React, { useEffect, useState } from "react";
import "./Documents.css";
import FileCard from "../../../components/common/FileCard";
import AddCard from "../../../components/common/AddCard";
import Popup from "../../../components/admin/Popup";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [documentsWithRequirements, setDocumentsWithRequirements] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Open the add/edit popup
  const handleEdit = (doc) => {
    setSelectedDoc(doc);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedDoc(null);
  };

  const handleOpen = () => setShowPopup(true);

  // Fetch documents, requirements, and joined data
  const fetchDocuments = () => {
    fetch("/admin/get-documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error fetching documents:", err));

    fetch("/admin/get-document-requirements")
      .then((res) => res.json())
      .then((data) => setRequirements(data))
      .catch((err) => console.error("Error fetching requirements:", err));

    fetch("/admin/get-documents-with-requirements")
      .then((res) => res.json())
      .then((data) => setDocumentsWithRequirements(data))
      .catch((err) => console.error("Error fetching joined documents:", err));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Merge requirements into documents
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

  // Sort documents by last edited first (doc_id descending for now)
  const sortedDocuments = [...documentsWithRequirements].sort((a, b) =>
    b.doc_id.localeCompare(a.doc_id)
  );

  return (
    <div>
      <h1 className="title">Manage Documents</h1>

      <div className="file-cards-container">
        <AddCard onClick={handleOpen} />
        {sortedDocuments.map((doc) => (
          <FileCard
            key={doc.doc_id}
            document={doc}
            onEdit={handleEdit}
            onClick={() => console.log("Clicked", doc.doc_id)}
          />
        ))}
      </div>

      {showPopup && (
        <Popup
          onClose={handleClosePopup}
          document={selectedDoc}
          onSuccess={fetchDocuments} // Refresh list after add/edit
        />
      )}
    </div>
  );
}

export default Documents;
