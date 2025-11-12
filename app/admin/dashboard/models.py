from flask import g
from app import db_pool
from datetime import datetime, timedelta


class DashboardModel:
    @staticmethod
    def get_stats():
        """Fetch dashboard statistics with percentage comparisons."""
        conn = db_pool.getconn()
        cur = conn.cursor()
        try:
            # Calculate date ranges for comparison
            now = datetime.now()
            
            # Current month: from 1st of this month to now
            current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Previous month: calculate the first day of last month
            if now.month == 1:
                last_month_start = now.replace(year=now.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
            else:
                last_month_start = now.replace(month=now.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # ============================================
            # ALL-TIME DATA (for display values)
            # ============================================
            
            # Total Requests (ALL TIME)
            cur.execute("SELECT COUNT(*) FROM requests")
            total_requests = cur.fetchone()[0]

            # Pending Requests (ALL TIME - current status)
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status IN ('SUBMITTED', 'PENDING', 'IN-PROGRESS')
            """)
            pending_requests = cur.fetchone()[0]

            # Unpaid Requests (ALL TIME - current unpaid)
            cur.execute("""
                SELECT COALESCE(SUM(total_cost), 0) FROM requests 
                WHERE payment_status = FALSE
            """)
            unpaid_amount = cur.fetchone()[0] or 0

            # Documents Ready (ALL TIME - current status)
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status = 'DOC-READY'
            """)
            documents_ready = cur.fetchone()[0]
            
            # ============================================
            # CURRENT MONTH DATA (for percentage comparison)
            # ============================================
            
            # Total Requests added this month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE requested_at >= %s
            """, (current_month_start,))
            current_month_total = cur.fetchone()[0]

            # Pending Requests added this month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status IN ('SUBMITTED', 'PENDING', 'IN-PROGRESS')
                AND requested_at >= %s
            """, (current_month_start,))
            current_month_pending = cur.fetchone()[0]

            # Unpaid amount from requests this month
            cur.execute("""
                SELECT COALESCE(SUM(total_cost), 0) FROM requests 
                WHERE payment_status = FALSE
                AND requested_at >= %s
            """, (current_month_start,))
            current_month_unpaid = cur.fetchone()[0] or 0

            # Documents ready from this month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status = 'DOC-READY'
                AND requested_at >= %s
            """, (current_month_start,))
            current_month_ready = cur.fetchone()[0]

            # ============================================
            # PREVIOUS MONTH DATA (for percentage comparison)
            # ============================================
            
            # Total Requests added last month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE requested_at >= %s 
                AND requested_at < %s
            """, (last_month_start, current_month_start))
            prev_month_total = cur.fetchone()[0]

            # Pending Requests added last month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status IN ('SUBMITTED', 'PENDING', 'IN-PROGRESS')
                AND requested_at >= %s 
                AND requested_at < %s
            """, (last_month_start, current_month_start))
            prev_month_pending = cur.fetchone()[0]

            # Unpaid amount from last month
            cur.execute("""
                SELECT COALESCE(SUM(total_cost), 0) FROM requests 
                WHERE payment_status = FALSE
                AND requested_at >= %s 
                AND requested_at < %s
            """, (last_month_start, current_month_start))
            prev_month_unpaid = cur.fetchone()[0] or 0

            # Documents ready from last month
            cur.execute("""
                SELECT COUNT(*) FROM requests 
                WHERE status = 'DOC-READY'
                AND requested_at >= %s 
                AND requested_at < %s
            """, (last_month_start, current_month_start))
            prev_month_ready = cur.fetchone()[0]

            # ============================================
            # CALCULATE PERCENTAGE CHANGES
            # ============================================
            
            total_pct = DashboardModel.calculate_percentage_change(
                current_month_total, prev_month_total
            )
            pending_pct = DashboardModel.calculate_percentage_change(
                current_month_pending, prev_month_pending
            )
            unpaid_pct = DashboardModel.calculate_percentage_change(
                current_month_unpaid, prev_month_unpaid
            )
            ready_pct = DashboardModel.calculate_percentage_change(
                current_month_ready, prev_month_ready
            )

            # ============================================
            # RETURN COMPLETE STATS WITH PERCENTAGES
            # ============================================
            
            return {
                # Total Requests - ALL TIME VALUE with monthly comparison
                "total_requests": total_requests,
                "total_requests_percentage": abs(total_pct),
                "total_requests_trend": "up" if total_pct >= 0 else "down",
                
                # Pending Requests - CURRENT STATUS with monthly comparison
                "pending_requests": pending_requests,
                "pending_requests_percentage": abs(pending_pct),
                "pending_requests_trend": "up" if pending_pct >= 0 else "down",
                
                # Unpaid Requests - CURRENT UNPAID with monthly comparison
                "unpaid_requests": float(unpaid_amount),
                "unpaid_requests_percentage": abs(unpaid_pct),
                "unpaid_requests_trend": "up" if unpaid_pct >= 0 else "down",
                
                # Documents Ready - CURRENT STATUS with monthly comparison
                "documents_ready": documents_ready,
                "documents_ready_percentage": abs(ready_pct),
                "documents_ready_trend": "up" if ready_pct >= 0 else "down",
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