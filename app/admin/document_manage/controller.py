from . import document_management_bp
from flask import render_template, session, redirect, url_for


@document_management_bp.route('/admin/document_management')
def document_management():
 
    return render_template('admin/document_management.html', username=session.get('username'), active='document_management')
