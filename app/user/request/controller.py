from . import request_bp
from flask import render_template, session, redirect, url_for, jsonify, g
from app.utils.decorator import jwt_required_with_role
from flask_jwt_extended import get_jwt_identity
from models import get_student_data, generate_unique_request_id, store_request, store_student_info
from app.user.document_list.models import DocumentList

role = 'user'

@request_bp.route("/api/request", methods=["GET"])
@jwt_required_with_role(role)
def get_request_page_data():
    """
    Step 1: Initialize the db with the student_id and request_id 
            and Get student data from external DB then fill in the database
    Step 2: Get all available documents for request
    Step 3: Return JSON data to React
    """
    try:
        # step 1: initialize the db
        request_id = generate_unique_request_id()
        student_id = get_jwt_identity()
        
        ##store req_id and student_id to db
        store_request(request_id, student_id)
        
        
        #Fetch student info
        student_data = get_student_data(student_id)

        student_name = student_data.get("full_name")
        student_contact = student_data.get("contact_number")
        student_email = student_data.get("email")
        
        #Store student info in the database
        store_student_info(student_id, student_name, student_contact, student_email)

        # Step 2: Fetch documents available for request
        documents = DocumentList.get_all_documents()

        # Step 3: send the needed data to React
        return jsonify({
            "status": "success",
            "request_id": request_id,
            "student_name": student_name,
            "documents": documents
        })

    except Exception as e:
        print(f"Error in /api/request: {e}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while fetching request data."
        }), 500