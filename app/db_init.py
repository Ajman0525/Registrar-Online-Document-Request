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
        hidden BOOLEAN DEFAULT FALSE,
        requires_payment_first BOOLEAN DEFAULT FALSE
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
       payment_status BOOLEAN DEFAULT FALSE,
       PRIMARY KEY (request_id, doc_id)
   )
   """
   execute_query(query)

   # Add is_done column if it doesn't exist
   alter_query = """
   ALTER TABLE request_documents ADD COLUMN IF NOT EXISTS is_done BOOLEAN DEFAULT FALSE
   """
   execute_query(alter_query)




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
   # Add request_id column if it doesn't exist
   alter_query = """
   ALTER TABLE logs ADD COLUMN IF NOT EXISTS request_id VARCHAR(15) DEFAULT 'none'
   """
   execute_query(alter_query)


def ready_request_assignments_table():
   query = """
   CREATE TABLE IF NOT EXISTS request_assignments (
       assignment_id SERIAL PRIMARY KEY,
       request_id VARCHAR(15) REFERENCES requests(request_id) ON DELETE CASCADE,
       admin_id VARCHAR(100) NOT NULL,
       assigned_at TIMESTAMP DEFAULT NOW(),
       UNIQUE (request_id)  -- Ensure a request is assigned to only one admin
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


def ready_max_request_settings_table():
   query = """
   CREATE TABLE IF NOT EXISTS max_request_settings (
       key VARCHAR(100) PRIMARY KEY,
       value TEXT NOT NULL
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


def ready_admin_settings_table():
   query = """
   CREATE TABLE IF NOT EXISTS admin_settings (
       admin_id VARCHAR(100) NOT NULL,
       key VARCHAR(100) NOT NULL,
       value TEXT NOT NULL,
       PRIMARY KEY (admin_id, key)
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
       is_done BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )
   """
   execute_query(query)

   # Add is_done column if it doesn't exist (for existing tables)
   alter_query = """
   ALTER TABLE others_docs ADD COLUMN IF NOT EXISTS is_done BOOLEAN DEFAULT FALSE
   """
   execute_query(alter_query)


# ==========================
# INDEXES FOR PERFORMANCE
# ==========================

def create_performance_indexes():
   """Create indexes on frequently queried columns for better performance."""
   indexes = [
       "CREATE INDEX IF NOT EXISTS idx_requests_requested_at ON requests(requested_at DESC)",
       "CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)",
       "CREATE INDEX IF NOT EXISTS idx_requests_request_id ON requests(request_id)",
       "CREATE INDEX IF NOT EXISTS idx_request_documents_request_id ON request_documents(request_id)",
       "CREATE INDEX IF NOT EXISTS idx_request_documents_doc_id ON request_documents(doc_id)",
       "CREATE INDEX IF NOT EXISTS idx_document_requirements_doc_id ON document_requirements(doc_id)",
       "CREATE INDEX IF NOT EXISTS idx_document_requirements_req_id ON document_requirements(req_id)",
       "CREATE INDEX IF NOT EXISTS idx_request_requirements_links_request_id ON request_requirements_links(request_id)",
       "CREATE INDEX IF NOT EXISTS idx_request_requirements_links_requirement_id ON request_requirements_links(requirement_id)",
       "CREATE INDEX IF NOT EXISTS idx_logs_details ON logs(details)",
       "CREATE INDEX IF NOT EXISTS idx_logs_admin_id ON logs(admin_id)",
       "CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC)",
       "CREATE INDEX IF NOT EXISTS idx_request_assignments_request_id ON request_assignments(request_id)",
       "CREATE INDEX IF NOT EXISTS idx_request_assignments_admin_id ON request_assignments(admin_id)"
   ]

   for index_query in indexes:
       execute_query(index_query)
   print("Performance indexes created successfully.")




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
           ("2025-1011", "John Smith", "639518876143", "john.smith@example.com", False, "John", "Smith", "CCS"),
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
           ("DOC0001", "Official Transcript of Records", "Complete academic record with grades and units earned", "/assets/logos/transcript.png", 100.00, False, True),
           ("DOC0002", "Diploma/Certificate of Completion", "Official proof of degree or program completion", "/assets/logos/diploma.png", 150.00, False, False),
           ("DOC0003", "Certificate of Enrollment", "Proof of current enrollment status", "/assets/logos/enrollment.png", 50.00, False, False),
           ("DOC0004", "Good Moral Certificate", "Character reference for employment or further education", "/assets/logos/moral.png", 75.00, False, True),
           ("DOC0005", "Certification of Grades", "Summary of academic performance for specific period", "/assets/logos/grades.png", 60.00, False, False),
           ("DOC0006", "Authentication of Documents", "Official verification of document authenticity", "/assets/logos/authentication.png", 80.00, False, True),
           ("DOC0007", "Replacement of Lost Diploma", "Duplicate diploma for lost or damaged original", "/assets/logos/replacement.png", 200.00, False, False),
           ("DOC0008", "Course Description", "Detailed description of subjects taken", "/assets/logos/course_desc.png", 40.00, False, False),
           ("DOC0009", "Ranking Certificate", "Academic ranking among graduating class", "/assets/logos/ranking.png", 65.00, False, False),
           ("DOC0010", "Special Order/Citation", "Recognition of academic achievements or awards", "/assets/logos/awards.png", 55.00, False, False)
       ]

       cur.executemany(
           "INSERT INTO documents (doc_id, doc_name, description, logo_link, cost, hidden, requires_payment_first) VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (doc_id) DO NOTHING",
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


def populate_logs_table():
   """Populate the logs table with sample data representing typical admin actions."""
   conn = get_connection()
   cur = conn.cursor()
   try:
       # Sample logs data representing typical registrar system activities
       log_values = [
           # System initialization and admin activities
           ("admin1@registrar.edu", "System Initialization", "Database initialized with sample data including students, documents, and requirements", None, "2024-01-15 08:30:00"),
           ("admin1@registrar.edu", "Admin Login", "Administrator logged into the system", None, "2024-01-15 08:31:00"),
           ("admin2@registrar.edu", "Admin Login", "Staff administrator logged into the system", None, "2024-01-15 09:15:00"),
           
           # Document management activities
           ("admin1@registrar.edu", "Document Created", "Created new document: Official Transcript of Records with cost ₱100.00", "DOC0001", "2024-01-15 10:00:00"),
           ("admin1@registrar.edu", "Document Updated", "Updated document requirements for Diploma/Certificate of Completion", "DOC0002", "2024-01-15 10:15:00"),
           ("admin2@registrar.edu", "Document Hidden", "Hidden document: Authentication of Documents for maintenance", "DOC0006", "2024-01-15 11:30:00"),
           ("admin1@registrar.edu", "Document Cost Updated", "Updated cost for Replacement of Lost Diploma to ₱200.00", "DOC0007", "2024-01-15 14:20:00"),
           
           # Request management activities
           ("admin1@registrar.edu", "Request Created", "New request created by student John Smith for Official Transcript of Records", "REQ2024001", "2024-01-16 09:45:00"),
           ("admin2@registrar.edu", "Request Assigned", "Assigned request REQ2024001 to admin2@registrar.edu", "REQ2024001", "2024-01-16 10:00:00"),
           ("admin2@registrar.edu", "Status Updated", "Updated request REQ2024001 status from PENDING to IN-PROGRESS", "REQ2024001", "2024-01-16 11:30:00"),
           ("admin1@registrar.edu", "Request Created", "New request created by student Maria Garcia for Diploma/Certificate", "REQ2024002", "2024-01-16 13:20:00"),
           ("admin1@registrar.edu", "Payment Confirmed", "Payment confirmed for request REQ2024001 - ₱100.00 received", "REQ2024001", "2024-01-16 15:45:00"),
           ("admin2@registrar.edu", "Status Updated", "Updated request REQ2024001 status from IN-PROGRESS to DOC-READY", "REQ2024001", "2024-01-17 09:15:00"),
           ("admin1@registrar.edu", "Document Released", "Released Official Transcript of Records for request REQ2024001", "REQ2024001", "2024-01-17 14:30:00"),
           ("admin2@registrar.edu", "Status Updated", "Updated request REQ2024001 status from DOC-READY to RELEASED", "REQ2024001", "2024-01-17 14:35:00"),
           
           # Student management activities
           ("admin1@registrar.edu", "Student Added", "Added new student: David Johnson (2025-1013) from CAS", None, "2024-01-18 08:00:00"),
           ("admin2@registrar.edu", "Student Updated", "Updated contact information for student Emma Wilson", None, "2024-01-18 10:30:00"),
           ("admin1@registrar.edu", "Liability Status Updated", "Updated liability status for student Michael Brown to cleared", None, "2024-01-18 11:45:00"),
           
           # Requirement management activities
           ("admin1@registrar.edu", "Requirement Created", "Created new requirement: Marriage Certificate (if applicable)", None, "2024-01-19 09:00:00"),
           ("admin2@registrar.edu", "Requirement Updated", "Updated requirement details for Valid Student ID", None, "2024-01-19 10:15:00"),
           ("admin1@registrar.edu", "Document-Requirement Mapping", "Mapped Birth Certificate (PSA) requirement to Replacement Diploma", None, "2024-01-19 13:20:00"),
           
           # System configuration activities
           ("admin1@registrar.edu", "Settings Updated", "Updated maximum concurrent requests limit to 50", None, "2024-01-20 08:30:00"),
           ("admin2@registrar.edu", "Request Window Updated", "Modified request submission window: 8:00 AM - 5:00 PM", None, "2024-01-20 09:45:00"),
           ("admin1@registrar.edu", "Admin Role Updated", "Changed admin2@registrar.edu role from staff to senior_admin", None, "2024-01-20 11:00:00"),
           
           # Recent activities for testing
           ("admin1@registrar.edu", "Request Created", "New request created by student Emma Wilson for Good Moral Certificate", "REQ2024003", "2024-01-21 10:30:00"),
           ("admin2@registrar.edu", "Request Assigned", "Assigned request REQ2024003 to admin2@registrar.edu", "REQ2024003", "2024-01-21 10:45:00"),
           ("admin1@registrar.edu", "Status Updated", "Updated request REQ2024002 status from PENDING to IN-PROGRESS", "REQ2024002", "2024-01-21 14:15:00"),
           ("admin2@registrar.edu", "Requirements Verified", "Verified all requirements for request REQ2024003", "REQ2024003", "2024-01-22 09:30:00"),
           ("admin1@registrar.edu", "Payment Confirmed", "Payment confirmed for request REQ2024003 - ₱75.00 received", "REQ2024003", "2024-01-22 11:20:00"),
           ("admin2@registrar.edu", "Document Processing", "Started processing Good Moral Certificate for request REQ2024003", "REQ2024003", "2024-01-22 13:45:00"),
           ("admin1@registrar.edu", "Status Updated", "Updated request REQ2024003 status from IN-PROGRESS to DOC-READY", "REQ2024003", "2024-01-23 08:15:00"),
           ("admin2@registrar.edu", "Document Released", "Released Good Moral Certificate for request REQ2024003", "REQ2024003", "2024-01-23 10:30:00"),
           ("admin1@registrar.edu", "Status Updated", "Updated request REQ2024003 status from DOC-READY to RELEASED", "REQ2024003", "2024-01-23 10:35:00"),
           
           # Error handling and maintenance activities
           ("admin1@registrar.edu", "System Maintenance", "Performed routine database maintenance and optimization", None, "2024-01-24 06:00:00"),
           ("admin2@registrar.edu", "Backup Completed", "Daily database backup completed successfully", None, "2024-01-24 06:30:00"),
           ("admin1@registrar.edu", "User Support", "Assisted student with document request troubleshooting", "REQ2024004", "2024-01-24 15:20:00"),
           
           # Authentication and security activities
           ("admin1@registrar.edu", "Password Reset", "Performed password reset for admin2@registrar.edu", None, "2024-01-25 08:45:00"),
           ("admin2@registrar.edu", "Security Check", "Reviewed system access logs and user permissions", None, "2024-01-25 14:30:00"),
           
           # Current day activities for demo purposes
           ("admin1@registrar.edu", "Request Created", "New request created by student Michael Brown for Course Description", "REQ2024005", "2024-01-26 09:15:00"),
           ("admin2@registrar.edu", "Request Assigned", "Assigned request REQ2024005 to admin1@registrar.edu", "REQ2024005", "2024-01-26 09:30:00"),
           ("admin1@registrar.edu", "Status Updated", "Updated request REQ2024005 status from PENDING to IN-PROGRESS", "REQ2024005", "2024-01-26 11:45:00"),
           ("admin2@registrar.edu", "Document Cost Verified", "Verified pricing for Course Description (₱40.00)", None, "2024-01-26 13:20:00"),
           ("admin1@registrar.edu", "Payment Confirmed", "Payment confirmed for request REQ2024005 - ₱40.00 received", "REQ2024005", "2024-01-26 15:50:00")
       ]
       
       # Insert logs data with proper timestamp formatting
       for log_entry in log_values:
           admin_id, action, details, request_id, timestamp = log_entry
           cur.execute(
               """
               INSERT INTO logs (admin_id, action, details, request_id, timestamp)
               VALUES (%s, %s, %s, %s, %s)
               ON CONFLICT DO NOTHING
               """,
               (admin_id, action, details, request_id, timestamp)
           )

       conn.commit()
       print("Logs table populated with sample data successfully.")
   except Exception as e:
       print(f"Error populating logs table: {e}")
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
   ready_request_assignments_table()
   ready_admins_table()
   ready_max_request_settings_table()
   ready_admin_settings_table()
   ready_open_request_restriction_table()
   ready_others_docs_table()
   print("Database and tables initialized successfully.")



def initialize_and_populate():
   """Initialize database, tables, and populate independent tables."""
   initialize_db()
   populate_independent_tables()
   populate_logs_table()
   print("Database initialized and independent tables populated successfully.")



def populate_only():
   """Populate only independent tables (assumes tables already exist)."""
   populate_independent_tables()


def populate_logs_only():
   """Populate only logs table (assumes tables already exist)."""
   populate_logs_table()


def populate_logs_and_independent():
   """Populate both independent tables and logs table (assumes tables already exist)."""
   populate_independent_tables()
   populate_logs_table()


if __name__ == "__main__":
   # By default, just initialize without populating to avoid duplicate data
   # Use initialize_and_populate() or populate_only() if you want to add sample data
   initialize_db()
