from flask import g
from app import db_pool


class DashboardModel:
    @staticmethod
    def get_stats():
        """Fetch dashboard statistics from the database."""
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            # Total Requests
            cur.execute("SELECT COUNT(*) FROM requests")
            total_requests = cur.fetchone()[0]


            # Pending Requests (SUBMITTED, PENDING, IN-PROGRESS)
            cur.execute("SELECT COUNT(*) FROM requests WHERE status IN ('SUBMITTED', 'PENDING', 'IN-PROGRESS')")
            pending_requests = cur.fetchone()[0]


            # Unpaid Requests (payment_status = FALSE)
            cur.execute("SELECT SUM(total_cost) FROM requests WHERE payment_status = FALSE")
            unpaid_amount = cur.fetchone()[0] or 0


            # Documents Ready (DOC-READY)
            cur.execute("SELECT COUNT(*) FROM requests WHERE status = 'DOC-READY'")
            documents_ready = cur.fetchone()[0]


            return {
                "total_requests": total_requests,
                "pending_requests": pending_requests,
                "unpaid_requests": unpaid_amount,
                "documents_ready": documents_ready
            }
        finally:
            cur.close()
            db_pool.putconn(conn)

    @staticmethod
    def calculate_percentage_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        
        change = ((current - previous) / previous) * 100
        return round(change, 2)

    @staticmethod
    def get_notifications():
        """Fetch recent notifications based on request statuses."""
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            notifications = []


            # New Requests (SUBMITTED)
            cur.execute("""
                SELECT request_id, full_name, requested_at
                FROM requests
                WHERE status = 'SUBMITTED'
                ORDER BY requested_at DESC
                LIMIT 5
            """)
            new_requests = cur.fetchall()
            for req in new_requests:
                notifications.append({
                    "id": req[0],
                    "type": "New Request",
                    "message": f"Request #{req[0]} submitted by {req[1]}.",
                    "time": req[2].strftime("%H:%M %d/%m/%Y") if req[2] else "Unknown"
                })


            # Payment Due (unpaid)
            cur.execute("""
                SELECT request_id, full_name, total_cost
                FROM requests
                WHERE payment_status = FALSE AND total_cost > 0
                ORDER BY requested_at DESC
                LIMIT 5
            """)
            unpaid_requests = cur.fetchall()
            for req in unpaid_requests:
                notifications.append({
                    "id": req[0],
                    "type": "Payment Due",
                    "message": f"Payment due for Request #{req[0]} by {req[1]}, amount: ₱{req[2]}.",
                    "time": "Pending"
                })


            # Document Ready (DOC-READY)
            cur.execute("""
                SELECT request_id, full_name, completed_at
                FROM requests
                WHERE status = 'DOC-READY'
                ORDER BY completed_at DESC
                LIMIT 5
            """)
            ready_docs = cur.fetchall()
            for req in ready_docs:
                notifications.append({
                    "id": req[0],
                    "type": "Document Ready",
                    "message": f"Document for Request #{req[0]} by {req[1]} is ready.",
                    "time": req[2].strftime("%H:%M %d/%m/%Y") if req[2] else "Unknown"
                })


            # Sort notifications by time (most recent first)
            notifications.sort(key=lambda x: x["time"], reverse=True)
            return notifications[:10]  # Limit to 10
        finally:
            cur.close()
            db_pool.putconn(conn)


    @staticmethod
    def get_recent_activity():
        """Fetch recent activity (last 10 requests)."""
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT request_id, full_name, status, requested_at
                FROM requests
                ORDER BY requested_at DESC
                LIMIT 10
            """)
            activities = cur.fetchall()
            return [
                {
                    "request_id": act[0],
                    "full_name": act[1],
                    "status": act[2],
                    "requested_at": act[3].strftime("%H:%M %d/%m/%Y") if act[3] else "Unknown"
                }
                for act in activities
            ]
        finally:
            cur.close()
            db_pool.putconn(conn)