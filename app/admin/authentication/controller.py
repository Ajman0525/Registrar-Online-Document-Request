from . import authentication_admin_bp
from flask import render_template, session, redirect, url_for, jsonify

@authentication_admin_bp.route('/api/admin/login', methods=['GET'])
def admin_login():
    # This can later handle login logic
    return jsonify({"message": "Hello from Flask!"})
