from . import tracking_bp
from flask import render_template, session, redirect, url_for


@tracking_bp.route('/user/tracking')
def tracking():
 
    return render_template('/user/tracking.html', username=session.get('username'), active='tracking')
