from flask import g
from app import db_pool
import random

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
                SELECT student_id, full_name, contact_number, email, liability_status
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
                "liability_status": bool(row[4])
            }

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
            
   #store request_id and student_id to db
   @staticmethod
   def store_request(request_id, student_id):
        """
        Stores the request_id and student_id into the requests table.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            cur.execute("""
                INSERT INTO requests (request_id, student_id)
                VALUES (%s, %s)
            """, (request_id, student_id))
            conn.commit()
            return True

        except Exception as e:
            print(f"Error storing request data: {e}")
            conn.rollback()
            return False

        finally:
            cur.close()
            db_pool.putconn(conn)
            
   #store student full name, contact number, email to db
   @staticmethod
   def store_student_info(student_id, full_name, contact_number, email): 
         """
         Stores or updates the student's full name, contact number, and email in the students table.
         """
         conn = db_pool.getconn()
         cur = conn.cursor()
   
         try:
               cur.execute("""
                  INSERT INTO students (student_id, full_name, contact_number, email)
                  VALUES (%s, %s, %s, %s)
                  ON CONFLICT (student_id) DO UPDATE
                  SET full_name = EXCLUDED.full_name,
                     contact_number = EXCLUDED.contact_number,
                     email = EXCLUDED.email
               """, (student_id, full_name, contact_number, email))
               conn.commit()
               return True
   
         except Exception as e:
               print(f"Error storing student info: {e}")
               conn.rollback()
               return False
   
         finally:
               cur.close()
               db_pool.putconn(conn)      
   
   #store requested documents to db
   @staticmethod
   def store_requested_documents(request_id, document_ids, quantity_list):
        """
        Stores the requested documents along with their quantities into the request_documents table.
        """
        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
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
   
   #fetch requirements needed by request id      
   @staticmethod
   def get_requirements_by_request_id(request_id):
        """
        Fetch all unique requirements for the documents in a given request.
        
        Args:
            request_id (str): The request ID (e.g., "R0000123")
        
        Returns:
            dict: {"requirements": [<requirement names>]}
        """
        if not request_id:
            return {"requirements": []}

        conn = db_pool.getconn()
        cur = conn.cursor()

        try:
            query = """
                SELECT DISTINCT r.requirement_name
                FROM request_documents rd
                JOIN document_requirements dr ON rd.doc_id = dr.doc_id
                JOIN requirements r ON dr.req_id = r.req_id
                WHERE rd.request_id = %s
                ORDER BY r.requirement_name;
            """
            cur.execute(query, (request_id,))
            rows = cur.fetchall()

            # Extract just the requirement names
            requirement_list = [row[0] for row in rows] if rows else []
            return {"requirements": requirement_list}

        except Exception as e:
            print(f"Error fetching requirements for request {request_id}: {e}")
            return {"requirements": []}

        finally:
            cur.close()
            db_pool.putconn(conn)
