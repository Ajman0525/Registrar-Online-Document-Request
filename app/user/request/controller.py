from . import request_bp
from flask import jsonify, request, session
from app.utils.decorator import jwt_required_with_role
from flask_jwt_extended import get_jwt_identity
from .models import Request
from app.user.document_list.models import DocumentList

role = 'user'

@request_bp.route("/api/request", methods=["GET"])
#@jwt_required_with_role(role)
def get_request_page_data():
    """
    Step 1: Initialize the db with the student_id and request_id 
            and Get student data from external DB then fill in the database
    Step 2: Get all available documents for request
    Step 3: Return JSON data to React
    """
    try:
        
        # step 1: initialize the db
        request_id = session.get("request_id")
        
        if not request_id:
            request_id = Request.generate_unique_request_id()
            session["request_id"] = request_id
            
        #student_id = session.get("student_id")

        
        #delete this later(dev testing only and uncomment the line above)
        student_id = "2025-1011"
        
        ##store req_id and student_id to db
        Request.store_request(request_id, student_id)
        
        
        #Fetch student info
        student_data = Request.get_student_data(student_id)

        student_name = student_data.get("full_name")
        student_contact = student_data.get("contact_number")
        student_email = student_data.get("email")
        
        #Store student info in the database
        Request.store_student_info(request_id, student_id, student_name, student_contact, student_email)

        # Step 2: Fetch documents available for request
        documents = DocumentList.get_all_documents()

        session["request_id"] = request_id  # Store request_id in session for later use
        
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

    
#submit requests
@request_bp.route("/api/save-request", methods=["POST"])
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
            "request_id": data["request_id"],
            "notification": "Your request has been submitted successfully."
        }), 200

    except Exception as e:
        print(f"Error in /api/save-request: {e}")
        return jsonify({
            "success": False,
            "notification": "An error occurred while submitting your request. Please try again later."
        }), 500
        

@request_bp.route("/api/list-requirements", methods=["GET"])
@jwt_required_with_role(role)  # replace role variable as needed
def get_requirements():
    """
    Returns all unique requirements for a specific request.
    """
    request_id = session.get("request_id")
    
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

#submit requirement links
@request_bp.route("/api/submit-links", methods=["POST"])
@jwt_required_with_role(role)
def submit_requirement_links():
    """
    Accepts requirement links from React and stores them to the database.
    Expected JSON format:
    {
        "request_id": "R0000123",
        "requirements": [
            {"requirement_id": "REQ0001", "file_link": "https://example.com/id.png"},
            {"requirement_id": "REQ0002", "file_link": "https://example.com/address.pdf"}
        ]
    }
    """
    
    data = request.get_json()
    request_id = session.get("request_id")
    requirements = data.get("requirements")

    #store requirement links to db
    success, message = Request.submit_requirement_links(request_id, requirements)
    status_code = 200 if success else 400
    return jsonify({"success": success, "notification": message}), status_code

#proceed upload req button
#get preferred contact
@request_bp.route("/api/get-contact", methods=["GET"])
@jwt_required_with_role(role)
def get_preferred_contact():
    """
    Fetches the preferred contact method for the logged-in student.
    """
    student_id = get_jwt_identity()
    contact_info = Request.get_contact_info_by_student_id(student_id)

    if contact_info:
        return jsonify({
            "success": True,
            "contact_info": contact_info
        }), 200
    else:
        return jsonify({
            "success": False,
            "notification": "Could not retrieve contact information."
        }), 500
        
#next button in contact page
#get the summary of request
@request_bp.route("/api/summary", methods=["GET"])
@jwt_required_with_role(role)
def get_request_summary():
    """
    Fetches a summary of the request including documents.
    """
    request_id = session.get("request_id")

    if not request_id:
        return jsonify({
            "success": False,
            "notification": "Missing request_id parameter.",
            "summary": {}
        }), 400

    summary = Request.get_request_documents_with_cost(request_id)

    # Sample Output:
    # {
    #     "documents": [
    #         {"doc_id": "DOC0001", "doc_name": "Certificate of Residency", "quantity": 2, "unit_cost": 50.0, "total_cost": 100.0},
    #         {"doc_id": "DOC0002", "doc_name": "Barangay Clearance", "quantity": 1, "unit_cost": 75.0, "total_cost": 75.0}
    #     ],
    #     "total_cost": 175.0
    # }
    
    
    return jsonify({
        "success": True,
        "summary": summary
    }), 200
    
#complete button in summary page
@request_bp.route("/api/submit-request", methods=["POST"])
@jwt_required_with_role(role)
def complete_request():
    
    request_id = session.get("request_id")
    try:
        Request.mark_request_complete(request_id)
        return jsonify({
            "success": True,
            "request_id": request_id, # for tracking purposes: TRACKING ID
            "notification": "Your request has been completed successfully."
        }), 200
    except Exception as e:
        print(f"Error in /api/submit-request: {e}")
        return jsonify({
            "success": False,
            "notification": "An error occurred while completing your request. Please try again later."
        }), 500