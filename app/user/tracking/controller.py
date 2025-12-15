from . import tracking_bp
from ...whatsapp.controller import send_whatsapp_message 
from flask import jsonify, request, current_app, session
from flask_jwt_extended import create_access_token, set_access_cookies, get_jwt_identity, verify_jwt_in_request
from .models import Tracking
from app.utils.decorator import jwt_required_with_role
from app.user.authentication.models import AuthenticationUser

role = 'user'

def send_whatsapp_otp(phone, otp_code, full_name):
    template_name = "odr_reference_number"
    
    components = [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": str(full_name)},
                    {"type": "text", "text": str(otp_code)}
                ]
            }
        ]
    
    print(f"[OTP Verification] Attempting to send WhatsApp OTP {otp_code} to {phone}")
    
    result = send_whatsapp_message(phone, template_name, components)
    
    if "error" in result:
        current_app.logger.error(f"WhatsApp send failed for OTP to {phone}: {result['error']}")
        return {"status": "failed", "message": "Failed to send OTP via WhatsApp"}
    
    return {"status": "success"}

@tracking_bp.route('/api/track', methods=['POST'])
def get_tracking_data():
    """
    API endpoint to fetch tracking information based on tracking number and student ID.
    Also issues a JWT for the student.
    """
    data = request.get_json(silent=True) or {}
    tracking_number = data.get('tracking_number')

    current_app.logger.info(f"Tracking request received: {data}")

    if not tracking_number:
        return jsonify({"message": "Please provide Tracking Number."}), 400
    
    student_id = Tracking.get_student_id_by_tracking_number(tracking_number)
    if not student_id:
        return jsonify({"message": "Invalid Tracking Number."}), 404
    
    is_already_authenticated = False
    try:
        verify_jwt_in_request(optional=True)
        current_user = get_jwt_identity()
        
        if current_user == student_id:
            is_already_authenticated = True
            current_app.logger.info(f"User {student_id} is already authenticated. Skipping OTP.")
    except Exception:
        pass

    try:
        # Fetch tracking record
        record = Tracking.get_record_by_tracking_number(tracking_number)
        if not record:
            return jsonify({"message": "Invalid Tracking Number or Student ID."}), 404

        result = AuthenticationUser.check_student_in_school_system(student_id) 

        # Student not found in records
        if not result["exists"]:
            return jsonify({
                "status": "not_found",
                "message": "Student ID not registered"
            }),404
        
        phone_number = result.get("phone_number") if result else None
        full_name = result.get("full_name") if result else "Valued Customer"
        masked_phone = phone_number[-4:] if phone_number else ""

        if not is_already_authenticated:
            otp, otp_hash = AuthenticationUser.generate_otp()

        #Save OTP hash in session (temp)
        AuthenticationUser.save_otp(student_id, otp_hash,has_liability=result["has_liability"], session=session)
        session["phone_number"] = result["phone_number"]
        session["tracking_number"] = tracking_number 
        session["full_name"] = full_name

            # DEBUG: Print session data
        print(f"[DEBUG] Session after saving OTP: {dict(session)}")

        phone = result["phone_number"]
        send_whatsapp_otp(phone, otp, full_name)

        # Build response
        response_data = {
            "message": "Tracking data retrieved successfully",
            "role": role,
            "track_data": record,
            "masked_phone": masked_phone,
            "student_id": student_id
        }
        response = jsonify(response_data)

        # Create and set JWT in http-only cookie
        access_token = create_access_token(identity=student_id, additional_claims={"role": role})
        set_access_cookies(response, access_token)

        return response, 200

    except Exception as e:
        current_app.logger.error(f"Error in /api/track: {e}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while fetching tracking data."
        }), 500
    
@tracking_bp.route("/api/set-order-type", methods=["POST"], strict_slashes=False)
@jwt_required_with_role(role)
def set_order_type():
    """
    Sets the order_type for the current request.
    """
    student_id = get_jwt_identity()
    if not student_id:
        return jsonify({"message": "User session not found or invalid."}), 401
    data = request.get_json()

    print(f"[DEBUG] Raw request data: {data}")
    print(f"[DEBUG] Request headers: {request.headers}")
    print(f"[DEBUG] Request data type: {type(data)}")

    tracking_number = data.get("tracking_number")
    order_type = data.get("order_type")

    if not tracking_number or not order_type:
        return jsonify({
            "success": False,
            "notification": "Missing tracking_number or order_type."
        }), 400

    success = Tracking.set_order_type(tracking_number, order_type)

    if success:
        return jsonify({
            "success": True,
            "notification": f"Order type set to {order_type} successfully."
        }), 200
    else:
        return jsonify({
            "success": False,
            "notification": "Failed to set order type."
        }), 500

@tracking_bp.route('/api/track/status/<tracking_number>', methods=['GET'])
@jwt_required_with_role(role)
def get_tracking_status(tracking_number):
    """
    API endpoint to get current tracking status without OTP verification.
    Used for polling payment status after payment redirect.
    """
    student_id = get_jwt_identity()
    if not student_id:
        return jsonify({"message": "User session not found or invalid."}), 401

    try:
        record = Tracking.get_record_by_tracking_number(tracking_number)
        if not record or record['studentId'] != student_id:
            return jsonify({"message": "Tracking record not found."}), 404

        return jsonify({
            "trackData": record
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in /api/track/status/<tracking_number>: {e}")
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500

@tracking_bp.route('/api/track/document/<tracking_number>', methods=['GET'])
@jwt_required_with_role(role)
def get_requested_documents(tracking_number):
    """
    API endpoint to fetch requested documents for a given tracking number and student ID.
    """
    try:
        documents = Tracking.get_requested_documents(tracking_number)
        if documents is None:
            return jsonify({"message": "No documents found for the provided Tracking Number and Student ID."}), 404

        # Log the retrieved documents as requested
        current_app.logger.info(f"Retrieved documents for tracking number {tracking_number}: {documents}")

        return jsonify({
            "message": "Requested documents retrieved successfully",
            "documents": documents
        }), 200


    except Exception as e:
        current_app.logger.error(f"Error in /api/track/document: {e}")
        return jsonify({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500
