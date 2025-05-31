from django.test import TestCase
from rest_framework.test import APIClient

from rest_framework_simplejwt.tokens import RefreshToken
from users.models import CustomUser
from classrooms.models import Classroom, Homework, Task
from pathlib import Path
from time import sleep

from django.test import TestCase, override_settings

@override_settings(
    CELERY_TASK_ALWAYS_EAGER=True,
    CELERY_TASK_EAGER_PROPAGATES=True
)

class TestSolution(TestCase):

    def setUp(self):
        self.client = APIClient()

        student = CustomUser(first_name = "Ivan", last_name = "Ivanov", email="ivanivanov@mail.ru")
        student.set_password("Passw0rd!")
        student.save()
        s_token = RefreshToken.for_user(student)

        student2 = CustomUser(first_name = "Artem", last_name = "Artemov", email="artemArtemov@mail.ru")
        student2.set_password("Passw0rd!")
        student2.save()
        s2_token = RefreshToken.for_user(student2)

        teacher = CustomUser(first_name = "Petr", last_name = "Petrovich", email="petrpetrovich@mail.ru", is_teacher=True)
        teacher.set_password("Passw0rd!")
        teacher.save()
        t_token = RefreshToken.for_user(teacher)

        classroom = Classroom(title = "Test classroom")
        classroom.save()
        classroom.teachers.add(teacher)
        classroom.students.add(student)
        classroom.students.add(student2)
        classroom.save()

        homework = Homework(classroom = classroom, title = "Test homework")
        homework.save()
        task_1 = Task(
            title = "Task #1",
            text = "An integer is taken as input. Output the square of this number.",
            answers = [["4"], ["9"]],
            tests = [["2"], ["-3"]],
            homework = homework
        )
        task_1.save()

        task_2 = Task(
            title = "Task #2",
            text = "Two integers are input, each on a new line. Output the sum of these numbers.\nExample:\nInput:\n1\n-2\nOutput:\n-1",
            answers = [["20"], ["-100"]],
            tests = [["17", "3"], ["120", "-220"]],
            homework = homework
        )
        task_2.save()

        file_path1 = Path(__file__).resolve().parent / "file1.py"
        file_path2 = Path(__file__).resolve().parent / "file2.py"
        file_path3 = Path(__file__).resolve().parent / "file3.py"
        file_path4 = Path(__file__).resolve().parent / "image.py"

        self.student = student
        self.student2 = student2
        self.teacher = teacher
        self.s_token = s_token.access_token
        self.s2_token = s2_token.access_token
        self.t_token = t_token.access_token
        
        self.cid = classroom.id

        self.hid = homework.id

        self.tid1 = task_1.id
        self.tid2 = task_2.id

        self.fp1 = file_path1
        self.fp2 = file_path2
        self.fp3 = file_path3
        self.fp4 = file_path4


    def test_solution(self):
        response = self.client.get(f"/api/tasks/{self.tid1}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"], [])
        self.assertEqual(response.json()["status"], "unsolved")

        with open(self.fp1, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid1}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"], [])
        self.assertEqual(response.json()["status"], "unsolved")

        response = self.client.get(f"/api/tasks/{self.tid1}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"][0]["successful"], True)
        self.assertEqual(response.json()["status"], "solved")
        
    def test_two_solution(self):
        response = self.client.get(f"/api/tasks/{self.tid1}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"], [])
        self.assertEqual(response.json()["status"], "unsolved")

        with open(self.fp1, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid1}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"], [])
        self.assertEqual(response.json()["status"], "unsolved")

        response = self.client.get(f"/api/tasks/{self.tid1}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"][0]["successful"], True)
        self.assertEqual(response.json()["status"], "solved")

        with open(self.fp2, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid1}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"], [])
        self.assertEqual(response.json()["status"], "unsolved")

        response = self.client.get(f"/api/tasks/{self.tid1}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"][0]["successful"], False)
        self.assertEqual(response.json()["status"], "solved")
    
    def test_many_lines_solution(self):
        with open(self.fp2, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["solutions"][0]["successful"], True)
        self.assertEqual(response.json()["status"], "solved")

    def test_bad_file(self):
        with open(self.fp4, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "wrong")
        self.assertEqual(response.json()["solutions"][0]["successful"], False)
        self.assertEqual(response.json()["solutions"][0]["message"], "Failed to start testing.")

    def test_time_limit(self):
        with open(self.fp3, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "wrong")
        self.assertEqual(response.json()["solutions"][0]["successful"], False)
        self.assertEqual(response.json()["solutions"][0]["message"], "The runtime is out at 1 test.")

    def test_time_limit(self):
        with open(self.fp3, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(f"/api/tasks/{self.tid2}/", headers={"Authorization": f"Bearer {self.s_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "wrong")
        self.assertEqual(response.json()["solutions"][0]["successful"], False)
        self.assertEqual(response.json()["solutions"][0]["message"], "The runtime is out at 1 test.")

    def test_advancement(self):
        with open(self.fp2, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        with open(self.fp1, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid2}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)

        with open(self.fp2, "rb") as file:
            response = self.client.post(
                f"/api/tasks/{self.tid1}/",
                data={"file": file},
                format="multipart",
                headers={"Authorization": f"Bearer {self.s_token}"}
            )
        
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(f"/api/homeworks/{self.hid}/advancement/", headers={"Authorization": f"Bearer {self.t_token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]["first_name"], "Ivan")
        self.assertEqual(response.json()[0]["tasks"][0]["status"], "wrong")
        self.assertEqual(response.json()[0]["tasks"][1]["status"], "solved")
        self.assertEqual(response.json()[0]["tasks"][1]["last_solution"]["successful"], True)
        self.assertEqual(response.json()[1]["first_name"], "Artem")
        self.assertEqual(response.json()[1]["tasks"][0]["status"], "unsolved")
        self.assertEqual(response.json()[1]["tasks"][1]["status"], "unsolved")