from . import dashboard_bp
from flask import render_template, session, redirect, url_for, jsonify
from app.utils.decorator import csrf_protect, login_required

@dashboard_bp.route("/api/admin/dashboard")
@csrf_protect
@login_required(role="admin")
def admin_dashboard():
    # Example data
    stats = {
        "users_count": 25,
        "documents_pending": 7,
        "recent_activity": ["User1 requested transcript", "User2 submitted request"]
    }
    return jsonify(stats)

@dashboard_bp.route("/api/admin/logout", methods=["POST"])
@csrf_protect
@login_required(role="admin")
def admin_logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"})