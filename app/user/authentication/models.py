import hashlib
import random
import requests
from ...db_init import get_connection

class AuthenticationUser:
    @staticmethod
    def check_student_in_school_system(student_id):
        """
        Checks the local 'students' table to confirm existence and liabilities.
        """
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                "SELECT full_name, contact_number, liability_status FROM students WHERE student_id = %s",
                (student_id,)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()

            if not row:
                return {
                    "exists": False,
                    "full_name": None,
                    "has_liability": False,
                    "phone_number": None
                }

            full_name, contact_number, liability_status = row
            return {
                "exists": True,
                "full_name": full_name,
                "has_liability": liability_status,
                "phone_number": contact_number
            }

        except Exception as e:
            print(f"Database error while checking student: {e}")
            return {
                "exists": False,
                "full_name": None,
                "has_liability": False,
                "phone_number": None
            }

    @staticmethod
    def generate_otp():
        """
        Generate a random 6-digit OTP and return both plain and hash.
        """
        otp = random.randint(100000, 999999)
        otp_hash = hashlib.sha256(str(otp).encode()).hexdigest()
        return otp, otp_hash

    @staticmethod
    def save_otp(student_id, otp_hash, session):
        """
        Save OTP hash to session (temporary) or database later.
        """
        session["otp"] = otp_hash
        session["student_id"] = student_id

    @staticmethod
    def verify_otp(otp_input, session):
        """
        Compare entered OTP hash with stored hash.
        """
        entered_hash = hashlib.sha256(str(otp_input).encode()).hexdigest()
        stored_hash = session.get("otp")

        if not stored_hash:
            return False

        return entered_hash == stored_hash
