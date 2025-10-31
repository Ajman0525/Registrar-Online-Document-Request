import requests

class AuthenticationUser:
    @staticmethod
    def check_student_in_school_system(student_id):
        """
        Check if student exists in the school's external system
        and whether they have liabilities.
        Returns a dict:
        {
            "exists": bool,
            "has_liability": bool
        }
        """

        # Placeholder API call (replace with real endpoint)
        # Example structure only. School API docs will define the real one.
        # Try/except to avoid app exploding if external site is down.
        try:
            response = requests.post(
                "https://school-api.example.com/check-student",
                json={"student_id": student_id},
                timeout=5
            )

            if response.status_code != 200:
                return {"exists": False, "has_liability": False}

            data = response.json()

            return {
                "exists": data.get("exists", False),
                "has_liability": data.get("has_liability", False)
            }

        except Exception:
            # School site dead, server crying, whatever
            return {"exists": False, "has_liability": False}

    @staticmethod
    def save_otp(student_id, otp):
        """
        Placeholder for saving OTP to database later.
        """
        pass

    @staticmethod
    def verify_otp(student_id, otp):
        """
        Placeholder for OTP verification later.
        """
        return False
