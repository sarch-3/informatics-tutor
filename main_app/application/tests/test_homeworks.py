from django.test import TestCase
from rest_framework.test import APIClient

from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
from classrooms.models import Classroom
from django.utils.timezone import now
from datetime import timedelta

class TestHomework(TestCase):

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

        classroom = Classroom(title = "Test classroom")
        classroom.save()
        classroom.teachers.add(teacher)
        classroom.students.add(student)
        classroom.save()
        
        self.cid = classroom.id

        self.student = student
        self.teacher = teacher
        self.s_token = s_token.access_token
        self.t_token = t_token.access_token

    def test_homework(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
                {
                    "title": "Task #2",
                    "text": "Two triangles are given. Each has...",
                    "answers": [["12"], ["7"]],
                    "tests": [["8", "4"], ["3", "4"]],
                }
            ]
        }

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 201)

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_homework2(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [[""], [""]],
                }
            ],
            "active_from": now() + timedelta(minutes=10),
            "active_until": now() + timedelta(minutes=21)
        }

        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 201)

    def test_delete_homework(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [[""], [""]],
                }
            ],
            "active_from": now() + timedelta(minutes=10),
            "active_until": now() + timedelta(minutes=21)
        }

        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 201)

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        hid = response.json()[0]["id"]

        response = self.client.delete(f"/api/homeworks/{hid}/edit/", headers={"Authorization": f"Bearer {self.t_token}"}, content_type="application/json")
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/classrooms/{self.cid}/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_no_permission(self):
        data = {}
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.s_token}"}, data=data)
        self.assertEqual(response.status_code, 403)

    def test_bad_active_from(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
                {
                    "title": "Task #2",
                    "text": "Two triangles are given. Each has...",
                    "answers": [["12"], ["7"]],
                    "tests": [["8", "4"], ["3", "4"]],
                }
            ],
            "active_from": now() - timedelta(minutes=1)
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("active_from", response.json()["messages"])

    def test_bad_active_until(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
                {
                    "title": "Task #2",
                    "text": "Two triangles are given. Each has...",
                    "answers": [["12"], ["7"]],
                    "tests": [["8", "4"], ["3", "4"]],
                }
            ],
            "active_until": now() - timedelta(minutes=1)
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("active_until", response.json()["messages"])
    
    def test_bad_time(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
                {
                    "title": "Task #2",
                    "text": "Two triangles are given. Each has...",
                    "answers": [["12"], ["7"]],
                    "tests": [["8", "4"], ["3", "4"]],
                }
            ],
            "active_from": now() + timedelta(minutes=10),
            "active_until": now() + timedelta(minutes=2)
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("active_until", response.json()["messages"])

    def test_no_title(self):
        data = {
            "classroom": self.cid,
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                }
            ],
            "active_from": now() + timedelta(minutes=10),
            "active_until": now() + timedelta(minutes=21)
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.json()["messages"])

    def test_no_classroom(self):
        data = {
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
            ],
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("classroom", response.json()["messages"])

    def test_bad_classroom(self):
        data = {
            "classroom": "791eedaa-1ea9-4427-8d75-523590596ca4",
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"]],
                },
            ],
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("classroom", response.json()["messages"])

    def test_no_tasks(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1"
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("tasks", response.json()["messages"])

    def test_bad_tests(self):
        data = {
            "classroom": self.cid,
            "title": "Homework #1",
            "tasks": [
                {
                    "title": "Task #1",
                    "text": "Two squares are given. Each has...",
                    "answers": [["4"], ["6"]],
                    "tests": [["3", "1"], ["3", "3"], ["123"]],
                },
            ],
        }
        response = self.client.post("/api/homeworks/create/", headers={"Authorization": f"Bearer {self.t_token}"}, data=data, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("tests", response.json()["messages"]["tasks"]["0"])
        self.assertIn("answers", response.json()["messages"]["tasks"]["0"])

