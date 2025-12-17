

from . import settings_bp
from flask import jsonify, request, current_app
from app.utils.decorator import jwt_required_with_role
from .models import Admin, OpenRequestRestriction, Fee, AvailableDates
from flask_jwt_extended import jwt_required
import json

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
            # Ensure all required fields are present
            default_settings = {
                "start_time": "09:00:00",
                "end_time": "17:00:00",
                "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "announcement": ""
            }
            
            # Merge with defaults to ensure all fields exist
            complete_settings = {**default_settings, **settings}
            return jsonify(complete_settings), 200
        else:
            # Return default settings if no settings exist
            return jsonify({
                "start_time": "09:00:00",
                "end_time": "17:00:00",
                "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "announcement": ""
            }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching settings: {e}")
        # Return default settings on error
        return jsonify({
            "start_time": "09:00:00",
            "end_time": "17:00:00",
            "available_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "announcement": "",
            "error": "Failed to fetch settings"
        }), 200


@settings_bp.route("/api/admin/settings", methods=["PUT"])
@jwt_required()
def update_settings():
    """Update settings."""
    data = request.get_json(silent=True) or {}
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    available_days = data.get("available_days")
    announcement = data.get("announcement", "")

    if not start_time or not end_time or not available_days:
        return jsonify({"error": "start_time, end_time, and available_days are required"}), 400

    # Ensure available_days is a list (in case it comes as a string)
    if isinstance(available_days, str):
        try:
            available_days = json.loads(available_days)
        except (json.JSONDecodeError, TypeError):
            return jsonify({"error": "available_days must be a valid JSON array"}), 400

    if OpenRequestRestriction.update_settings(start_time, end_time, available_days, announcement):
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


# ==========================
# DATE AVAILABILITY MANAGEMENT ENDPOINTS
# ==========================

@settings_bp.route("/api/admin/available-dates", methods=["GET"])
@jwt_required()
def get_available_dates():
    """Get all date availability settings."""
    try:
        date_settings = AvailableDates.get_all()
        return jsonify({"date_settings": date_settings}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching available dates: {e}")
        return jsonify({"error": "Failed to fetch available dates"}), 500


@settings_bp.route("/api/admin/available-dates/<date>", methods=["GET"])
@jwt_required()
def get_available_date(date):
    """Get availability for a specific date."""
    try:
        date_setting = AvailableDates.get_by_date(date)
        if date_setting:
            return jsonify(date_setting), 200
        else:
            return jsonify({"message": "No specific availability setting found for this date"}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching available date for {date}: {e}")
        return jsonify({"error": "Failed to fetch available date"}), 500


@settings_bp.route("/api/admin/available-dates", methods=["POST"])
@jwt_required()
def create_or_update_date():
    """Create or update availability for a specific date."""
    data = request.get_json(silent=True) or {}
    date = data.get("date")
    is_available = data.get("is_available")
    reason = data.get("reason", "")

    if not date or is_available is None:
        return jsonify({"error": "date and is_available are required"}), 400

    try:
        if AvailableDates.create_or_update(date, is_available, reason):
            current_app.logger.info(f"Date availability updated for {date}: {is_available}")
            return jsonify({"message": "Date availability updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update date availability"}), 500
    except Exception as e:
        current_app.logger.error(f"Error updating date availability for {date}: {e}")
        return jsonify({"error": "Failed to update date availability"}), 500


@settings_bp.route("/api/admin/available-dates/<date>", methods=["DELETE"])
@jwt_required()
def delete_available_date(date):
    """Delete availability setting for a specific date."""
    try:
        if AvailableDates.delete(date):
            current_app.logger.info(f"Date availability deleted for {date}")
            return jsonify({"message": "Date availability deleted successfully"}), 200
        else:
            return jsonify({"error": "Date availability setting not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting date availability for {date}: {e}")
        return jsonify({"error": "Failed to delete date availability"}), 500


@settings_bp.route("/api/admin/available-dates/bulk", methods=["POST"])
@jwt_required()
def bulk_update_dates():
    """Bulk update availability for multiple dates."""
    data = request.get_json(silent=True) or {}
    dates = data.get("dates", [])
    is_available = data.get("is_available")
    reason = data.get("reason", "")

    if not dates or is_available is None:
        return jsonify({"error": "dates array and is_available are required"}), 400

    if not isinstance(dates, list) or len(dates) == 0:
        return jsonify({"error": "dates must be a non-empty array"}), 400

    try:
        if AvailableDates.bulk_update(dates, is_available, reason):
            current_app.logger.info(f"Bulk updated {len(dates)} dates to {is_available}")
            return jsonify({"message": f"Successfully updated {len(dates)} dates"}), 200
        else:
            return jsonify({"error": "Failed to bulk update dates"}), 500
    except Exception as e:
        current_app.logger.error(f"Error bulk updating dates: {e}")
        return jsonify({"error": "Failed to bulk update dates"}), 500


@settings_bp.route("/api/admin/available-dates/upcoming", methods=["GET"])
@jwt_required()
def get_upcoming_restrictions():
    """Get upcoming date restrictions."""
    try:
        days_ahead = request.args.get('days', 30, type=int)
        restrictions = AvailableDates.get_upcoming_restrictions(days_ahead)
        return jsonify({"restrictions": restrictions}), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching upcoming restrictions: {e}")
        return jsonify({"error": "Failed to fetch upcoming restrictions"}), 500


@settings_bp.route("/api/public/date-availability/<date>", methods=["GET"])
def check_date_availability(date):
    """Public endpoint to check if a specific date is available for requests."""
    try:
        is_available = AvailableDates.is_date_available(date)
        return jsonify({
            "date": date,
            "is_available": is_available,
            "has_specific_setting": is_available is not None
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error checking availability for date {date}: {e}")
        return jsonify({"error": "Failed to check date availability"}), 500
