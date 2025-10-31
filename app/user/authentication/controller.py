from . import authentication_user_bp
from flask import jsonify, request, session
from .models import AuthenticationUser
import random

# Mock SMS sender (in production you replace this with an actual SMS API)
# For now, it prints OTP in console for debugging/dev testing
def send_sms(phone, message):
    print("=========== DEV OTP ===========")
    print(f"To: {phone}")
    print(f"Message: {message}")
    print("================================")

@authentication_user_bp.route('/check-id', methods=['POST'])
def check_id():
    # Get student ID sent from frontend
    student_id = request.json.get("student_id")

    # Query school database for student
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
        }),200
    
    # Student found and clear; generate OTP
    otp = random.randint(100000, 999999)

    # Save OTP in session (temporary server memory)
    session["otp"]= str(otp)

    # Get phone number from database record
    phone = result["phone_number"]

    # Send OTP (currently print only)
    send_sms(phone, f"Your verification code is: {otp}")

    # Mask phone number; only show last 2 digits to user
    return jsonify({
        "status": "valid",
        "message": "Student OK, continue",
        "masked_phone": phone[-2:]
    }), 200

@authentication_user_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    # OTP user entered
    otp = request.json.get("otp")

    # Compare OTP with session-stored OTP
    if otp != session.get("otp"):
        return jsonify({
            "valid": False,
            "message": "Invalid OTP"
        }), 400

    # OTP correct, remove it from session so it can't be reused
    session.pop("otp", None)

    return jsonify({"valid": True}), 200
