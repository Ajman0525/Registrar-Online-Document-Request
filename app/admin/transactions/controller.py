from . import transactions_bp
from flask import jsonify, request
from app.utils.decorator import jwt_required_with_role
from flask_jwt_extended import get_jwt_identity
from .models import TransactionsModel

role = "admin"
@transactions_bp.route("/api/admin/transactions", methods=["GET"])
@jwt_required_with_role(role)
def get_transactions():
@transactions_bp.route('/api/admin/transactions/summary', methods=['GET'])
@jwt_required_with_role(role)
def get_summary():
