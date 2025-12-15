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
                SELECT status, total_cost, contact_number, payment_status, order_type, remarks, student_id
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

            # Check if any docs are already paid to decide on admin fee inclusion
            cur.execute("SELECT COUNT(*) FROM request_documents WHERE request_id = %s AND payment_status = TRUE", (tracking_number,))
            paid_docs_count = cur.fetchone()[0]
            include_admin_fee = (paid_docs_count == 0)

            # Calculate amounts based on unpaid documents
            cur.execute("""
                SELECT d.cost, rd.quantity, d.requires_payment_first, rd.payment_status
                FROM request_documents rd
                JOIN documents d ON rd.doc_id = d.doc_id
                WHERE rd.request_id = %s
            """, (tracking_number,))
            
            docs = cur.fetchall()
            total_unpaid = sum(float(d[0]) * d[1] for d in docs if not d[3])
            required_unpaid = sum(float(d[0]) * d[1] for d in docs if not d[3] and d[2])

            amount_due = total_unpaid + (admin_fee if include_admin_fee else 0.0)
            min_amount_due = required_unpaid + (admin_fee if include_admin_fee else 0.0)

            # Map database columns to frontend keys
            tracking_data = {
                "status": record[0],
                "amountDue": amount_due,
                "minimumAmountDue": min_amount_due,
                "contact_number": record[2],
                "paymentStatus": record[3],
                "orderType": record[4],
                "remarks": record[5],
                "trackingNumber": tracking_number,
                "studentId": record[6],
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
                SELECT d.doc_name, rd.quantity, d.cost, d.requires_payment_first, rd.payment_status
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
                    "quantity": record[1],
                    "cost": float(record[2]),
                    "requires_payment_first": record[3],
                    "payment_status": record[4]
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
