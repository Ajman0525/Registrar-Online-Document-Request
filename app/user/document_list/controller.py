from . import document_list_bp
from flask import render_template, session, redirect, url_for


@document_list_bp.route('/user/document_list')
def document_list():
 
    return render_template('/user/document_list.html', username=session.get('username'), active='document_list')
