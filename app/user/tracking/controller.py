from . import tracking_bp
from flask import jsonify, request
from .models import Tracking
from app.user.authentication.models import AuthenticationUser # Import model to get student phone


role = 'user'

@tracking_bp.route('/api/track', methods=['POST'])
@jwt_required_with_role(role)  
def get_tracking_data():
    """
    API endpoint to fetch tracking information based on tracking number and student ID.
    """
    data = request.get_json()
    print(f"Received data: {data}")

    tracking_number = data.get('tracking_number')
    student_id = data.get('student_id')

    print(f"Tracking number: {tracking_number}")
    print(f"Student ID: {student_id}")

    if not tracking_number or not student_id:
        return jsonify({"message": "Please provide both Tracking Number and Student ID."}), 400

    try:
        record = Tracking.get_record_by_ids(tracking_number, student_id)

        if not record:
            return jsonify({"message": "Invalid Tracking Number or Student ID."}), 404

        # fetch student's phone number to create a masked version
        student_info = AuthenticationUser.check_student_in_school_system(student_id)
        phone_number = student_info.get("phone_number") if student_info else None
        
        masked_phone = ""
        if phone_number:
            masked_phone = phone_number[-2:]

        # return the complete tracking data on success
        return jsonify({"track_data": record, "masked_phone": masked_phone}), 200

    except Exception as e:
        print(f"Error in /api/track: {e}")
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while fetching tracking data."
        }), 500
