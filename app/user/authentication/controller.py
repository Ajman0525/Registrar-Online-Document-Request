from . import authentication_user_bp
from flask import jsonify, request, session
from .models import AuthenticationUser
import random

# Mock SMS function (replace with Twilio / Globe API / Smart API later)
def send_sms(phone, message):
    print(f"Sending SMS to {phone}: {message}")  # DEV ONLY

@authentication_user_bp.route('/check-id', methods=['POST'])
def check_id():
    student_id = request.json.get("student_id")

    result = AuthenticationUser.check_student_in_school_system(student_id)

    if not result["exists"]:
        return jsonify({
            "status": "not_found",
            "message": "Student ID not registered"
        }),404

    if result["has_liability"]:
        return jsonify({
            "status": "has_liability",
            "message": "Student has outstanding liabilities"
        }),200
    
    otp = random.randint(100000, 999999)
    session["otp"]= str(otp)

    phone = result["phone_number"]
    send_sms(phone, f"Your verification code is: {otp}")


    return jsonify({
        "status": "valid",
        "message": "Student OK, continue"
    }), 200


@authentication_user_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    otp = request.json.get("otp")

    if otp != session.get("otp"):
        return jsonify({"valid": False, "message": "Invalid OTP"}), 400

    return jsonify({"valid": True}), 200
