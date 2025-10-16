from . import authentication_admin_bp
from flask import render_template, session, redirect, url_for


@authentication_admin_bp.route('/admin/login')
def login_admin():
 
    return render_template('admin_login.html', username=session.get('username'), active='admin_login')
