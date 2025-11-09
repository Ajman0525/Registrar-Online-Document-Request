import React, { useEffect, useState } from "react";
import "./Documents.css";
import FileCard from "../../../components/common/FileCard";
import AddCard from "../../../components/common/AddCard";
import Popup from "../../../components/admin/Popup";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  
  const handleOpen = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  // Fetch documents
  useEffect(() => {
    fetch("/get-documents")
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error fetching documents:", err));
  }, []);

  // Fetch document requirements
  useEffect(() => {
    fetch("/get-document-requirements")
      .then((res) => res.json())
      .then((data) => setRequirements(data))
      .catch((err) => console.error("Error fetching requirements:", err));
  }, []);

  return (
    <div>
      {/* <h1>Documents</h1>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Logo</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.doc_id}>
              <td>{doc.doc_id}</td>
              <td>{doc.doc_name}</td>
              <td>{doc.description}</td>
              <td>
                <img src={doc.logo_link} width="50" alt={doc.doc_name} />
              </td>
              <td>{doc.cost}</td>
            </tr>
          ))}
        </tbody>
      </table> */}

      {/* <h2>Document Requirements</h2>
      <ul>
        {requirements.map((req, index) => (
          <li key={index}>
            Document ID: {req.doc_id}, Requirement ID: {req.req_id}
          </li>
        ))}
      </ul> */}

      <AddCard onClick={handleOpen} />

      {showPopup && <Popup onClose={handleClose} />}

    </div>
  );
}

export default Documents;
