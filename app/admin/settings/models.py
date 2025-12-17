
from flask import g
from app import db_pool
import json

class OpenRequestRestriction:
    @staticmethod
    def get_settings():
        """Fetch current settings."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT start_time, end_time, available_days, announcement FROM open_request_restriction WHERE id = 1")
            row = cur.fetchone()
            if row:
                # Handle available_days properly - it's stored as JSONB but may need parsing
                available_days = row[2]
                if isinstance(available_days, str):
                    try:
                        available_days = json.loads(available_days)
                    except (json.JSONDecodeError, TypeError):
                        # Fallback to default if parsing fails
                        available_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                
                return {
                    "start_time": str(row[0]),
                    "end_time": str(row[1]),
                    "available_days": available_days,
                    "announcement": row[3] or ""
                }
            return None
        except Exception as e:
            print(f"Error fetching restriction settings: {e}")
            return None
        finally:
            cur.close()


    @staticmethod
    def update_settings(start_time, end_time, available_days, announcement=""):
        """Update settings."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO open_request_restriction (id, start_time, end_time, available_days, announcement)
                VALUES (1, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    start_time = EXCLUDED.start_time,
                    end_time = EXCLUDED.end_time,
                    available_days = EXCLUDED.available_days,
                    announcement = EXCLUDED.announcement
            """, (start_time, end_time, json.dumps(available_days), announcement))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error updating settings: {e}")
            return False
        finally:
            cur.close()

class Admin:

    @staticmethod
    def get_all():
        """Fetch all admins."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT email, role, profile_picture FROM admins ORDER BY email")
            admins = cur.fetchall()
            return [{"email": admin[0], "role": admin[1], "profile_picture": admin[2]} for admin in admins]
        finally:
            cur.close()


    @staticmethod
    def add(email, role, profile_picture=None):
        """Add a new admin."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO admins (email, role, profile_picture) VALUES (%s, %s, %s)", (email, role, profile_picture))
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
        """Update an admin's role"""
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
            cur.execute("SELECT email, role, profile_picture FROM admins WHERE email = %s", (email,))
            admin = cur.fetchone()
            if admin:
                return {"email": admin[0], "role": admin[1], "profile_picture": admin[2]}
            return None
        finally:
            cur.close()

class Fee:
    @staticmethod
    def get_value(key):
        """Fetch fee value by key."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("SELECT value FROM fee WHERE key = %s", (key,))
            row = cur.fetchone()
            return row[0] if row else 0.0
        finally:
            cur.close()

    @staticmethod
    def update_value(key, value):
        """Update fee value."""
        conn = g.db_conn
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO fee (key, value) VALUES (%s, %s)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
            """, (key, value))
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error updating fee: {e}")
            return False
        finally:
            cur.close()
