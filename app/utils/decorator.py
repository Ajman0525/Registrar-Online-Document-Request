
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity
from app.admin.settings.models import OpenRequestRestriction
import datetime
import json

def jwt_required_with_role(role=None):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # Verify JWT exists
            verify_jwt_in_request()

            # Get identity and claims
            identity = get_jwt_identity()  # string or dict depending on version
            claims = get_jwt()             # contains additional_claims

            # Determine user role
            user_role = None
            if isinstance(identity, dict):
                user_role = identity.get("role")
            else:
                user_role = claims.get("role")  # fallback to additional_claims

            # Role check
            if role and user_role != role:
                return jsonify({
                    "error": f"You are forbidden to access this page. Required '{role}' role"
                }), 403

            return fn(*args, **kwargs)
        return decorator
    return wrapper

def request_allowed_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if not is_request_allowed():
                return jsonify({
                    "status": "error",
                    "message": "Requests are not allowed at this time. Please check the available hours and days."
                }), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


def is_request_allowed():
    """
    Check if requesting is allowed at the current time based on settings.
    """
    try:
        now = datetime.datetime.now()
        current_day = now.strftime('%A')  # e.g., 'Monday'
        current_time = now.time()

        settings = OpenRequestRestriction.get_settings()
        if not settings:
            # If no settings, allow by default
            return True

        # Handle available_days - could be JSON string or list
        available_days_raw = settings.get('available_days', [])
        if isinstance(available_days_raw, str):
            try:
                available_days = json.loads(available_days_raw)
            except json.JSONDecodeError:
                # Fallback to default if JSON parsing fails
                available_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        else:
            available_days = available_days_raw

        start_time_str = settings.get('start_time', '09:00:00')
        end_time_str = settings.get('end_time', '17:00:00')

        # Validate time strings and provide defaults
        try:
            start_time = datetime.datetime.strptime(start_time_str, '%H:%M:%S').time()
        except ValueError:
            start_time = datetime.time(9, 0, 0)  # 09:00:00

        try:
            end_time = datetime.datetime.strptime(end_time_str, '%H:%M:%S').time()
        except ValueError:
            end_time = datetime.time(17, 0, 0)  # 17:00:00

        # Check if current day is allowed
        if current_day not in available_days:
            return False

        # Handle time range logic properly
        # For same-day requests: start_time <= current_time <= end_time
        # For overnight requests: current_time >= start_time OR current_time <= end_time
        if start_time <= end_time:
            # Same day range (e.g., 09:00 to 17:00)
            return start_time <= current_time <= end_time
        else:
            # Overnight range (e.g., 22:00 to 06:00)
            return current_time >= start_time or current_time <= end_time

    except Exception as e:
        print(f"Error in is_request_allowed: {e}")
        # If there's any error, allow requests by default
        return True
