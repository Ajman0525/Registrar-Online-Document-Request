from . import request_bp
from flask import jsonify, request
from app.utils.decorator import jwt_required_with_role
from flask_jwt_extended import get_jwt_identity
from .models import Request
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
        request_id = Request.generate_unique_request_id()
        student_id = get_jwt_identity()
        
        ##store req_id and student_id to db
        Request.store_request(request_id, student_id)
        
        
        #Fetch student info
        student_data = Request.get_student_data(student_id)

        student_name = student_data.get("full_name")
        student_contact = student_data.get("contact_number")
        student_email = student_data.get("email")
        
        #Store student info in the database
        Request.store_student_info(student_id, student_name, student_contact, student_email)

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
        
#view requests
@request_bp.route("/api/view_request", methods=["GET"])
@jwt_required_with_role(role)
def view_request_page():
    """
    Accepts selected documents from React and returns them as JSON.
    If no documents are selected, return a user-friendly notification.
    """
    data = request.get_json()

    # Check if the 'documents' key exists
    if not data or "documents" not in data:
        return jsonify({
            "success": False,
            "notification": "No documents were selected.",
            "documents": []
        }), 200  # 200 so frontend can handle it gracefully

    selected_docs = data.get("documents", [])

    # If the list is empty, return a notification
    if not selected_docs:
        return jsonify({
            "success": False,
            "notification": "Please select at least one document before proceeding.",
            "documents": []
        }), 200

    # If documents exist, return them
    return jsonify({
        "success": True,
        "message": "Documents sent successfully.",
        "documents": selected_docs
    }), 200
    
    
#submit requests
@request_bp.route("/api/submit_request", methods=["POST"])
@jwt_required_with_role(role)
def submit_request_page():
    """
    Accepts final submission data from React and processes the request.
    Returns a success or error notification based on processing outcome.
    """
    
    """accepts data from react: request id, document id, quantity"""
    data = request.get_json()

    try:
        #store requested documents to db
        Request.store_requested_documents(
            data["request_id"],
            data["document_ids"],
            data["quantity_list"]
        )

        return jsonify({
            "success": True,
            "notification": "Your request has been submitted successfully."
        }), 200

    except Exception as e:
        print(f"Error in /api/submit_request: {e}")
        return jsonify({
            "success": False,
            "notification": "An error occurred while submitting your request. Please try again later."
        }), 500
        

@request_bp.route("/api/list_requirements", methods=["GET"])
@jwt_required_with_role("student")  # replace role variable as needed
def get_requirements():
    """
    Returns all unique requirements for a specific request.
    Expects a query parameter: ?request_id=R0000123
    """
    request_id = request.args.get("request_id")
    
    if not request_id:
        return jsonify({
            "success": False,
            "notification": "Missing request_id parameter.",
            "requirements": []
        }), 400

    # Fetch unique requirements
    result = Request.get_requirements_by_request_id(request_id)

    if not result["requirements"]:
        return jsonify({
            "success": True,
            "notification": "No requirements found for this request.",
            "requirements": []
        }), 200

    return jsonify({
        "success": True,
        "requirements": result["requirements"]
    }), 200

#submit link
@request_bp.route("/api/submit_requirement_links", methods=["POST"])
@jwt_required_with_role(role)
def submit_requirement_links():
    pass