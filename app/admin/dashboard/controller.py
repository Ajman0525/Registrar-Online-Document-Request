from . import dashboard_bp
from flask import render_template, session, redirect, url_for


@dashboard_bp.route('/admin/dashboard')
def dashboard():
 
    return render_template('dashboard.html', username=session.get('username'), active='dashboard')
