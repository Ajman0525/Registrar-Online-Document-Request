import React from "react";
import "./Documents.css"
import FileCard from "../../../components/common/FileCard";
function Documents(){

    return(
        <div>
            <h1>Documents</h1>
            <h1 className= "placeholder">Area daReserved for organization tools</h1>
            <FileCard fileName="Document 1" requirements="Requirement 1" onClick={() => {}} />
            <FileCard fileName="Document 2" requirements="Requirement 2" onClick={() => {}} />
            <FileCard fileName="Document 3" requirements="Requirement 3" onClick={() => {}} />
        </div>
    );
}

export default Documents;