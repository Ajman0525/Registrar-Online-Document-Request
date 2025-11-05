from . import request_bp
from flask import render_template, session, redirect, url_for, jsonify, g
from app.utils.decorator import jwt_required_with_role
from flask_jwt_extended import get_jwt_identity

role = 'user'

@request_bp.route("/api/request", methods=["GET"])
@jwt_required_with_role(role)
def get_request_page_data():
    """
    Step 1: Initialize the db with the student_id and request_id 
    Step 2: Get student data from external DB then fill in the database
    Step 2: Get all available documents for request
    Step 3: Return JSON data to React
    """
    try:
        # step 1: initialize the db
        request_id = generated_id
        student_id = get_jwt_identity()
        
        ##store req_id and student_id to db
        
        #Fetch student info
        student_data = get_student_data(student_id)


        # Step 2: Fetch documents available for request
        documents = get_all_documents()

        # Step 3: Combine results
        return jsonify({
            "status": "success",
            "student": student_data,
            "documents": documents
        })

    except Exception as e:
        print(f"Error in /api/request: {e}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while fetching request data."
        }), 500