from . import authentication_admin_bp
from flask import jsonify, request, current_app
from flask_jwt_extended import create_access_token, set_access_cookies
from authlib.integrations.flask_client import OAuth
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests


oauth = OAuth(current_app)
google = oauth.register(
   name='google',
   client_id=GOOGLE_CLIENT_ID,
   client_secret=GOOGLE_CLIENT_SECRET,
   authorize_url='https://accounts.google.com/o/oauth2/auth',
   authorize_params=None,
   access_token_url='https://accounts.google.com/o/oauth2/token',
   access_token_params=None,
   refresh_token_url=None,
   redirect_uri='http://localhost:8000/api/admin/google/callback',
   client_kwargs={'scope': 'openid email profile'},
)


@authentication_admin_bp.route("/api/admin/google-login", methods=["POST"])
def google_login():
   """Verify Google ID token and create JWT."""
   data = request.get_json(silent=True) or {}
   token = data.get("token")


   if not token:
       return jsonify({"error": "ID token required"}), 400


   try:
       # Verify the ID token
       CLIENT_ID = GOOGLE_CLIENT_ID
       id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)


       # Check if email is authorized (e.g., domain check)
       if not id_info['email'].endswith('@g.msuiit.edu.ph'):
           return jsonify({"error": "Unauthorized email"}), 403


       # Create JWT
       access_token = create_access_token(
           identity=id_info['email'],
           additional_claims={"role": "admin"}
       )


       response = jsonify({"message": "Admin login successful", "role": "admin"})
       set_access_cookies(response, access_token)


       current_app.logger.info(f"Admin {id_info['email']} logged in via Google.")
       return response, 200


   except ValueError as e:
       current_app.logger.warning(f"Invalid ID token: {e}")
       return jsonify({"error": "Invalid token"}), 401
