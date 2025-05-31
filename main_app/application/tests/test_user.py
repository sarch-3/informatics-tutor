from django.test import TestCase
from rest_framework.test import APIClient

class TestUser(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_same_user(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["messages"])

    def test_sign_in(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)

        response = self.client.post('/api/user/sign-in/', data=data)
        self.assertEqual(response.status_code, 200)

    def test_refresh(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)
        refresh = response.json()["refresh"]

        response = self.client.post('/api/user/refresh/', data={"refresh": refresh})
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())

    def test_sign_out(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)
        refresh = response.json()["refresh"]

        response = self.client.post('/api/user/refresh/', data={"refresh": refresh})
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.json())

        response = self.client.post('/api/user/sign-out/', data={"refresh": refresh})
        self.assertEqual(response.status_code, 200)

        response = self.client.post('/api/user/refresh/', data={"refresh": refresh})
        self.assertEqual(response.status_code, 400)

    def test_get(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)
        access = response.json()["access"]

        response = self.client.get('/api/user/get/', headers={"Authorization": f"Bearer {access}"})
        self.assertEqual(response.status_code, 200)
        data.pop("password")
        response_json = response.json()
        response_json.pop("id")
        self.assertEqual(response_json, data)
    
    def test_bad_password(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd",
            "is_teacher": True
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["messages"])

    def test_bad_password2(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Password!",
            "is_teacher": True
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["messages"])

    def test_bad_password3(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["messages"])

    def test_bad_password4(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Pa0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["messages"])

    def test_no_first_name(self):
        data = {
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("first_name", response.json()["messages"])

    def test_no_last_name(self):
        data = {
            "first_name": "Артём",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("last_name", response.json()["messages"])

    def test_no_email(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "password": "Passw0rd!",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json()["messages"])

    def test_no_password(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "is_teacher": False
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json()["messages"])


    def test_no_is_teacher(self):
        data = {
            "first_name": "Артём",
            "last_name": "Sarch3",
            "email": "sarch@mail.com",
            "password": "Passw0rd!",
        }

        response = self.client.post('/api/user/sign-up/', data=data)
        self.assertEqual(response.status_code, 201)