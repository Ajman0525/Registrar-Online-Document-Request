from flask import current_app
from app import db_pool

class TransactionsModel:
  @staticmethod
  def get_transactions(page=1, limit=20, start_date=None, end_date=None, status=None, search=None, sort='desc'):
  @staticmethod
  def get_summary_stats(start_date=None, end_date=None, search=None):
