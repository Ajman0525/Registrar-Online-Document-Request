from . import authentication_admin_bp
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import create_access_token, set_access_cookies
from datetime import timedelta

@authentication_admin_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    """Secure admin login endpoint using JWT + CSRF-protected cookies."""
    
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    # Dummy user for illustration
    user = {"username": "admin", "role": "user"} if username == "user" and password == "1234" else None

    if user:
        
        access_token = create_access_token(
            identity=user["username"],                 # string identity
            additional_claims={"role": user["role"]}
        )
        
        response = jsonify({"message": "Admin login successful", "role": user["role"]})
        set_access_cookies(response, access_token)

        current_app.logger.info(f"Admin {username} logged in successfully.")
        return response, 200

    current_app.logger.warning(f"Failed admin login attempt for username: {username}")
    current_app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    return jsonify({"error": "Invalid credentials"}), 401
