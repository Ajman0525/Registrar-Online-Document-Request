from . import manage_request_bp
from flask import jsonify, request, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorator import jwt_required_with_role
from .models import ManageRequestModel


# Admin role
role = "admin"


@manage_request_bp.route("/api/admin/requests", methods=["GET"])
@jwt_required_with_role(role)
def get_requests():
    """
    Get paginated requests for admin management.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        search = request.args.get('search')
        result = ManageRequestModel.get_all_requests(page=page, limit=limit, search=search)
        return jsonify({"requests": result["requests"], "total": result["total"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/requests/<request_id>/status", methods=["PUT"])
@jwt_required_with_role(role)
def update_request_status(request_id):
    """
    Update the status of a specific request.
    """
    try:
        data = request.get_json()
        new_status = data.get("status")
        payment_status = data.get("payment_status")
        if not new_status:
            return jsonify({"error": "Status is required"}), 400

        # Validate status
        valid_statuses = ["UNCONFIRMED", "SUBMITTED", "PENDING", "IN-PROGRESS", "DOC-READY", "RELEASED", "REJECTED"]
        if new_status not in valid_statuses:
            return jsonify({"error": "Invalid status"}), 400

        # Get admin ID from JWT token
        admin_id = get_jwt_identity()

        success = ManageRequestModel.update_request_status(request_id, new_status, admin_id, payment_status)
        if success:
            return jsonify({"message": "Status updated successfully"}), 200
        else:
            return jsonify({"error": "Request not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/requests/<request_id>", methods=["DELETE"])
@jwt_required_with_role(role)
def delete_request(request_id):
    """
    Delete a specific request and all associated data.
    """
    try:
        # Get admin ID from JWT token
        admin_id = get_jwt_identity()

        success = ManageRequestModel.delete_request(request_id, admin_id)
        if success:
            return jsonify({"message": "Request deleted successfully"}), 200
        else:
            return jsonify({"error": "Request not found or deletion failed"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/my-requests", methods=["GET"])
@jwt_required_with_role(role)
def get_my_requests():
    """
    Get paginated requests assigned to the logged-in admin.
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        admin_id = get_jwt_identity()
        result = ManageRequestModel.get_assigned_requests(admin_id, page=page, limit=limit)
        return jsonify({"requests": result["requests"], "total": result["total"]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/auto-assign", methods=["POST"])
@jwt_required_with_role(role)
def auto_assign_requests():
    """
    Auto-assign a number of requests to the logged-in admin.
    """
    try:
        data = request.get_json()
        number = data.get("number", 1)
        admin_id = get_jwt_identity()
        assigner_admin_id = get_jwt_identity()
        assigned_count = ManageRequestModel.auto_assign_requests(admin_id, number, assigner_admin_id)
        return jsonify({"message": f"Auto-assigned {assigned_count} requests"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/manual-assign", methods=["POST"])
@jwt_required_with_role(role)
def manual_assign_requests():
    """
    Manually assign specific requests to the logged-in admin or a specified admin.
    """
    try:
        data = request.get_json()
        request_ids = data.get("request_ids", [])
        admin_id = data.get("admin_id", get_jwt_identity())
        assigner_admin_id = get_jwt_identity()
        assigned_count = 0
        for req_id in request_ids:
            if ManageRequestModel.assign_request_to_admin(req_id, admin_id, assigner_admin_id):
                assigned_count += 1
        return jsonify({"message": f"Manually assigned {assigned_count} requests"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/unassigned-requests", methods=["GET"])
@jwt_required_with_role(role)
def get_unassigned_requests():
    """
    Get unassigned requests for manual assignment.
    """
    try:
        conn = g.db_conn
        cur = conn.cursor()
        cur.execute("""
            SELECT request_id, full_name, requested_at
            FROM requests
            WHERE status = 'PENDING'
            AND request_id NOT IN (SELECT request_id FROM request_assignments)
            ORDER BY requested_at ASC
            LIMIT 50
        """)
        unassigned = cur.fetchall()
        requests = [
            {
                "request_id": req[0],
                "full_name": req[1],
                "requested_at": req[2].strftime("%Y-%m-%d %H:%M:%S") if req[2] else None
            }
            for req in unassigned
        ]
        cur.close()
        return jsonify({"requests": requests}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/assignment-progress", methods=["GET"])
@jwt_required_with_role(role)
def get_assignment_progress():
    """
    Get assignment progress for the logged-in admin.
    """
    try:
        admin_id = get_jwt_identity()
        progress = ManageRequestModel.get_assignment_progress(admin_id)
        return jsonify(progress), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/admins-progress", methods=["GET"])
@jwt_required_with_role(role)
def get_admins_progress():
    """
    Get assignment progress for all admins.
    """
    try:
        conn = g.db_conn
        cur = conn.cursor()
        cur.execute("SELECT email FROM admins ORDER BY email")
        admins = cur.fetchall()
        admins_progress = []
        for admin in admins:
            admin_id = admin[0]
            progress = ManageRequestModel.get_assignment_progress(admin_id)
            max_requests = ManageRequestModel.get_admin_max_requests(admin_id)
            admins_progress.append({
                "admin_id": admin_id,
                "completed": progress["completed"],
                "total": progress["total"],
                "max_requests": max_requests
            })
        cur.close()
        return jsonify({"admins": admins_progress}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/admin-requests/<admin_id>", methods=["GET"])
@jwt_required_with_role(role)
def get_admin_requests(admin_id):
    """
    Get all requests assigned to a specific admin.
    """
    try:
        requests = ManageRequestModel.get_assigned_requests_for_admin(admin_id)
        return jsonify({"requests": requests}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/global-max-assign", methods=["GET"])
@jwt_required_with_role(role)
def get_global_max_assign():
    """
    Get the global max assign per account.
    """
    try:
        max_assign = ManageRequestModel.get_global_max_assign()
        return jsonify({"max": max_assign}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/global-max-assign", methods=["PUT"])
@jwt_required_with_role(role)
def set_global_max_assign():
    """
    Set the global max assign per account.
    """
    try:
        data = request.get_json()
        max_assign = data.get("max", 10)
        ManageRequestModel.set_global_max_assign(max_assign)
        return jsonify({"message": "Global max assign updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/admin-max-requests/<admin_id>", methods=["GET"])
@jwt_required_with_role(role)
def get_admin_max_requests(admin_id):
    """
    Get the max requests for a specific admin.
    """
    try:
        max_requests = ManageRequestModel.get_admin_max_requests(admin_id)
        return jsonify({"max": max_requests}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/admin-max-requests/<admin_id>", methods=["PUT"])
@jwt_required_with_role(role)
def set_admin_max_requests(admin_id):
    """
    Set the max requests for a specific admin.
    """
    try:
        data = request.get_json()
        max_requests = data.get("max", 10)
        ManageRequestModel.set_admin_max_requests(admin_id, max_requests)
        return jsonify({"message": "Admin max requests updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/unassign", methods=["POST"])
@jwt_required_with_role(role)
def unassign_request():
    """
    Unassign a request from an admin.
    """
    try:
        data = request.get_json()
        request_id = data.get("request_id")
        admin_id = data.get("admin_id")
        if not request_id or not admin_id:
            return jsonify({"error": "request_id and admin_id are required"}), 400

        success = ManageRequestModel.unassign_request_from_admin(request_id, admin_id)
        if success:
            return jsonify({"message": "Request unassigned successfully"}), 200
        else:
            return jsonify({"error": "Request not found or not assigned to this admin"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_request_bp.route("/api/admin/requests/<request_id>", methods=["GET"])
@jwt_required_with_role(role)
def get_single_request(request_id):
    """
    Get a single request by ID with all details.
    """
    try:
        request_data = ManageRequestModel.get_request_by_id(request_id)
        if request_data:
            return jsonify(request_data), 200
        else:
            return jsonify({"error": "Request not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
