from flask import current_app
from app import db_pool


class TransactionsModel:
  @staticmethod
  def get_transactions(page=1, limit=20, start_date=None, end_date=None, status=None, search=None, sort='desc'):
    conn = db_pool.getconn()
    cur = conn.cursor()
    try:
      base_query = """
        SELECT request_id, student_id, full_name, total_cost, completed_at, status
        FROM requests
        WHERE TRUE
      """

      params = []
      if start_date:
        base_query += " AND requested_at >= %s"
        params.append(start_date)
      if end_date:
        base_query += " AND requested_at <= %s"
        params.append(end_date)
      if status:
        if status.lower() == 'paid':
          base_query += " AND payment_status = TRUE"
        elif status.lower() == 'unpaid':
          base_query += " AND payment_status = FALSE"
      if search:
        # Search by request id, student id or full_name
        base_query += " AND (CAST(request_id AS TEXT) ILIKE %s OR student_id ILIKE %s OR full_name ILIKE %s)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])

      sort_order = 'DESC' if sort == 'desc' else 'ASC'
      count_query = f"SELECT COUNT(*) FROM ({base_query}) as q"
      cur.execute(count_query, tuple(params))
      total = cur.fetchone()[0]

      offset = (page - 1) * limit
      paginated_query = f"{base_query} ORDER BY requested_at {sort_order} LIMIT %s OFFSET %s"
      params.extend([limit, offset])
      cur.execute(paginated_query, tuple(params))
      rows = cur.fetchall()

      results = []
      for row in rows:
        results.append({
          'transaction_id': row[0],
          'request_id': row[0],
          'student_id': row[1],
          'full_name': row[2],
          'amount': float(row[3]) if row[3] else 0.0,
          'paid': bool(row[4]),
          'payment_date': row[5].isoformat() if row[5] else None,
          'request_status': row[6]
        })

      return {
        'transactions': results,
        'total': total
      }
    except Exception as e:
      current_app.logger.error(f"Error fetching transactions: {e}")
      return {
        'transactions': [],
        'total': 0,
        'error': str(e)
      }
    finally:
      cur.close()
      db_pool.putconn(conn)

  @staticmethod
  def get_summary_stats(start_date=None, end_date=None, search=None):
    conn = db_pool.getconn()
    cur = conn.cursor()
    try:
      base_query = """
        FROM requests
        WHERE TRUE
      """
      params = []
      
      if start_date:
        base_query += " AND requested_at >= %s"
        params.append(start_date)
      if end_date:
        base_query += " AND requested_at <= %s"
        params.append(end_date)
      if search:
        base_query += " AND (CAST(request_id AS TEXT) ILIKE %s OR student_id ILIKE %s OR full_name ILIKE %s)"
        search_term = f"%{search}%"
        params.extend([search_term, search_term, search_term])

      # Total Amount (Paid only)
      query_paid = f"SELECT COALESCE(SUM(total_cost), 0) {base_query} AND payment_status = TRUE"
      cur.execute(query_paid, tuple(params))
      total_amount = cur.fetchone()[0]

      # Total Transactions (Count of all matching filters)
      query_count = f"SELECT COUNT(*) {base_query}"
      cur.execute(query_count, tuple(params))
      total_count = cur.fetchone()[0]

      return {
        'total_amount_completed': float(total_amount),
        'total_transactions': total_count
      }
    finally:
      cur.close()
      db_pool.putconn(conn)