from . import authentication_admin_bp
from flask import session, jsonify, request
from app.utils.decorator import csrf_protect

@authentication_admin_bp.route("/api/admin/login", methods=["POST"])
@csrf_protect
def admin_login():
    
    # Extract login data
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Dummy user for illustration
    user = {"id": 1, "username": "admin", "role": "admin"} if username == "admin" and password == "1234" else None
    
    # Example authentication 
    if user:
        # Login successful
        session['user_id'] = user["id"]
        session['role'] = user["role"]
        return jsonify({"message": "Admin login successful", "role": "admin" })
    else:
        return jsonify({"error": "Invalid credentials"}), 401
    