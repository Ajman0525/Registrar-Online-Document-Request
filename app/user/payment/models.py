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
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            # Verify the amount matches and validate student_id
            cur.execute("""
                SELECT total_cost, payment_status, student_id
                FROM requests
                WHERE request_id = %s AND student_id = %s
            """, (tracking_number, student_id))
            
            order = cur.fetchone()
            
            if not order:
                return {
                    'success': False,
                    'message': f'Order not found for tracking number: {tracking_number} with student_id: {student_id}'
                }
            
            expected_amount = float(order[0]) if order[0] else 0.0
            received_amount = float(amount) if amount else 0.0
            db_student_id = order[2]
            
            # Validate student_id matches
            if db_student_id != student_id:
                return {
                    'success': False,
                    'message': f'Student ID mismatch for tracking number: {tracking_number}'
                }
            
            if received_amount != expected_amount:
                return {
                    'success': False,
                    'message': f'Payment amount mismatch: expected {expected_amount}, received {received_amount}'
                }
            
            # Update payment status and status
            cur.execute("""
                UPDATE requests
                SET payment_status = TRUE,
                    status = 'DOC-READY'
                WHERE request_id = %s AND student_id = %s
            """, (tracking_number, student_id))
            conn.commit()
            
            return {
                'success': True,
                'message': f'Payment confirmed for tracking number: {tracking_number}'
            }
            
        except Exception as e:
            conn.rollback()
            error_msg = f"Database error processing webhook payment: {e}"
            if has_app_context():
                current_app.logger.error(error_msg)
            else:
                print(error_msg)
            return {
                'success': False,
                'message': error_msg
            }
        finally:
            cur.close()
            db_pool.putconn(conn)