import hashlib
import random
import requests

class AuthenticationUser:
    @staticmethod
    def check_student_in_school_system(student_id):
        """
        Checks if the student exists in the school's external system
        and whether they have liabilities.
        Returns a dict:
        {
            "exists": bool,
            "has_liability": bool,
            "phone_number": str | None
        }
        """

        try:
            # Mock call to external school system
            # Replace URL and logic with the real API when ready
            response = requests.post(
                "https://school-api.example.com/check-student",
                json={"student_id": student_id},
                timeout=5
            )

            if response.status_code != 200:
                return {"exists": False, "has_liability": False, "phone_number": None}

            data = response.json()
            return {
                "exists": data.get("exists", False),
                "has_liability": data.get("has_liability", False),
                "phone_number": data.get("phone_number")  # from school record
            }

        except Exception:
            # School system offline, broken, or just hates you
            return {"exists": False, "has_liability": False, "phone_number": None}

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
