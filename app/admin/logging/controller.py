from . import logging_bp
from flask import render_template, session, redirect, url_for


@logging_bp.route('/admin/logs')
def logs():

    return render_template('admin/logs.html', username=session.get('username'), active='logs')
