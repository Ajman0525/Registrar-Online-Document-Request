from . import settings_bp
from flask import jsonify, request, current_app
from app.utils.decorator import jwt_required_with_role
from .models import Admin, OpenRequestRestriction, Fee

role = "admin"

@settings_bp.route("/api/admin/admins", methods=["GET"])
@jwt_required()
def get_admins():
    """Get all admins."""
    try:
        admins = Admin.get_all()
        return jsonify(admins), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching admins: {e}")
        return jsonify({"error": "Failed to fetch admins"}), 500


@settings_bp.route("/api/admin/admins", methods=["POST"])
@jwt_required()
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
@jwt_required()
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
@jwt_required()
def delete_admin(email):
    """Delete an admin."""
    if Admin.delete(email):
        current_app.logger.info(f"Admin {email} deleted")
        return jsonify({"message": "Admin deleted successfully"}), 200
    else:
        return jsonify({"error": "Admin not found"}), 404

@settings_bp.route("/api/admin/settings", methods=["GET"])
def get_settings():
    """Get current settings."""
    try:
        settings = OpenRequestRestriction.get_settings()
        if settings:
            return jsonify(settings), 200
        else:
            return jsonify({"start_time": "09:00", "end_time": "17:00", "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching settings: {e}")
        return jsonify({"error": "Failed to fetch settings"}), 500

@settings_bp.route("/api/admin/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    """Update settings."""
    data = request.get_json(silent=True) or {}
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    available_days = data.get("available_days")

    if not start_time or not end_time or not available_days:
        return jsonify({"error": "start_time, end_time, and available_days are required"}), 400

    if OpenRequestRestriction.update_settings(start_time, end_time, available_days):
        current_app.logger.info("Settings updated")
        return jsonify({"message": "Settings updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update settings"}), 500

@settings_bp.route("/api/admin/settings/fee", methods=["GET"])
@jwt_required()
def get_admin_fee():
    """Get current admin fee."""
    try:
        value = Fee.get_value('admin_fee')
        return jsonify({'admin_fee': value}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching admin fee: {e}")
        return jsonify({"error": "Failed to fetch admin fee"}), 500

@settings_bp.route("/api/admin/settings/fee", methods=["PUT"])
@jwt_required()
def update_admin_fee():
    """Update admin fee."""
    data = request.get_json(silent=True) or {}
    admin_fee = data.get('admin_fee')

    if admin_fee is None:
        return jsonify({"error": "admin_fee is required"}), 400

    if Fee.update_value('admin_fee', admin_fee):
        current_app.logger.info(f"Admin fee updated to {admin_fee}")
        return jsonify({"message": "Admin fee updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update admin fee"}), 500
