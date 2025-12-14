from flask import g
from app import db_pool
import random
from psycopg2 import extras
import os

class Request:
   
    #Dummy function to simulate fetching student data from a Dummy DB called odr: 'students' table
    @staticmethod
    def get_student_data(student_id):
        """
        Fetch student details from the local dummy 'students' table.
        Returns a dictionary with student info or None if not found.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:

            cur.execute("""
                SELECT student_id, full_name, contact_number, email, liability_status, college_code
                FROM students
                WHERE student_id = %s
            """, (student_id,))

            row = cur.fetchone()

            if not row:
                return None

            student_data = {
                "student_id": row[0],
                "full_name": row[1],
                "contact_number": row[2],
                "email": row[3],
                "liability_status": bool(row[4]),
                "college_code": row[5]
            }

            print(f"Fetched student data: {student_data}")  
            return student_data

        except Exception as e:
            print(f"Error fetching student data: {e}")
            return None

        finally:
            cur.close()
            db_pool.putconn(conn)

    #Generate unique request ID
    @staticmethod
    def generate_unique_request_id():
        """
        Generates a unique request ID in the format R0000000.
        Randomly generates numbers and ensures they do not exist in the DB.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            while True:
                # Generate random 7-digit number and prefix with 'R'
                random_number = random.randint(0, 9999999)
                request_id = f"R{random_number:07d}"

                # Check if ID exists in database
                cur.execute("SELECT 1 FROM requests WHERE request_id = %s", (request_id,))
                if not cur.fetchone():  # Unique ID found
                    return request_id

        except Exception as e:
            print(f"Error generating unique request ID: {e}")
            return None

        finally:
            cur.close()
            db_pool.putconn(conn)
            
   #store requested documents to db
    @staticmethod
    def store_requested_documents(request_id, document_ids, quantity_list):
        """
        Stores the requested documents along with their quantities into the request_documents table.
        Deletes all existing documents for the request_id before inserting new ones.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            # Delete all existing documents for this request_id
            cur.execute("""
                DELETE FROM request_documents
                WHERE request_id = %s
            """, (request_id,))

            for doc_id, quantity in zip(document_ids, quantity_list):
                cur.execute("""
                    INSERT INTO request_documents (request_id, doc_id, quantity)
                    VALUES (%s, %s, %s)
                """, (request_id, doc_id, quantity))
            conn.commit()
            return True

        except Exception as e:
            print(f"Error storing requested documents: {e}")
            conn.rollback()
            return False

        finally:
            cur.close()
            db_pool.putconn(conn)



    #fetch requirements needed by document IDs (for UploadRequirements step)
    @staticmethod
    def get_requirements_by_document_ids(document_ids):
        """
        Fetch all unique requirements for selected documents.
        Requirements are deduplicated - same requirement appearing in multiple documents 
        will only appear once in the result.

        Args:
            document_ids (list): List of document IDs

        Returns:
            dict: {"requirements": [{"req_id": "REQ0001", "requirement_name": "Birth Certificate", "doc_names": ["Document 1", "Document 2"]}, ...]}
        """
        if not document_ids:
            return {"requirements": []}

        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            # Create placeholders for the IN clause
            placeholders = ','.join(['%s'] * len(document_ids))
            query = f"""
                SELECT r.req_id, r.requirement_name, STRING_AGG(dl.doc_name, ', ' ORDER BY dl.doc_name) as doc_names
                FROM document_requirements dr
                JOIN requirements r ON dr.req_id = r.req_id
                JOIN documents dl ON dr.doc_id = dl.doc_id
                WHERE dr.doc_id IN ({placeholders})
                GROUP BY r.req_id, r.requirement_name
                ORDER BY r.requirement_name;
            """
            cur.execute(query, tuple(document_ids))
            rows = cur.fetchall()

            # Extract req_id, requirement_name, and doc_names (comma-separated list)
            requirement_list = [
                {
                    "req_id": row[0], 
                    "requirement_name": row[1],
                    "doc_names": row[2].split(', ') if row[2] else []
                } 
                for row in rows
            ] if rows else []
            return {"requirements": requirement_list}

        except Exception as e:
            print(f"Error fetching requirements for documents {document_ids}: {e}")
            return {"requirements": []}

        finally:
            cur.close()
            db_pool.putconn(conn)
            
    @staticmethod
    def store_requirement_files(request_id, requirements):
        """
        Stores requirement files for a request.
        Args:
            request_id (str): The request ID.
            requirements (list of dict): Each dict contains 'requirement_id' and 'file_path'.
        Returns:
            tuple: (success: bool, message: str)
        """
        if not request_id or not requirements or not isinstance(requirements, list):
            return False, "Invalid data provided."

        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            insert_values = []
            for req in requirements:
                requirement_id = req.get("requirement_id")
                file_path = req.get("file_path")
                if not requirement_id or not file_path:
                    continue
                insert_values.append((request_id, requirement_id, file_path))

            if not insert_values:
                return False, "No valid requirement files provided."

            # Bulk insert with ON CONFLICT
            cur.executemany("""
                INSERT INTO request_requirements_links (request_id, requirement_id, file_path)
                VALUES (%s, %s, %s)
                ON CONFLICT (request_id, requirement_id)
                DO UPDATE SET file_path = EXCLUDED.file_path, uploaded_at = NOW()
            """, insert_values)

            conn.commit()
            return True, "Requirement files submitted successfully."

        except Exception as e:
            conn.rollback()
            print(f"Error submitting requirement files: {e}")
            return False, "Failed to submit requirement files."

        finally:
            cur.close()
            db_pool.putconn(conn)
        

    @staticmethod
    def submit_request(request_id, student_id, full_name, contact_number, email, preferred_contact, payment_status, total_cost, college_code, remarks=None, order_type=None):
        """
        Submit a complete request with all student information and details.
        This method consolidates multiple database operations into one transaction.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            # Use INSERT ... ON CONFLICT DO UPDATE for upsert behavior
            cur.execute("""
                INSERT INTO requests (
                    request_id, student_id, full_name, contact_number, email,
                    preferred_contact, payment_status, total_cost, remarks, order_type, status, college_code
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PENDING', %s)
                ON CONFLICT (request_id) DO UPDATE SET
                    student_id = EXCLUDED.student_id,
                    full_name = EXCLUDED.full_name,
                    contact_number = EXCLUDED.contact_number,
                    email = EXCLUDED.email,
                    preferred_contact = EXCLUDED.preferred_contact,
                    payment_status = EXCLUDED.payment_status,
                    total_cost = EXCLUDED.total_cost,
                    remarks = EXCLUDED.remarks,
                    order_type = EXCLUDED.order_type,
                    college_code = EXCLUDED.college_code,
                    status = 'PENDING'
            """, (request_id, student_id, full_name, contact_number, email, 
                  preferred_contact, payment_status, total_cost, remarks, order_type, college_code))
            
            conn.commit()

            print(f"Request {request_id} submitted successfully")
            return True

        except Exception as e:
            print(f"Error submitting request: {e}")
            conn.rollback()
            return False

        finally:
            cur.close()
            db_pool.putconn(conn)


    @staticmethod
    def get_active_requests_by_student(student_id):
        """
        Fetch all active requests for a student (status != 'RELEASED').
        Returns a list of requests with their documents and current status.
        
        Args:
            student_id (str): The student ID to query
            
        Returns:
            list: List of dictionaries containing request details
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:

            # Fetch all active requests for the student
            cur.execute("""
                SELECT 
                    r.request_id,
                    r.status,
                    r.total_cost,
                    r.remarks,
                    r.requested_at,
                    r.college_code,
                    STRING_AGG(
                        CONCAT(dl.doc_name, ' (', rd.quantity, ')'), 
                        ', ' ORDER BY dl.doc_name
                    ) as documents,
                    COUNT(rd.doc_id) as document_count
                FROM requests r
                LEFT JOIN request_documents rd ON r.request_id = rd.request_id
                LEFT JOIN documents dl ON rd.doc_id = dl.doc_id
                WHERE r.student_id = %s AND r.status != 'RELEASED'
                GROUP BY r.request_id, r.status, r.total_cost, r.remarks, r.requested_at, r.college_code
                ORDER BY r.requested_at DESC
            """, (student_id,))
            
            rows = cur.fetchall()
            

            active_requests = []
            for row in rows:
                request_data = {
                    "request_id": row[0],
                    "status": row[1],
                    "total_cost": float(row[2]) if row[2] else 0.0,
                    "remarks": row[3] or "",
                    "requested_at": row[4].strftime("%Y-%m-%d %H:%M:%S") if row[4] else "",
                    "college_code": row[5],
                    "documents": row[6] or "No documents",
                    "document_count": row[7]
                }
                active_requests.append(request_data)
            
            return active_requests
            
        except Exception as e:
            print(f"Error fetching active requests for student {student_id}: {e}")
            return []
            
        finally:
            cur.close()
            db_pool.putconn(conn)
