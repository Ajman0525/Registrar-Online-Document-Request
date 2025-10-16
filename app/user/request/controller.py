from . import request_bp
from flask import render_template, session, redirect, url_for


@request_bp.route('/user/request')
def landing():
 
    return render_template('/user/request.html', username=session.get('username'), active='request')
