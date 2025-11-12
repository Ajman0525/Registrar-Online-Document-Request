from flask import g
from app import db_pool

class Tracking:
    @staticmethod
    def get_record_by_ids(tracking_number, student_id):
        """
        Fetches a request record from the database using tracking_number and student_id.

        Args:
            tracking_number (str): The request_id of the record.
            student_id (str): The student_id associated with the request.

        Returns:
            dict: A dictionary containing the tracking data if found, otherwise None.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            # Query to get the main request details
            cur.execute("""
                SELECT status, total_cost
                FROM requests
                WHERE request_id = %s AND student_id = %s
            """, (tracking_number, student_id))

            record = cur.fetchone()

            if not record:
                return None

            # Map database columns to frontend keys
            tracking_data = {
                "status": record[0],
                "amountDue": float(record[1]) if record[1] is not None else 0.0,
                "trackingNumber": tracking_number,
                "studentId": student_id,
            }
            
            return tracking_data

        except Exception as e:
            print(f"Error fetching tracking data: {e}")
            return None
        finally:
            cur.close()
            db_pool.putconn(conn)