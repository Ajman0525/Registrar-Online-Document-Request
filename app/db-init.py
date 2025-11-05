import psycopg2
from psycopg2 import sql
from config import DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT
from dotenv import load_dotenv


def create_database():
    """Connect to default 'postgres' DB and create DB_NAME if it doesn't exist."""
    load_dotenv('.env')
    conn = psycopg2.connect(
        dbname=DB_NAME,
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
        print(f"✅ Database '{DB_NAME}' created.")
    else:
        print(f"ℹ️ Database '{DB_NAME}' already exists.")

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
        print(f"❌ Error executing query: {e}")
    finally:
        cur.close()
        conn.close()


# ==========================
# TABLE INITIALIZERS
# ==========================

# use this to store requirements info
def ready_requirements_table():
    query = """
    CREATE TABLE IF NOT EXISTS requirements (
        req_id VARCHAR(10) PRIMARY KEY,
        requirement_name VARCHAR(255) NOT NULL
    )
    """
    execute_query(query)

# use this to store document info
def ready_documents_table():
    query = """
    CREATE TABLE IF NOT EXISTS documents (
        doc_id VARCHAR(10) PRIMARY KEY,
        doc_name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        logo_link VARCHAR(255)
    )
    """
    execute_query(query)


# use this to link documents to their requirements
def ready_document_requirements_table():
    query = """
    CREATE TABLE IF NOT EXISTS document_requirements (
        doc_id VARCHAR(10) REFERENCES documents(doc_id) ON DELETE CASCADE,
        req_id VARCHAR(10) REFERENCES requirements(req_id) ON DELETE CASCADE,
        PRIMARY KEY (doc_id, req_id)
    )
    """
    execute_query(query)

# use this to store user requests
def ready_requests_table():
    query = """
    CREATE TABLE IF NOT EXISTS requests (
        request_id VARCHAR(8) PRIMARY KEY,
        student_id VARCHAR(15) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20),
        email VARCHAR(100),
        requirements_link VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        payment_status VARCHAR(20) DEFAULT 'Unpaid',
        requested_at VARCHAR(30)
    )
    """
    execute_query(query)

# use this to link requests to their documents
def ready_request_documents_table():
    query = """
    CREATE TABLE IF NOT EXISTS request_documents (
        req_id VARCHAR(8) REFERENCES requests(request_id) ON DELETE CASCADE,
        doc_id VARCHAR(10) REFERENCES documents(doc_id) ON DELETE CASCADE,
        quantity VARCHAR(3) DEFAULT '1',
        PRIMARY KEY (req_id, doc_id)
    )
    """
    execute_query(query)


# ==========================
# SAMPLE DATA
# ==========================

def insert_sample_data():
    """Insert initial records."""
    conn = get_connection()
    cur = conn.cursor()

    try:
        req_values = [
            ('REQ0001', 'Valid ID'),
            ('REQ0002', 'Proof of Address'),
            ('REQ0003', 'Recent Photograph')
        ]

        doc_values = [
            ('DOC0001', 'Certificate of Residency', 'Issued by Barangay for proof of residence', 'https://example.com/logos/residency.png'),
            ('DOC0002', 'Barangay Clearance', 'Clearance certificate for local residents', 'https://example.com/logos/clearance.png'),
            ('DOC0003', 'Business Permit', 'Required for business registration', 'https://example.com/logos/business.png')
        ]

        doc_req_values = [
            ('DOC0001', 'REQ0001'),
            ('DOC0001', 'REQ0002'),
            ('DOC0002', 'REQ0001'),
            ('DOC0003', 'REQ0001'),
            ('DOC0003', 'REQ0003')
        ]

        cur.executemany("INSERT INTO requirements (req_id, requirement_name) VALUES (%s, %s) ON CONFLICT DO NOTHING", req_values)
        cur.executemany("INSERT INTO documents (doc_id, doc_name, description, logo_link) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING", doc_values)
        cur.executemany("INSERT INTO document_requirements (doc_id, req_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", doc_req_values)

        conn.commit()
        print("Sample data inserted successfully.")
    except Exception as e:
        print(f"Error inserting sample data: {e}")
    finally:
        cur.close()
        conn.close()


# ==========================
# INITIALIZE EVERYTHING
# ==========================

def initialize_db():
    create_database()
    ready_requirements_table()
    ready_documents_table()
    ready_document_requirements_table()
    ready_requests_table()
    ready_request_documents_table()
    #insert_sample_data()
    print("Database and tables initialized successfully.")


if __name__ == "__main__":
    initialize_db()
