from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity

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
