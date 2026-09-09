import time
import unittest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.auth import decode_access_token

client = TestClient(app)


def get_unique_phone():
    return f"9{int(time.time() * 1000) % 1000000000:09d}"


class TestAuthEndpoints(unittest.TestCase):
    def test_send_otp_valid(self):
        response = client.post("/api/auth/send-otp", json={"phone": "9876543210"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["demo_otp"], "123456")

    def test_send_otp_invalid(self):
        response = client.post("/api/auth/send-otp", json={"phone": "123"})
        self.assertIn(response.status_code, (400, 422))

    def test_verify_otp_flow_and_jwt(self):
        test_phone = get_unique_phone()
        res_verify = client.post("/api/auth/verify-otp", json={"phone": test_phone, "otp": "123456"})
        self.assertEqual(res_verify.status_code, 200)
        data_verify = res_verify.json()
        self.assertTrue(data_verify["verified"])
        self.assertTrue(data_verify["is_new_user"])
        token = data_verify["access_token"]
        self.assertIsNotNone(token)

        # Validate JWT payload
        payload = decode_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], test_phone)

        # Update profile
        res_profile = client.post("/api/auth/profile", json={
            "phone": test_phone,
            "name": "Asha Verma Collector",
            "role": "collector",
            "language": "hi",
            "location": "Bhopal, MP",
        })
        self.assertEqual(res_profile.status_code, 200)
        data_profile = res_profile.json()
        self.assertEqual(data_profile["name"], "Asha Verma Collector")

        # Verify again - should return user profile and JWT
        res_verify2 = client.post("/api/auth/verify-otp", json={"phone": test_phone, "otp": "123456"})
        self.assertEqual(res_verify2.status_code, 200)
        data2 = res_verify2.json()
        self.assertFalse(data2["is_new_user"])
        self.assertEqual(data2["user"]["name"], "Asha Verma Collector")
        self.assertEqual(data2["token_type"], "bearer")

    def test_signup_and_login_flow(self):
        signup_phone = get_unique_phone()
        signup_payload = {
            "name": "Vikram Patel",
            "phone": signup_phone,
            "password": "SecurePassword123",
            "role": "recycler",
            "language": "en",
            "location": "Indore, MP",
            "company_name": "Patel Green Tech Pvt Ltd",
            "license_no": "CPCB/MP/2026/0091",
        }

        # Signup
        res_signup = client.post("/api/auth/signup", json=signup_payload)
        self.assertEqual(res_signup.status_code, 200)
        data_signup = res_signup.json()
        self.assertEqual(data_signup["token_type"], "bearer")
        self.assertIsNotNone(data_signup["access_token"])
        self.assertEqual(data_signup["user"]["name"], "Vikram Patel")
        self.assertEqual(data_signup["user"]["role"], "recycler")

        # JWT Token claims verification
        token = data_signup["access_token"]
        payload = decode_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["role"], "recycler")
        self.assertEqual(payload["name"], "Vikram Patel")

        # Duplicate signup should fail
        res_dup = client.post("/api/auth/signup", json=signup_payload)
        self.assertEqual(res_dup.status_code, 400)

        # Login with correct password
        res_login = client.post("/api/auth/login", json={
            "phone_or_email": signup_phone,
            "password": "SecurePassword123",
        })
        self.assertEqual(res_login.status_code, 200)
        data_login = res_login.json()
        self.assertIsNotNone(data_login["access_token"])
        self.assertEqual(data_login["user"]["company_name"], "Patel Green Tech Pvt Ltd")

        # Login with wrong password
        res_fail = client.post("/api/auth/login", json={
            "phone_or_email": signup_phone,
            "password": "WrongPassword",
        })
        self.assertEqual(res_fail.status_code, 401)

    def test_get_me_endpoint(self):
        user_phone = get_unique_phone()
        res_signup = client.post("/api/auth/signup", json={
            "name": "Neha Sharma",
            "phone": user_phone,
            "password": "Password456",
            "role": "collector",
            "language": "mr",
        })
        self.assertEqual(res_signup.status_code, 200)
        token = res_signup.json()["access_token"]

        # Call /api/auth/me with Bearer token
        res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_me.status_code, 200)
        data_me = res_me.json()
        self.assertEqual(data_me["name"], "Neha Sharma")
        self.assertEqual(data_me["phone"], user_phone)
        self.assertEqual(data_me["role"], "collector")

        # Call /api/auth/me without token -> 401
        res_unauth = client.get("/api/auth/me")
        self.assertEqual(res_unauth.status_code, 401)

        # Call /api/auth/me with invalid token -> 401
        res_invalid = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
        self.assertEqual(res_invalid.status_code, 401)


if __name__ == "__main__":
    unittest.main()
