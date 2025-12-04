from flask import g
from app import db_pool

class Admin:
    @staticmethod
    def get_all():
        """Fetch all admins."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT email, role FROM admins ORDER BY email")
            admins = cur.fetchall()
            return [{"email": admin[0], "role": admin[1]} for admin in admins]
        finally:
            cur.close()

    @staticmethod
    def add(email, role):
        """Add a new admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO admins (email, role) VALUES (%s, %s)", (email, role))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error adding admin: {e}")
            return False
        finally:
            cur.close()

    @staticmethod
    def update(email, role):
        """Update an admin's role."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("UPDATE admins SET role = %s WHERE email = %s", (role, email))
            conn.commit()
            return cur.rowcount > 0
        finally:
            cur.close()

    @staticmethod
    def delete(email):
        """Delete an admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM admins WHERE email = %s", (email,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            cur.close()

    @staticmethod
    def get_by_email(email):
        """Fetch an admin by email."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT email, role FROM admins WHERE email = %s", (email,))
            admin = cur.fetchone()
            if admin:
                return {"email": admin[0], "role": admin[1]}
            return None
        finally:
            cur.close()
