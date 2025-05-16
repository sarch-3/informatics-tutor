from django.test import TestCase
from rest_framework.test import APIClient

from users.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken

class TestClassroom(TestCase):

    def setUp(self):
        self.client = APIClient()

        student = CustomUser(first_name = "Ivan", last_name = "Ivanov", email="ivanivanov@mail.ru")
        student.set_password("Passw0rd!")
        student.save()
        s_token = RefreshToken.for_user(student)

        teacher = CustomUser(first_name = "Petr", last_name = "Petrovich", email="petrpetrovich@mail.ru", is_teacher=True)
        teacher.set_password("Passw0rd!")
        teacher.save()
        t_token = RefreshToken.for_user(teacher)

        self.student = student
        self.teacher = teacher
        self.s_token = s_token.access_token
        self.t_token = t_token.access_token
    

    def test_new_classroom(self):
        data = {"title": "My first classroom!"}
        response = self.client.post('/api/classrooms/create/', headers={"Authorization": f"Bearer {self.t_token}"}, data=data)
        self.assertEqual(response.status_code, 201)

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_ivite_link(self):
        data = {"title": "Test ivite codes!"}
        response = self.client.post('/api/classrooms/create/', headers={"Authorization": f"Bearer {self.t_token}"}, data=data)
        self.assertEqual(response.status_code, 201)
        cid = response.json()["id"]

        response = self.client.post(f'/api/classrooms/{cid}/invite-link/', headers={"Authorization": f"Bearer {self.t_token}"}, data={"recipient": "student"})
        self.assertEqual(response.status_code, 201)
        s_code = response.json()["code"]

        response = self.client.post(f'/api/classrooms/{cid}/invite-link/', headers={"Authorization": f"Bearer {self.t_token}"}, data={"recipient": "teacher"})
        self.assertEqual(response.status_code, 201)
        t_code = response.json()["code"]

        response = self.client.post('/api/classrooms/join/', headers={"Authorization": f"Bearer {self.s_token}"}, data={"code": t_code})
        self.assertEqual(response.status_code, 403)

        response = self.client.post('/api/classrooms/join/', headers={"Authorization": f"Bearer {self.s_token}"}, data={"code": s_code})
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(len(response.json()[0]["students"]), 1)

        response = self.client.post(f'/api/classrooms/{cid}/exit/', headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_delete(self):
        data = {"title": "Delete this classroom!"}
        response = self.client.post('/api/classrooms/create/', headers={"Authorization": f"Bearer {self.t_token}"}, data=data)
        self.assertEqual(response.status_code, 201)
        cid = response.json()["id"]

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

        response = self.client.delete(f'/api/classrooms/{cid}/edit/', headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)

        response = self.client.get("/api/classrooms/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_bad_classroom(self):
        data = {"title": ""}
        response = self.client.post('/api/classrooms/create/', headers={"Authorization": f"Bearer {self.t_token}"}, data=data)
        self.assertEqual(response.status_code, 400)

    def test_bad_classroom2(self):
        response = self.client.post('/api/classrooms/create/', headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 400)