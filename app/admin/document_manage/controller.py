from . import document_management_bp
from flask import jsonify, g

@document_management_bp.route('/get-documents', methods=['GET'])
def get_documents():
    try:
        # Use connection from the pool
        conn = g.db_conn
        cursor = conn.cursor()
        cursor.execute("SELECT doc_id, doc_name, description, logo_link, cost FROM documents;")
        documents = cursor.fetchall()
        cursor.close()

        document_list = [
            {
                "doc_id": doc[0],
                "doc_name": doc[1],
                "description": doc[2],
                "logo_link": doc[3],
                "cost": float(doc[4])
            }
            for doc in documents
        ]
        return jsonify(document_list)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@document_management_bp.route('/get-document-requirements', methods=['GET'])
def get_document_requirements():
    try:
        # Use connection from the pool
        conn = g.db_conn
        cursor = conn.cursor()
        cursor.execute("SELECT doc_id, req_id FROM document_requirements;")
        document_requirements = cursor.fetchall()
        cursor.close()

        document_requirements_list = [
            {
                "doc_id": doc[0],
                "req_id": doc[1]
            }
            for doc in document_requirements
        ]
        return jsonify(document_requirements_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@document_management_bp.route('/get-document-requirements/<string:doc_id>', methods=['GET'])
def get_document_requirements_by_id(doc_id):
    try:
        conn = g.db_conn
        cursor = conn.cursor()
        cursor.execute("SELECT doc_id, req_id FROM document_requirements WHERE doc_id = %s;", (doc_id,))
        document_requirements = cursor.fetchall()
        cursor.close()

        document_requirements_list = [
            {"doc_id": doc[0], "req_id": doc[1]}
            for doc in document_requirements
        ]
        return jsonify(document_requirements_list)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
