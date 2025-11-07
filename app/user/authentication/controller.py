from . import authentication_user_bp
from flask import jsonify, request, session, current_app
from .models import AuthenticationUser
from flask_jwt_extended import create_access_token, set_access_cookies
import random
import hashlib

# Mock SMS sender (in production, replace this with an actual SMS API)
def send_sms(phone, message):
    print("=========== DEV OTP ===========")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print("================================")

# Mock SMS sender (in production you replace this with an actual SMS API)
# For now, it prints OTP in console for debugging/dev testing
def send_sms(phone, message):
    print("=========== DEV OTP ===========")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print("================================")

@authentication_user_bp.route('/check-id', methods=['POST'])
def check_id():
    # Get student ID from frontend
    student_id = request.json.get("student_id")

    # Query school database for student info
    result = AuthenticationUser.check_student_in_school_system(student_id)

    # Student not found in records
    if not result["exists"]:
        return jsonify({
            "status": "not_found",
            "message": "Student ID not registered"
        }),404

    # Student has unpaid liabilities, cannot proceed
    if result["has_liability"]:
        return jsonify({
            "status": "has_liability",
            "message": "Student has outstanding liabilities"
        }), 200

    # Generate OTP + hash it
    otp, otp_hash = AuthenticationUser.generate_otp()

    # Save OTP hash in session (temporary)
    AuthenticationUser.save_otp(student_id, otp_hash, session)

    # Send OTP to registered phone (printed in dev)
    phone = result["phone_number"]
    send_sms(phone, f"Your verification code is: {otp}")

    # Return masked number to frontend
    return jsonify({
        "status": "valid",
        "message": "Student OK, continue",
        "masked_phone": phone[-2:]
    }), 200


@authentication_user_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    student_id = request.json.get("student_id")

    # Get stored session to confirm an active OTP attempt
    if "otp" not in session:
        return jsonify({
            "status": "expired",
            "message": "No active OTP session. Please start again."
        }), 400

    # Generate new OTP
    otp = random.randint(100000, 999999)
    otp_hash = hashlib.sha256(str(otp).encode()).hexdigest()
    session["otp"] = otp_hash  # replace old OTP

    # Normally, phone comes from stored data or user record
    result = AuthenticationUser.check_student_in_school_system(student_id)
    phone = result["phone_number"]  # or pull from your database

    send_sms(phone, f"Your new verification code is: {otp}")

    return jsonify({
        "status": "resent",
        "message": "New OTP sent successfully",
        "masked_phone": phone[-2:]
    }), 200

@authentication_user_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    otp = request.json.get("otp")
    student_id = request.json.get("student_id")

    # Validate entered OTP
    valid = AuthenticationUser.verify_otp(otp, session)
    if not valid:
        return jsonify({"valid": False, "message": "Invalid OTP"}), 400

    # OTP correct, clear it
    session.pop("otp", None)

    # Create JWT token for the session
    user = {"student_id": student_id, "role": "user"}
    access_token = create_access_token(
        identity=user["student_id"],
        additional_claims={"role": user["role"]}
    )

    response = jsonify({
        "message": "User login successful",
        "role": user["role"]
    })
    set_access_cookies(response, access_token)

    current_app.logger.info(f"User {student_id} logged in successfully.")
    return response, 200
