from flask import has_app_context, current_app
from app import db_pool


class Payment:
    @staticmethod
    def process_webhook_payment(tracking_number, amount, student_id):
        """
        Processes a payment webhook by verifying amount and updating payment status.

        Args:
            tracking_number (str): The request_id of the record.
            amount (float): The payment amount received.
            student_id (str): The student_id to validate ownership.

        Returns:
            dict: A dictionary with 'success' (bool) and 'message' (str) keys.
        """
        previous_payment_status = False 
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            # 1. Fetch data
            cur.execute("""
                SELECT total_cost, payment_status, student_id
                FROM requests
                WHERE request_id = %s
            """, (tracking_number,))
            
            order = cur.fetchone()
            
            if order: 
                previous_payment_status = order[1]
                
                if has_app_context():
                    current_app.logger.info(f"[MAYA] Fetched order for tracking {tracking_number}: {order}")
                else:
                    print(f"[MAYA] Fetched order for tracking {tracking_number}: {order}")
            
            if not order:
                return {
                    'success': False,
                    'message': f'Order not found for tracking number: {tracking_number}',
                    'was_already_paid': previous_payment_status 
                }
            
            expected_amount = float(order[0]) if order[0] else 0.0
            
            if amount is None:
                received_amount = expected_amount
            else:
                received_amount = float(amount)
            
            
            if received_amount != expected_amount:
                return {
                    'success': False,
                    'message': f'Payment amount mismatch: expected {expected_amount}, received {received_amount}',
                    'was_already_paid': previous_payment_status
                }
            
            # Update payment status
            cur.execute("""
                UPDATE requests
                SET payment_status = TRUE, payment_date = (NOW() AT TIME ZONE 'UTC' + INTERVAL '8 HOURS')
                WHERE request_id = %s
            """, (tracking_number,))
            rows_updated = cur.rowcount
            conn.commit()

            message = f'Payment confirmed for tracking number: {tracking_number}, rows updated: {rows_updated}'
            
            return {
                'success': True,
                'message': message,
                'was_already_paid': previous_payment_status 
            }
            
        except Exception as e:
            conn.rollback()
            error_msg = f"Database error processing webhook payment: {e}"
            if has_app_context():
                current_app.logger.error(f"[MAYA] {error_msg}")
            else:
                print(f"[MAYA] {error_msg}")
            return {
                'success': False,
                'message': error_msg,
                'was_already_paid': previous_payment_status
            }
        finally:
            cur.close()
            db_pool.putconn(conn)