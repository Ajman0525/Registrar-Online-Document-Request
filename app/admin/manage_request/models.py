from flask import g
from collections import defaultdict

class ManageRequestModel:
    @staticmethod
    def fetch_requests(page=1, limit=20, search=None, admin_id=None):
        """
        Fetch paginated requests with full details.
        If admin_id is provided, only fetch requests assigned to that admin.
        """
        conn = g.db_conn
        cur = conn.cursor()
        try:
            offset = (page - 1) * limit

            # --------------------------
            # 1. Base query
            # --------------------------
            params = []
            where_clauses = []

            if admin_id:
                where_clauses.append("ra.admin_id = %s")
                params.append(admin_id)

            if search:
                where_clauses.append("(r.full_name ILIKE %s OR r.student_id ILIKE %s OR r.email ILIKE %s OR r.contact_number ILIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param] * 4)

            where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

            # --------------------------
            # 2. Fetch paginated requests
            # --------------------------
            if admin_id:
                join_assignments = "JOIN request_assignments ra ON r.request_id = ra.request_id"
            else:
                join_assignments = ""

            cur.execute(f"""
                SELECT r.request_id, r.student_id, r.full_name, r.contact_number, r.email,
                       r.preferred_contact, r.status, r.requested_at,r.remarks,
                       r.total_cost, r.payment_status
                FROM requests r
                {join_assignments}
                {where_sql}
                ORDER BY r.requested_at DESC
                LIMIT %s OFFSET %s
            """, params + [limit, offset])
            rows = cur.fetchall()

            if not rows:
                return {"requests": [], "total": 0}

            request_ids = [r[0] for r in rows]
            placeholders = ','.join(['%s'] * len(request_ids))

            # --------------------------
            # 3. Total count
            # --------------------------
            cur.execute(f"""
                SELECT COUNT(*)
                FROM requests r
                {join_assignments}
                {where_sql}
            """, params)
            total_count = cur.fetchone()[0]

            # --------------------------
            # 4. Bulk fetch documents
            # --------------------------
            cur.execute(f"""
                SELECT rd.request_id, d.doc_name, rd.quantity, d.cost
                FROM request_documents rd
                JOIN documents d ON rd.doc_id = d.doc_id
                WHERE rd.request_id IN ({placeholders})
            """, request_ids)
            docs_map = defaultdict(list)
            for rid, name, qty, cost in cur.fetchall():
                docs_map[rid].append({"name": name, "quantity": qty, "cost": cost})

            # --------------------------
            # 5. Bulk fetch requirements
            # --------------------------
            cur.execute(f"""
                SELECT rd.request_id, r.requirement_name
                FROM request_documents rd
                JOIN document_requirements dr ON rd.doc_id = dr.doc_id
                JOIN requirements r ON dr.req_id = r.req_id
                WHERE rd.request_id IN ({placeholders})
            """, request_ids)
            reqs_map = defaultdict(list)
            for rid, req_name in cur.fetchall():
                reqs_map[rid].append(req_name)

            # --------------------------
            # 6. Bulk fetch uploaded files
            # --------------------------
            cur.execute(f"""
                SELECT rrl.request_id, r.requirement_name, rrl.file_path
                FROM request_requirements_links rrl
                JOIN requirements r ON rrl.requirement_id = r.req_id
                WHERE rrl.request_id IN ({placeholders})
            """, request_ids)
            files_map = defaultdict(list)
            for rid, req_name, path in cur.fetchall():
                files_map[rid].append({"requirement": req_name, "file_path": path})

            # --------------------------
            # 7. Bulk fetch recent logs
            # --------------------------
            cur.execute(f"""
                SELECT DISTINCT ON (request_id) request_id, admin_id, action, details, timestamp
                FROM logs
                WHERE request_id IN ({placeholders})
                ORDER BY request_id, timestamp DESC
            """, request_ids)
            logs_map = {}
            for rid, log_admin, action, details, ts in cur.fetchall():
                logs_map[rid] = {
                    "admin_id": log_admin,
                    "action": action,
                    "details": details,
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S") if ts else None
                }

            # --------------------------
            # 8. Assemble results
            # --------------------------
            results = []
            for r in rows:
                rid = r[0]
                results.append({
                    "request_id": rid,
                    "student_id": r[1],
                    "full_name": r[2],
                    "contact_number": r[3],
                    "email": r[4],
                    "preferred_contact": r[5],
                    "status": r[6],
                    "requested_at": r[7].strftime("%Y-%m-%d %H:%M:%S") if r[7] else None,
                    "remarks": r[8],
                    "total_cost": r[9],
                    "payment_status": r[10],
                    "documents": docs_map[rid],
                    "requirements": reqs_map[rid],
                    "uploaded_files": files_map[rid],
                    "recent_log": logs_map.get(rid)
                })

            return {"requests": results, "total": total_count}
        finally:
            cur.close()

    @staticmethod
    def update_request_status(request_id, new_status, admin_id=None, payment_status=None):
        """Update the status of a specific request and log the change."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            if payment_status is not None:
                cur.execute("""
                    UPDATE requests
                    SET status = %s, payment_status = %s
                    WHERE request_id = %s
                """, (new_status, payment_status, request_id))
            else:
                cur.execute("""
                    UPDATE requests
                    SET status = %s
                    WHERE request_id = %s
                """, (new_status, request_id))

            if cur.rowcount > 0 and admin_id:
                # Log the status change
                cur.execute("""
                    INSERT INTO logs (admin_id, action, details, request_id)
                    VALUES (%s, %s, %s, %s)
                """, (admin_id, 'Status Change', f'Changed status of request {request_id} to {new_status}', request_id))
                conn.commit()
                return True
            elif cur.rowcount > 0:
                conn.commit()
                return True
            return False
        finally:
            cur.close()

    @staticmethod
    def get_recent_logs_for_request(request_id, limit=1):
        """Get the most recent log entries for a specific request."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT admin_id, action, details, timestamp, request_id
                FROM logs
                WHERE request_id = %s
                ORDER BY timestamp DESC
                LIMIT %s
            """, (request_id, limit))
            logs = cur.fetchall()
            return [
                {
                    "admin_id": log[0],
                    "action": log[1],
                    "details": log[2],
                    "timestamp": log[3].strftime("%Y-%m-%d %H:%M:%S") if log[3] else None
                }
                for log in logs
            ]
        finally:
            cur.close()

    @staticmethod
    def assign_request_to_admin(request_id, admin_id, assigner_admin_id):
        """Assign a request to an admin, respecting max_requests limit."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            # Check if the admin is already at max capacity
            cur.execute("""
                SELECT COUNT(*)
                FROM request_assignments
                WHERE admin_id = %s
            """, (admin_id,))
            current_assigned = cur.fetchone()[0]

            # Get max_requests for the admin
            max_requests = ManageRequestModel.get_admin_max_requests(admin_id)

            if current_assigned >= max_requests:
                print(f"Admin {admin_id} is already at max capacity ({max_requests})")
                return False  # Cannot assign more

            cur.execute("""
                INSERT INTO request_assignments (request_id, admin_id)
                VALUES (%s, %s)
                ON CONFLICT (request_id) DO UPDATE SET admin_id = EXCLUDED.admin_id, assigned_at = NOW()
            """, (request_id, admin_id))
            # Log the assignment
            cur.execute("""
                INSERT INTO logs (admin_id, action, details, request_id)
                VALUES (%s, %s, %s, %s)
            """, (assigner_admin_id, 'Request Assignment', f'Assigned request {request_id} to admin {admin_id}', request_id))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error assigning request {request_id} to admin {admin_id}: {e}")
            return False
        finally:
            cur.close()

    @staticmethod
    def auto_assign_requests_load_balanced(n, assigner_admin_id):
        """Auto-assign the next N unassigned PENDING requests to admins using load balancing."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            # Get all admins with their current load and max_requests
            cur.execute("""
                SELECT a.email,
                       COALESCE(asp.value::int, 10) as max_requests,
                       COALESCE(assigned.count, 0) as current_assigned
                FROM admins a
                LEFT JOIN admin_settings asp ON a.email = asp.admin_id AND asp.key = 'max_requests'
                LEFT JOIN (
                    SELECT admin_id, COUNT(*) as count
                    FROM request_assignments
                    GROUP BY admin_id
                ) assigned ON a.email = assigned.admin_id
                WHERE a.role != 'none'
                ORDER BY a.email
            """)
            admins = cur.fetchall()

            # Calculate available capacity for each admin
            admin_capacities = []
            for admin in admins:
                admin_id, max_requests, current_assigned = admin
                available = max_requests - current_assigned
                if available > 0:
                    admin_capacities.append((admin_id, available))

            if not admin_capacities:
                return 0  # No admins with available capacity

            # Get the next N unassigned PENDING requests
            cur.execute("""
                SELECT request_id
                FROM requests
                WHERE status = 'PENDING'
                AND request_id NOT IN (SELECT request_id FROM request_assignments)
                ORDER BY requested_at ASC
                LIMIT %s
            """, (n,))
            unassigned_requests = cur.fetchall()

            if not unassigned_requests:
                return 0  # No requests to assign

            # Distribute requests using round-robin load balancing
            assigned_count = 0
            request_index = 0
            admin_index = 0

            while assigned_count < len(unassigned_requests) and admin_capacities:
                admin_id, available = admin_capacities[admin_index % len(admin_capacities)]

                # Assign one request to this admin if they have capacity
                if available > 0:
                    req_id = unassigned_requests[request_index][0]
                    cur.execute("""
                        INSERT INTO request_assignments (request_id, admin_id)
                        VALUES (%s, %s)
                    """, (req_id, admin_id))
                    # Log the assignment
                    cur.execute("""
                        INSERT INTO logs (admin_id, action, details, request_id)
                        VALUES (%s, %s, %s, %s)
                    """, (assigner_admin_id, 'Request Assignment', f'Auto-assigned request {req_id} to admin {admin_id}', req_id))

                    assigned_count += 1
                    request_index += 1
                    # Reduce available capacity
                    admin_capacities[admin_index % len(admin_capacities)] = (admin_id, available - 1)

                admin_index += 1

                # Remove admins with no capacity left
                admin_capacities = [(aid, av) for aid, av in admin_capacities if av > 0]

            conn.commit()
            return assigned_count
        except Exception as e:
            conn.rollback()
            print(f"Error auto-assigning requests with load balancing: {e}")
            return 0
        finally:
            cur.close()



    @staticmethod
    def get_assigned_requests_for_admin(admin_id):
        """Get all requests assigned to an admin with completion status."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT r.request_id, r.full_name, r.status, ra.assigned_at
                FROM requests r
                JOIN request_assignments ra ON r.request_id = ra.request_id
                WHERE ra.admin_id = %s
                ORDER BY ra.assigned_at DESC
            """, (admin_id,))
            assigned_requests = cur.fetchall()

            result = []
            for req in assigned_requests:
                result.append({
                    "request_id": req[0],
                    "full_name": req[1],
                    "status": req[2],
                    "assigned_at": req[3].strftime("%Y-%m-%d %H:%M:%S") if req[3] else None
                })

            return result
        finally:
            cur.close()

    @staticmethod
    def get_assignment_progress(admin_id):
        """Get progress: completed (DOC-READY) vs total assigned."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            # Total assigned
            cur.execute("""
                SELECT COUNT(*)
                FROM request_assignments
                WHERE admin_id = %s
            """, (admin_id,))
            total_assigned = cur.fetchone()[0]

            # Completed (DOC-READY)
            cur.execute("""
                SELECT COUNT(*)
                FROM requests r
                JOIN request_assignments ra ON r.request_id = ra.request_id
                WHERE ra.admin_id = %s AND r.status = 'DOC-READY'
            """, (admin_id,))
            completed = cur.fetchone()[0]

            return {"completed": completed, "total": total_assigned}
        finally:
            cur.close()

    @staticmethod
    def is_assigned(request_id):
        """Check if a request is assigned."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT COUNT(*)
                FROM request_assignments
                WHERE request_id = %s
            """, (request_id,))
            count = cur.fetchone()[0]
            return count > 0
        finally:
            cur.close()

    @staticmethod
    def delete_request(request_id, admin_id):
        """Delete a request and all associated data, and log the deletion."""
        from supabase import create_client, Client
        from config import SUPABASE_URL, SUPABASE_ANON_KEY

        conn = g.db_conn
        cur = conn.cursor()
        try:
            # First, get all uploaded files for this request to delete from Supabase
            cur.execute("""
                SELECT file_path
                FROM request_requirements_links
                WHERE request_id = %s
            """, (request_id,))
            files = cur.fetchall()

            # Delete files from Supabase
            if files:
                supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
                file_paths_to_delete = []
                for file_row in files:
                    file_path = file_row[0]
                    if 'requirements-odr/' in file_path:
                        file_path_in_bucket = file_path.split('requirements-odr/')[1]
                        file_paths_to_delete.append(file_path_in_bucket)

                if file_paths_to_delete:
                    try:
                        supabase.storage.from_('requirements-odr').remove(file_paths_to_delete)
                    except Exception as e:
                        print(f"Error deleting files from Supabase: {e}")
                        # Continue with DB deletion even if Supabase fails

            # Log the deletion
            cur.execute("""
                INSERT INTO logs (admin_id, action, details, request_id)
                VALUES (%s, %s, %s, %s)
            """, (admin_id, 'Request Deletion', f'Deleted request {request_id} and all associated data', request_id))

            # Delete request_requirements_links (cascades to request_documents and requests due to FK constraints)
            cur.execute("""
                DELETE FROM request_requirements_links
                WHERE request_id = %s
            """, (request_id,))

            # Delete request_documents
            cur.execute("""
                DELETE FROM request_documents
                WHERE request_id = %s
            """, (request_id,))

            # Finally, delete the request itself
            cur.execute("""
                DELETE FROM requests
                WHERE request_id = %s
            """, (request_id,))

            conn.commit()
            return cur.rowcount > 0  # Return True if at least one row was deleted
        except Exception as e:
            conn.rollback()
            print(f"Error deleting request {request_id}: {e}")
            return False
        finally:
            cur.close()




    @staticmethod
    def get_admin_max_requests(admin_id):
        """Get the max requests for a specific admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT value FROM admin_settings WHERE admin_id = %s AND key = 'max_requests'", (admin_id,))
            row = cur.fetchone()
            return int(row[0]) if row else 10
        finally:
            cur.close()

    @staticmethod
    def set_admin_max_requests(admin_id, max_requests):
        """Set the max requests for a specific admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO admin_settings (admin_id, key, value)
                VALUES (%s, 'max_requests', %s)
                ON CONFLICT (admin_id, key) DO UPDATE SET value = EXCLUDED.value
            """, (admin_id, str(max_requests)))
            conn.commit()
        finally:
            cur.close()

    @staticmethod
    def get_request_by_id(request_id):
        """Fetch a single request by ID with all details."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT request_id, student_id, full_name, contact_number, email, preferred_contact, status, requested_at, remarks, total_cost, payment_status
                FROM requests
                WHERE request_id = %s
            """, (request_id,))
            req = cur.fetchone()

            if not req:
                return None

            request_data = {
                "request_id": req[0],
                "student_id": req[1],
                "full_name": req[2],
                "contact_number": req[3],
                "email": req[4],
                "preferred_contact": req[5],
                "status": req[6],
                "requested_at": req[7].strftime("%Y-%m-%d %H:%M:%S") if req[7] else None,
                "remarks": req[8],
                "total_cost": req[9],
                "payment_status": req[10]
            }

            # Fetch requested documents with cost
            cur.execute("""
                SELECT d.doc_name, rd.quantity, d.cost
                FROM request_documents rd
                JOIN documents d ON rd.doc_id = d.doc_id
                WHERE rd.request_id = %s
            """, (request_id,))
            docs = cur.fetchall()
            request_data["documents"] = [{"name": doc[0], "quantity": doc[1], "cost": doc[2]} for doc in docs]

            # Fetch requirements
            cur.execute("""
                SELECT DISTINCT r.requirement_name
                FROM request_documents rd
                JOIN document_requirements dr ON rd.doc_id = dr.doc_id
                JOIN requirements r ON dr.req_id = r.req_id
                WHERE rd.request_id = %s
            """, (request_id,))
            reqs = cur.fetchall()
            request_data["requirements"] = [req[0] for req in reqs]

            # Fetch uploaded files
            cur.execute("""
                SELECT r.requirement_name, rrl.file_path
                FROM request_requirements_links rrl
                JOIN requirements r ON rrl.requirement_id = r.req_id
                WHERE rrl.request_id = %s
            """, (request_id,))
            files = cur.fetchall()
            request_data["uploaded_files"] = [{"requirement": file[0], "file_path": file[1]} for file in files]

            # Fetch recent logs
            recent_logs = ManageRequestModel.get_recent_logs_for_request(request_id, limit=1)
            request_data["recent_log"] = recent_logs[0] if recent_logs else None

            return request_data
        finally:
            cur.close()

    @staticmethod
    def unassign_request_from_admin(request_id, admin_id):
        """Unassign a request from an admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                DELETE FROM request_assignments
                WHERE request_id = %s AND admin_id = %s
            """, (request_id, admin_id))
            conn.commit()
            return cur.rowcount > 0  # Return True if a row was deleted
        except Exception as e:
            conn.rollback()
            print(f"Error unassigning request {request_id} from admin {admin_id}: {e}")
            return False
        finally:
            cur.close()
