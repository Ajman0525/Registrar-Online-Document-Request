from flask import g
from app import db_pool

class Tracking:
    @staticmethod
    def get_record_by_tracking_number(tracking_number):
        """
        Fetches a request record from the database using tracking_number.

        Args:
            tracking_number (str): The request_id of the record.

        Returns:
            dict: A dictionary containing the tracking data if found, otherwise None.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            # Query to get the main request details
            cur.execute("""
                SELECT status, total_cost, contact_number, payment_status, order_type, remarks
                FROM requests
                WHERE request_id = %s
            """, (tracking_number,))

            record = cur.fetchone()

            if not record:
                return None

            # Fetch admin fee from DB
            cur.execute("SELECT value FROM fee WHERE key = 'admin_fee'")
            fee_res = cur.fetchone()
            admin_fee = float(fee_res[0]) if fee_res else 0.0

            # Map database columns to frontend keys
            tracking_data = {
                "status": record[0],
                "amountDue": (float(record[1]) if record[1] is not None else 0.0) + admin_fee,
                "contact_number": record[2],
                "paymentStatus": record[3],
                "orderType": record[4],
                "remarks": record[5],
                "trackingNumber": tracking_number,
                "studentId": record[5],
            }
            
            return tracking_data

        except Exception as e:
            print(f"Error fetching tracking data: {e}")
            return None
        finally:
            cur.close()
            db_pool.putconn(conn)

    @staticmethod
    def get_requested_documents(tracking_number):
        """
        Fetches the requested documents for a given tracking number.


        Args:
            tracking_number (str): The request_id of the record.
        Returns:
            list: A list of dictionaries containing document details (name, quantity) if found, otherwise None.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()


        try:
            # Query to get the requested documents with names and quantities
            print(f"Fetching documents for tracking number: {tracking_number}")

            cur.execute("""
                SELECT d.doc_name, rd.quantity
                FROM request_documents rd
                JOIN documents d ON rd.doc_id = d.doc_id
                WHERE rd.request_id = %s
            """, (tracking_number,))


            records = cur.fetchall()

            print(f"Fetched records for documents: {records}")

            if not records:
                return None


            # Map to list of dicts
            documents = [
                {
                    "name": record[0],
                    "quantity": record[1]
                }
                for record in records
            ]

            return documents
        
        except Exception as e:
            print(f"Error fetching tracking data: {e}")
            return None
        finally:
            cur.close()
            db_pool.putconn(conn)

    @staticmethod
    def update_payment_status(tracking_number, student_id):
        """
        Updates the payment_status of a request to TRUE.

        Args:
            tracking_number (str): The request_id of the record.
            student_id (str): The student_id to validate ownership.

        Returns:
            bool: True if the update was successful, False otherwise.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            cur.execute("""
                UPDATE requests
                SET payment_status = TRUE
                WHERE request_id = %s AND student_id = %s
            """, (tracking_number, student_id))
            conn.commit()
            return cur.rowcount > 0  # Returns True if a row was updated
        except Exception as e:
            print(f"Error updating payment status: {e}")
            conn.rollback()
            return False
        finally:
            cur.close()
            db_pool.putconn(conn)

    @staticmethod
    def set_order_type(request_id, order_type):
        """
        Sets the order_type for a request.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            cur.execute("""
                UPDATE requests
                SET order_type = %s
                WHERE request_id = %s
            """, (order_type, request_id))
            conn.commit()
            return True

        except Exception as e:
            print(f"Error setting order type: {e}")
            conn.rollback()
            return False

        finally:
            cur.close()
            db_pool.putconn(conn)

    @staticmethod
    def get_student_id_by_tracking_number(tracking_number):
        """
        Fetches the student_id associated with a tracking number.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            cur.execute("SELECT student_id FROM requests WHERE request_id = %s", (tracking_number,))
            row = cur.fetchone()
            return row[0] if row else None
        except Exception as e:
            print(f"Error fetching student_id: {e}")
            return None
        finally:
            cur.close()
            db_pool.putconn(conn)
