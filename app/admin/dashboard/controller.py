from . import dashboard_bp
from flask import jsonify
from flask_jwt_extended import unset_jwt_cookies
from app.utils.decorator import jwt_required_with_role

# Admin role
role = "admin"

@dashboard_bp.route("/api/admin/dashboard", methods=["GET"])
@jwt_required_with_role(role)
def admin_dashboard():
    """
    Protected admin dashboard endpoint.
    Only accessible by users with role='admin'.
    """
    # Example dashboard data
    stats = {
        "users_count": 25,
        "documents_pending": 7,
        "recent_activity": [
            "User1 requested transcript",
            "User2 submitted request"
        ]
    }
    return jsonify(stats), 200


@dashboard_bp.route("/api/admin/logout", methods=["POST"])
@jwt_required_with_role(role)
def admin_logout():
    """
    Logout admin by clearing JWT cookies.
    """
    response = jsonify({"message": "Logged out successfully"})
    unset_jwt_cookies(response)  # clears JWT + CSRF cookies
    return response, 200
