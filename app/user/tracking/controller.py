from . import tracking_bp
from flask import jsonify, request, current_app
from flask_jwt_extended import create_access_token, set_access_cookies
from .models import Tracking
from app.user.authentication.models import AuthenticationUser


role = 'user'


@tracking_bp.route('/api/track', methods=['POST'])
def get_tracking_data():
   """
   API endpoint to fetch tracking information based on tracking number and student ID.
   Also issues a JWT for the student.
   """
   data = request.get_json(silent=True) or {}
   tracking_number = data.get('tracking_number')
   student_id = data.get('student_id')


   current_app.logger.info(f"Tracking request received: {data}")


   if not tracking_number or not student_id:
       return jsonify({"message": "Please provide both Tracking Number and Student ID."}), 400


   try:
       # Fetch tracking record
       record = Tracking.get_record_by_ids(tracking_number, student_id)
       if not record:
           return jsonify({"message": "Invalid Tracking Number or Student ID."}), 404


       # Fetch student's phone number for masking
       student_info = AuthenticationUser.check_student_in_school_system(student_id)
       phone_number = student_info.get("phone_number") if student_info else None
       masked_phone = phone_number[-2:] if phone_number else ""


       # Create JWT for student
       access_token = create_access_token(
           identity=student_id,
           additional_claims={"role": role}
       )


       # Build response
       response = jsonify({
           "message": "Tracking data retrieved successfully",
           "role": role,
           "track_data": record,
           "masked_phone": masked_phone
       })
       set_access_cookies(response, access_token)


       return response, 200


   except Exception as e:
       current_app.logger.error(f"Error in /api/track: {e}")
       return jsonify({
           "status": "error",
           "message": "An unexpected error occurred while fetching tracking data."
       }), 500