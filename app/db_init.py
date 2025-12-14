import psycopg2
from psycopg2 import sql, extras
from config import DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT
from dotenv import load_dotenv
import datetime




def create_database():
   """Connects to the default 'postgres' DB and creates DB_NAME if it doesn't exist."""
   load_dotenv('.env')
   conn = psycopg2.connect(
       dbname=DB_NAME,  # connect to default DB first
       user=DB_USERNAME,
       password=DB_PASSWORD,
       host=DB_HOST,
       port=DB_PORT
   )
   conn.autocommit = True
   cur = conn.cursor()


   cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (DB_NAME,))
   exists = cur.fetchone()


   if not exists:
       cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
       print(f"Database '{DB_NAME}' created.")
   else:
       print(f"Database '{DB_NAME}' already exists.")


   cur.close()
   conn.close()




def get_connection():
   """Connect to the target database."""
   return psycopg2.connect(
       dbname=DB_NAME,
       user=DB_USERNAME,
       password=DB_PASSWORD,
       host=DB_HOST,
       port=DB_PORT
   )




def execute_query(query, params=None):
   """Helper to execute a single query safely."""
   conn = get_connection()
   cur = conn.cursor()
   try:
       cur.execute(query, params)
       conn.commit()
   except Exception as e:
       print(f"Error executing query: {e}")
   finally:
       cur.close()
       conn.close()




# ==========================
# TABLE INITIALIZERS
# ==========================



#dummy student table
def ready_students_table():
   query = """
   CREATE TABLE IF NOT EXISTS students (
       student_id VARCHAR(20) PRIMARY KEY,
       full_name VARCHAR(100) NOT NULL,
       contact_number VARCHAR(20),
       email VARCHAR(100),
       liability_status BOOLEAN DEFAULT FALSE,
       firstname VARCHAR(50) NOT NULL,
       lastname VARCHAR(50) NOT NULL,
       college_code VARCHAR(20)
   )
   """
   execute_query(query)

def ready_auth_letters_table():
   query = """
   CREATE TABLE IF NOT EXISTS auth_letters (
       id VARCHAR(200) PRIMARY KEY,
       created_at TIMESTAMP DEFAULT NOW(),
       firstname VARCHAR(50) NOT NULL,
       lastname VARCHAR(50) NOT NULL,
       file_url VARCHAR(255) NOT NULL,
       number VARCHAR(20) NOT NULL,
       requester_name VARCHAR(100) NOT NULL
   )
   """
   execute_query(query)

def ready_requirements_table():
   query = """
   CREATE TABLE IF NOT EXISTS requirements (
       req_id VARCHAR(10) PRIMARY KEY,
       requirement_name VARCHAR(255) NOT NULL
   )
   """
   execute_query(query)

def ready_documents_table():
    query = """
    CREATE TABLE IF NOT EXISTS documents (
        doc_id VARCHAR(10) PRIMARY KEY,
        doc_name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        logo_link VARCHAR(255),
        cost NUMERIC(10,2) DEFAULT 0.00,
        hidden BOOLEAN DEFAULT FALSE
    )
    """
    execute_query(query)


#mapping table between documents and requirements
def ready_document_requirements_table():
   query = """
   CREATE TABLE IF NOT EXISTS document_requirements (
       doc_id VARCHAR(200) REFERENCES documents(doc_id) ON DELETE CASCADE,
       req_id VARCHAR(200) REFERENCES requirements(req_id) ON DELETE CASCADE,
       PRIMARY KEY (doc_id, req_id)
   )
   """
   execute_query(query)



def ready_requests_table():
   query = """
   CREATE TABLE IF NOT EXISTS requests (
       request_id VARCHAR(15) PRIMARY KEY,
       student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
       full_name VARCHAR(100),
       contact_number VARCHAR(20),
       email VARCHAR(100),
       preferred_contact VARCHAR(50),
       status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN-PROGRESS', 'DOC-READY', 'RELEASED', 'REJECTED')),
       payment_status BOOLEAN DEFAULT FALSE,
       total_cost NUMERIC(10,2) DEFAULT 0.00,
       requested_at TIMESTAMP DEFAULT NOW(),
       remarks VARCHAR(255),
       order_type varchar(20),
       college_code VARCHAR(20) NOT NULL
   )
   """
   execute_query(query)


#mapping table between requests and requested documents for each request and quantity
def ready_request_documents_table():
   query = """
   CREATE TABLE IF NOT EXISTS request_documents (
       request_id VARCHAR(15) REFERENCES requests(request_id) ON DELETE CASCADE,
       doc_id VARCHAR(200),
       quantity INTEGER DEFAULT 1,
       PRIMARY KEY (request_id, doc_id)
   )
   """
   execute_query(query)


#mapping table between requests and requirements with uploaded file paths
def ready_request_requirements_links_table():
   query = """
   CREATE TABLE IF NOT EXISTS request_requirements_links (
       request_id VARCHAR(15) REFERENCES requests(request_id) ON DELETE CASCADE,
       requirement_id VARCHAR(200) REFERENCES requirements(req_id) ON DELETE CASCADE,
       file_path VARCHAR(255) NOT NULL,
       uploaded_at TIMESTAMP DEFAULT NOW(),
       PRIMARY KEY (request_id, requirement_id)
   )
   """
   execute_query(query)


def ready_logs_table():
   query = """
   CREATE TABLE IF NOT EXISTS logs (
       log_id SERIAL PRIMARY KEY,
       admin_id VARCHAR(100) NOT NULL,
       action VARCHAR(255) NOT NULL,
       details TEXT,
       timestamp TIMESTAMP DEFAULT NOW()
   )
   """
   execute_query(query)


def ready_admins_table():
   query = """
   CREATE TABLE IF NOT EXISTS admins (
       email VARCHAR(100) PRIMARY KEY,
       role VARCHAR(50) NOT NULL
   )
   """
   execute_query(query)



def ready_open_request_restriction_table():
   query = """
   CREATE TABLE IF NOT EXISTS open_request_restriction (
       id SERIAL PRIMARY KEY,
       start_time TIME NOT NULL,
       end_time TIME NOT NULL,
       available_days JSONB NOT NULL
   )
   """
   execute_query(query)

def ready_others_docs_table():
   query = """
   CREATE TABLE IF NOT EXISTS others_docs (
       id SERIAL PRIMARY KEY,
       request_id VARCHAR(15) REFERENCES requests(request_id) ON DELETE CASCADE,
       student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
       document_name VARCHAR(500) NOT NULL,
       document_description VARCHAR(1000),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
   """
   execute_query(query)

    
 


# ==========================
# SAMPLE DATA FOR INDEPENDENT TABLES
# ==========================


def populate_independent_tables():
   """Populate all tables except request-related ones."""
   conn = get_connection()
   cur = conn.cursor()
   try:
       # Students data
       student_values = [
           ("2025-1011", "John Smith", "09171234567", "john.smith@example.com", False, "John", "Smith", "CCS"),
           ("2025-1012", "Maria Garcia", "09172345678", "maria.garcia@example.com", True, "Maria", "Garcia", "COE"),
           ("2025-1013", "David Johnson", "09173456789", "david.johnson@example.com", False, "David", "Johnson", "CAS"),
           ("2025-1014", "Emma Wilson", "09174567890", "emma.wilson@example.com", True, "Emma", "Wilson", "CBA"),
           ("2025-1015", "Michael Brown", "09175678901", "michael.brown@example.com", False, "Michael", "Brown", "CCS")
       ]
       extras.execute_values(
           cur,
           """
           INSERT INTO students (student_id, full_name, contact_number, email, liability_status, firstname, lastname, college_code)
           VALUES %s
           ON CONFLICT (student_id) DO NOTHING
           """,
           student_values
       )


       # Requirements data
       req_values = [
           ("REQ0001", "Valid Student ID"),
           ("REQ0002", "Authorization Letter"),
           ("REQ0003", "Recent Passport Size Photo"),
           ("REQ0004", "Birth Certificate (PSA)"),
           ("REQ0005", "Previous Transcript of Records"),
           ("REQ0006", "Certificate of Enrollment"),
           ("REQ0007", "Proof of Payment"),
           ("REQ0008", "Diploma/Certificate of Completion"),
           ("REQ0009", "Official Request Form"),
           ("REQ0010", "Marriage Certificate (if applicable)")
       ]
       cur.executemany(
           "INSERT INTO requirements (req_id, requirement_name) VALUES (%s, %s) ON CONFLICT (req_id) DO NOTHING",
           req_values
       )


       # Documents data
       doc_values = [
           ("DOC0001", "Official Transcript of Records", "Complete academic record with grades and units earned", "/assets/logos/transcript.png", 100.00, False),
           ("DOC0002", "Diploma/Certificate of Completion", "Official proof of degree or program completion", "/assets/logos/diploma.png", 150.00, False),
           ("DOC0003", "Certificate of Enrollment", "Proof of current enrollment status", "/assets/logos/enrollment.png", 50.00, False),
           ("DOC0004", "Good Moral Certificate", "Character reference for employment or further education", "/assets/logos/moral.png", 75.00, False),
           ("DOC0005", "Certification of Grades", "Summary of academic performance for specific period", "/assets/logos/grades.png", 60.00, False),
           ("DOC0006", "Authentication of Documents", "Official verification of document authenticity", "/assets/logos/authentication.png", 80.00, False),
           ("DOC0007", "Replacement of Lost Diploma", "Duplicate diploma for lost or damaged original", "/assets/logos/replacement.png", 200.00, False),
           ("DOC0008", "Course Description", "Detailed description of subjects taken", "/assets/logos/course_desc.png", 40.00, False),
           ("DOC0009", "Ranking Certificate", "Academic ranking among graduating class", "/assets/logos/ranking.png", 65.00, False),
           ("DOC0010", "Special Order/Citation", "Recognition of academic achievements or awards", "/assets/logos/awards.png", 55.00, False)
       ]
       cur.executemany(
           "INSERT INTO documents (doc_id, doc_name, description, logo_link, cost, hidden) VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (doc_id) DO NOTHING",
           doc_values
       )


       # Document ↔ Requirement mapping
       doc_req_values = [
           ("DOC0001", "REQ0001"),  # Official Transcript of Records requires Valid Student ID
           ("DOC0001", "REQ0009"),  # Official Transcript of Records requires Official Request Form
           ("DOC0001", "REQ0007"),  # Official Transcript of Records requires Proof of Payment
           ("DOC0002", "REQ0001"),  # Diploma/Certificate requires Valid Student ID
           ("DOC0002", "REQ0009"),  # Diploma/Certificate requires Official Request Form
           ("DOC0002", "REQ0008"),  # Diploma/Certificate requires Diploma/Certificate of Completion
           ("DOC0002", "REQ0007"),  # Diploma/Certificate requires Proof of Payment
           ("DOC0003", "REQ0001"),  # Certificate of Enrollment requires Valid Student ID
           ("DOC0003", "REQ0006"),  # Certificate of Enrollment requires Certificate of Enrollment
           ("DOC0003", "REQ0009"),  # Certificate of Enrollment requires Official Request Form
           ("DOC0004", "REQ0001"),  # Good Moral Certificate requires Valid Student ID
           ("DOC0004", "REQ0003"),  # Good Moral Certificate requires Recent Passport Size Photo
           ("DOC0004", "REQ0009"),  # Good Moral Certificate requires Official Request Form
           ("DOC0005", "REQ0001"),  # Certification of Grades requires Valid Student ID
           ("DOC0005", "REQ0009"),  # Certification of Grades requires Official Request Form
           ("DOC0005", "REQ0007"),  # Certification of Grades requires Proof of Payment
           ("DOC0006", "REQ0001"),  # Authentication requires Valid Student ID
           ("DOC0006", "REQ0009"),  # Authentication requires Official Request Form
           ("DOC0007", "REQ0001"),  # Replacement Diploma requires Valid Student ID
           ("DOC0007", "REQ0003"),  # Replacement Diploma requires Recent Passport Size Photo
           ("DOC0007", "REQ0004"),  # Replacement Diploma requires Birth Certificate (PSA)
           ("DOC0007", "REQ0009"),  # Replacement Diploma requires Official Request Form
           ("DOC0007", "REQ0007"),  # Replacement Diploma requires Proof of Payment
           ("DOC0008", "REQ0001"),  # Course Description requires Valid Student ID
           ("DOC0008", "REQ0009"),  # Course Description requires Official Request Form
           ("DOC0009", "REQ0001"),  # Ranking Certificate requires Valid Student ID
           ("DOC0009", "REQ0009"),  # Ranking Certificate requires Official Request Form
           ("DOC0010", "REQ0001"),  # Special Order requires Valid Student ID
           ("DOC0010", "REQ0009")   # Special Order requires Official Request Form
       ]
       cur.executemany(
           "INSERT INTO document_requirements (doc_id, req_id) VALUES (%s, %s) ON CONFLICT (doc_id, req_id) DO NOTHING",
           doc_req_values
       )

       conn.commit()
       print("Independent tables populated successfully.")
   except Exception as e:
       print(f"Error populating independent tables: {e}")
       conn.rollback()
   finally:
       cur.close()
       conn.close()


def insert_sample_data():
   """Legacy function - kept for compatibility but redirects to new function."""
   populate_independent_tables()





# ==========================
# INITIALIZE EVERYTHING
# ==========================



def initialize_db():
   """Initialize database and all tables."""
   create_database()
   ready_students_table()
   ready_requirements_table()
   ready_documents_table()
   ready_auth_letters_table()
   ready_document_requirements_table()
   ready_requests_table()
   ready_request_documents_table()
   ready_request_requirements_links_table()
   ready_logs_table()
   ready_admins_table()
   ready_open_request_restriction_table()
   ready_others_docs_table()
   print("Database and tables initialized successfully.")


def initialize_and_populate():
   """Initialize database, tables, and populate independent tables."""
   initialize_db()
   populate_independent_tables()
   print("Database initialized and independent tables populated successfully.")


def populate_only():
   """Populate only independent tables (assumes tables already exist)."""
   populate_independent_tables()


if __name__ == "__main__":
   # By default, just initialize without populating to avoid duplicate data
   # Use initialize_and_populate() or populate_only() if you want to add sample data
   initialize_db()
