from . import authentication_user_bp
from ...whatsapp.controller import send_whatsapp_message 
from flask import jsonify, request, session, current_app
from .models import AuthenticationUser
from flask_jwt_extended import create_access_token, set_access_cookies
import random
import hashlib

def send_whatsapp_otp(phone, otp_code):
    template_name = "hello_world"
    components = None
    
    if template_name != "hello_world":
        # Passing the OTP for dynamic variables such as {{1}}.
        components = [
            {
                "type": "body",
                "parameters": [
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
    phone = result["phone_number"] 

    # Save OTP hash and student ID in session
    AuthenticationUser.save_otp(student_id, otp_hash, session)
    session["phone_number"] = phone
    
    # Send OTP via WhatsApp
    whatsapp_result = send_whatsapp_otp(phone, otp)
    
    if whatsapp_result["status"] == "failed":
        return jsonify({
            "status": "error",
            "message": whatsapp_result["message"]
        }), 500

    # Return masked number to frontend
    return jsonify({
        "status": "valid",
        "message": "Student OK, continue",
        "masked_phone": phone[-4:] 
    }), 200

@authentication_user_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    # Debug print
    print(f"[DEBUG] Session at resend: {dict(session)}")

    student_id = session.get("student_id")
    phone = session.get("phone_number")

    if not student_id or not phone:
        return jsonify({
            "status": "expired",
            "message": "No active OTP session. Please start again."
        }), 400

    # Generate new OTP
    otp, otp_hash = AuthenticationUser.generate_otp()
    session["otp"] = otp_hash  # replace old OTP

    # Send OTP via WhatsApp
    whatsapp_result = send_whatsapp_otp(phone, otp)
    
    if whatsapp_result["status"] == "failed":
        return jsonify({
            "status": "error",
            "message": whatsapp_result["message"]
        }), 500
        
    # Success response
    return jsonify({
        "status": "resent",
        "message": "New OTP sent successfully",
        "masked_phone": phone[-4:] 
    }), 200

@authentication_user_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    print("=" * 50)
    print("[DEBUG] Received payload:", request.json)
    print("[DEBUG] Session contents:", dict(session))
    print("[DEBUG] Session ID:", request.cookies.get('session'))
    print("=" * 50)

    otp = request.json.get("otp")
    student_id = session.get("student_id")
    
    # Check if OTP exists in session
    if "otp" not in session:
        print("[ERROR] No OTP found in session!")
        return jsonify({
            "valid": False, 
            "message": "Session expired. Please request a new OTP."
        }), 400
    
    # Validate entered OTP
    valid = AuthenticationUser.verify_otp(otp, session)
    
    if not valid:
        print(f"[ERROR] OTP validation failed. Entered: {otp}")
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
        "role": user["role"],
        "valid": True
    })
    set_access_cookies(response, access_token)

    current_app.logger.info(f"User {student_id} logged in successfully.")
    print("[SUCCESS] OTP verified, JWT token created")
    return response, 200