from . import settings_bp
from flask import jsonify, request, current_app
from app.utils.decorator import jwt_required_with_role
from .models import Admin

role = "admin"

@settings_bp.route("/api/admin/admins", methods=["GET"])
@jwt_required_with_role(role)
def get_admins():
    """Get all admins."""
    try:
        admins = Admin.get_all()
        return jsonify(admins), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching admins: {e}")
        return jsonify({"error": "Failed to fetch admins"}), 500


@settings_bp.route("/api/admin/admins", methods=["POST"])
@jwt_required_with_role(role)
def add_admin():
    """Add a new admin."""
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    role = data.get("role")

    if not email or not role:
        return jsonify({"error": "Email and role are required"}), 400

    if Admin.add(email, role):
        current_app.logger.info(f"Admin {email} added with role {role}")
        return jsonify({"message": "Admin added successfully"}), 201
    else:
        return jsonify({"error": "Failed to add admin"}), 500


@settings_bp.route("/api/admin/admins/<email>", methods=["PUT"])
@jwt_required_with_role(role)
def update_admin(email):
    """Update an admin's role."""
    data = request.get_json(silent=True) or {}
    role = data.get("role")

    if not role:
        return jsonify({"error": "Role is required"}), 400

    if Admin.update(email, role):
        current_app.logger.info(f"Admin {email} role updated to {role}")
        return jsonify({"message": "Admin updated successfully"}), 200
    else:
        return jsonify({"error": "Admin not found"}), 404


@settings_bp.route("/api/admin/admins/<email>", methods=["DELETE"])
@jwt_required_with_role(role)
def delete_admin(email):
    """Delete an admin."""
    if Admin.delete(email):
        current_app.logger.info(f"Admin {email} deleted")
        return jsonify({"message": "Admin deleted successfully"}), 200
    else:
        return jsonify({"error": "Admin not found"}), 404
