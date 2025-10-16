from . import authentication_admin_bp
from flask import render_template, session, redirect, url_for


#testing
@authentication_admin_bp.route("/")
def index():
    return render_template('index.html')
#testing



@authentication_admin_bp.route('/admin/login')
def admin_login():
 
    return render_template('/admin/admin_login.html', username=session.get('username'), active='admin_login')
