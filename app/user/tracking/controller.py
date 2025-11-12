from . import tracking_bp
from flask import jsonify, request, current_app, session
from flask_jwt_extended import create_access_token, set_access_cookies
from .models import Tracking
from app.user.authentication.models import AuthenticationUser


role = 'user'

# Mock SMS sender (in production you replace this with an actual SMS API)
# For now, it prints OTP in console for debugging/dev testing
def send_sms(phone, message):
    print("=========== DEV OTP ===========")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print("================================")

@tracking_bp.route('/api/track', methods=['POST'])
def get_tracking_data():
    """
    API endpoint to fetch tracking information based on tracking number and student ID.
    Also issues a JWT for the student.
    """
    data = request.get_json(silent=True) or {}
    tracking_number = data.get('tracking_number')
    student_id = data.get('student_id')


    current_app.logger.info(f"Tracking request received: {data}")


    if not tracking_number or not student_id:
        return jsonify({"message": "Please provide both Tracking Number and Student ID."}), 400


    try:
        # Fetch tracking record
        record = Tracking.get_record_by_ids(tracking_number, student_id)
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
        masked_phone = phone_number[-2:] if phone_number else ""

        # Generate OTP + hash
        otp, otp_hash = AuthenticationUser.generate_otp()

        #Save OTP hash in session (temp)
        AuthenticationUser.save_otp(student_id, otp_hash, session)
        session["phone_number"] = result["phone_number"]
        session["tracking_number"] = tracking_number # Add tracking number to session

        # DEBUG: Print session data
        print(f"[DEBUG] Session after saving OTP: {dict(session)}")

        # Send OTP to registered phone (printed in dev)
        phone = result["phone_number"]
        send_sms(phone, f"Your verification code is: {otp}")

        # Build response
        response = jsonify({
            "message": "Tracking data retrieved successfully",
            "role": role,
            "track_data": record,
            "masked_phone": masked_phone
        })
        return response, 200

    except Exception as e:
        current_app.logger.error(f"Error in /api/track: {e}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while fetching tracking data."
        }), 500
