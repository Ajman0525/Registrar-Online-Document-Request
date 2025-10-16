from flask import Flask, g
from config import DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT, SECRET_KEY
from flask_wtf.csrf import CSRFProtect
from psycopg2 import pool
from flask_bootstrap import Bootstrap


db_pool = None

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
  
    app.config['SECRET_KEY'] = SECRET_KEY 
    
    CSRFProtect(app)
    Bootstrap(app)
    
    
    #Initialize connection pool ONCE
    global db_pool
    if db_pool is None:
        db_pool = pool.SimpleConnectionPool(
            1, 10,  # min/max connections
            user=DB_USERNAME,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )

    # Open connection for this request
    @app.before_request
    def get_db_connection():
        if "db_conn" not in g:
            g.db_conn = db_pool.getconn()

    # Close connection after request
    @app.teardown_appcontext
    def close_db_connection(exception):
        conn = g.pop("db_conn", None)
        if conn is not None:
            db_pool.putconn(conn)
            
    
    #ADMIN BLUEPRINTS
    from .admin.authentication import authentication_admin_bp as auth_admin_blueprint
    app.register_blueprint(auth_admin_blueprint)
    from .admin.dashboard import dashboard_bp as dashboard_blueprint
    app.register_blueprint(dashboard_blueprint)
    from .admin.document_manage import document_management_bp as document_management_blueprint
    app.register_blueprint(document_management_blueprint)
    from .admin.logging import logging_bp as logging_blueprint
    app.register_blueprint(logging_blueprint)
    
    #USER BLUEPRINTS
    from .user.authentication import authentication_user_bp as auth_user_blueprint
    app.register_blueprint(auth_user_blueprint)
    from .user.document_list import document_list_bp as document_list_blueprint
    app.register_blueprint(document_list_blueprint)
    from .user.landing import landing_bp as landing_blueprint
    app.register_blueprint(landing_blueprint)
    
    
    
    return app
