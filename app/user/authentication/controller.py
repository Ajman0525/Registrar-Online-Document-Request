from . import authentication_user_bp
from flask import render_template, session, redirect, url_for


@authentication_user_bp.route('/user/login')
def user_login():
 
    return render_template('/user/user_login.html', username=session.get('username'), active='user_login')
