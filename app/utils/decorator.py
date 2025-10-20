from functools import wraps
from flask import request, jsonify, session
from flask_wtf.csrf import validate_csrf, CSRFError


def csrf_protect(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            csrf_token = request.headers.get("X-CSRFToken")
            validate_csrf(csrf_token)
        except CSRFError:
            return jsonify({"error": "Invalid or missing CSRF token"}), 400
        return f(*args, **kwargs)
    return decorated


def login_required(role=None):
    """Protect a route: only logged-in users with optional role can access."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not session.get("user_id"):  # not logged in
                return jsonify({"error": "Please Login first"}), 401
            if role and session.get("role") != role:  # wrong role
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
